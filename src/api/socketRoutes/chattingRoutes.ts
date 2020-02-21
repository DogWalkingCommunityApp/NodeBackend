import { Socket } from 'socket.io';
import mongoDB from './../controllers/MongoDBConnection';

export default (socket: Socket, io) => {
    socket.on("sendMessage", async (data) => {
        let userInfos: string[] = data.toString().split(";");
        let message: string = userInfos[0];
        let username: string = userInfos[1];
        io.of(await mongoDB.getUserID(username)).emit("getMessage", username + ": " + message);
    });
}
