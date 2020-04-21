class SocketMappingController {

    public sockets: { [key:string]: string };

    constructor(){
        this.sockets = {};
    }

    add(userId: number, socketId: string)  {
        this.sockets[userId] = socketId;
    }

    remove(userId: number) {
        delete this.sockets[userId];
    }

    getSocketId(userId: number) {
        return this.sockets[userId];
    }
}

const socketMapping = new SocketMappingController();

export default socketMapping;
