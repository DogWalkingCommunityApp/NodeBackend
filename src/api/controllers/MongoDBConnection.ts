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
                counter         -> Speichert den ID Counter
*/

class MongoDBConnection {
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
    }

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
    }

    public addUserProfile = async (profileObject):Promise<boolean> => {
        const { connection, db }: any = await this.connect();
        counter ? null : counter = await this.getCounter();
        profileObject.id = counter;

        counter++;

        connection.collection("userprofile").insertOne(profileObject);
        this.updateCounter()

        db.close();
        return true;
    }

    public addUserLogin = async (username: string, password: string):Promise<boolean> => {
        const { connection, db }: any = await this.connect();

        //TODO: Create and add a salt to the entry. Hash the password with the salt

        connection.collection("userlogin").insertOne({
            name: username,
            password: password
        });

        db.close();
        return true;
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
    }

    public updateCounter = async (): Promise<number> => {
        const { connection, db }: any = await this.connect();

        connection.collection("counter").updateOne({}, {
                $set: {
                    "counter": counter
                }
            });

        db.close();
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
