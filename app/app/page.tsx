import { MonadProvider, MonadSlot } from "../components/Monad";
import Link from "next/link";
import { ArrowRight, Zap, Target, Activity } from "lucide-react";

export default function Home() {
  return (
    <MonadProvider publisherWallet="0x6d63C3DD44983CddEeA8cB2e730b82daE2E91E32">
      <main className="min-h-screen relative overflow-hidden bg-background">
        
        {/* Neon Monad Glowing Orbs for deep background atmosphere */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-monad/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-neon-magenta/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
          
          {/* HERO SECTION */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center space-x-2 glass-panel px-4 py-2 rounded-full border-monad/30">
                <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                <span className="text-sm font-mono tracking-wider text-neon-cyan uppercase">10,000 TPS Ad Protocol</span>
              </div>
              
              <h1 className="text-6xl lg:text-8xl font-sans font-bold leading-tight tracking-tighter text-foreground drop-shadow-2xl">
                OWN <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-monad to-neon-cyan">THE ATTENTION.</span>
              </h1>
              
              <p className="text-lg font-mono text-muted-foreground max-w-xl leading-relaxed">
                By-pass legacy ad-networks. Buy slots natively on Monad via x402 escrows. 
                Sub-second finality. Zero intermediaries. Absolute ownership.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  href="/dashboard"
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-mono font-bold text-background bg-foreground hover:bg-monad transition-all duration-300"
                >
                  START PUBLISHING
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/example-ads"
                  className="inline-flex items-center justify-center px-8 py-4 font-mono font-bold text-foreground border border-border glass-panel hover:border-monad/50 transition-all duration-300"
                >
                  LIVE AUCTIONS
                </Link>
              </div>
            </div>

            {/* FLOATING MARKETPLACE COMPOSITION */}
            <div className="flex-1 relative w-full aspect-square hidden lg:block">
              {/* Main Premium Slot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass-panel p-6 border-monad/40 shadow-monad-glow glow-hover z-20 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex justify-between items-center border-b border-border/50 pb-4 mb-4">
                  <h3 className="font-sans text-xl font-bold tracking-tight">PREMIUM HEADER</h3>
                  <span className="text-neon-cyan font-mono text-sm bg-neon-cyan/10 px-2 py-1">LIVE</span>
                </div>
                <MonadSlot
                  slotId="demo-hero-premium"
                  size="banner"
                  price="5.00"
                  durations={['1h', '24h']}
                  category="premium"
                />
              </div>

              {/* Background Queued Slot */}
              <div className="absolute top-[10%] right-[-5%] w-full max-w-sm glass-panel p-6 border-border blur-[2px] opacity-60 z-10 transform rotate-6">
                <div className="flex justify-between items-center border-b border-border/50 pb-4 mb-4">
                  <h3 className="font-sans text-lg font-bold text-muted-foreground">SIDEBAR TILE</h3>
                  <span className="text-neon-magenta font-mono text-xs border border-neon-magenta/50 px-2 py-1">QUEUED</span>
                </div>
                <MonadSlot
                  slotId="demo-hero-background"
                  size="square"
                  price="1.25"
                  durations={['1h']}
                  category="standard"
                />
              </div>
            </div>
          </div>
        </div>

        {/* METRICS & FEATURES GRID */}
        <div className="relative z-10 border-t border-border/50 bg-black/50 backdrop-blur-3xl mt-20">
          <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div className="space-y-4 glow-hover p-6 border border-transparent">
              <Zap className="w-10 h-10 text-neon-cyan mb-6" />
              <h3 className="text-2xl font-sans font-bold tracking-tight">Atomic Finality</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                Powered by Monad's parallel execution. Bids settle in milliseconds rendering legacy Web2 ad-auctions obsolete.
              </p>
            </div>

            <div className="space-y-4 glow-hover p-6 border border-transparent">
              <Activity className="w-10 h-10 text-monad mb-6" />
              <h3 className="text-2xl font-sans font-bold tracking-tight">x402 Facilitators</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                Seamless gasless onboarding via HTTP 402 endpoints. Native USDC cross-chain payment proxying out-of-the-box.
              </p>
            </div>

            <div className="space-y-4 glow-hover p-6 border border-transparent">
              <Target className="w-10 h-10 text-neon-magenta mb-6" />
              <h3 className="text-2xl font-sans font-bold tracking-tight">Zero Extraction</h3>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                Direct Publisher-to-Advertiser pathways. Pull-over-push escrow architecture guarantees unruggable slot ownership.
              </p>
            </div>

          </div>
        </div>

      </main>
    </MonadProvider>
  );
}
