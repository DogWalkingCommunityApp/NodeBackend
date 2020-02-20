import { Request, Response } from 'express';
import mongoDB from "./MongoDBConnection";
import {LoginObject} from "../types/UserController";

class ProfileController {

    constructor() {}

    public saveProfilePic = async (req: Request, res: Response) => {
        const { userData , authId, profilePicFile } = req.body;

        if (await mongoDB.doesUserExist(userData.username, userData.email)) {

            const currentLogin: LoginObject = await mongoDB
                .authenticate(userData.username, userData.email, null, authId);

            if (currentLogin.success) {
                const success:boolean = await mongoDB.updateUserProfilePic(profilePicFile);
                res.send({success, message: success ?
                        'Profile picture successfully updated' : 'Failed to update profile picture'})
            }
            else {
                res.send({success: false, message: 'User not authenticated'})
            }

        } else {
            res.send({success: false, message: 'User doesn\'t exist'})
        }
    };

}

export default ProfileController;
