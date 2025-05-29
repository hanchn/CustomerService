const app = require('./app');
const { createServer } = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./socket/socketHandler');

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:8080", "http://localhost:8081"],
    methods: ["GET", "POST"]
  }
});

// Socket.io 处理
socketHandler(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});