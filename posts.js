const SUPABASE_URL = "https://ymjllbqozbsqrwzdtpls.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltamxsYnFvemJzcXJ3emR0cGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODUzMjUsImV4cCI6MjA1NjU2MTMyNX0.mSo_GvI3RlliYmmwkqWx2CW5Xynj-p7Ru9ErAZNoNOU";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch and display posts
async function fetchPosts() {
  try {
    const { data: posts, error } = await supabase.from("posts").select("*");
    if (error) throw error;

    const postList = document.getElementById("postList");
    postList.innerHTML = "";

    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.classList.add("post");
      postElement.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <small>Posted by: ${post.userEmail}</small>
      `;
      postList.appendChild(postElement);
    });
  } catch (error) {
    console.error("Error fetching posts:", error.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchPosts();
});
