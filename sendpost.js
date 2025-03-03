const SUPABASE_URL = "https://ymjllbqozbsqrwzdtpls.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltamxsYnFvemJzcXJ3emR0cGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODUzMjUsImV4cCI6MjA1NjU2MTMyNX0.mSo_GvI3RlliYmmwkqWx2CW5Xynj-p7Ru9ErAZNoNOU";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function submitPost() {
  const title = document.getElementById("postTitle").value.trim();
  const content = document.getElementById("postContent").value.trim();
  const userEmail = localStorage.getItem("userEmail");

  if (!title || !content || !userEmail) {
    console.error("Missing required fields.");
    return;
  }

  try {
    const { error } = await supabase
      .from("posts")
      .insert([{ title, content, userEmail }]);
    if (error) throw error;

    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";
    alert("Post submitted successfully!");
  } catch (error) {
    console.error("Error submitting post:", error.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const postForm = document.getElementById("post-form");
  if (postForm) {
    postForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitPost();
    });
  }
});
