const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  about: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  liveLocation: {
    lat: { type: Number, default: '52.47261204877296' }, lng: { type: Number, default: '13.448861726018933' }
  },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
