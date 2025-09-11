
import Message from '../models/message.js';
const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a private chat room for two users
    socket.on('joinChat', ({ userId, friendId }) => {
      const roomId = [userId, friendId].sort().join('_');
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
    });

    // Send message
    socket.on('sendMessage', async ({ senderId, recipientId, content }, callback) => {
      try {
        const message = await Message.create({
          sender: senderId,
          recipient: recipientId,
          content,
        });

        const roomId = [senderId, recipientId].sort().join('_');
        io.to(roomId).emit('receiveMessage', {
          _id: message._id,
          sender: senderId,
          content: message.content,
          createdAt: message.createdAt,
        });

        callback({ status: 'success', message });
      } catch (error) {
        callback({ status: 'error', message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

export default setupSocket;