// Main exports
export { MonadProvider, useMonadContext, useMonadConfig, useMonadApi, useMonadContracts, useMonadChainId } from './components/MonadProvider';
export { MonadSlot } from './components/MonadSlot';

// Contract hooks — on-chain reads and writes via wagmi
export {
  useActiveSlot,
  useBidQueue,
  useUSDCBalance,
  useUSDCAllowance,
  useVaultBalance,
  usePendingRefund,
  useApproveUSDC,
  usePurchaseSlot,
  useClaimRefund,
  useRotateAd,
} from './hooks/useMonadContract';

// Type exports
export type {
  MonadConfig,
  MonadSlotConfig,
  MonadTheme,
  PaymentConfig,
  AdData,
  SlotInfo,
  QueueInfo,
  MonadProviderProps,
  MonadSlotProps,
  AdResponse,
  QueueResponse,
  MonadError,
  UseMonadSlotReturn,
  MonadContextType,
  OnChainAdSlot,
  OnChainBidQueueEntry,
} from './types';

// Utility exports
export {
  createDefaultConfig,
  validateConfig,
  isValidUrl,
  isValidColor,
  formatPrice,
  formatTimeRemaining,
  generateCheckoutUrl,
  generateUploadUrl,
  fetchAdData,
  fetchQueueInfo,
  readOnChainSlot,
  verifyTxOnChain,
  createAdDataHook,
  generateSlotId,
  parseSlotConfigFromUrl,
  trackAdEvent,
} from './utils';

// Default export
export { MonadProvider as default } from './components/MonadProvider';
