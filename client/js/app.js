/* app.js */

document.addEventListener("DOMContentLoaded", () => {
  console.log("[App] DOM fully loaded.");
  
  // Initialize router and default route
  Router.init();
  if (!location.hash) {
    console.log("[App] No hash detected. Redirecting to #/login");
    location.hash = "#/login";
  }

  // Header navigation buttons
  const homeBtn = document.getElementById("homeBtn");
  const helpBtn = document.getElementById("helpBtn");
  const contactBtn = document.getElementById("contactBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      console.log("[App] Home button clicked. Navigating to contacts.");
      location.hash = "#/contacts";
    });
  }
  if (helpBtn) {
    helpBtn.addEventListener("click", () => {
      console.log("[App] Help button clicked.");
      alert("Need help? Contact support@contacly.com");
    });
  }
  if (contactBtn) {
    contactBtn.addEventListener("click", () => {
      console.log("[App] Contact button clicked.");
      alert("For inquiries, email us at info@contacly.com");
    });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      console.log("[App] Logout button clicked.");
      handleLogout();
    });
  }

  // Global form submit listener for login and registration
  document.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    console.log("[App] Form submitted with ID:", form.id);
    if (form.id === "loginForm") {
      handleLogin();
    } else if (form.id === "registerForm") {
      handleRegister();
    }
  });
});

// Handle logout: clear session info and redirect to login
function handleLogout() {
  console.log("[App] Handling logout.");
  document.getElementById("logoutBtn").style.display = "none";
  location.hash = "#/login";
  showLoginError("You have been logged out.");
}

/* Handle Login (FAJAX) */
function handleLogin() {
  console.log("[App] Handling login.");
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  // Basic validation
  if (!email || !password) {
    console.warn("[App] Login validation failed: Missing email or password.");
    return showLoginError("Please enter both email and password.");
  }

  const xhr = new FXMLHttpRequest();
  xhr.open("POST", "/users/login");
  
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      console.log("[App] Login AJAX call completed with status:", xhr.status);
      let response;
      try {
        response = JSON.parse(xhr.responseText || "{}");
      } catch (err) {
        console.error("[App] Error parsing login response:", err);
        return showLoginError("Unexpected response from server.");
      }
      if (xhr.status === 200) {
        console.log("[App] Login successful:", response);
        document.getElementById("logoutBtn").style.display = "inline-block";
        location.hash = "#/contacts";
      } else {
        console.error("[App] Login error:", response.error);
        showLoginError(response.error || "Login error. Please try again later.");
      }
    }
  };

  const body = JSON.stringify({ email, password });
  console.log("[App] Sending login request with body:", body);
  xhr.send(body);
}

/* Handle Registration (FAJAX) */
function handleRegister() {
  console.log("[App] Handling registration.");
  const fullname = document.getElementById("fullname")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const confirmPassword = document.getElementById("confirmPassword")?.value.trim();

  // Basic validations for registration
  if (!fullname || !email || !password || !confirmPassword) {
    console.warn("[App] Registration validation failed: Missing required fields.");
    return showRegisterError("Please fill in all required fields.");
  }
  if (password !== confirmPassword) {
    console.warn("[App] Registration validation failed: Passwords do not match.");
    return showRegisterError("Passwords do not match.");
  }

  const xhr = new FXMLHttpRequest();
  xhr.open("POST", "/users/register");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      console.log("[App] Registration AJAX call completed with status:", xhr.status);
      let response;
      try {
        response = JSON.parse(xhr.responseText || "{}");
      } catch (err) {
        console.error("[App] Error parsing registration response:", err);
        return showRegisterError("Unexpected response from server.");
      }
      if (xhr.status === 201) {
        console.log("[App] Registration successful:", response);
        showRegisterError(""); // Clear any previous error
        showRegisterSuccess("Registration successful! Please log in.");
        setTimeout(() => {
          location.hash = "#/login";
        }, 3000);
      } else {
        console.error("[App] Registration error:", response.error);
        showRegisterError(response.error || "Registration error. Please try again later.");
      }
    }
  };

  const bodyData = JSON.stringify({ fullname, email, password, confirmPassword });
  console.log("[App] Sending registration request with body:", bodyData);
  xhr.send(bodyData);
}

/* Inline error message for the login form */
function showLoginError(message) {
  const errorContainer = document.getElementById("loginError");
  if (errorContainer) {
    console.log("[App] Displaying login error message:", message);
    errorContainer.textContent = message;
    errorContainer.style.display = message ? "block" : "none";
    if (message) {
      setTimeout(() => {
        errorContainer.style.display = "none";
      }, 5000);
    }
  }
}

/* Inline error message for the registration form */
function showRegisterError(message) {
  const errorContainer = document.getElementById("registerError");
  if (errorContainer) {
    console.log("[App] Displaying registration error message:", message);
    errorContainer.textContent = message;
    errorContainer.style.display = message ? "block" : "none";
    if (message) {
      setTimeout(() => {
        errorContainer.style.display = "none";
      }, 5000);
    }
  }
}

/* Inline success message for the registration form */
function showRegisterSuccess(message) {
  const successContainer = document.getElementById("registerSuccess");
  if (successContainer) {
    console.log("[App] Displaying registration success message:", message);
    successContainer.textContent = message;
    successContainer.style.display = message ? "block" : "none";
    if (message) {
      setTimeout(() => {
        successContainer.style.display = "none";
      }, 5000);
    }
  }
}
