import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors"; 

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("✅ Usuario conectado:", socket.id);

    // Unir usuario a una sala específica
    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        console.log(`👥 Usuario ${socket.id} se unió a la sala ${roomId}`);
    });

    // Transmitir oferta WebRTC
    socket.on("offer", ({ roomId, offer }) => {
        socket.to(roomId).emit("offer", offer);
        console.log("📤 Oferta enviada a la sala:", roomId);
    });

    // Transmitir respuesta WebRTC
    socket.on("answer", ({ roomId, answer }) => {
        socket.to(roomId).emit("answer", answer);
        console.log("📤 Respuesta enviada a la sala:", roomId);
    });

    // Manejo de ICE candidates
    socket.on("candidate", ({ roomId, candidate }) => {
        socket.to(roomId).emit("candidate", candidate);
        console.log("📤 Candidato ICE enviado a la sala:", roomId);
    });

    // Manejo del chat en tiempo real
    socket.on("send-message", ({ roomId, message, user }) => {
        socket.to(roomId).emit("receive-message", { message, user });
        console.log(`💬 Mensaje en ${roomId}: ${user}: ${message}`);
    });

    socket.on("disconnect", () => {
        console.log("❌ Usuario desconectado:", socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
