const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const liveMapRoutes = require('./routes/live-map-routes');
const HttpError = require('./models/http-error');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/livemap', liveMapRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

app.get('/probe', (req, res) => {
  res.json({ name: 'JOHN' });
});

mongoose
<<<<<<< HEAD
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
=======
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8h2fl.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
>>>>>>> a5ebf19cc0407ff81b7a9cb3914d0260f0a79b03
  .then(() => {
    server.listen(process.env.PORT || 5000);
    console.log('listening port 5000');
  })
  .catch((err) => {
    console.log(err);
  });
// io = socket(server);

io.on('connection', (socket) => {
  console.log('someone connected:', socket.id);
  socket.join('position_room');
  socket.on('position_room', (data) => {
    console.log(data, 'coordinates');
    socket.broadcast.emit('position_room', data);
  });
});
