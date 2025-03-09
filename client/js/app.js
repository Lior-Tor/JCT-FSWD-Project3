/* app.js */
let isEditing = false;
let Id = null;
let currentUser;

document.addEventListener("DOMContentLoaded", () => {
  console.log("[App] DOM fully loaded.");

  // Initialize router and default route
  Router.init();
  if (!location.hash) {
    console.log("[App] No hash detected. Redirecting to #/login");
    location.hash = "#/login";
  }
  if (location.hash === "#/contacts") {
    console.log("[App] Route is contacts.");
    document.getElementById("logoutBtn").style.display = "inline-block";
    // Add one-time listener for add contact button if not already attached
    const addContactBtn = document.getElementById("addContactBtn");
    if (addContactBtn && !addContactBtn.dataset.listenerAttached) {
      addContactBtn.addEventListener("click", () => showContactModal());
      addContactBtn.dataset.listenerAttached = "true";
    }
    fetchContacts();
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

// Function to show contact modal (for adding or editing)
function showContactModal(contact = null, id) {
  Id = id;
  const modal = document.getElementById("contactModal");
  if (modal) {
    modal.style.display = "block";
    console.log("[App] Showing contact modal.");
    document.getElementById("modalTitle").textContent = contact ? "Edit Contact" : "Add Contact";
    if (contact) {
      document.getElementById("contactName").value = contact.fullname;
      document.getElementById("contactPhone").value = contact.phone;
      document.getElementById("contactEmail").value = contact.email;
      isEditing = true;
    } else {
      document.getElementById("contactForm").reset();
    }
  }
}

// Function to close the modal
function closeContactModal() {
  const modal = document.getElementById("contactModal");
  if (modal) {
    modal.style.display = "none";
    isEditing = false;
  }
}

// Function to retrieve contacts
function fetchContacts() {
  const contactsList = document.getElementById("contactsList");
  if (!contactsList) {
    console.log("[fetchContacts] contactsList element not found. Aborting fetchContacts.");
    return; // Exit if contacts view isn't active
  }
  
  // Create a new XHR instance for getting the current user
  const xhrUser = new FXMLHttpRequest();
  xhrUser.open("POST", "/users/getcurentuser", true);
  xhrUser.setRequestHeader("Content-Type", "application/json");
  console.log("[fetchContacts] Sending request for current user...");
  xhrUser.onreadystatechange = function () {
    if (xhrUser.readyState === 4) {
      console.log("[fetchCurrentUser] Response:", xhrUser.status, xhrUser.responseText);
      try {
        const response = JSON.parse(xhrUser.responseText);
        const user = response.response.user;
        console.log("Current User:", user);
      } catch (error) {
        console.error("[fetchContacts] JSON parsing error:", error);
      }
    }
  };
  xhrUser.send();
  
  // Create a new XHR instance for fetching contacts
  const xhrContacts = new FXMLHttpRequest();
  xhrContacts.open("GET", "/contacts");
  xhrContacts.onreadystatechange = function () {
    if (xhrContacts.readyState === 4 && xhrContacts.status === 200) {
      try {
        const { contacts } = JSON.parse(xhrContacts.responseText);
        renderContacts(contacts);
      } catch (error) {
        console.error("[fetchContacts] Error parsing contacts response:", error);
      }
    }
  };
  xhrContacts.send();
}

// Function to display contacts and attach static event listeners only once
function renderContacts(contacts) {
  const contactsList = document.getElementById("contactsList");
  if (!contactsList) {
    console.log("[renderContacts] contactsList element not found.");
    return;
  }
  contactsList.innerHTML = ""; // Clear existing items

  contacts.forEach((contact) => {
    const contactItem = document.createElement("li");
    contactItem.classList.add("contact-item");
    contactItem.innerHTML = `
      <div class="contact-info">
        <span class="contact-name">${contact.fullname}</span>
        <span class="contact-phone">${contact.phone}</span>
        <span class="contact-email">${contact.email}</span>
      </div>
      <button class="edit-contact-btn" data-id="${contact.id}">Edit</button>
      <button class="delete-contact-btn" data-id="${contact.id}">Delete</button>
    `;
    contactItem.querySelector(".edit-contact-btn").addEventListener("click", () => {
      showContactModal(contact, contact.id);
    });
    contactItem.querySelector(".delete-contact-btn").addEventListener("click", () => {
      deleteContact(contact.id);
    });
    contactsList.appendChild(contactItem);
  });

  // Attach listener for add contact button once
  const addContactBtn = document.getElementById("addContactBtn");
  if (addContactBtn && !addContactBtn.dataset.listenerAttached) {
    addContactBtn.addEventListener("click", () => showContactModal());
    addContactBtn.dataset.listenerAttached = "true";
  }
  // Attach listener for search input once
  const searchContact = document.getElementById("searchContact");
  if (searchContact && !searchContact.dataset.listenerAttached) {
    searchContact.addEventListener("input", (e) => filterContacts(e.target.value));
    searchContact.dataset.listenerAttached = "true";
  }
  // Attach listener for contact form submission once
  const contactForm = document.getElementById("contactForm");
  if (contactForm && !contactForm.dataset.listenerAttached) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handleAddandUpdateContact();
    });
    contactForm.dataset.listenerAttached = "true";
  }
  // Attach listener for modal cancel button once
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  if (cancelModalBtn && !cancelModalBtn.dataset.listenerAttached) {
    cancelModalBtn.addEventListener("click", closeContactModal);
    cancelModalBtn.dataset.listenerAttached = "true";
  }
}

