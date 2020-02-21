import * as Express from 'express';
import { Express as IExpress } from 'express';
import bodyParser = require('body-parser');
import cors = require('cors');

import Routes from './api/routes';
import mongoDB from './api/controllers/MongoDBConnection';

const port: number = Number(process.env.PORT) || 3000; // port / default port
const notifications = [];
const promises = [];
const PUBLIC_VAPID =
    'BLh_eSBke1-kJSm8d21jlj88Zz6_iwPW69pbUzQ1IWMrz7-ZDzC8hUpmyjxm4vI1a7xeX2ETZ0tw2eoCsm358XA';
const PRIVATE_VAPID = '3x9XokcKR3kvFh63mKdgcMAxbNRbg_zqOMl4y5MvtcQ';

// Start up an instance of app
const app: IExpress = Express();

// Configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Reset visibility on server Startup
mongoDB.resetOnlineStatus();

app.use('/images', Express.static(__dirname + '/images'));

// Cors for cross origin allowance
app.use(cors());

app.post('/subscription', (req, res) => {
    const subscription = req.body;
    notifications.push(subscription);
});

// Register all routes
const server = Routes(app);


server.listen(port);
