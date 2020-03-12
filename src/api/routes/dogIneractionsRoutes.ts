import {Express as IExpress} from 'express';
import UserInteractionsController from "../controllers/DogProfileController";

export default (app: IExpress) => {
    const controller = new UserInteractionsController();

    app.route('/addDog')
        .post(controller.addDog);

   // app.route('/register')
   //     .post(controller.register);

    // app.route('/passwordForgotten')
    //     .post(controller.passwordForgotten)

}
