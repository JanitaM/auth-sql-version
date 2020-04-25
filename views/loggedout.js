async function logout() {
  const response = await fetch('http://localhost:3000/logout', {
    method: 'POST'
  });
  console.log(response);

  window.location = response.url;
}