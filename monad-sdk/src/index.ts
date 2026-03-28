// Main exports
export { MonadProvider, useMonadContext, useMonadConfig, useMonadApi } from './components/MonadProvider';
export { MonadSlot } from './components/MonadSlot';

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
  MonadContextType
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
  createAdDataHook,
  generateSlotId,
  parseSlotConfigFromUrl,
  trackAdEvent
} from './utils';

// Default export
export { MonadProvider as default } from './components/MonadProvider';
