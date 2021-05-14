const express = require('express');

const liveMapController = require('../controllers/live-map-controllers');

const router = express.Router();

router.get('/', liveMapController.getUsers)

module.exports = router;
