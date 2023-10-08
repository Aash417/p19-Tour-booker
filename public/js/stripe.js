/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import { loadStripe } from '@stripe/stripe-js';

export const bookTour = async tourId => {
  const stripe = await loadStripe(
    'pk_test_51NyZfkSJOyvrZ0QJ2oEAM2KMWRmSbP78R2G7wb26KRpT1ajOAZeaeUKB9Vqnr2ftTJPEAYvJ3X08mzkhZ73n7mgl00lma9PHDo'
  );

  try {
    // 1) Get Checkout session
    const response = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    const session = response.data.session;

    // 2) Redirect to checkout form
    await stripe.redirectToCheckout({
      sessionId: session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