// Function to handle adding/updating a contact using new XHR instances
function handleAddandUpdateContact() {
  const fullname = document.getElementById("contactName").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();
  const email = document.getElementById("contactEmail").value.trim();

  if (!fullname || !phone || !email) {
    alert("Please fill in all the fields");
    return;
  }

  const contactData = { fullname, phone, email, currentUser };
  
  if (isEditing) {
    const xhrUpdate = new FXMLHttpRequest();
    xhrUpdate.open("PUT", `/contacts/${Id}`);
    xhrUpdate.setRequestHeader("Content-Type", "application/json");
    xhrUpdate.onreadystatechange = function () {
      if (xhrUpdate.readyState === 4) {
        console.log("[updateContact] Server Response:", xhrUpdate.status, xhrUpdate.responseText);
        if (xhrUpdate.status === 200) {
          console.log("[updateContact] Contact updated successfully.");
          fetchContacts();
          closeContactModal();
        } else {
          alert("Error updating contact: " + xhrUpdate.responseText);
        }
      }
    };
    xhrUpdate.send(JSON.stringify(contactData));
  } else {
    const xhrAdd = new FXMLHttpRequest();
    xhrAdd.open("POST", "/contacts");
    xhrAdd.setRequestHeader("Content-Type", "application/json");
    xhrAdd.onreadystatechange = function () {
      if (xhrAdd.readyState === 4) {
        console.log("[handleAddContact] Server Response:", xhrAdd.status, xhrAdd.responseText);
        if (xhrAdd.status === 201) {
          console.log("[handleAddContact] Contact added successfully.");
          fetchContacts();
          closeContactModal();
        } else {
          alert("Error adding contact: " + xhrAdd.responseText);
        }
      }
    };
    xhrAdd.send(JSON.stringify(contactData));
  }
}

// Function to delete a contact using its own XHR instance
function deleteContact(contactId) {
  const xhrDelete = new FXMLHttpRequest();
  xhrDelete.open("DELETE", `/contacts/${contactId}`);
  xhrDelete.onreadystatechange = function () {
    if (xhrDelete.readyState === 4 && xhrDelete.status === 200) {
      fetchContacts();
    }
  };
  xhrDelete.send();
}

// Function to filter contacts based on search query
function filterContacts(query) {
  const contactsList = document.getElementById("contactsList");
  const items = contactsList.getElementsByClassName("contact-item");
  Array.from(items).forEach((item) => {
    const name = item.querySelector(".contact-name").textContent.toLowerCase();
    item.style.display = name.includes(query.toLowerCase()) ? "block" : "none";
  });
}

