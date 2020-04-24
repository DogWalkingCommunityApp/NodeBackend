import {Express as IExpress} from 'express';
import DogProfileController from "../controllers/DogProfileController";

export default (app: IExpress) => {
    const controller = new DogProfileController();

    app.route('/addDog')
        .post(controller.addDog);

}
