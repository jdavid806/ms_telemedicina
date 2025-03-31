const chatToggleBtn = document.getElementById('chatToggleBtn');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatContainer = document.getElementById('chatContainer');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const typingIndicator = document.getElementById("typingIndicator");

if (roomId) {
    socket.emit("join-room", { roomId });
}

socket.on("connect", () => {
    console.log("✅ Conectado a Socket.io con ID:", socket.id);
});

chatToggleBtn.addEventListener('click', () => chatContainer.classList.toggle('hidden'));
closeChatBtn.addEventListener('click', () => chatContainer.classList.add('hidden'));

const sendMessage = () => {
    const message = messageInput.value.trim();
    if (!message || !roomId) return;

    socket.emit("send-message", { roomId, message, user: userName });
    addMessageToChat(message, userName, true);
    messageInput.value = "";
    messageInput.focus();
};

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

sendMessageBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});

let unreadMessages = 0;
const originalTitle = document.title;

socket.on("receive-message", ({ message, user, senderId }) => {
    if (senderId === socket.id) return;
    addMessageToChat(message, user, false);
    
    unreadMessages++;
    document.title = `(${unreadMessages}) Nuevo mensaje - Telemedicina`;

    window.addEventListener("focus", () => {
        unreadMessages = 0;
        document.title = originalTitle;
    });

    if (document.hidden && Notification.permission === "granted") {
        new Notification("Nuevo mensaje", {
            body: `${user}: ${message}`,
            icon: "icono.png"
        });
    }
});

if (Notification.permission === "default") {
    Notification.requestPermission();
}

socket.on("user-joined", (user) => {
    notificationSound.play();
});

socket.on("user-left", (user) => {
    notificationSound.play();
});



// ----------------------- "Escribiendo..." -----------------------

// let typingTimeout;

// messageInput.addEventListener("input", () => {
//     socket.emit("typing", { roomId, user: userName });

//     // Mostrar el indicador si está oculto
//     typingIndicator.style.display = "inline-block";

//     clearTimeout(typingTimeout);
//     typingTimeout = setTimeout(() => {
//         if (messageInput.value.trim() === "") { // Solo oculta si está vacío
//             console.log("🛑 Enviando evento 'stop-typing'");
//             socket.emit("stop-typing", { roomId });
//         }
//     }, 2000); // Espera 2 segundos sin escribir
// });

// // Mostrar la notificación cuando alguien está escribiendo
// socket.on("user-typing", (user, senderId) => {
//     if (senderId === socket.id) return; // Evita mostrarlo para el propio usuario

//     typingIndicator.textContent = `${user} está escribiendo...`;
//     typingIndicator.classList.remove("hidden");
// });


// // Ocultar la notificación solo si el input está vacío
// socket.on("user-stopped-typing", () => {
//     if (messageInput.value.trim() === "") {
//         console.log("✅ Ocultando indicador de 'escribiendo'");
//         typingIndicator.style.display = "none";
//     }
// });
