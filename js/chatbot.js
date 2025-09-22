// ================== Chatbot Open/Close ==================
const chatbotButton = document.getElementById("chatbot-button");
const chatbotBox = document.getElementById("chatbot-box");
const closeChat = document.getElementById("close-chat");
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatBody = document.getElementById("chat-body");

// Open chatbot
chatbotButton.addEventListener("click", () => {
    chatbotBox.style.display = "flex";
    userInput.focus();
});

// Close chatbot
closeChat.addEventListener("click", () => {
    chatbotBox.style.display = "none";
});

// ================== Send Message ==================
sendBtn.addEventListener("click", sendMessage);

// Send message on Enter key
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

// ================== Helper: Add message ==================
function addMessage(text, sender, isTyping = false) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    if (isTyping) messageDiv.classList.add("typing");
    messageDiv.innerHTML = text;

    // Timestamp
    const timestamp = document.createElement("span");
    timestamp.classList.add("timestamp");
    const now = new Date();
    timestamp.textContent =
        now.getHours().toString().padStart(2, "0") + ":" +
        now.getMinutes().toString().padStart(2, "0");
    messageDiv.appendChild(timestamp);

    chatBody.appendChild(messageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    return messageDiv;
}

// ================== Quick Suggestions ==================
const suggestions = ["Show furniture deals", "Find interior designer", "Home services", "Contact support"];

function addSuggestions() {
    const sugContainer = document.createElement("div");
    sugContainer.classList.add("message", "assistant", "suggestions");

    suggestions.forEach(text => {
        const btn = document.createElement("button");
        btn.classList.add("suggestion-btn");
        btn.textContent = text;
        btn.addEventListener("click", () => {
            userInput.value = text;
            sendMessage();
            sugContainer.remove();
        });
        sugContainer.appendChild(btn);
    });

    chatBody.appendChild(sugContainer);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
}

// ================== Send Message Function ==================
async function sendMessage() {
    const input = userInput.value.trim();
    if (!input) return;

    // Add user message
    addMessage(`💬 ${input}`, "user");

    userInput.value = "";
    userInput.disabled = true;

    // Typing indicator
    const typingIndicator = addMessage("🤖 Typing...", "assistant", true);

    try {
        const response = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: input })
        });
        const data = await response.json();

        // Remove typing
        typingIndicator.remove();

        // Add AI reply
        addMessage(`🤖 ${data.reply}`, "assistant");

        // Show quick suggestions after reply
        addSuggestions();
    } catch (err) {
        typingIndicator.remove();
        addMessage("⚠️Sorry! Something went wrong.", "assistant");
        console.error(err);
    } finally {
        userInput.disabled = false;
        userInput.focus();
    }
}
