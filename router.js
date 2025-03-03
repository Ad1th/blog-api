document.addEventListener("DOMContentLoaded", () => {
  const protectedPages = ["/index.html"];
  const currentPage = window.location.pathname;

  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error("Error fetching session:", error.message);
      return;
    }
    const session = data.session;
    if (!session && protectedPages.includes(currentPage)) {
      window.location.href = "/login.html";
    } else if (
      session &&
      (currentPage === "/login.html" || currentPage === "/signup.html")
    ) {
      window.location.href = "/index.html";
    }
  });
});
