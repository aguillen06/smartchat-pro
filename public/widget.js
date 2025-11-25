/**
 * SmartChat Pro - Embeddable Chat Widget
 * Version: 1.0.0
 *
 * A self-contained vanilla JavaScript chat widget for customer support.
 * No external dependencies required.
 */

(function() {
  'use strict';

  // Configuration
  const API_BASE_URL = window.location.origin;
  const STORAGE_KEYS = {
    VISITOR_ID: 'smartchat_visitor_id',
    CONVERSATION_ID: 'smartchat_conversation_id'
  };

  class SmartChatWidget {
    constructor(config) {
      this.config = {
        widgetKey: config.widgetKey,
        primaryColor: config.primaryColor || '#0EA5E9',
        position: config.position || 'bottom-right',
        apiUrl: config.apiUrl || API_BASE_URL
      };

      this.isOpen = false;
      this.conversationId = null;
      this.visitorId = null;
      this.messageQueue = [];

      this.init();
    }

    init() {
      // Load CSS
      this.loadStyles();

      // Get or create visitor ID
      this.visitorId = this.getOrCreateVisitorId();

      // Get conversation ID from session
      this.conversationId = sessionStorage.getItem(STORAGE_KEYS.CONVERSATION_ID);

      // Create widget elements
      this.createWidget();

      // Attach event listeners
      this.attachEventListeners();
    }

    loadStyles() {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${this.config.apiUrl}/widget.css`;
      document.head.appendChild(link);
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
      container.className = `smartchat-widget smartchat-${this.config.position}`;

      // Create chat bubble button
      const bubble = document.createElement('button');
      bubble.id = 'smartchat-bubble';
      bubble.className = 'smartchat-bubble';
      bubble.style.backgroundColor = this.config.primaryColor;
      bubble.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;

      // Create chat window
      const chatWindow = document.createElement('div');
      chatWindow.id = 'smartchat-window';
      chatWindow.className = 'smartchat-window smartchat-hidden';
      chatWindow.innerHTML = `
        <div class="smartchat-header" style="background-color: ${this.config.primaryColor}">
          <h3>Chat with us</h3>
          <button id="smartchat-close" class="smartchat-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div id="smartchat-messages" class="smartchat-messages">
          <div class="smartchat-welcome">
            <p>Hi! How can we help you today?</p>
          </div>
        </div>
        <div class="smartchat-input-container">
          <input
            type="text"
            id="smartchat-input"
            class="smartchat-input"
            placeholder="Type your message..."
            autocomplete="off"
          />
          <button id="smartchat-send" class="smartchat-send" style="background-color: ${this.config.primaryColor}">
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
        messages: chatWindow.querySelector('#smartchat-messages'),
        input: chatWindow.querySelector('#smartchat-input'),
        sendButton: chatWindow.querySelector('#smartchat-send'),
        closeButton: chatWindow.querySelector('#smartchat-close')
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

      // Clear input
      this.elements.input.value = '';

      // Display user message
      this.addMessage(message, 'user');

      // Show typing indicator
      const typingId = this.showTypingIndicator();

      try {
        // Send to API
        const response = await fetch(`${this.config.apiUrl}/api/chat`, {
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
          const error = await response.json();
          throw new Error(error.error || 'Failed to send message');
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
        this.addMessage('Sorry, something went wrong. Please try again.', 'assistant');
      }
    }

    addMessage(text, role) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `smartchat-message smartchat-message-${role}`;

      const bubble = document.createElement('div');
      bubble.className = 'smartchat-message-bubble';

      if (role === 'user') {
        bubble.style.backgroundColor = this.config.primaryColor;
      }

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
        new SmartChatWidget(config);
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
