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

// Function to initialize the app
async function initializeApp() {
  try {
    await loadSupabaseLibrary();
    if (!supabase) {
      throw new Error("Supabase failed to initialize.");
    }
    await setupEventListeners();
    await checkAuthState();
  } catch (error) {
    console.error("Error initializing app:", error);
  }
}

// Setup event listeners
async function setupEventListeners() {
  const signUpForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");

  if (signUpForm) {
    signUpForm.addEventListener("submit", handleSignUp);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
}

// Handle Sign Up
async function handleSignUp(e) {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert("Error signing up: " + error.message);
  } else {
    alert("Signed up successfully! Please check your email for confirmation.");
    window.location.href = "/login.html";
  }
}

// Handle Login
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("Error logging in: " + error.message);
  } else {
    window.location.href = "/index.html";
  }
}

// Handle Logout
async function handleLogout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert("Error logging out: " + error.message);
  } else {
    window.location.href = "/login.html";
  }
}

// Check auth state
async function checkAuthState() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Error fetching session:", error.message);
    return;
  }

  if (session) {
    // User is signed in
    console.log("User is signed in:", session.user);
    if (window.location.pathname !== "/index.html") {
      // Redirect to homepage if not already there
      window.location.href = "/index.html";
    }
  } else {
    // User is not signed in
    console.log("User is not signed in");
    if (window.location.pathname === "/index.html") {
      // Redirect to login if trying to access homepage while not signed in
      window.location.href = "/login.html";
    }
  }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initializeApp);
