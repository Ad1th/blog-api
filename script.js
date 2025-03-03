const API_URL = "http://127.0.0.1:8000"; // Change to your backend URL if deployed

async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (response.ok) {
    localStorage.setItem("token", data.token);
    window.location.href = "home.html"; // Redirect to homepage
  } else {
    alert(data.detail);
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (response.ok) {
    localStorage.setItem("token", data.token);
    window.location.href = "home.html"; // Redirect to homepage
  } else {
    alert(data.detail);
  }
}

// Homepage Authentication Check
async function checkAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html"; // Redirect to login if not authenticated
    return;
  }

  const response = await fetch(`${API_URL}/home?token=${token}`);
  const data = await response.json();

  if (response.ok) {
    document.getElementById("welcome-message").innerText = data.message;
  } else {
    localStorage.removeItem("token"); // Clear token if invalid
    window.location.href = "index.html";
  }
}

// Logout Function
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// Run checkAuth when on the homepage
if (window.location.pathname.includes("home.html")) {
  checkAuth();
}
