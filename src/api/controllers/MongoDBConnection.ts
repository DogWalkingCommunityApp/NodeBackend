const jssha = require('jssha');
const randomString = require('randomstring');
const defaultValidity: number = 43200;
import { AuthTokenStore } from '../types/MongoDBController';
import { LoginObject } from './../types/UserController';
import { DogObject } from './../types/DogController';
const MongoClient = require('mongodb').MongoClient;
let counter;

/*
Aufbau der Datenbank:
    DB's:
        admin,
        config,
        local,
        data -> Daten für die Anwendung
         ->  Collections:
                dogs,           -> Daten für die Hunde
                routes,         -> Daten für die Routen
                userprofile,    -> Daten für das Profil der User
                userlogin       -> Daten für die Logindaten der User
                counter         -> Speichert den UserID Counter
*/

class MongoDBConnection {
    private authStore: AuthTokenStore = {};

    constructor() {
        this.connect().then(res => {
            const { connection, db }:any = res;
            connection.collection("counter").findOne({}, (err, result) => {
                if (!result) {
                    connection.collection("counter").insertOne({
                        counter: 0
                    });
                }
                db.close();
            });
        });
    }

    private connect = () => {
        //specify the connection URL
        const url = 'mongodb://localhost:20000/';

        let resolver;
        let rejecter;
        const response = new Promise((resolve, reject) => {
            resolver = resolve;
            rejecter = reject;
        });

        //Connecting to the Database
        MongoClient.connect(url, function (err, db) {
            console.log("Connected!");

            const dbo = db.db("data");

            resolver({ connection: dbo, db });
        });
        return response;
    };

