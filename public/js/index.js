// console.log('Hello from Parcel!');
import '@babel/polyfill';
import { login, logout } from './login.js';
import { updateSettings } from './updateSettings.js';
import { signUp } from './signUp.js';
import lodash from 'lodash';
import { showAlert } from './alert';
import { bookTour } from './stripe.js';

const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-password');
const signUpForm = document.querySelector('.sign-up-form');
const bookTourBtn = document.getElementById('book-tour-btn');

if (signUpForm) {
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    signUp(name, email, password, passwordConfirm);
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (updateForm) {
  updateForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    console.log(form);
    updateSettings(form, 'data');
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn-save-password').textContent = 'Updating';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn-save-password').textContent = 'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookTourBtn) {
  bookTourBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    e.preventDefault();
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
  });
}
// const a = { name: 'ahmed', age: 12 };
// const b = lodash.cloneDeep(a);
// console.log(b);
