import axios from 'axios';

export async function handleRequest(
  type: 'get' | 'post',
  url: string,
  params: any,
) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept-Encoding': 'application/json',
  };

  let response;
  try {
    if (type === 'get') {
      response = await axios.get(url, { params: params, headers: headers });
    } else if (type === 'post') {
      response = await axios.post(url, params, { headers: headers });
    } else {
      throw 'Unsupported HTTP method';
    }
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      return { error: error.message };
    }
  }
}
