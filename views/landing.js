// Variables
const renderDiv = document.getElementById('render');

async function getPostsByAuthor() {
  try {
    const response = await fetch("http://localhost:3000/blogPosts", {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${document.cookie.split("=")[1]}`
      }
    });

    const blogPosts = await response.json();
    console.log('blogPosts', blogPosts);

    for (let i = 0; i < blogPosts.length; i++) {
      document.getElementById("render").innerHTML += `
      <div>
        <h2>${blogPosts[i].title}</h2>
        <p>${blogPosts[i].text}</p>
      </div>
    `;
    }
  } catch (error) {
    console.error(error.message);
  }
}

getPostsByAuthor();