import { Server, Socket } from "socket.io";

let onlineUsers: Map<string, string> = new Map();

export const socketServer = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  io.on("connection", (socket: Socket) => {
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

    socket.on("send-notification", (userId: string[]) => {
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
