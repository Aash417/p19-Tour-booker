/*eslint-disable*/
// import axios from 'axios';

// const stripePublicKey =
//   'pk_test_51NyZfkSJOyvrZ0QJ2oEAM2KMWRmSbP78R2G7wb26KRpT1ajOAZeaeUKB9Vqnr2ftTJPEAYvJ3X08mzkhZ73n7mgl00lma9PHDo';
// const stripe = stripe(stripePublicKey);

// export const bookTour = async tourId => {
//   try {
//     // 1. get checkout session from api
//     const session = await axios(
//       `http;//127.0.0.1/api/v1/bookings/checkout-session/${tourId}`
//     );
//     console.log(session);
//     // 2. crate checkout form + chager credit card
//     await stripe.redirectToCheckout({
//       sessionId: session.data.session.tourId
//     });
//   } catch (error) {
//     console.log(error);
//     showAlert('error', error);
//   }
// };
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
      `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
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
