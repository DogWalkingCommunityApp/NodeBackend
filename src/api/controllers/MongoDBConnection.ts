import {Request, Response} from "express";

class MongoDBConnection {
    constructor() {
    }

    public connect = (req: Request, res: Response) => {
        var MongoClient = require('mongodb').MongoClient;

        //specify the connection URL
        var url = 'mongodb://localhost:20000/';

        let resolver;
        let rejecter;
        const response = new Promise((resolve, reject) => {
            resolver = resolve;
            rejecter = reject;
        });

        //Connecting to the Database
        MongoClient.connect(url, function (err, db) {
            console.log("Connected!");

            var dbo = db.db("data");
            //Querying for data in a MongoDB
            //Using the find function to create a cursor of records
            var cursor = dbo.collection('user').find();

            resolver();

            //For each record in the cursor we are calling a function
            cursor.each(function (err, doc) {
                console.log(doc);
            });

            //Closing the database Connection
            db.close();
        });
        return response;
    }

    /*
                //Inserting documents in a collection
                    //Use the insertOne method to insert a document
                    db.collection('user').insertOne({
                        UserID: 1,
                        UserName: "NewUser"
                    });

                //Updating documents in a collection
                    //Use the updateOne method
                    db.collection('user').updateOne({
                    "UserName": "NewUser" },
                        {
                            $set: {
                                "UserName": "Johanna"
                            }
                    });

                //Deleting documents in a collection
                    //Use the deleteOne method
                    db.collection('user').deleteOne(
                        {
                            "UserName": "Johanna"
                        }
                    );
                */
}

const mongoDB = new MongoDBConnection();

export default mongoDB;
