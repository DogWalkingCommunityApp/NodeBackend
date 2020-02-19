import { Socket } from 'socket.io';
import trackingRoutes from './socketRoutes/trackingRoutes';

export default (socket: Socket) => {
    trackingRoutes(socket);
}