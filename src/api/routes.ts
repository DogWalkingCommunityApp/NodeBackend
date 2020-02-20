import  userInteractions from './routes/userInteractionsRoutes';
import { Express as IExpress } from 'express';
import * as SocketIO from 'socket.io';
import { Socket } from 'socket.io';
import { Server } from 'http';
import socketRoutes from './socketRoutes';
import mongoDB from './controllers/MongoDBConnection';
import profileRoutes from "./routes/profileRoutes";


export default (app: IExpress) => {
  const server = new Server(app);
  const io = SocketIO(server);


  io.on('connection', (socket: Socket) => {
    console.log('a user is connected');
    socket.on('disconnect', function () {
      console.log('user disconnected');
      // Apply socket routes
      socketRoutes(socket);
    });
    socket.on("sendMessage", async (data) => {
      let userInfos: string[] = data.toString().split(";");
      let message: string = userInfos[0];
      let username: string = userInfos[1];
      io.of( await mongoDB.getUserID(username)).emit("getMessage", username + ": " + message);
      socketRoutes(socket);
    });
  });

    userInteractions(app);

    profileRoutes(app);

    return server;

}
