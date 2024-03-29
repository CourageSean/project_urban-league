const fs = require('fs');
const cors = require('cors');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');
const staticPlace = require('../models/staticPlace');

const getAllStaticPlaces = async (req, res, next) => {
  let staticPlaces;
  try {
    staticPlaces = await staticPlace.find({});
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find static places.',
      500
    );
    return next(error);
  }

  if (!staticPlaces) {
    const error = new HttpError('Could not find staticplaces.', 404);
    return next(error);
  }

  res.json({ staticPlaces: staticPlaces });
};

const getStaticPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  console.log(placeId);

  let place;
  try {
    place = await staticPlace.findById(placeId);
    console.log(place);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      'Could not find place for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const updateStaticPlacesActiveUsers = async (req, res, next) => {
  console.log(req.query);
  const placeId = req.params.uid;
  const userId = req.query.userId;
  const time = req.query.time;

  //const userId = req.body.userId;

  //{country:req.query.location, activity:req.query.activity}
  staticPlace.findById(placeId).then((result) => {
    const newList = [...result.activeUsers, userId];
    staticPlace.findByIdAndUpdate(
      { _id: placeId },
      { activeUsers: newList },
      function (err, result) {
        if (err) {
          res.send(err);
        } else {
          setTimeout(() => {
            staticPlace.findById(placeId).then((result) => {
              const newListUpdate = [...result.activeUsers];
              const listUpdated = newListUpdate.filter((elt) => {
                return elt !== userId;
              });

              console.log('list:', newListUpdate);
              console.log('Filteredlist:', listUpdated);
              console.log('userId:', userId);

              staticPlace.findByIdAndUpdate(
                { _id: placeId },
                {
                  activeUsers: listUpdated,
                },
                function (err, result) {
                  if (err) {
                    res.redirect(err);
                  } else {
                  }
                }
              );
            });
          }, Number(time));
        }
        res.send('http://localhost:3000');
      }
    );
  });

  // let staticPlaceActive;

  // try {
  //   staticPlaceActive = await staticPlace.findById(placeId);
  // } catch (err) {
  //   const error = new HttpError(
  //     'Something went wrong, could not find static places 01.',
  //     500
  //   );
  //   return next(error);
  // }

  // try {
  //   await staticPlaceActive.activeUsers.push('HarryFuckingPotter');
  // } catch (err) {
  //   const error = new HttpError(
  //     'Something went wrong with push, could not update.',
  //     500
  //   );
  //   return next(error);
  // }

  // try {
  //   await staticPlaceActive.save();
  // } catch (err) {
  //   const error = new HttpError(
  //     'Something went wrong with save, could not update.',
  //     500
  //   );
  //   return next(error);
  // }

  // if (!staticPlaceActive) {
  //   const error = new HttpError('Could not find staticplaces.', 404);
  //   return next(error);
  // }

  // res.json({ staticPlaceActive: staticPlaceActive });
};

const getAll = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      'Could not find place for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError(
      'Could not find place for the provided id.',
      404
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // let places;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, please try again later.',
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0) {
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this place.', 401);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }

  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to delete this place.',
      401
    );
    return next(error);
  }

  const imagePath = place.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: 'Deleted place.' });
};

exports.getAllStaticPlaces = getAllStaticPlaces;
exports.getStaticPlaceById = getStaticPlaceById;
exports.updateStaticPlacesActiveUsers = updateStaticPlacesActiveUsers;
exports.getAll = getAll;
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
