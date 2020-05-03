async function logout() {
  try {
    const response = await fetch('http://localhost:3000/logout', {
      method: 'POST',
      redirect: 'follow'
    });
    console.log('res', response);

    if (response.redirected) {
      window.location = response.url;
    }
  } catch (error) {
    console.log("Error", error);
  }
}