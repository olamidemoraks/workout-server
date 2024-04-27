"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketServer = void 0;
const socket_io_1 = require("socket.io");
let onlineUsers = new Map();
const socketServer = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "http://localhost:3000",
        },
    });
    io.on("connection", (socket) => {
        socket.on("add-user", (userId) => {
            console.log(`${userId} connected to socket`);
            onlineUsers.set(userId, socket.id);
            socket.broadcast.emit("online-user", {
                onlineUsers: Array.from(onlineUsers.keys()),
            });
        });
        socket.on("signout", (id) => {
            onlineUsers.delete(id);
            socket.broadcast.emit("online-user", {
                onlineUsers: Array.from(onlineUsers.keys()),
            });
        });
        socket.on("send-notification", (userId) => {
            console.log({ "Sent-Notification": userId });
            userId.forEach((id) => {
                const senderUserSocket = onlineUsers.get(id);
                if (senderUserSocket) {
                    socket.to(senderUserSocket).emit("receive-notification", {
                        success: true,
                        message: "New notification",
                    });
                }
            });
        });
    });
};
exports.socketServer = socketServer;
//# sourceMappingURL=socketServer.js.map