/* eslint-disable*/

const REQUEST_TIMEOUT_SEC = 5;

const formEl = document.querySelector('.form');

const timeout = sec =>
  new Promise((_, reject) => {
    setTimeout(
      () => reject(Error(`Request timed out. Please try again later...`)),
      sec * 1000
    );
  });

const useFetch = async (url, uploadData = null) => {
  try {
    const req = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uploadData)
        })
      : fetch(url);

    const res = await Promise.race([req, timeout(REQUEST_TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) throw Error(data.message);

    return data;
  } catch (err) {
    if (err.message === 'Failed to fetch')
      err.message = `Unable to reach the server. Please check your internet connection...`;
    throw err;
  }
};

const login = async (email, password) => {
  try {
    const res = await useFetch('http://127.0.0.1:8000/api/v1/users/login', {
      email,
      password
    });

    if (res.status !== 'success') return;

    setTimeout(() => window.location.replace('/'), 1000);
  } catch (err) {
    console.error(err.message);
    console.error(err);
  }
};

const handleSubmit = e => {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  login(email, password);

  formEl.reset();
};

formEl.addEventListener('submit', handleSubmit);
