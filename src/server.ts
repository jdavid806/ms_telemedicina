import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
  }
});

app.use(express.json());

app.get("/status", (req, res) => {
  res.json({ message: "Servidor de telemedicina funcionando 🚀" });
});

// WebSockets para WebRTC y Chat
io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  socket.on("create-room", () => {
    const roomId = Math.random().toString(36).substr(2, 8);
    socket.join(roomId);
    socket.emit("room-created", roomId);
  });

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.emit("room-joined", roomId);
  });

  socket.on("send-message", ({ roomId, message, user }) => {
    if (roomId && message.trim() !== "") {
      console.log(` [${roomId}] ${user}: ${message}`); // Log en la consola
      io.to(roomId).emit("receive-message", { message, user });
    }
  });
  
  // WebRTC - Señalización
  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor backend de telemedicina en http://localhost:${PORT}`);
});