    public doesUserExist = async (username: string, email: string):Promise<boolean> => {
        const { connection, db }:any = await  this.connect();

        let resolver, rejecter;

        const response:Promise<boolean> = new Promise((res, rej) => resolver = res);

        connection.collection("userprofile").findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        }, function (err, result) {
            if (err) throw err;

            if (result && (result.name === username || result.email === email))
            {
                resolver(true);
            } else {
                resolver(false);
            }
        });

        db.close();

        return await response;
    };

    public getUserData = async (username: string, email: string, id?:number):Promise<any> => {
        const { connection, db }:any = await  this.connect();

        let resolver, rejecter;

        const response:Promise<any> = new Promise((res, rej) => resolver = res);

        connection.collection("userprofile").findOne({
            $or: [
                { username: username },
                { email: email },
                { id: id }
            ]
        }, function (err, result) {
            if (err) throw err;
            console.log(result)
            if (result && (result.username === username || result.email === email || result.id === id))
            {
                resolver(result);
            } else {
                resolver(false);
            }
        });

        db.close();

        return await response;
    }

    public addUserProfile = async (profileObject):Promise<boolean> => {
        const { connection, db }: any = await this.connect();
        counter ? null : counter = await this.getCounter();
        profileObject.id = counter;

        counter++;

        profileObject = Object.assign({ profileImg: '/images/placeholder.svg' }, profileObject);

        delete profileObject.password;

        profileObject.friends = [];

        connection.collection("userprofile").insertOne(profileObject);
        this.updateCounter();

        db.close();
        return true;
    };

    public addUserLogin = async (username: string, password: string, email: string):Promise<boolean> => {
        const { connection, db }: any = await this.connect();

        const salt: string = randomString.generate(16);
        const shaObj = new jssha("SHA3-512", "TEXT");
        shaObj.update(salt + password);
        const saltedPassword: string = shaObj.getHash("HEX");


        connection.collection("userlogin").insertOne({
            username,
            password: saltedPassword,
            salt,
            email
        });

        db.close();
        return true;
    };

    public addDogToUser = async (dogObject):Promise<boolean> => {
        const { connection, db }: any = await this.connect();
        console.log(dogObject)
        //const tempID = "5e674c44b9c115366c80319b";

        connection.collection("userprofile").insertOne(dogObject);

      /*  connection.collection("userprofile").updateOne(
            {_id:tempID},{
                $set:{
                    dogs:{
                        dogName:dogObject.dogName,
                        dogAge:dogObject.dogAge,
                        dogRace:dogObject.dogRace,
                        dogSize:dogObject.dogSize,
                        dogDescription:dogObject.dogDescription,
                        dogGender:dogObject.dogGender,
                        neutered:dogObject.neutered
                    }
                }
            });*/

        db.close();
        return true;
    };


    public getDogFromUser = async ():Promise<boolean> => {
        const { connection, db }: any = await this.connect();

        let resolver, rejecter;

        const response:Promise<boolean> = new Promise((res, rej) => resolver = res);

        connection.collection("userprofile").findOne({

        }, function (err, result) {
            if (err) throw err;

            if (result)
            {
                resolver(result);
            } else {
                resolver(false);
            }
        });

        db.close();
        return await response;
    };



    /*  public updateDogFromUser = async (userId, dogName, dogAge?, dogRace?, dogSize?, dogDescription?, dogGender?, neutered?):Promise<boolean> => {

      };

      public deleteDogFromUser = async (userId, dogName):Promise<boolean> => {

      };
  */



    /**
     * The function allows for toke  or password authentification
     */
    public authenticate = async (username: string, email: string, password: (string | null), authTokenId: (string | null)): Promise<LoginObject> => {
        if (authTokenId) {
            const isTokenValid = this.checkAuthToken(authTokenId);

            if (isTokenValid) {
                const token = this.authStore[authTokenId];
                const userData = await this.getUserData(token.username, token.email);

                const userToken = Object.assign({}, token);

                delete userToken.selfDestructHandler;

                return {success: true, message: 'Authentification Token is valid', data: { authToken: userToken, userData }};
            }
        }

        if (password) {
            const passwordValid = await this.checkLogin(username, email, password);

            console.log('Validation Message: ', passwordValid.message);

            if (passwordValid.success) {
                const userData = await this.getUserData(username, email);

                const authToken = this.generateAuthToken(userData.username, userData.email);

                const userToken = Object.assign({}, authToken);

                delete userToken.selfDestructHandler;

                return {success: true, message: 'Authentification Successful', data: { authToken: userToken, userData }};
            } else {
                return {success: false, message: 'Authentification failed, wrong password'}
            }

        } else {
            return {success: false, message: 'Authentification failed, auth token not valid'}
        }
    }

    // TODO: Type ME!
    public logout = (authTokenId: string): any => {
        const token = this.authStore[authTokenId];
        if (token) {
            const username = token.username;
            this.updateOnlineStatus(username, false);

            delete this.authStore[authTokenId];

            return { success: true, message: 'Logged out Successfully!' };
        }

        return { success: false, message: 'User not logged in.' };
    }

    public updateOnlineStatus = async (identifier: (number | string), isOnline: boolean):Promise<void> => {
        const { connection, db }:any = await  this.connect();

        connection.collection("userprofile").updateOne({
            $or: [
                { username: identifier },
                { id: identifier }
            ]
        }, {
            $set: { visible: isOnline }
        });

        db.close();
    };

    public resetOnlineStatus = async ():Promise<void> => {
        const { connection, db }:any = await  this.connect();

        connection.collection("userprofile").updateMany({}, {
            $set: { visible: false }
        });

        db.close();
    };

    public getFriends = async (friends: (string | number)[]): Promise<any[]> => {
        const { connection, db }:any = await  this.connect();

        let resolver, rejecter;

        const response:Promise<any> = new Promise((res, rej) => resolver = res);

        connection.collection("userprofile").find({
            id: {
                $in: friends || []
            }
        }, function (err, result) {
            if (err) throw err;
                resolver(result.toArray());
        });

        db.close();

        return await response;
    }

    private checkAuthToken = (tokenId: string): boolean => {
        let validToken: boolean = false;

        if (this.authStore[tokenId]) {
            const token = this.authStore[tokenId];
            const currentTime = new Date().getTime()/1000;
            if (token.validity > currentTime) {
                validToken = true;
            } else {
                delete this.authStore[tokenId];
            }
        }

        return validToken;
    }

    private generateAuthToken = (username: string, email: string) => {
        const authId: string = randomString.generate(32);
        const currentTime = new Date().getTime()/1000;
        const validity: number = currentTime + defaultValidity;

        const authToken = {
            id: authId,
            validity,
            username,
            email,
            selfDestructHandler: (setTimeout(() => {
                delete this.authStore[authId];
            }, defaultValidity*1000) as unknown as number)
        }

        this.authStore[authId] = authToken;

        return authToken;
    }

    private checkLogin = async (username: string, email: string, password: string):Promise<any> => {
        const { connection, db }:any = await  this.connect();

        let resolver, rejecter;

        const response:Promise<any> = new Promise((res, rej) => resolver = res);
        connection.collection("userlogin").findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        }, function (err, result) {
            if (err) throw err;

            if (result && (result.username === username || result.email === email))
            {
                const shaObj = new jssha("SHA3-512", "TEXT");
                shaObj.update(result.salt + password);
                const correctPassword: boolean = shaObj.getHash('HEX');

                if (correctPassword === result.password) {
                    resolver({ success: true, message: 'Login successful' });
                } else {
                    resolver({ success: false, message: 'Wrong password' });
                }

            } else {
                resolver({ success: false, message: 'Login not found' });
            }
        });

        db.close();

        return await response;

    }

    public getCounter = async (): Promise<number> => {
        const { connection, db }: any = await this.connect();

        let resolver, rejecter;

        const response:Promise<number> = new Promise((res, rej) => resolver = res)

        connection.collection("counter").findOne({}, function (err, result) {
            if (err) throw err;
            db.close();

            resolver(result ? result.counter : 0);

        });

        db.close();

        return await response;
    };

    public updateCounter = async (): Promise<number> => {
        const { connection, db }: any = await this.connect();

        connection.collection("counter").updateOne({}, {
                $set: {
                    "counter": counter
                }
            });

        db.close();
        return counter;
    };

    public getUserID = async (username: string): Promise<number> => {
        const { connection, db }: any = await this.connect();
        let userID: number;

        let resolver, rejecter;

        const response:Promise<number> = new Promise((res, rej) => resolver = res);

        connection.collection("userprofile").findOne({
            $or: [
                { username: username }
            ]
        }, function (err, result) {
            if (err) throw err;
            resolver(result.id);
            db.close();
        });

        userID = await response;

        if(userID === undefined){
            userID = -1;
        }

        db.close();

        return userID;
    };

    public getUserName = async (userId: number): Promise<string> => {
        const { connection, db }: any = await this.connect();
        let userName: string;

        connection.collection("userprofile").findOne({
            $or: [
                { "id": userId }
            ]
        }, function (err, result) {
            if (err) throw err;
            userName = result.username;
            db.close();
        });

        if(userName === undefined){
            userName = "";
        }

        db.close();

        return await userName;
    }
/*
//Inserting documents in a collection
    //Use the insertOne method to insert a document
    db.collection('userprofile').insertOne({
        id: 1,
        name: "NewUser"
    });

//Updating documents in a collection
    //Use the updateOne method
    db.collection('userprofile').updateOne({
    "name": "NewUser" },
        {
            $set: {
                "name": "Johanna"
            }
    });

//Deleting documents in a collection
    //Use the deleteOne method
    db.collection('userprofile').deleteOne(
        {
            "name": "Johanna"
        }
    );
*/
}

const mongoDB = new MongoDBConnection();

export default mongoDB;