// Handle logout: clear session info, redirect to login, and do not call fetchContacts
function handleLogout() {
  currentUser = null;
  const contactData = "null";
  const xhrLogout = new FXMLHttpRequest();
  xhrLogout.open("POST", "/users/setcurentuser");
  xhrLogout.setRequestHeader("Content-Type", "application/json");
  xhrLogout.onreadystatechange = function () {
    if (xhrLogout.readyState === 4) {
      console.log("[updatecurrentUser] currentUser Response:", xhrLogout.status, xhrLogout.responseText);
      if (xhrLogout.status === 201) {
        console.log("[updatecurrentUser] currentUser updated successfully.");
        closeContactModal();
      } else {
        alert("Error updating currentUser: " + xhrLogout.responseText);
      }
    }
  };
  xhrLogout.send(JSON.stringify(contactData));

  console.log("[App] Handling logout.");
  document.getElementById("logoutBtn").style.display = "none";
  location.hash = "#/login"; // Change the route to login
  showLoginError("You have been logged out.");
}

function handleLogin() {
  console.log("[App] Handling login.");
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!email || !password) {
    console.warn("[App] Login validation failed: Missing email or password.");
    return showLoginError("Please enter both email and password.");
  }

  currentUser = email;
  // New instance to set current user
  const xhrSetUser = new FXMLHttpRequest();
  xhrSetUser.open("POST", "/users/setcurentuser");
  xhrSetUser.setRequestHeader("Content-Type", "application/json");
  xhrSetUser.onreadystatechange = function () {
    if (xhrSetUser.readyState === 4) {
      console.log("[updatecurrentUser] currentUser Response:", xhrSetUser.status, xhrSetUser.responseText);
      if (xhrSetUser.status === 201) {
        console.log("[updatecurrentUser] currentUser updated successfully.");
        // Do not call fetchContacts() here; let the router handle it.
        closeContactModal();
      } else {
        alert("Error updating currentUser: " + xhrSetUser.responseText);
      }
    }
  };
  xhrSetUser.send(JSON.stringify(currentUser));

  // New instance for login request
  const xhrLogin = new FXMLHttpRequest();
  xhrLogin.open("POST", "/users/login");
  xhrLogin.setRequestHeader("Content-Type", "application/json");
  xhrLogin.onreadystatechange = function () {
    if (xhrLogin.readyState === 4) {
      console.log("[App] Login AJAX call completed with status:", xhrLogin.status);
      let response;
      try {
        response = JSON.parse(xhrLogin.responseText || "{}");
      } catch (err) {
        console.error("[App] Error parsing login response:", err);
        return showLoginError("Unexpected response from server.");
      }
      if (xhrLogin.status === 200) {
        console.log("[App] Login successful:", response);
        document.getElementById("logoutBtn").style.display = "inline-block";
        // Change route to contacts; the router will load the view and call fetchContacts()
        location.hash = "#/contacts";
      } else {
        console.error("[App] Login error:", response.error);
        showLoginError(response.error || "Login error. Please try again later.");
      }
    }
  };
  const body = JSON.stringify({ email, password });
  console.log("[App] Sending login request with body:", body);
  xhrLogin.send(body);
}

/* Handle Registration (FAJAX) */
function handleRegister() {
  console.log("[App] Handling registration.");
  const fullname = document.getElementById("fullname")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const confirmPassword = document.getElementById("confirmPassword")?.value.trim();

  if (password !== confirmPassword) {
    console.warn("[App] Registration validation failed: Passwords do not match.");
    return showRegisterError("Passwords do not match.");
  }

  const xhrRegister = new FXMLHttpRequest();
  xhrRegister.open("POST", "/users/register");
  xhrRegister.setRequestHeader("Content-Type", "application/json");
  xhrRegister.onreadystatechange = function () {
    if (xhrRegister.readyState === 4) {
      console.log("[App] Registration AJAX call completed with status:", xhrRegister.status);
      let response;
      try {
        response = JSON.parse(xhrRegister.responseText || "{}");
      } catch (err) {
        console.error("[App] Error parsing registration response:", err);
        return showRegisterError("Unexpected response from server.");
      }
      if (xhrRegister.status === 201) {
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
  xhrRegister.send(bodyData);
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