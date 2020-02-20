import ProfileController from '../controllers/ProfileController';
import { Express as IExpress } from 'express';


export default (app: IExpress) => {
    const controller = new ProfileController();

    app.route('/profile/updateProfilePic')
        .post(controller.saveProfilePic);

}
