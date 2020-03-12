import  userInteractions from './routes/userInteractionsRoutes';
import  dataInteractions from './routes/dataRoutes';
import { Express as IExpress } from 'express';
import * as SocketIO from 'socket.io';
import { Socket } from 'socket.io';
import { Server } from 'http';
import socketRoutes from './socketRoutes';


export default (app: IExpress) => {
  const server = new Server(app);
  const io = SocketIO(server);


  io.on('connection', (socket: Socket) => {
    console.log('a user is connected');
    socket.on('disconnect', function () {
      console.log('user disconnected');
      // Apply socket routes
    });
    socketRoutes(socket, io);
  });

    userInteractions(app);
    dataInteractions(app);

    return server;

}
