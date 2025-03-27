import { Server, Socket } from "socket.io";

export const configureSockets = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("Usuario conectado:", socket.id);

    socket.on("offer", (offer) => {
      socket.broadcast.emit("offer", offer);
    });

    socket.on("answer", (answer) => {
      socket.broadcast.emit("answer", answer);
    });

    socket.on("ice-candidate", (candidate) => {
      socket.broadcast.emit("ice-candidate", candidate);
    });

    socket.on("disconnect", () => {
      console.log("Usuario desconectado:", socket.id);
    });
  });
};