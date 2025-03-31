const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");
const userRole = urlParams.get("role");
let userName = userRole === 'doctor' ? 'Doctor' : 'Paciente';
// Configuración de Socket.io
// const socket = io("http://localhost:3000", {
//     path: "/telemedicina/socket.io",
//     transports: ["websocket"],
//     query: { roomId, userRole }
// });

const socket = io("https://6b67-152-202-84-100.ngrok-free.app", {
    path: "/telemedicina/socket.io",
    transports: ["websocket"],
    query: { roomId, userRole }
});

// Vincular los botones a sus respectivas funciones
document.querySelector('.control-btn[title="Mute microphone"]').addEventListener("click", toggleMute);
document.querySelector('.control-btn[title="Turn off camera"]').addEventListener("click", toggleCamera);
document.querySelector('.control-btn.danger[title="Leave call"]').addEventListener("click", leaveCall);

// Función para mutear/desmutear el micrófono
function toggleMute() {
    console.log("Activando/desactivando el micrófono...");
    if (!localStream) return;
    localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        console.log("Micrófono activo:", track.enabled);

        // Actualizar el icono del botón
        const muteIcon = document.querySelector('.control-btn[title="Mute microphone"] i');
        if (track.enabled) {
            muteIcon.classList.remove("fa-microphone-slash");
            muteIcon.classList.add("fa-microphone");
        } else {
            muteIcon.classList.remove("fa-microphone");
            muteIcon.classList.add("fa-microphone-slash");
        }
    });
}

function toggleCamera() {
    console.log("Activando/desactivando la cámara...");
    if (!localStream) return;
    localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        console.log("Cámara activa:", track.enabled);

        // Actualizar el icono del botón
        const cameraIcon = document.querySelector('.control-btn[title="Turn off camera"] i');
        if (track.enabled) {
            cameraIcon.classList.remove("fa-video-slash");
            cameraIcon.classList.add("fa-video");
        } else {
            cameraIcon.classList.remove("fa-video");
            cameraIcon.classList.add("fa-video-slash");
        }
    });
}

function leaveCall() {
    // Cerrar la conexión RTCPeerConnection
    if (peerConnection) {
        peerConnection.close();
        console.log("Conexión cerrada.");
    }

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        console.log("Pistas locales detenidas.");
    }

    alert("Has salido de la llamada.");
}
