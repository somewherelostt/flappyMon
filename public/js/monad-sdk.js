/**
 * Ad-402 SDK - Decentralized Advertising Platform
 * Version: 1.0.0
 */

(function(window) {
  'use strict';

  // Configuration
  let config = {
    publisherWallet: '',
    network: 'base',
    currency: 'USDC',
    apiBaseUrl: '/api',
    theme: 'light',
    autoRefresh: true
  };

  // State management
  let slots = new Map();
  let activePlacements = new Map();
  let isInitialized = false;

  // Utility functions
  const utils = {
    formatPrice: (amount, currency = 'USDC') => {
      return `${amount} ${currency}`;
    },

    formatDuration: (minutes) => {
      if (minutes < 60) return `${minutes}m`;
      if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
      return `${Math.floor(minutes / 1440)}d`;
    },

    generateId: () => {
      return Math.random().toString(36).substr(2, 9);
    },

    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  };

  // API client
  const api = {
    async request(endpoint, options = {}) {
      const url = `${config.apiBaseUrl}${endpoint}`;
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return response.json();
    },

    async getSlots(publisherWallet, websiteUrl) {
      const params = new URLSearchParams({
        publisherWallet,
        websiteUrl: websiteUrl || window.location.origin
      });
      return this.request(`/ad-slots?${params}`);
    },

    async createPlacement(data) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      
      return this.request('/ad-placements', {
        method: 'POST',
        body: formData
      });
    },

    async verifyPayment(data) {
      return this.request('/ad-placements/verify-payment', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async trackEvent(placementId, eventType, metadata = {}) {
      return this.request('/analytics', {
        method: 'POST',
        body: JSON.stringify({
          placementId,
          eventType,
          metadata
        })
      });
    }
  };

  // Payment processing
  const payment = {
    async processPayment(amount, recipient, metadata = {}) {
      try {
        // Check if x402 is available
        if (!window.x402) {
          throw new Error('x402 not available. Please install the x402 extension.');
        }

        // Create payment request
        const paymentRequest = {
          amount: amount.toString(),
          currency: config.currency,
          recipient: recipient,
          network: config.network,
          metadata: {
            ...metadata,
            platform: 'Monad',
            timestamp: Date.now()
          }
        };

        // Process payment
        const result = await window.x402.pay(paymentRequest);
        
        if (result.success) {
          return {
            success: true,
            transactionHash: result.transactionHash,
            signature: result.signature
          };
        } else {
          throw new Error(result.error || 'Payment failed');
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        throw error;
      }
    }
  };

  // Modal management
  const modal = {
    create(html) {
      const modalElement = document.createElement('div');
      modalElement.className = 'Monad-modal-overlay';
      modalElement.innerHTML = `
        <div class="Monad-modal">
          <div class="Monad-modal-header">
            <h3>Place Ad</h3>
            <button class="Monad-modal-close">&times;</button>
          </div>
          <div class="Monad-modal-content">
            ${html}
          </div>
        </div>
      `;

      // Add styles
      const styles = `
        .Monad-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        .Monad-modal {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .Monad-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        .Monad-modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }
        .Monad-modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6b7280;
        }
        .Monad-modal-content {
          padding: 20px;
        }
        .Monad-form-group {
          margin-bottom: 16px;
        }
        .Monad-form-label {
          display: block;
          margin-bottom: 4px;
          font-weight: 500;
          color: #374151;
        }
        .Monad-form-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        .Monad-form-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        .Monad-form-textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          resize: vertical;
          min-height: 80px;
        }
        .Monad-form-file {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        .Monad-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .Monad-button:hover {
          background: #2563eb;
        }
        .Monad-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .Monad-button-secondary {
          background: #6b7280;
        }
        .Monad-button-secondary:hover {
          background: #4b5563;
        }
        .Monad-error {
          color: #dc2626;
          font-size: 14px;
          margin-top: 4px;
        }
        .Monad-success {
          color: #059669;
          font-size: 14px;
          margin-top: 4px;
        }
      `;

      // Add styles to head if not already added
      if (!document.getElementById('Monad-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'Monad-styles';
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
      }

      return modalElement;
    },

    show(html) {
      const modalElement = this.create(html);
      document.body.appendChild(modalElement);

      // Close modal handlers
      const closeButton = modalElement.querySelector('.Monad-modal-close');
      const overlay = modalElement.querySelector('.Monad-modal-overlay');

      const closeModal = () => {
        document.body.removeChild(modalElement);
      };

      closeButton.addEventListener('click', closeModal);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModal();
        }
      });

      return modalElement;
    }
  };

  // Slot management
  const slotManager = {
    async registerSlot(slotElement) {
      const slotId = slotElement.getAttribute('data-slot-id');
      const size = slotElement.getAttribute('data-size');
      const price = slotElement.getAttribute('data-price');
      const durations = slotElement.getAttribute('data-durations').split(',');
      const category = slotElement.getAttribute('data-category');

      if (!slotId) {
        console.error('Monad: Slot ID is required');
        return;
      }

      // Store slot configuration
      slots.set(slotId, {
        element: slotElement,
        size,
        price,
        durations,
        category,
        registered: true
      });

      // Load existing placements
      await this.loadPlacements(slotId);

      // Set up click handler for placing ads
      slotElement.addEventListener('click', () => {
        this.showPlacementModal(slotId);
      });

      // Update slot display
      this.updateSlotDisplay(slotId);
    },

    async loadPlacements(slotId) {
      try {
        const slotData = await api.getSlots(config.publisherWallet, window.location.origin);
        const slot = slotData.find(s => s.slotIdentifier === slotId);
        
        if (slot && slot.placements.length > 0) {
          const activePlacement = slot.placements.find(p => 
            p.status === 'active' && new Date(p.expiresAt) > new Date()
          );
          
          if (activePlacement) {
            activePlacements.set(slotId, activePlacement);
            this.displayAd(slotId, activePlacement);
          }
        }
      } catch (error) {
        console.error('Error loading placements:', error);
      }
    },

    showPlacementModal(slotId) {
      const slot = slots.get(slotId);
      if (!slot) return;

      const modalHtml = `
        <form id="Monad-placement-form">
          <div class="Monad-form-group">
            <label class="Monad-form-label">Ad Content Type</label>
            <select class="Monad-form-select" name="contentType" required>
              <option value="">Select content type</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="text">Text</option>
            </select>
          </div>

          <div class="Monad-form-group">
            <label class="Monad-form-label">Ad File</label>
            <input type="file" class="Monad-form-file" name="adFile" accept="image/*,video/*">
          </div>

          <div class="Monad-form-group">
            <label class="Monad-form-label">Click URL (optional)</label>
            <input type="url" class="Monad-form-input" name="clickUrl" placeholder="https://example.com">
          </div>

          <div class="Monad-form-group">
            <label class="Monad-form-label">Description</label>
            <textarea class="Monad-form-textarea" name="description" placeholder="Describe your ad..."></textarea>
          </div>

          <div class="Monad-form-group">
            <label class="Monad-form-label">Duration</label>
            <select class="Monad-form-select" name="duration" required>
              ${slot.durations.map(duration => 
                `<option value="${duration}">${duration}</option>`
              ).join('')}
            </select>
          </div>

          <div class="Monad-form-group">
            <label class="Monad-form-label">Price: ${utils.formatPrice(slot.price)}</label>
          </div>

          <div class="Monad-form-group">
            <button type="submit" class="Monad-button">Place Ad</button>
            <button type="button" class="Monad-button Monad-button-secondary" onclick="this.closest('.Monad-modal-overlay').remove()">Cancel</button>
          </div>

          <div id="Monad-form-message"></div>
        </form>
      `;

      const modalElement = modal.show(modalHtml);
      const form = modalElement.querySelector('#Monad-placement-form');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handlePlacementSubmission(slotId, form);
      });
    },

    async handlePlacementSubmission(slotId, form) {
      const formData = new FormData(form);
      const messageDiv = document.getElementById('Monad-form-message');
      
      try {
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        // Get slot data
        const slot = slots.get(slotId);
        const slotData = await api.getSlots(config.publisherWallet, window.location.origin);
        const slotInfo = slotData.find(s => s.slotIdentifier === slotId);

        if (!slotInfo) {
          throw new Error('Slot not found');
        }

        // Process payment
        const paymentResult = await payment.processPayment(
          slot.price,
          config.publisherWallet,
          {
            slotId: slotInfo.id,
            contentType: formData.get('contentType'),
            duration: formData.get('duration')
          }
        );

        // Create placement
        const placementData = {
          slotId: slotInfo.id,
          advertiserWallet: paymentResult.transactionHash, // This would be the actual wallet address
          contentType: formData.get('contentType'),
          clickUrl: formData.get('clickUrl'),
          description: formData.get('description'),
          duration: formData.get('duration'),
          price: slot.price,
          paymentHash: paymentResult.transactionHash,
          adFile: formData.get('adFile')
        };

        const placement = await api.createPlacement(placementData);

        // Verify payment
        await api.verifyPayment({
          placementId: placement.id,
          paymentHash: paymentResult.transactionHash,
          signature: paymentResult.signature,
          advertiserWallet: paymentResult.transactionHash // This would be the actual wallet address
        });

        // Success
        messageDiv.innerHTML = '<div class="Monad-success">Ad placed successfully!</div>';
        
        // Update slot display
        activePlacements.set(slotId, placement);
        this.displayAd(slotId, placement);

        // Close modal after delay
        setTimeout(() => {
          document.querySelector('.Monad-modal-overlay')?.remove();
        }, 2000);

      } catch (error) {
        console.error('Placement error:', error);
        messageDiv.innerHTML = `<div class="Monad-error">Error: ${error.message}</div>`;
        
        // Reset button
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Place Ad';
      }
    },

    displayAd(slotId, placement) {
      const slot = slots.get(slotId);
      if (!slot) return;

      const slotElement = slot.element;
      
      if (placement.content && placement.content.length > 0) {
        const content = placement.content[0];
        const adHtml = `
          <div class="Monad-ad" data-placement-id="${placement.id}">
            ${content.type === 'image' ? 
              `<img src="${content.filePath}" alt="Ad" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;">` :
              content.type === 'video' ?
              `<video src="${content.filePath}" style="width: 100%; height: 100%; object-fit: cover;" controls></video>` :
              `<div style="padding: 20px; text-align: center;">${placement.description || 'Ad'}</div>`
            }
          </div>
        `;
        
        slotElement.innerHTML = adHtml;
        
        // Add click tracking
        const adElement = slotElement.querySelector('.Monad-ad');
        adElement.addEventListener('click', () => {
          this.trackClick(placement.id);
          if (placement.clickUrl) {
            window.open(placement.clickUrl, '_blank');
          }
        });

        // Track view
        this.trackView(placement.id);
      }
    },

    updateSlotDisplay(slotId) {
      const slot = slots.get(slotId);
      if (!slot) return;

      const placement = activePlacements.get(slotId);
      
      if (placement) {
        this.displayAd(slotId, placement);
      } else {
        // Show placeholder
        const slotElement = slot.element;
        slotElement.innerHTML = `
          <div style="text-align: center; color: #666; padding: 20px;">
            <div style="font-size: 24px; margin-bottom: 8px;">📢</div>
            <div>Click to place ad</div>
            <div style="font-size: 12px; margin-top: 4px;">${utils.formatPrice(slot.price)}</div>
          </div>
        `;
      }
    },

    trackView(placementId) {
      api.trackEvent(placementId, 'view', {
        url: window.location.href,
        timestamp: Date.now()
      }).catch(error => {
        console.error('Error tracking view:', error);
      });
    },

    trackClick(placementId) {
      api.trackEvent(placementId, 'click', {
        url: window.location.href,
        timestamp: Date.now()
      }).catch(error => {
        console.error('Error tracking click:', error);
      });
    }
  };

  // Auto-refresh functionality
  const autoRefresh = {
    start() {
      if (!config.autoRefresh) return;
      
      setInterval(() => {
        slots.forEach((slot, slotId) => {
          slotManager.loadPlacements(slotId);
        });
      }, 30000); // Refresh every 30 seconds
    }
  };

  // Public API
  const Monad = {
    init(userConfig) {
      config = { ...config, ...userConfig };
      isInitialized = true;

      // Auto-register slots
      this.registerSlots();
      
      // Start auto-refresh
      autoRefresh.start();

      console.log('Monad SDK initialized', config);
    },

    registerSlots() {
      const slotElements = document.querySelectorAll('.Monad-slot[data-register="true"]');
      slotElements.forEach(slotElement => {
        const slotId = slotElement.getAttribute('data-slot-id');
        if (slotId) {
          slotManager.registerSlot(slotElement);
        }
      });
    },

    registerSlot(slotId, element) {
      if (element) {
        element.setAttribute('data-slot-id', slotId);
        element.setAttribute('data-register', 'true');
        element.classList.add('Monad-slot');
        slotManager.registerSlot(element);
      }
    },

    getConfig() {
      return { ...config };
    },

    getSlots() {
      return Array.from(slots.keys());
    },

    getActivePlacements() {
      return Array.from(activePlacements.entries());
    }
  };

  // Make Monad available globally
  window.Monad = Monad;

  // Auto-initialize if config is available
  if (window.MonadConfig) {
    Monad.init(window.MonadConfig);
  }

})(window);

