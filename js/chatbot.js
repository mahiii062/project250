const chatBtn = document.getElementById("chatbot-button");
const chatBox = document.getElementById("chatbot-box");
const closeChat = document.getElementById("close-chat");
const sendBtn = document.getElementById("send-btn");
const input = document.getElementById("user-input");
const chatBody = document.getElementById("chat-body");

/* ---------------- New Message Badge ---------------- */
let newMsgBadge = document.createElement("div");
newMsgBadge.id = "new-msg-badge";
newMsgBadge.textContent = "New Messages ↓";
Object.assign(newMsgBadge.style, {
  position: "absolute",
  bottom: "10px",
  left: "50%",
  transform: "translateX(-50%)",
  background: "#ffdd57",
  padding: "5px 12px",
  borderRadius: "16px",
  cursor: "pointer",
  display: "none",
  fontSize: "13px",
  fontWeight: "600",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  transition: "opacity 0.3s"
});
chatBox.appendChild(newMsgBadge);

/* ---------------- Chatbox Toggle ---------------- */
chatBtn.onclick = () => {
  chatBox.style.display = "flex";
  input.focus();
  scrollToBottomSmooth();
};

closeChat.onclick = () => {
  chatBox.style.display = "none";
};

/* ---------------- Badge Click Scroll ---------------- */
newMsgBadge.onclick = () => {
  scrollToBottomSmooth();
  newMsgBadge.style.display = "none";
};

/* ---------------- Send Button & Enter ---------------- */
sendBtn.onclick = sendMessage;
input.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

/* ---------------- Message Append Function ---------------- */
function appendMessage(sender, text) {
  const atBottom = isAtBottom();

  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  msgDiv.innerHTML = text
    .replace(/\n/g, "<br>")
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
  msgDiv.style.opacity = "0";
  msgDiv.style.transition = "opacity 0.4s ease";

  chatBody.appendChild(msgDiv);

  requestAnimationFrame(() => (msgDiv.style.opacity = "1"));

  // Add timestamp
  const time = document.createElement("span");
  time.classList.add("timestamp");
  time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  msgDiv.appendChild(time);

  if (atBottom) {
    scrollToBottomSmooth();
  } else {
    highlightNewMessage(msgDiv);
  }

  playSound(sender);
}

/* ---------------- Highlight New Message ---------------- */
function highlightNewMessage(msgDiv) {
  msgDiv.style.background = "#fff8c2"; // soft yellow
  setTimeout(() => (msgDiv.style.background = ""), 1500);
  newMsgBadge.style.display = "block";
}

/* ---------------- Typing Indicator ---------------- */
function appendTyping() {
  const typing = document.createElement("div");
  typing.classList.add("message", "assistant", "typing");
  typing.innerHTML = `
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  `;
  chatBody.appendChild(typing);
  if (isAtBottom()) scrollToBottomSmooth();
  return typing;
}

function removeTyping(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

/* ---------------- Smooth Scroll ---------------- */
function scrollToBottomSmooth() {
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
}

function isAtBottom() {
  return chatBody.scrollTop + chatBody.clientHeight >= chatBody.scrollHeight - 10;
}

/* ---------------- Message Sending ---------------- */
let isSending = false;

async function sendMessage() {
  const text = input.value.trim();
  if (!text || isSending) return;

  appendMessage("user", text);
  input.value = "";

  isSending = true;
  const typingEl = appendTyping();

  try {
    const res = await fetch("http://localhost:5555/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    removeTyping(typingEl);
    appendMessage("assistant", data.reply || "⚠️ No response from server.");
  } catch (err) {
    removeTyping(typingEl);
    appendMessage("assistant", "⚠️ Connection issue, please try again.");
    console.error(err);
  } finally {
    isSending = false;
    input.focus();
  }
}

/* ---------------- Hide Badge on Scroll ---------------- */
chatBody.addEventListener("scroll", () => {
  if (isAtBottom()) newMsgBadge.style.display = "none";
});

/* ---------------- Optional Sound Effect ---------------- */
function playSound(sender) {
  // Light "pop" sound when receiving a message
  if (sender === "assistant") {
    const audio = new Audio(
      "https://cdn.pixabay.com/download/audio/2022/03/15/audio_7e0f6bff48.mp3?filename=message-pop-alert-35843.mp3"
    );
    audio.volume = 0.2;
    audio.play().catch(() => { }); // Ignore autoplay errors
  }
}
