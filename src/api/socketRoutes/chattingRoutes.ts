import { Socket } from 'socket.io';
import socketMapping from './../controllers/SocketMappingController';
import mongoDB from './../controllers/MongoDBConnection';

export default (socket: Socket, io) => {

    let socketId: string;

    socket.on("sendMessage", async (data) => {
        let message: string = data.msg;
        let fromUserId: number = data.formUserId;
        let toUserId: number = data.toUserId;
        let fromUserName: string = data.fromUserName;
        if(toUserId != undefined){
            socketMapping.add(toUserId, socket.id);
            socketId = socketMapping.getSocketId(toUserId);
            console.log(socketId);
            if(socket != undefined){
                io.to(socketId).emit("getMessage", fromUserName + ": " + message);
            }
            else{
                console.log("Error: SocketId not found");
            }
            socketMapping.remove(toUserId);
        }
    });
}
