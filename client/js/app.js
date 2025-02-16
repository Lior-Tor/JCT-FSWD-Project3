/* app.js
   A modern, professional client-side script for Contacly.
   Uses FAJAX + Network to communicate with simulated servers (usersServer, contactsServer).
   Written with a focus on user-friendly functionality, responsive layouts,
   accessibility, and creative UI transitions.
*/

document.addEventListener("DOMContentLoaded", () => {
  // Initialize router and default route
  Router.init();
  if (!location.hash) {
    location.hash = "#/login";
  }

  // Header navigation
  const homeBtn = document.getElementById("homeBtn");
  const helpBtn = document.getElementById("helpBtn");
  const contactBtn = document.getElementById("contactBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      location.hash = "#/contacts";
    });
  }
  if (helpBtn) {
    helpBtn.addEventListener("click", () => {
      alert("Need help? Contact support@contacly.com");
    });
  }
  if (contactBtn) {
    contactBtn.addEventListener("click", () => {
      alert("For inquiries, email us at info@contacly.com");
    });
  }
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // Global form submit listener for login and registration
  document.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    if (form.id === "loginForm") {
      handleLogin();
    } else if (form.id === "registerForm") {
      handleRegister();
    }
  });
});

// Handle logout: clear session info and redirect to login
function handleLogout() {
  document.getElementById("logoutBtn").style.display = "none";
  location.hash = "#/login";
  // Optionally clear session data from localStorage here
  showLoginError("You have been logged out.");
}

/* =====================
   Handle Login (FAJAX)
====================== */
function handleLogin() {
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  // Basic validation
  if (!email || !password) {
    return showLoginError("Please enter both email and password.");
  }

  // Use our FXMLHttpRequest to simulate an AJAX call
  const xhr = new FXMLHttpRequest();
  xhr.open("POST", "/users/login");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      let response;
      try {
        response = JSON.parse(xhr.responseText || "{}");
      } catch (err) {
        return showLoginError("Unexpected response from server.");
      }
      if (xhr.status === 200) {
        // Successful login
        document.getElementById("logoutBtn").style.display = "inline-block";
        location.hash = "#/contacts";
      } else {
        showLoginError(response.error || "Login error. Please try again later.");
      }
    }
  };

  const body = JSON.stringify({ email, password });
  xhr.send(body);
}

/* =========================
   Handle Registration (FAJAX)
========================== */
function handleRegister() {
  const fullname = document.getElementById("fullname")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const confirmPassword = document.getElementById("confirmPassword")?.value.trim();

  // Basic validations for registration
  if (!fullname || !email || !password || !confirmPassword) {
    return showRegisterError("Please fill in all required fields.");
  }
  if (password !== confirmPassword) {
    return showRegisterError("Passwords do not match.");
  }

  // Use our FXMLHttpRequest to simulate an AJAX call
  const xhr = new FXMLHttpRequest();
  xhr.open("POST", "/users/register");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      let response;
      try {
        response = JSON.parse(xhr.responseText || "{}");
      } catch (err) {
        return showRegisterError("Unexpected response from server.");
      }
      if (xhr.status === 201) {
        // Registration successful: clear error, show success message, then redirect
        showRegisterError(""); // Clear any previous error
        showRegisterSuccess("Registration successful! Please log in.");
        setTimeout(() => {
          location.hash = "#/login";
        }, 3000);
      } else {
        showRegisterError(response.error || "Registration error. Please try again later.");
      }
    }
  };

  const bodyData = JSON.stringify({ fullname, email, password, confirmPassword });
  xhr.send(bodyData);
}

/* Inline error message for the login form */
function showLoginError(message) {
  const errorContainer = document.getElementById("loginError");
  if (errorContainer) {
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
    successContainer.textContent = message;
    successContainer.style.display = message ? "block" : "none";
    if (message) {
      setTimeout(() => {
        successContainer.style.display = "none";
      }, 5000);
    }
  }
}
