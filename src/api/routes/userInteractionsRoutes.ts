import UserInteractionsController from './../controllers/UserInteractionsController';
import { Express as IExpress } from 'express';

export default (app: IExpress) => {
  const controller = new UserInteractionsController();

  app.route('/login')
      .post(controller.login);

  app.route('/register')
      .post(controller.register);



  // app.route('/passwordForgotten')
  //     .post(controller.passwordForgotten)

}
