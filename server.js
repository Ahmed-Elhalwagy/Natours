// Everything out of express we do it here.
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' }); // this command will read our variables and save them into node JS envionment variables

const app = require('./app');

//Error in DB connection Unhandled Rejection
process.on('unhandledRejection', (err) => {
  console.log('ERROR: ', err.name, err.message);
  console.log('UNHANDLER REJECTION');
  server.close(() => {
    process.exit(1);
  });
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.set('strictQuery', true); //DeprecationWarning
mongoose
  .connect(DB, {
    useNewURLParser: true,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log('DB connection successful');
  });
// .catch((err) => console.log('ERROR in DB connection'));

// console.log(app.get('env'));
// console.log(process.env);

const port = process.env.PORT;
const server = app.listen(port, () =>
  console.log(`Listening on port ${port}: `)
);

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION');
  console.log('ERROR: ', err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
// console.log(x); // uncaught Exception
