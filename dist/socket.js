"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureSockets = void 0;
const configureSockets = (io) => {
    io.on("connection", (socket) => {
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
exports.configureSockets = configureSockets;
