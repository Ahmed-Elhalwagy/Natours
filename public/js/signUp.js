import axios from 'axios';
import { showAlert } from './alert';

export const signUp = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    console.log('AXIOS RESPONSE: ', res);
    if (res.data.status == 'success') {
      showAlert('success', 'Your accound have been made successfully!');
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
