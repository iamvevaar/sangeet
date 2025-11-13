import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 1e7, // 10MB
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('createRoom', () => {
    let roomId;
    do {
      roomId = Math.random().toString(36).substring(2, 6);
    } while (rooms[roomId]);
    rooms[roomId] = {
      web: socket.id,
      mobile: null,
    };
    socket.join(roomId);
    socket.emit('roomCreated', roomId);
    console.log(`Room created: ${roomId}`);
  });

  socket.on('joinRoom', (roomId) => {
    if (rooms[roomId]) {
      rooms[roomId].mobile = socket.id;
      socket.join(roomId);
      io.to(rooms[roomId].web).emit('mobileJoined');
      socket.emit('mobileJoined');
      console.log(`Mobile joined room: ${roomId}`);
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  socket.on('play', (data) => {
    const { roomId } = data;
    if (rooms[roomId] && rooms[roomId].web) {
      io.to(rooms[roomId].web).emit('play');
    }
  });

  socket.on('pause', (data) => {
    const { roomId } = data;
    if (rooms[roomId] && rooms[roomId].web) {
      io.to(rooms[roomId].web).emit('pause');
    }
  });

  socket.on('seek', (data) => {
    const { roomId, time } = data;
    if (rooms[roomId] && rooms[roomId].web) {
      io.to(rooms[roomId].web).emit('seek', time);
    }
  });

  socket.on('playSong', (data) => {
    const { roomId, song } = data;
    if (rooms[roomId] && rooms[roomId].web) {
      io.to(rooms[roomId].web).emit('playSong', song);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    for (const roomId in rooms) {
      if (rooms[roomId].web === socket.id || rooms[roomId].mobile === socket.id) {
        delete rooms[roomId];
        console.log(`Room closed: ${roomId}`);
        break;
      }
    }
  });
});

httpServer.listen(3001, () => {
  console.log('listening on *:3001');
});