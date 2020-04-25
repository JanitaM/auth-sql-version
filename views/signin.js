// Variables
const username = document.getElementById("username")
const password = document.getElementById("password")
const signinBtn = document.getElementById("signin-btn")

signinBtn.addEventListener("click", signinToApp)

async function signinToApp() {
  if (username.value === "" || password.value === "") {
    return;
  } else {
    const user = { username: username.value, password: password.value };
    console.log(user) // this works
    try {
      console.log('user', user) //this works
      const response = await fetch("http://localhost:3000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
      });
      console.log('response', response) //this works - redirect is false

      if (response.redirected) {
        window.location = response.url;
      } //redirect is false
    } catch (error) {
      console.error(error.message)
    }
  }
}