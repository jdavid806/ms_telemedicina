import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid"; // Para generar IDs únicos de sala

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
    path: "/telemedicina/socket.io"
});

app.use(cors());
app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("✅ Usuario conectado:", socket.id);

    // Crear una sala
    socket.on("create-room", () => {
        const roomId = uuidv4();
        socket.join(roomId);
        console.log(`🎯 Sala creada: ${roomId} por ${socket.id}`);
        socket.emit("room-created", roomId);
    });

    // Unirse a una sala
    socket.on("join-room", ({ roomId }) => {
        console.log(`📩 SERVIDOR: Recibido join-room para ${roomId} de ${socket.id}`);
        socket.join(roomId);

        const usersInRoom = io.sockets.adapter.rooms.get(roomId);
        console.log(`👥 Usuarios en la sala ${roomId}:`, usersInRoom ? Array.from(usersInRoom) : []);
    });

    // Mensajería en la sala
    socket.on("send-message", ({ roomId, message, user }) => {
        console.log(`📤 SERVIDOR: Mensaje recibido de ${user} (${socket.id}): ${message}`);
        socket.to(roomId).emit("receive-message", { message, user, senderId: socket.id });

        // 🚀 Detener la indicación de "escribiendo" cuando el usuario envía un mensaje
        socket.to(roomId).emit("user-stopped-typing");
    });

    // Usuario está escribiendo
    socket.on("typing", ({ roomId, user }) => {
        socket.to(roomId).emit("user-typing", user, socket.id);
    });
    

    // Usuario dejó de escribir
    socket.on("stop-typing", ({ roomId }) => {
        socket.to(roomId).emit("user-stopped-typing");
    });

    // 🛑 Cuando un usuario se desconecta, asegurarse de que su estado de "escribiendo" se detenga
    socket.on("disconnect", () => {
        console.log(`❌ Usuario desconectado: ${socket.id}`);
        io.emit("user-stopped-typing");
    });


    
    

    // WebRTC - Oferta
    socket.on("offer", ({ roomId, offer }) => {
        if (!roomId || !offer) return;
        socket.to(roomId).emit("offer", offer);
        console.log("📡 Oferta enviada a sala:", roomId);
    });

    // WebRTC - Respuesta
    socket.on("answer", ({ roomId, answer }) => {
        if (!roomId || !answer) return;
        socket.to(roomId).emit("answer", answer);
        console.log("✅ Respuesta enviada a sala:", roomId);
    });

    // WebRTC - ICE Candidate
    socket.on("candidate", ({ roomId, candidate }) => {
        if (!roomId || !candidate) return;
        socket.to(roomId).emit("candidate", candidate);
        console.log("🧊 Candidato ICE enviado a sala:", roomId);
    });

    // Usuario se desconecta
    socket.on("disconnect", () => {
        console.log("❌ Usuario desconectado:", socket.id);
    });
});

// Arrancar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
