import { Socket } from 'socket.io';
import trackingRoutes from './socketRoutes/trackingRoutes';
import chattingRoutes from './socketRoutes/chattingRoutes';

export default (socket: Socket, io) => {
    trackingRoutes(socket);
    chattingRoutes(socket, io);
}
