import { Request, Response } from 'express';
import mongoDB from './MongoDBConnection';

class DataController {
    constructor() {
    }

    public getFriends = async (req: Request, res: Response) => {
      const friendsData = await mongoDB.getFriends(req.body.friends);
      const message = {
          success: Array.isArray(friendsData),
          data: friendsData
      }
      res.send(message);
    }
  }
  
  export default DataController;
