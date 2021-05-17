const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');


const router = express.Router();

router.get('/', usersController.getUsers);
router.get('/profile/:uid', usersController.getUserById);

router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail()
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersController.signup
);

router.post('/login', usersController.login);

router.patch(
  '/profile/:uid',
  [
    check('name').isLength({ min: 5 })
      .not()
      .isEmpty()
  ],
  usersController.updateProfile
);

module.exports = router;