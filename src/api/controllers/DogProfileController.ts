import { Request, Response } from 'express';
import { DogObject } from './../types/DogController';
import mongoDB from './MongoDBConnection';

class DogProfileController{
    constructor() {
    }

    public addDog = async (req: Request, res: Response) => {
        const { userId, dogName, dogBirthDate, dogRace, dogSize, dogDescription, dogGender, neutered } = req.body;
        const success:boolean = await mongoDB.addDogToUser(req.body);
        res.send({success, message: success ? 'Registration complete' : 'Error during registration'})
    };

    public get = async (req: Request, res: Response)=>{

    };

    public change = async (req: Request, res: Response)=>{

    };

    public delete = async (req: Request, res: Response)=>{

    }
}

export default DogProfileController;
