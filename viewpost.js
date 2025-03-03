const SUPABASE_URL = "https://ymjllbqozbsqrwzdtpls.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltamxsYnFvemJzcXJ3emR0cGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODUzMjUsImV4cCI6MjA1NjU2MTMyNX0.mSo_GvI3RlliYmmwkqWx2CW5Xynj-p7Ru9ErAZNoNOU";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadPosts() {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    const postList = document.getElementById("postList");
    if (!data.length) {
      postList.innerHTML = "<p>No posts available.</p>";
      return;
    }

    postList.innerHTML = data
      .map(
        (post) => `
        <div class="post">
          <h3>${post.title}</h3>
          <p>${post.content.substring(0, 100)}...</p>
          <p><strong>Author:</strong> ${post.email || "Unknown"}</p>
        </div>
      `
      )
      .join("");
  } catch (error) {
    console.error("Error loading posts:", error.message);
  }
}

// Load posts when the page is ready
document.addEventListener("DOMContentLoaded", loadPosts);
