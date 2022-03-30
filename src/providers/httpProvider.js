const get = (url) => {
  const token = localStorage.getItem('token');

  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());
};

const post = (url, body) => {
  const token = localStorage.getItem('token');

  return fetch(url, {
    body: JSON.stringify(body),
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json());
};

const put = (url, body) => {
  const token = localStorage.getItem('token');

  return fetch(url, {
    body: JSON.stringify(body),
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json());
};

const patch = (url, body) => {
  const token = localStorage.getItem('token');

  return fetch(url, {
    body: JSON.stringify(body),
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json());
};

const deleteReq = (url, body = {}) => {
  const token = localStorage.getItem('token');

  return fetch(url, {
    body: JSON.stringify(body),
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json());
};

const httpProvider = {
  get,
  post,
  put,
  patch,
  deleteReq,
};

export default httpProvider;
