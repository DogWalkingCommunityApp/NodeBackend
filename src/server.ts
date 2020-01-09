import * as Express from 'express';
import { Express as IExpress } from 'express';
import bodyParser = require('body-parser');
import cors = require('cors');
import Routes from './api/routes';

const port: number = Number(process.env.PORT) || 3000; // port / default port

// Start up an instance of app
const app: IExpress = Express();

// Configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
app.use(cors());

// Register all routes
const server = Routes(app);

server.listen(port);