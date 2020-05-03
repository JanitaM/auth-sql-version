// Variables
const firstName = document.getElementById("first-name");
const lastName = document.getElementById("last-name");
const username = document.getElementById("username");
const password = document.getElementById("password");
const joinBtn = document.getElementById("join-btn");

joinBtn.addEventListener("click", postUserToDatabase);

// Contact List
class User {
  constructor(firstName, lastName, username, password) {
    this.firstName = firstName
    this.lastName = lastName
    this.username = username
    this.password = password
  }
}

// POST User - this works
async function postUserToDatabase() {
  if (firstName.value === "" || lastName.value === "" || username.value === "" || password.value === "") {
    // alertMessage("Please Enter All Values", "error");
    return //for now
  } else {
    const user = new User(firstName.value, lastName.value, username.value, password.value);

    try {
      const response = await fetch("http://localhost:3000/user/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user)
      })

      if (response.redirected) {
        window.location = response.url
      }
    } catch (error) {
      console.log("Error", error);
    }
  }

  clearFields();
}