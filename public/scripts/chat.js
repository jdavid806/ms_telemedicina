const chatToggleBtn = document.getElementById('chatToggleBtn');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatContainer = document.getElementById('chatContainer');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');

if (roomId) {
    console.log(`📡 FRONTEND: Solicitando unirse a la sala ${roomId}`);
    socket.emit("join-room", { roomId });
}


socket.on("connect", () => {
    console.log("✅ Conectado a Socket.io con ID:", socket.id);
});

chatToggleBtn.addEventListener('click', () => chatContainer.classList.toggle('hidden'));
closeChatBtn.addEventListener('click', () => chatContainer.classList.add('hidden'));

const sendMessage = () => {
    const message = messageInput.value.trim();
    console.log(`✉️ SERVIDOR: Emitiendo mensaje "${message}" a la sala ${roomId}`);

    if (!message || !roomId) return;

    socket.emit("send-message", {
        roomId,
        message,
        user: userName
    });

    addMessageToChat(message, userName, true);
    messageInput.value = "";
    messageInput.focus();
};

// Función para añadir mensajes al chat
function addMessageToChat(message, sender, isOwnMessage = false) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", isOwnMessage ? "message-sent" : "message-received");

    messageElement.innerHTML = `
    ${!isOwnMessage ? `<div class="message-sender">${sender}</div>` : `<div class="message-sender">Tú</div>`}
    <div>${message}</div>
    <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
`;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event listeners
sendMessageBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});

// Escuchar mensajes entrantes
socket.on("receive-message", ({ message, user, senderId }) => {
    console.log(`📥 FRONTEND: Mensaje recibido de ${user} (${senderId}): ${message}`);

    // Evita duplicar el mensaje si fue enviado por el mismo usuario
    if (senderId === socket.id) return;

    addMessageToChat(message, user, false);
});

