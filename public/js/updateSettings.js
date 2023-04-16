import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  const url =
    type === 'password'
      ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
      : 'http://127.0.0.1:3000/api/v1/users/updateMe';
  try {
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    console.log(res.data);
    if (res.data.status === 'success') {
      showAlert('Success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    console.log(err);
  }
};
