/**
 * SmartChat Pro - Embeddable Chat Widget
 * Version: 2.0.0
 *
 * A self-contained vanilla JavaScript chat widget for customer support.
 * No external dependencies required - all styles included inline.
 */

(function() {
  'use strict';

  // Configuration - Extract base URL from script source
  function getScriptBaseUrl() {
    // Find the script tag that loaded this widget
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
      if (script.src && script.src.includes('/widget.js')) {
        // Extract the base URL from the script src
        const url = new URL(script.src);
        return `${url.protocol}//${url.host}`;
      }
    }
    // Fallback to window origin if script not found (shouldn't happen)
    return window.location.origin;
  }

  const API_BASE_URL = getScriptBaseUrl();
  const STORAGE_KEYS = {
    VISITOR_ID: 'smartchat_visitor_id',
    CONVERSATION_ID: 'smartchat_conversation_id'
  };

  class SmartChatWidget {
    constructor(config) {
      this.config = {
        widgetKey: config.widgetKey,
        primaryColor: config.primaryColor || '#3B82F6',
        position: config.position || 'bottom-right',
        apiUrl: config.apiUrl || API_BASE_URL
      };

      // Debug logging
      console.log('[SmartChat] Widget initialized with:', {
        widgetKey: this.config.widgetKey,
        apiUrl: this.config.apiUrl,
        apiEndpoint: `${this.config.apiUrl}/api/chat`
      });

      this.isOpen = false;
      this.conversationId = null;
      this.visitorId = null;
      this.messageQueue = [];

      this.init();
    }

    init() {
      // Inject styles
      this.injectStyles();

      // Get or create visitor ID
      this.visitorId = this.getOrCreateVisitorId();

      // Get conversation ID from session
      this.conversationId = sessionStorage.getItem(STORAGE_KEYS.CONVERSATION_ID);

      // Create widget elements
      this.createWidget();

      // Attach event listeners
      this.attachEventListeners();
    }

    injectStyles() {
      const styleId = 'smartchat-widget-styles';

      // Check if styles already exist
      if (document.getElementById(styleId)) {
        return;
      }

      const styles = `
        /* SmartChat Widget Styles */
        #smartchat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        /* Chat Bubble Button */
        .smartchat-bubble {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: ${this.config.primaryColor};
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          color: white;
        }

        .smartchat-bubble:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        .smartchat-bubble.smartchat-hidden {
          display: none;
        }

        /* Chat Window */
        .smartchat-window {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 380px;
          height: 600px;
          max-height: calc(100vh - 40px);
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.3s ease;
          transform-origin: bottom right;
        }

        .smartchat-window.smartchat-hidden {
          display: none;
        }

        /* Responsive design */
        @media (max-width: 480px) {
          .smartchat-window {
            width: calc(100vw - 40px);
            height: calc(100vh - 40px);
            max-height: none;
            border-radius: 16px;
          }

          #smartchat-widget {
            right: 20px;
            bottom: 20px;
          }
        }

        /* Header */
        .smartchat-header {
          background-color: ${this.config.primaryColor};
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }

        .smartchat-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .smartchat-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .smartchat-close:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }

        /* Messages Area */
        .smartchat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f9fafb;
        }

        .smartchat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .smartchat-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .smartchat-messages::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .smartchat-welcome {
          text-align: center;
          padding: 20px;
          color: #64748b;
          font-size: 14px;
        }

        /* Message Styles */
        .smartchat-message {
          margin-bottom: 16px;
          display: flex;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .smartchat-message-user {
          justify-content: flex-end;
        }

        .smartchat-message-assistant {
          justify-content: flex-start;
        }

        .smartchat-message-bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 18px;
          word-wrap: break-word;
          font-size: 14px;
          line-height: 1.4;
        }

        .smartchat-message-user .smartchat-message-bubble {
          background-color: ${this.config.primaryColor};
          color: white;
          border-bottom-right-radius: 4px;
        }

        .smartchat-message-assistant .smartchat-message-bubble {
          background-color: white;
          color: #1e293b;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* Typing Indicator */
        .smartchat-typing {
          display: flex;
          align-items: center;
          padding: 12px 16px;
        }

        .smartchat-typing span {
          height: 8px;
          width: 8px;
          background-color: #94a3b8;
          border-radius: 50%;
          display: inline-block;
          margin: 0 2px;
          animation: typing 1.4s infinite ease-in-out;
        }

        .smartchat-typing span:nth-child(1) {
          animation-delay: -0.32s;
        }

        .smartchat-typing span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }

        /* Input Area */
        .smartchat-input-container {
          padding: 16px;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .smartchat-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          outline: none;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .smartchat-input:focus {
          border-color: ${this.config.primaryColor};
        }

        .smartchat-send {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: ${this.config.primaryColor};
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .smartchat-send:hover {
          transform: scale(1.05);
        }

        .smartchat-send:active {
          transform: scale(0.95);
        }

        .smartchat-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `;

      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
    }

    getOrCreateVisitorId() {
      let visitorId = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
      if (!visitorId) {
        visitorId = 'visitor_' + this.generateId();
        localStorage.setItem(STORAGE_KEYS.VISITOR_ID, visitorId);
      }
      return visitorId;
    }

    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    createWidget() {
      // Create container
      const container = document.createElement('div');
      container.id = 'smartchat-widget';

      // Create chat bubble button
      const bubble = document.createElement('button');
      bubble.className = 'smartchat-bubble';
      bubble.setAttribute('aria-label', 'Open chat');
      bubble.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;

      // Create chat window
      const chatWindow = document.createElement('div');
      chatWindow.className = 'smartchat-window smartchat-hidden';
      chatWindow.innerHTML = `
        <div class="smartchat-header">
          <h3>Chat Support</h3>
          <button class="smartchat-close" aria-label="Close chat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="smartchat-messages">
          <div class="smartchat-welcome">
            <p>👋 Hi! How can we help you today?</p>
          </div>
        </div>
        <div class="smartchat-input-container">
          <input
            type="text"
            class="smartchat-input"
            placeholder="Type your message..."
            autocomplete="off"
          />
          <button class="smartchat-send" aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      `;

      container.appendChild(bubble);
      container.appendChild(chatWindow);
      document.body.appendChild(container);

      // Store references
      this.elements = {
        container,
        bubble,
        chatWindow,
        messages: chatWindow.querySelector('.smartchat-messages'),
        input: chatWindow.querySelector('.smartchat-input'),
        sendButton: chatWindow.querySelector('.smartchat-send'),
        closeButton: chatWindow.querySelector('.smartchat-close')
      };
    }

    attachEventListeners() {
      // Toggle chat window
      this.elements.bubble.addEventListener('click', () => this.toggleChat());
      this.elements.closeButton.addEventListener('click', () => this.toggleChat());

      // Send message
      this.elements.sendButton.addEventListener('click', () => this.sendMessage());
      this.elements.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Prevent closing when clicking inside the chat window
      this.elements.chatWindow.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    toggleChat() {
      this.isOpen = !this.isOpen;

      if (this.isOpen) {
        this.elements.chatWindow.classList.remove('smartchat-hidden');
        this.elements.bubble.classList.add('smartchat-hidden');
        this.elements.input.focus();
        this.scrollToBottom();
      } else {
        this.elements.chatWindow.classList.add('smartchat-hidden');
        this.elements.bubble.classList.remove('smartchat-hidden');
      }
    }

    async sendMessage() {
      const message = this.elements.input.value.trim();
      if (!message) return;

      // Disable input while sending
      this.elements.input.disabled = true;
      this.elements.sendButton.disabled = true;

      // Clear input
      this.elements.input.value = '';

      // Display user message
      this.addMessage(message, 'user');

      // Show typing indicator
      const typingId = this.showTypingIndicator();

      try {
        // Send to API
        const apiUrl = `${this.config.apiUrl}/api/chat`;
        console.log('[SmartChat] Sending message to:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            widgetKey: this.config.widgetKey,
            message: message,
            conversationId: this.conversationId,
            visitorId: this.visitorId
          })
        });

        // Remove typing indicator
        this.removeTypingIndicator(typingId);

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch (e) {
            // Response wasn't JSON
          }
          console.error('[SmartChat] API Error:', errorMessage);
          throw new Error(errorMessage);
        }

        const data = await response.json();

        // Store conversation ID
        if (data.conversationId && !this.conversationId) {
          this.conversationId = data.conversationId;
          sessionStorage.setItem(STORAGE_KEYS.CONVERSATION_ID, this.conversationId);
        }

        // Display AI response
        this.addMessage(data.message, 'assistant');

      } catch (error) {
        console.error('SmartChat error:', error);
        this.removeTypingIndicator(typingId);
        this.addMessage('Sorry, something went wrong. Please try again later.', 'assistant');
      } finally {
        // Re-enable input
        this.elements.input.disabled = false;
        this.elements.sendButton.disabled = false;
        this.elements.input.focus();
      }
    }

    addMessage(text, role) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `smartchat-message smartchat-message-${role}`;

      const bubble = document.createElement('div');
      bubble.className = 'smartchat-message-bubble';
      bubble.textContent = text;

      messageDiv.appendChild(bubble);
      this.elements.messages.appendChild(messageDiv);
      this.scrollToBottom();
    }

    showTypingIndicator() {
      const typingId = 'typing-' + this.generateId();
      const typingDiv = document.createElement('div');
      typingDiv.id = typingId;
      typingDiv.className = 'smartchat-message smartchat-message-assistant';
      typingDiv.innerHTML = `
        <div class="smartchat-message-bubble smartchat-typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      `;

      this.elements.messages.appendChild(typingDiv);
      this.scrollToBottom();

      return typingId;
    }

    removeTypingIndicator(typingId) {
      const element = document.getElementById(typingId);
      if (element) {
        element.remove();
      }
    }

    scrollToBottom() {
      setTimeout(() => {
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
      }, 100);
    }
  }

  // Auto-initialize from script tag
  function initializeFromScriptTag() {
    const scripts = document.querySelectorAll('script[data-widget-key]');

    scripts.forEach(script => {
      const config = {
        widgetKey: script.getAttribute('data-widget-key'),
        primaryColor: script.getAttribute('data-primary-color'),
        position: script.getAttribute('data-position'),
        apiUrl: script.getAttribute('data-api-url')
      };

      if (config.widgetKey) {
        // Only initialize one instance per page
        if (!window.__smartchatInitialized) {
          window.__smartchatInitialized = true;
          new SmartChatWidget(config);
        }
      } else {
        console.error('SmartChat: data-widget-key is required');
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFromScriptTag);
  } else {
    initializeFromScriptTag();
  }

  // Expose for manual initialization
  window.SmartChatWidget = SmartChatWidget;
})();