require('dotenv').config();
require('express-async-errors');
const express = require('express');

// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

// Swagger
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');

const swaggerDocument = YAML.load('./swagger.yaml');

const connectDB = require('./db/connect');
const jobsRouter = require('./routes/jobs');
const authRouter = require('./routes/auth');

const app = express();

const authenticationMiddleware = require('./middleware/authentication');
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// We set up rate limit middleware for requests with the help of "express-rate-limit" package.
// This is the basic rate-limiting middleware for Express.
// We use it to limit repeated requests to public APIs and/or endpoints such as password reset
// for abuse-prevention.
// IMPORTANT:
// If we are behind a proxy/load balancer (usually the case with most hosting services,
// e.g. Heroku, Bluemix, AWS ELB, Nginx, Cloudflare, Akamai, Fastly, Firebase Hosting,
// Rackspace LB, Riverbed Stingray, etc.), the IP address of the request might be
// the IP of the load balancer/reverse proxy (making the rate limiter effectively
// a global one and blocking all requests once the limit is reached) or undefined.
// To solve this issue, we add the following line to our code (right after
// we create the express application):
app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per "windowMs"
  }),
);
app.use(express.json());
// We use "HELMET" middleware to secure Express apps
// by setting various HTTP headers (by default, it sets around 10-15 headers)
app.use(helmet());
// We use "CORS" middleware to enable CORS
app.use(cors());
// We use "XSS" middleware to sanitize user input coming from POST body, GET queries, and url params
app.use(xss());

// just to be able to quickly check if application is successfully deployed
// we set up a simple route
app.get('/', (req, res) => res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>'));
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticationMiddleware, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
