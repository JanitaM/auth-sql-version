// Variables
const username = document.getElementById("username")
const password = document.getElementById("password")
const signinBtn = document.getElementById("signin-btn")

signinBtn.addEventListener("click", signinToApp)

async function signinToApp(e) {
  e.preventDefault();

  if (username.value === "" || password.value === "") {
    return;
  } else {
    const user = { username: username.value, password: password.value };

    try {
      const response = await fetch("http://localhost:3000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(user),
        redirect: 'follow'
      });

      if (response.redirected) {
        window.location = response.url;
      }
    } catch (error) {
      console.error(error.message)
    }
  }
}