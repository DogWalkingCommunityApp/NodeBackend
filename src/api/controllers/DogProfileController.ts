import { Request, Response } from 'express';
import { DogObject } from './../types/DogController';
import mongoDB from './MongoDBConnection';

class DogProfileController{
    constructor() {
    }

    public addDog = async (req: Request, res: Response) => {
        const { userId, dogName, dogAge, dogRace, dogSize, dogDescription, dogGender, neutered } = req.body;

        await mongoDB.addDogToUser(userId, dogName, dogAge, dogRace, dogSize, dogDescription, dogGender, neutered);
        res.send("Hund wurde hinzufügt");
        console.log("hund hinzugefügt");
    };

    public get = async (req: Request, res: Response)=>{

    };

    public change = async (req: Request, res: Response)=>{

    };

    public delete = async (req: Request, res: Response)=>{

    }
}

export default DogProfileController;
