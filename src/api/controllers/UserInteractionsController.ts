import { Request, Response } from 'express';
import mongoDB from "./MongoDBConnection";

class UserInteractionsController {
    constructor() {
    }
  
    public login = (req: Request, res: Response) => {
      res.send('not yet implemented')
    }

    public test = (req: Request, res: Response) => {
        mongoDB.connect(req, res);
    }
  }
  
  export default UserInteractionsController;
