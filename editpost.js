const SUPABASE_URL = "https://ymjllbqozbsqrwzdtpls.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltamxsYnFvemJzcXJ3emR0cGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODUzMjUsImV4cCI6MjA1NjU2MTMyNX0.mSo_GvI3RlliYmmwkqWx2CW5Xynj-p7Ru9ErAZNoNOU";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const userEmail = localStorage.getItem("userEmail"); // Get logged-in user email
const postList = document.getElementById("edit-posts-list");

// Fetch and display posts that belong to the logged-in user
async function loadUserPosts() {
  if (!userEmail) {
    postList.innerHTML = "<p>Please log in to edit your posts.</p>";
    return;
  }

  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .eq("userEmail", userEmail);

    if (error) throw error;
    if (!posts.length) {
      postList.innerHTML = "<p>No posts found.</p>";
      return;
    }

    postList.innerHTML = ""; // Clear existing content

    posts.forEach((post) => {
      const postDiv = document.createElement("div");
      postDiv.className = "post-item";
      postDiv.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <button onclick="editPost('${post.id}', '${post.title}', '${post.content}')">Edit</button>
      `;
      postList.appendChild(postDiv);
    });
  } catch (error) {
    console.error("Error loading posts:", error.message);
  }
}

// Function to edit a post
async function editPost(postId, oldTitle, oldContent) {
  const newTitle = prompt("Edit Title:", oldTitle);
  const newContent = prompt("Edit Content:", oldContent);

  if (newTitle !== null && newContent !== null) {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ title: newTitle, content: newContent })
        .eq("id", postId);

      if (error) throw error;
      alert("Post updated successfully!");
      loadUserPosts(); // Refresh the posts list
    } catch (error) {
      console.error("Error updating post:", error.message);
    }
  }
}

document.addEventListener("DOMContentLoaded", loadUserPosts);
