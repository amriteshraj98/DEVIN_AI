import http from 'http';
import app from './app.js';
import 'dotenv/config.js';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import jwt from 'jsonwebtoken';
import {  generateResult } from './services/ai.service.js'; // Assuming you have an AI service to generate responses



const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const io = new Server(server,{cors: {
    origin:'*'
}});

// Socket.io connection handling
io.use(async (socket, next) => {
     try {

        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[ 1 ];
        const projectId = socket.handshake.query.projectId;

        if(!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid project ID'));
        }
        const project = await projectModel.findById(projectId);
        if (!project) {
            return next(new Error('Project not found'));
        }
        socket.project = project;

        if (!token) {
            return next(new Error('Authentication error'))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return next(new Error('Authentication error'))
        }


        socket.user = decoded;

        next();

    } catch (error) {
        next(error)
    }

    });
io.on('connection', socket => {
    socket.roomId = socket.project._id.toString()


    console.log('a user connected');



    socket.join(socket.roomId);

    socket.on('project-message', async data => {

        const message = data.message;

        const aiIsPresentInMessage = message.includes('@ai');
        socket.broadcast.to(socket.roomId).emit('project-message', data)

        if (aiIsPresentInMessage) {


            const prompt = message.replace('@ai', '');

            const result = await generateResult(prompt);


            io.to(socket.roomId).emit('project-message', {
                message: result,
                sender: {
                    _id: 'ai',
                    email: 'AI'
                }
            })


            return
        }


    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.leave(socket.roomId)
    });
});





server.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}`);
});