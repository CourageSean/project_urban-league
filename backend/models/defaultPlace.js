const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const defaultPlaceSchema = new Schema({
  title: { type: String },
  description: { type: String },
  image: { type: String },
  address: { type: String },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  }
});

module.exports = mongoose.model('DefaultPlaces', defaultPlaceSchema);
