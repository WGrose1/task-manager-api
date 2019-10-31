const express = require('express');
//Makes sure mongoose connects to database
require('./db/mongoose');

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

// const bodyParser = require('body-parser');

const app = express();
//const port = process.env.PORT;

//middleware metheod to run before and other requests
// app.use((req, res, next) => {
//     if (req) {
//         res.status(503).send('Website Down for maintenence');
//     }
// });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
