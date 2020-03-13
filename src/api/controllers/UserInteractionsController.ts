import { Request, Response } from 'express';
import { LoginObject } from './../types/UserController';
import mongoDB from './MongoDBConnection';
import { ValidateRegister } from '../helpers/ValidateRegister';
import socketMapping from "./SocketMappingController";

class UserInteractionsController {

    constructor() {
    }
  
    public login = async (req: Request, res: Response) => {
      const { login, password, authId } = req.body;

      const authentification: LoginObject = await mongoDB.authenticate(login, login, password, authId);

      res.send(authentification);
    };

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

    public logout = async (req: Request, res: Response) => {
        const authId = req.body.authId;

        const message = mongoDB.logout(authId);

        const userId = await mongoDB.getUserID(req.body.login);
        socketMapping.remove(userId);

        res.send(message);
    }

    // public passwordForgotten = async (req: Request, res: Response) => {
    //     const sendmail = require('sendmail')({silent: true})
    //
    //     sendmail({
    //         from: 'test@test.de',
    //         to: 'jquednau@yahoo.com',
    //         subject: 'MailComposer sendmail',
    //         html: 'Mail of test sendmail '
    //     }, function (err, reply) {
    //         console.log(err && err.stack)
    //         console.dir(reply)
    //     })
    // }
  }
  
  export default UserInteractionsController;
