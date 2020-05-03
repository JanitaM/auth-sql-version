document.addEventListener('DOMContentLoaded', getAllDatabasePosts);

async function getAllDatabasePosts() {
  try {
    const response = await fetch("http://localhost:3000/viewposts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });
    const posts = await response.json();
    displayOnUI(posts);
  } catch (error) {
    console.log("Error", error);
  }
}

const displayOnUI = posts => {
  for (let post of posts) {
    document.getElementById("display-all-posts").innerHTML += `<div class="card">
      <h4>${post.post_title}</h4>
      <p>${post.post_text}</p>
    </div>`
  }
}
