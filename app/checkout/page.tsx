// pages/checkout/index.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount, useDisconnect, useWalletClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMonadMarket } from "@/hooks/useMonadMarket";
import { useMonadPayment } from "@/hooks/useMonadPayment";
import { toUSDC, DURATION_SECS } from "@/lib/contracts";

// Simple SVG icons
const WalletIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
    />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
    />
  </svg>
);

interface ConnectionStatus {
  type: "idle" | "loading" | "success" | "error";
  message: string;
}

interface PaymentInfo {
  slotId: string;
  price: string;
  size: string;
  durations: string[];
  category: string;
}

interface QueueInfo {
  slotId: string;
  position: number;
  totalInQueue: number;
  nextActivation?: string;
  isAvailable: boolean;
}

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { disconnect } = useDisconnect();
  const {
    allowance,
    approve,
    purchaseSlot,
    isPending,
    hash,
    error: marketError,
  } = useMonadMarket();
  const { sendMON, isPending: isMONPending, hash: monHash } = useMonadPayment();

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    type: "idle",
    message: "",
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);
  const [bidAmount, setBidAmount] = useState<string>("");
  const [isBidding, setIsBidding] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "mon" | "contract" | "x402"
  >("mon");
  const [customAmount, setCustomAmount] = useState<string>("0.00001");

  // Publisher wallet address (from env or default)
  const PUBLISHER_WALLET =
    process.env.NEXT_PUBLIC_PUBLISHER_WALLET ||
    "0x6d63C3DD44983CddEeA8cB2e730b82daE2E91E32";

  // Parse payment information from URL parameters
  useEffect(() => {
    const slotId = searchParams.get("slotId");
    const price = searchParams.get("price");
    const size = searchParams.get("size");
    const durations = searchParams.get("durations")?.split(",") || [];
    const category = searchParams.get("category") || "general";

    if (slotId && price && size) {
      setPaymentInfo({ slotId, price, size, durations, category });
      setBidAmount(price);
      fetchQueueInfo(slotId);
    }
  }, [searchParams]);

  // Handle successful transaction
  useEffect(() => {
    const txHash = hash || monHash;
    if (txHash && paymentInfo && address) {
      setConnectionStatus({
        type: "success",
        message: "Transaction confirmed!",
      });

      const paymentData = {
        txHash: txHash,
        AmountPaid: customAmount,
        bidAmount: customAmount,
        payerAddress: address,
        validUpto: Math.floor(Date.now() / 1000) + 3600,
        paymentMethod: paymentMethod,
      };

      sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
      sessionStorage.setItem("paymentInfo", JSON.stringify(paymentInfo));

      setTimeout(() => {
        const params = new URLSearchParams({
          slotId: paymentInfo.slotId,
          price: paymentInfo.price,
          bidAmount: customAmount,
          size: paymentInfo.size,
          transactionHash: txHash,
          walletAddress: address,
          network: "Monad Testnet",
          paymentMethod: paymentMethod,
        });
        router.push(`/upload?${params.toString()}`);
      }, 1500);
    }
  }, [
    hash,
    monHash,
    paymentInfo,
    address,
    customAmount,
    router,
    paymentMethod,
  ]);

  const fetchQueueInfo = async (slotId: string) => {
    try {
      const resp = await fetch(`/api/queue-info/${slotId}`);
      if (resp.ok) {
        const data = await resp.json();
        setQueueInfo(data);
        setIsBidding(!data.isAvailable);
      }
    } catch (e) {
      console.error("Queue info fetch failed", e);
    }
  };

  const handleAction = async () => {
    if (!paymentInfo || !address) return;

    // MON native token payment
    if (paymentMethod === "mon") {
      setConnectionStatus({ type: "loading", message: "Sending MON..." });
      sendMON(PUBLISHER_WALLET, customAmount);
      return;
    }

    // x402 payment (micropayments via facilitator)
    if (paymentMethod === "x402") {
      await handleX402Payment();
      return;
    }

    // Original contract payment flow (USDC)
    const amountWei = toUSDC(bidAmount);

    // Check if we need approval first
    if (!allowance || (allowance as bigint) < amountWei) {
      setConnectionStatus({ type: "loading", message: "Approving mUSDC..." });
      approve(amountWei);
      return;
    }

    setConnectionStatus({ type: "loading", message: "Submitting to Monad..." });
    // Default 1h duration
    purchaseSlot(
      paymentInfo.slotId,
      "ipfs://pending",
      DURATION_SECS["1h"],
      amountWei,
    );
  };

  const handleX402Payment = async () => {
    if (!walletClient || !paymentInfo) return;

    try {
      setConnectionStatus({
        type: "loading",
        message: "Setting up x402 payment...",
      });

      const { createX402Client, fetchWithX402 } = await import(
        "@/lib/x402-client"
      );
      const client = createX402Client(walletClient);

      setConnectionStatus({
        type: "loading",
        message: "Processing USDC payment via x402...",
      });

      const response = await fetchWithX402(
        client,
        `${window.location.origin}/api/x402-content?slotId=${paymentInfo.slotId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error(
            "Payment required - insufficient funds or not approved",
          );
        }
        throw new Error(`Failed to fetch content: ${response.status}`);
      }

      const contentData = await response.json();
      console.log("Content fetched via x402:", contentData);

      const paymentData = {
        txHash: "x402-payment",
        amountPaid: customAmount,
        payerAddress: address,
        validUpto: Math.floor(Date.now() / 1000) + 3600,
        paymentMethod: "x402",
      };

      sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
      sessionStorage.setItem("paymentInfo", JSON.stringify(paymentInfo));
      sessionStorage.setItem("x402Content", JSON.stringify(contentData));

      setConnectionStatus({ type: "success", message: "Payment successful!" });

      setTimeout(() => {
        const params = new URLSearchParams();
        params.set("slotId", String(paymentInfo.slotId ?? ""));
        params.set("price", String(paymentInfo.price ?? ""));
        params.set("bidAmount", String(customAmount ?? ""));
        params.set("size", String(paymentInfo.size ?? ""));
        params.set("transactionHash", "x402-payment");
        params.set("walletAddress", String(address ?? ""));
        params.set("network", "Monad Testnet");
        params.set("paymentMethod", "x402");
        router.push(`/upload?${params.toString()}`);
      }, 1500);
    } catch (error) {
      console.error("x402 payment error:", error);
      setConnectionStatus({
        type: "error",
        message: error instanceof Error ? error.message : "x402 payment failed",
      });
    }
  };

  const isSupportedNetwork = () => chainId === 10143;

  const renderConnectionStatus = () => {
    const currentError =
      marketError?.message ||
      (connectionStatus.type === "error" ? connectionStatus.message : null);
    if (connectionStatus.type === "idle" && !currentError) return null;

    return (
      <div
        className={`mt-4 border px-4 py-3 flex items-center gap-3 font-mono bg-secondary border-border`}
      >
        {isPending ? (
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent" />
        ) : null}
        <span className="text-sm">
          {currentError || connectionStatus.message}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="mb-8 flex items-center justify-between">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="font-mono"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back
          </Button>
          <Badge
            variant="outline"
            className="font-mono border-primary/50 text-primary"
          >
            MONAD TESTNET
          </Badge>
        </div>

        <Card className="border-border bg-card shadow-2xl shadow-primary/5">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-mono font-bold">
              {isBidding ? "Place High Bid" : "Secure Ad Slot"}
            </CardTitle>
            <CardDescription className="font-mono">
              {paymentInfo?.slotId} • {paymentInfo?.size}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="bg-secondary/50 p-4 rounded-lg border border-border/50">
              <div className="text-3xl font-mono font-bold text-center mb-2">
                {bidAmount}{" "}
                <span className="text-sm text-muted-foreground">mUSDC</span>
              </div>
              <div className="flex justify-between text-xs font-mono text-muted-foreground">
                <span>Base Price: {paymentInfo?.price}</span>
                <span>My Turn: {isBidding ? "Queued" : "Immediate"}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Your Bid (MON)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="font-mono bg-background border-primary/20 focus:border-primary"
                  />
                  <div className="absolute right-3 top-2.5 text-xs font-mono text-muted-foreground">
                    MON
                  </div>
                </div>
              </div>

              {/* Custom Amount Input */}
              <div className="space-y-2">
                <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Custom Amount (MON)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.00001"
                    min="0.00001"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="0.00001"
                    className="font-mono bg-background border-primary/20 focus:border-primary"
                  />
                  <div className="absolute right-3 top-2.5 text-xs font-mono text-muted-foreground">
                    MON
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  Minimum: 0.00001 MON (testing phase)
                </p>
              </div>

              {/* Payment Method Toggle */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="payMon"
                    name="paymentMethod"
                    checked={paymentMethod === "mon"}
                    onChange={() => setPaymentMethod("mon")}
                    className="rounded"
                  />
                  <label htmlFor="payMon" className="text-foreground">
                    Pay with MON
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="payX402"
                    name="paymentMethod"
                    checked={paymentMethod === "x402"}
                    onChange={() => setPaymentMethod("x402")}
                    className="rounded"
                  />
                  <label htmlFor="payX402" className="text-foreground">
                    Pay with x402
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="payContract"
                    name="paymentMethod"
                    checked={paymentMethod === "contract"}
                    onChange={() => setPaymentMethod("contract")}
                    className="rounded"
                  />
                  <label
                    htmlFor="payContract"
                    className="text-muted-foreground"
                  >
                    Pay with Contract (USDC)
                  </label>
                </div>
              </div>

              {!isConnected ? (
                <div className="flex justify-center py-4">
                  <ConnectButton />
                </div>
              ) : (
                <div className="space-y-3">
                  {!isSupportedNetwork() ? (
                    <Button
                      disabled
                      className="w-full font-mono bg-destructive text-destructive-foreground"
                    >
                      Switch to Monad Testnet
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAction}
                      disabled={
                        isPending ||
                        isMONPending ||
                        (paymentMethod === "x402" && !walletClient)
                      }
                      className="w-full font-mono h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    >
                      {paymentMethod === "mon"
                        ? connectionStatus.type === "loading"
                          ? connectionStatus.message
                          : isBidding
                            ? `Pay ${customAmount} MON & Bid`
                            : `Pay ${customAmount} MON`
                        : paymentMethod === "x402"
                          ? connectionStatus.type === "loading"
                            ? connectionStatus.message
                            : isBidding
                              ? `Pay ${customAmount} & Bid (x402)`
                              : `Pay ${customAmount} (x402)`
                          : !allowance ||
                              (allowance as bigint) < toUSDC(bidAmount)
                            ? isPending
                              ? "Approving..."
                              : "Approve mUSDC"
                            : isPending
                              ? "Processing..."
                              : isBidding
                                ? "Place Bid"
                                : "Purchase Now"}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => disconnect()}
                    className="w-full text-xs font-mono text-muted-foreground"
                  >
                    Disconnect {address?.slice(0, 6)}...{address?.slice(-4)}
                  </Button>
                </div>
              )}
            </div>

            {renderConnectionStatus()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground font-mono">
              Loading checkout...
            </p>
          </div>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
