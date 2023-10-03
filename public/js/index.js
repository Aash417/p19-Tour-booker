/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';

console.log('hello from parcel');

const loginForm = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav_el--logout');
console.log(logoutBtn);

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });

if (logoutBtn) logoutBtn.addEventListener('click', logout);
