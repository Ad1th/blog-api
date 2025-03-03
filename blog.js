// blog.js

async function createPost(title, content) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("posts")
    .insert([{ title, content, author_id: user.id }]);

  if (error) throw error;
  return data;
}

async function getPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

async function deletePost(postId) {
  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) throw error;
}

async function updatePost(postId, title, content) {
  const { data, error } = await supabase
    .from("posts")
    .update({ title, content })
    .eq("id", postId);

  if (error) throw error;
  return data;
}

async function displayPosts() {
  const postsContainer = document.getElementById("posts-container");
  postsContainer.innerHTML = "";
  const posts = await getPosts();

  posts.forEach((post) => {
    const postElement = document.createElement("div");
    postElement.className = "post";
    postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <button onclick="deletePost(${post.id}).then(displayPosts)">Delete</button>
            <button onclick="editPost(${post.id}, '${post.title}', '${post.content}')">Edit</button>
        `;
    postsContainer.appendChild(postElement);
  });
}

function editPost(id, title, content) {
  const form = document.getElementById("create-post-form");
  form.innerHTML = `
        <input type="text" id="edit-title" value="${title}" required>
        <textarea id="edit-content" required>${content}</textarea>
        <button type="submit">Update Post</button>
    `;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const newTitle = document.getElementById("edit-title").value;
    const newContent = document.getElementById("edit-content").value;
    await updatePost(id, newTitle, newContent);
    form.reset();
    form.innerHTML = `
            <input type="text" id="post-title" placeholder="Title" required>
            <textarea id="post-content" placeholder="Content" required></textarea>
            <button type="submit">Create Post</button>
        `;
    form.onsubmit = handleCreatePost;
    await displayPosts();
  };
}

async function handleCreatePost(e) {
  e.preventDefault();
  const title = document.getElementById("post-title").value;
  const content = document.getElementById("post-content").value;
  await createPost(title, content);
  e.target.reset();
  await displayPosts();
}

document.addEventListener("DOMContentLoaded", async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    document.getElementById(
      "user-info"
    ).textContent = `Logged in as: ${user.email}`;
    document.getElementById("create-post-form").onsubmit = handleCreatePost;
    await displayPosts();
  } else {
    window.location.href = "/login.html";
  }
});
