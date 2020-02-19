import * as Express from 'express';
import { Express as IExpress } from 'express';
import bodyParser = require('body-parser');
import cors = require('cors');
import Routes from './api/routes';

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

const webpush = require('web-push');
webpush.setVapidDetails('mailto:starwars.98@hotmail.de', PUBLIC_VAPID, PRIVATE_VAPID);

app.use('/images', Express.static(__dirname + '/images'));

// Cors for cross origin allowance
app.use(cors());

app.post('/subscription', (req, res) => {
    const subscription = req.body;
    notifications.push(subscription);
});
app.post('/sendNotification', (req, res) => {
    const notificationPayload = {
        notification: {
            title: 'New Notification',
            body: 'This is the body of the notification'
        },
    };


    notifications.forEach(subscription => {
        promises.push(
            webpush.sendNotification(
                subscription,
                JSON.stringify(notificationPayload)
            )
        )
    });
    Promise.all(promises).then(() => res.sendStatus(200))
});
// Register all routes
const server = Routes(app);

server.listen(port);
