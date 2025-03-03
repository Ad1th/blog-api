const SUPABASE_URL = "https://ymjllbqozbsqrwzdtpls.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltamxsYnFvemJzcXJ3emR0cGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA5ODUzMjUsImV4cCI6MjA1NjU2MTMyNX0.mSo_GvI3RlliYmmwkqWx2CW5Xynj-p7Ru9ErAZNoNOU";
let supabase = null;

// Function to dynamically load Supabase library
function loadSupabaseLibrary() {
  return new Promise((resolve, reject) => {
    if (window.supabase) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return resolve(supabase);
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.6";
    script.onload = () => {
      console.log("Supabase library loaded successfully.");
      if (window.supabase) {
        supabase = window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_ANON_KEY
        );
        console.log("Supabase initialized:", supabase);
        resolve(supabase);
      } else {
        reject(new Error("Supabase library did not load correctly"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load Supabase library"));
    document.head.appendChild(script);
  });
}
// Submit a new post
async function submitPost() {
  if (!supabase) return;

  const title = document.getElementById("postTitle").value.trim();
  const content = document.getElementById("postContent").value.trim();
  if (title && content) {
    try {
      const { error } = await supabase
        .from("posts")
        .insert([{ title, content }]);
      if (error) throw error;
      document.getElementById("postTitle").value = "";
      document.getElementById("postContent").value = "";
      // Optionally reload posts after submission
      await loadPosts();
    } catch (error) {
      console.error("Error submitting post:", error.message);
    }
  }
}

// Load posts
async function loadPosts() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    const list = document.getElementById("postList");
    list.innerHTML = data
      .map((post) => `<p><strong>${post.title}</strong>: ${post.content}</p>`)
      .join(" ");
  } catch (error) {
    console.error("Error loading posts:", error.message);
  }
}

// Initialize the app
async function initializeApp() {
  try {
    const initialized = await loadSupabaseLibrary();
    if (initialized) {
      console.log("Supabase library loaded successfully");
      // Load existing posts immediately upon initialization
      await Promise.all([loadPosts()]);
    } else {
      console.error("Failed to initialize Supabase library.");
    }
  } catch (error) {
    console.error("Error during initialization:", error.message);
  }
}

// Initial load
document.addEventListener("DOMContentLoaded", initializeApp);
