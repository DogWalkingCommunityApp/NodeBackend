import { Socket } from 'socket.io';
import socketMapping from './../controllers/SocketMappingController';
import mongoDB from "../controllers/MongoDBConnection";

export default (socket: Socket, io) => {

    let socketId: string;

    socket.on("chatLogin", async (data) => {
       let userId: number = await mongoDB.getUserID(data);
       socketMapping.add(userId, socket.id);
    });

    socket.on("sendMessage", async (data) => {
        let message: string = data.msg;
        let fromUserId: number = data.formUserId;
        let toUserId: number = data.toUserId;
        let fromUserName: string = data.fromUserName;
        if(toUserId != undefined) {
            socketId = socketMapping.getSocketId(toUserId);
            if (socketId != undefined) {
                io.to(`${socketId}`).emit("getMessage", fromUserName + ": " + message);
            } else {
                console.log("Error: SocketId not found");
            }
        }
    });
}
