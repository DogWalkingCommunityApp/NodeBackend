import DataController from './../controllers/DataController';
import { Express as IExpress } from 'express';

export default (app: IExpress) => {
  const controller = new DataController();

  app.route('/getFriends')
      .post(controller.getFriends);
     
  app.route('/getUserData')
      .post(controller.getUserData);
}
