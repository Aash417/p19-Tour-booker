const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');
const errorController = require('./controllers/errorController');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);

  process.exit(1);
});
// connect with mongoose
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// , {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false
//   }

mongoose.connect(DB).then(con => {
  console.log('database connection successfull');
});

const port = process.env.PORT || 5020;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
