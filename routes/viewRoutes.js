const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

// to improve performance use this only where route is not protected
// router.use(authController.isLoggedIn);

router.get(
  '/',
  bookingController.createBookingsCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);

// router.post(  '/submit-user-data',  authController.protect,  viewsController.updateUserData);

module.exports = router;
