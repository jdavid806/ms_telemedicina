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

