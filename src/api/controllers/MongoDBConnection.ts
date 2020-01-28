const MongoClient = require('mongodb').MongoClient;
let counter = 10000000;

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
                counter         -> Speichert den ID Counter
*/

class MongoDBConnection {
    constructor() {
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

            resolver(dbo);
        });
        return response;
    }

    public doesUserExist = async (username: string, email: string):Promise<boolean> => {
        const connection:any = await  this.connect();

        connection.collection("userprofile").findOne({}, function (err, result) {
            if (err) throw err;
            if (result.name === username || result.email === email)
            {
                return true;
            }
        });

        return false;
    }

    public addUserProfile = async (profileObject):Promise<boolean> => {
        const connection: any = await this.connect();
        profileObject.id = await this.getCounter();

        connection.collection("userprofile").insertOne(profileObject);
        this.updateCounter

        connection.close();
        return true;
    }

    public addUserLogin = async (username: string, password: string):Promise<boolean> => {
        const connection: any = await this.connect();

        connection.collection("userlogin").insertOne({
            name: username,
            password: password
        });

        connection.close();
        return true;
    }

    public getCounter = async (): Promise<number> => {
        const connection: any = await this.connect();

        connection.collection("counter").findOne({}, function (err, result) {
            if (err) throw err;
            connection.close();

            return result.counter;

        });

        return null;
    }

    public updateCounter = async (): Promise<number> => {
        const connection: any = await this.connect();
        counter++;
        connection.collection("counter").updateOne({
                "counter": "counter" },
            {
                $set: {
                    "counter": counter
                }
            });
        return counter;
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
