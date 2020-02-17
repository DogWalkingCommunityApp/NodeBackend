import { Request, Response } from 'express';
import MongoDBController from './MongoDBConnection';
import { LoginObject } from './../types/UserController';
import mongoDB from './MongoDBConnection';
import { ValidateRegister } from '../helpers/ValidateRegister';

class UserInteractionsController {
    constructor() {
    }
  
    public login = async (req: Request, res: Response) => {
      const { login, password, authId } = req.body;

      const authentification: LoginObject = await mongoDB.authenticate(login, login, password, authId);
      
      res.send(authentification);
    }

    public register = async (req: Request, res: Response) => {
      if (!ValidateRegister(req.body)) {
        res.send(res.send({success: false, message: 'Data validation failed'}))
      }

      const { username, email, password } = req.body;
      if (!await mongoDB.doesUserExist(username, email)) {
        const success:boolean = await mongoDB.addUserProfile(req.body);
        await mongoDB.addUserLogin(username, password, email);

        res.send({success, message: success ? 'Registration complete' : 'Error during registration'})
      } else {
        res.send({success: false, message: 'User does already exist'})
      }
    }
  }
  
  export default UserInteractionsController;
