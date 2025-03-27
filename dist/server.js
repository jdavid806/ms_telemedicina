"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const uuid_1 = require("uuid"); // Para generar IDs únicos de sala
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "*" },
    path: "/telemedicina/socket.io"
});
app.use((0, cors_1.default)());
app.use(express_1.default.static("public"));
io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);
    socket.on("create-room", () => {
        const roomId = (0, uuid_1.v4)();
        socket.join(roomId);
        console.log(`Sala creada: ${roomId} por ${socket.id}`);
        socket.emit("room-created", roomId);
    });
    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        console.log(`Usuario ${socket.id} se unió a la sala ${roomId}`);
    });
    socket.on("offer", ({ roomId, offer }) => {
        socket.to(roomId).emit("offer", offer);
        console.log("Oferta enviada a la sala:", roomId);
    });
    socket.on("answer", ({ roomId, answer }) => {
        socket.to(roomId).emit("answer", answer);
        console.log("Respuesta enviada a la sala:", roomId);
    });
    socket.on("candidate", ({ roomId, candidate }) => {
        socket.to(roomId).emit("candidate", candidate);
        console.log("Candidato ICE enviado a la sala:", roomId);
    });
    socket.on("send-message", ({ roomId, message, user }) => {
        socket.to(roomId).emit("receive-message", { message, user });
        console.log(`Mensaje en ${roomId}: ${user}: ${message}`);
    });
    socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id);
    });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
