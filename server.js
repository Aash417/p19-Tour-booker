const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

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
  //   console.log(con.connections);
  console.log('database connection successfull');
});

const port = process.env.PORT || 5020;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
