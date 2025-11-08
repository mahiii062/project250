class NibashChatbot {
    constructor() {
        this.isOpen = false;
        this.conversationHistory = [];
        this.isLoading = false;
        this.init();
    }

    async init() {
        const success = await this.testConnection();

        // Always create HTML first, then attach listeners
        this.createChatbotHTML();
        this.attachEventListeners();

        if (success) {
            this.loadConversationHistory();
            console.log("✅ Chatbot initialized successfully");
        } else {
            console.warn("⚠️ Chatbot backend not available");
            this.showInitialWarning();
        }
    }

    async testConnection() {
        try {
            const response = await fetch("/api/chatbot/test");
            const data = await response.json();
            return data.status === "online";
        } catch (error) {
            console.error("Connection test failed:", error);
            return false;
        }
    }

    showInitialWarning() {
        const messagesContainer = document.getElementById("chatbot-messages");
        if (messagesContainer) {
            const warningMessage = document.createElement("div");
            warningMessage.className = "bot-message warning-message";
            warningMessage.innerHTML = `
        <div class="message-content">
          <strong>Note:</strong> I'm currently in setup mode. Some features might be limited.
        </div>
        <div class="message-time">${this.getCurrentTime()}</div>
      `;
            messagesContainer.appendChild(warningMessage);
        }
    }

    createChatbotHTML() {
        if (document.getElementById("nibash-chatbot")) return; // prevent duplicates

        const chatbotHTML = `
      <div id="nibash-chatbot" class="chatbot-container">
        <div class="chatbot-header">
          <h3>Nibash Assistant</h3>
          <button class="close-btn" aria-label="Close">&times;</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages">
          <div class="bot-message">
            <div class="message-content">
              Hello! I'm your Nibash assistant. I can help you with furniture recommendations, interior design advice, finding vendors, and home improvement services. How can I assist you today?
            </div>
            <div class="message-time">${this.getCurrentTime()}</div>
          </div>
        </div>
        <div class="chatbot-input">
          <input 
            type="text" 
            id="chatbot-input" 
            placeholder="Ask about furniture, services, or vendors..." 
            maxlength="500"
          >
          <button id="send-message">Send</button>
        </div>
        <div class="chatbot-footer">
          <small>AI-powered home services assistant</small>
        </div>
      </div>
      <button id="chatbot-toggle" class="chatbot-toggle" aria-label="Open Chat">
        💬
      </button>
    `;

        document.body.insertAdjacentHTML("beforeend", chatbotHTML);
    }

    attachEventListeners() {
        // Use event delegation (more reliable)
        document.body.addEventListener("click", (e) => {
            if (e.target.matches("#chatbot-toggle")) {
                this.toggleChatbot();
            } else if (e.target.matches(".close-btn")) {
                this.closeChatbot();
            } else if (e.target.matches("#send-message")) {
                this.sendMessage();
            }
        });

        // Enter key handler
        document.body.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !this.isLoading && e.target.id === "chatbot-input") {
                this.sendMessage();
            }
        });
    }

    async sendMessage() {
        if (this.isLoading) return;

        const input = document.getElementById("chatbot-input");
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        this.addMessageToUI(message, "user");
        input.value = "";

        this.setLoadingState(true);
        this.showTypingIndicator();

        try {
            const response = await fetch("/api/chatbot/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message,
                    conversationHistory: this.conversationHistory,
                }),
            });

            const data = await response.json();

            this.removeTypingIndicator();
            this.setLoadingState(false);

            if (response.ok && data.response) {
                this.addMessageToUI(data.response, "bot");
                this.conversationHistory.push(
                    { role: "user", content: message },
                    { role: "assistant", content: data.response }
                );
                this.saveConversationHistory();
            } else {
                const errorMsg =
                    data.response || data.error || "Sorry, I encountered an error. Please try again.";
                this.addMessageToUI(errorMsg, "bot");
            }
        } catch (error) {
            console.error("🚨 Fetch error:", error);
            this.removeTypingIndicator();
            this.setLoadingState(false);
            this.addMessageToUI(
                "Sorry, I am having connection issues. Please check your internet and try again.",
                "bot"
            );
        }
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        const input = document.getElementById("chatbot-input");
        const sendBtn = document.getElementById("send-message");

        if (input) {
            input.disabled = loading;
            input.placeholder = loading
                ? "Processing..."
                : "Ask about furniture, services, or vendors...";
        }

        if (sendBtn) {
            sendBtn.disabled = loading;
            sendBtn.textContent = loading ? "..." : "Send";
        }
    }

    addMessageToUI(message, sender) {
        const messagesContainer = document.getElementById("chatbot-messages");
        if (!messagesContainer) return;

        const messageElement = document.createElement("div");
        messageElement.className = `${sender}-message`;
        messageElement.innerHTML = `
      <div class="message-content">${this.escapeHTML(message)}</div>
      <div class="message-time">${this.getCurrentTime()}</div>
    `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById("chatbot-messages");
        if (!messagesContainer) return;

        const typingElement = document.createElement("div");
        typingElement.className = "bot-message typing-indicator";
        typingElement.id = "typing-indicator";
        typingElement.innerHTML = `
      <div class="message-content">
        <span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>
      </div>
    `;

        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const typingElement = document.getElementById("typing-indicator");
        if (typingElement) typingElement.remove();
    }

    escapeHTML(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    saveConversationHistory() {
        if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
        }
        localStorage.setItem("nibashChatHistory", JSON.stringify(this.conversationHistory));
    }

    loadConversationHistory() {
        const saved = localStorage.getItem("nibashChatHistory");
        if (saved) this.conversationHistory = JSON.parse(saved);
    }

    toggleChatbot() {
        const chatbot = document.getElementById("nibash-chatbot");
        if (!chatbot) return;
        this.isOpen = !this.isOpen;

        chatbot.classList.toggle("active", this.isOpen);
        if (this.isOpen) {
            setTimeout(() => {
                const input = document.getElementById("chatbot-input");
                if (input) input.focus();
            }, 150);
        }
    }

    closeChatbot() {
        const chatbot = document.getElementById("nibash-chatbot");
        if (!chatbot) return;
        chatbot.classList.remove("active");
        this.isOpen = false;
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener("DOMContentLoaded", () => new NibashChatbot());
