document.addEventListener('DOMContentLoaded', getPostsByAuthor);

async function getPostsByAuthor() {
  try {
    const response = await fetch("http://localhost:3000/blogPosts", {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${document.cookie.split("=")[1]}`
      }
    });

    const userInfo = await response.json();
    const posts = userInfo.data[0];

    displayOnUI(posts);
  } catch (error) {
    console.error('error', error.message);
  }
}

const displayOnUI = posts => {
  document.getElementById

  for (let post of posts) {
    document.getElementById("display-user-posts").innerHTML += `<div class="card">
      <h4>${post.post_title}</h4>
      <p>${post.post_text}</p>
    </div>`
  }
}