const express = require('express');
const socketIo = require('socket.io');

const app = express();
//app.use(cors());

app.get('/', (_, res) => {
    res.send('Hi!');
});

const server = app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
})

const io = socketIo(server);


let rooms = {};
let socketToRoom = {};

io.on("connection", socket => {
    socket.on("join", data => {
        //User joins room
        const roomId = data.room;
        socket.join(roomId);
        socketToRoom[socket.id] = roomId;

        //Persist user in room
        if(rooms[roomId]) {
            rooms[roomId].push({ id: socket.id, name: data.name });
        } else {
            rooms[roomId] = [{ id: socket.id, name: data.name }];
        }

        //Send list of joined users to the new user
        const users = rooms[data.room].filter(user => user.id !== socket.id);
        io.sockets.to(socket.id).emit("room_users", users);
        console.log('Joined Room: ' + data.room + ' name: ' + data.name);
    });

    socket.on('offer', sdp => {
        socket.broadcast.emit('getOffer', sdp);
        console.log('Offer: ', socket.id);
    });

    socket.on('answer', sdp => {
        socket.broadcast.emit('getAnswer', sdp);
        console.log('answer: ', socket.id);
    });

    socket.on('candidate', candidate => {
        socket.broadcast.emit('getCandidate', candidate);
        console.log('candidate: ', socket.id);
    });

    socket.on('disconnect', () => {
        const roomId = socketToRoom[socket.io];
        let room = rooms[roomId];

        if(room) {
            room = room.filter(user => user.id !== socket.io);
            rooms[roomId] = room;
        }

        socket.broadcast.to(room).emit('user_exit', { id: socket.id });
        console.log(`[${socketToRoom[socket.id]}]: ${socket.id} exit`);
    });
});