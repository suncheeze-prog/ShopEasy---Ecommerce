// Toggle between login and register
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginLink = document.getElementById("login-link");
const registerLink = document.getElementById("register-link");
const message = document.getElementById("message");

registerLink.addEventListener("click", () => {
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
  message.textContent = "";
});

loginLink.addEventListener("click", () => {
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  message.textContent = "";
});

// ✅ Register a new user
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("new-username").value.trim();
  const password = document.getElementById("new-password").value.trim();

  if (!username || !password) {
    message.style.color = "red";
    message.textContent = "Please fill in all fields!";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.find(u => u.username === username)) {
    message.style.color = "red";
    message.textContent = "Username already exists!";
    return;
  }

  // Save new user
  const newUser = { username, password };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  // Save current user to localStorage for display on useraccount.html
  localStorage.setItem("currentUser", JSON.stringify(newUser));

  // ✅ Redirect to useraccount.html
  message.style.color = "green";
  message.textContent = "Registration successful! Redirecting...";
  setTimeout(() => {
    window.location.href = "user.html";
  }, 1000);
});

// ✅ Login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    message.style.color = "green";
    message.textContent = "Login successful! Redirecting...";
    setTimeout(() => {
      window.location.href = "home.html"; // redirect to homepage
    }, 1000);
  } else {
    message.style.color = "red";
    message.textContent = "Invalid username or password!";
  }
});
  