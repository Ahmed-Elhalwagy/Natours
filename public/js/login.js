import axios from 'axios';
import { showAlert } from './alert';
//
export const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    console.log('AXIOS RESPONSE: ', res);
    if (res.data.status == 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/overview');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    console.log(err.response.data);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      location.reload(true); // true force the reload to be from teh server not from teh cache
    }
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error Logging out! Try again.');
  }
};
