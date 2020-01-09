import  userInteractions from './routes/userInteractionsRoutes';
import { Express as IExpress } from 'express';
import * as SocketIO from 'socket.io';
import { Socket }from 'socket.io';
import { Server } from 'http';
import socketRoutes from './socketRoutes';

export default (app: IExpress) => {
  const server = new Server(app);
  const io = SocketIO(server);

  io.on('connection', (socket: Socket) =>{
    console.log('a user is connected');

    // Apply socket routes
    socketRoutes(socket);
   })

  userInteractions(app);

  return server;
}