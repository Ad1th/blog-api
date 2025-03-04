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
    // Adjust the selected fields according to your schema—
    // Here we assume your primary key is "post_id" and it's an integer.
    const { data: posts, error } = await supabase
      .from("posts")
      .select("post_id, title, content, updated_at")
      .eq("userEmail", userEmail)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    if (!posts.length) {
      postList.innerHTML = "<p>No posts found.</p>";
      return;
    }

    postList.innerHTML = ""; // Clear existing content

    posts.forEach((post) => {
      // Use data attributes to safely pass the post_id, title, and content.
      const postDiv = document.createElement("div");
      postDiv.className = "post-item";
      postDiv.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <button class="edit-btn" data-id="${
          post.post_id
        }" data-title="${post.title.replace(
        /'/g,
        "\\'"
      )}" data-content="${post.content.replace(/'/g, "\\'")}">Edit</button>
        <button class="delete-btn" data-id="${post.post_id}">Delete</button>
      `;
      postList.appendChild(postDiv);
    });

    // Attach event listeners to edit buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const postId = btn.getAttribute("data-id");
        const oldTitle = btn.getAttribute("data-title");
        const oldContent = btn.getAttribute("data-content");
        editPost(postId, oldTitle, oldContent);
      });
    });

    // Attach event listeners to delete buttons
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const postId = btn.getAttribute("data-id");
        deletePost(postId);
      });
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
      // Convert postId to integer if necessary (assuming post_id is an integer)
      const id = parseInt(postId, 10);
      const { error } = await supabase
        .from("posts")
        .update({ title: newTitle, content: newContent })
        .eq("post_id", id); // Use "post_id" per your schema

      if (error) throw error;
      alert("Post updated successfully!");
      loadUserPosts(); // Refresh the posts list
    } catch (error) {
      console.error("Error updating post:", error.message);
    }
  }
}

// Function to delete a post
async function deletePost(postId) {
  const confirmDelete = confirm("Are you sure you want to delete this post?");
  if (!confirmDelete) return;

  try {
    // Convert postId to integer if necessary
    const id = parseInt(postId, 10);
    const { error } = await supabase.from("posts").delete().eq("post_id", id); // Use "post_id" per your schema

    if (error) throw error;
    alert("Post deleted successfully!");
    loadUserPosts(); // Refresh the posts list
  } catch (error) {
    console.error("Error deleting post:", error.message);
  }
}

document.addEventListener("DOMContentLoaded", loadUserPosts);
