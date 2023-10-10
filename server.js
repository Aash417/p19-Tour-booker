const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

process.on('uncaughtException', err => {
  console.log('Uncaught Exception');
  console.log(err.name, err.message);
  console.log(err.stack);
  process.exit(1);
});
// connect with mongoose
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// This will be need if you are using mongoose v5
mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

mongoose.connect(DB).then(con => {
  console.log('database connection successfull');
});

const port = process.env.PORT || 5020;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('Rejected promise :');
  console.log(err.name, err.message);
  console.log(err.stack);
  server.close(() => {
    process.exit(1);
  });
});
