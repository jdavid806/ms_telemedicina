import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid"; // Para generar IDs únicos de sala

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("Usuario conectado:", socket.id);


    socket.on("create-room", () => {
        const roomId = uuidv4(); 
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
