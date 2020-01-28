import { Request, Response } from 'express';
import MongoDBController from './MongoDBConnection';
import mongoDB from './MongoDBConnection';

class UserInteractionsController {
    constructor() {
    }
  
    public login = (req: Request, res: Response) => {
      res.send('not yet implemented')
    }

    public register = async (req: Request, res: Response) => {
      const { username, email, password } = req.body;
      if (!await mongoDB.doesUserExist(username, email)) {
        const success:boolean = await mongoDB.addUserProfile(req.body);
        await mongoDB.addUserLogin(username, password);

        res.send({success, message: success ? 'Added succesfully' : 'Error'})
      } else {
        res.send({success: false, message: 'User does already exist'})
      }
    }
  }
  
  export default UserInteractionsController;
