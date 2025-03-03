/* app.js */

document.addEventListener("DOMContentLoaded", () => {
  console.log("[App] DOM fully loaded.");
  
  // Initialize router and default route
  Router.init();
  if (!location.hash) {
    console.log("[App] No hash detected. Redirecting to #/login");
    location.hash = "#/login";
  }
  if (location.hash == "#/contacts") {
    console.log(location.hash);
    document.getElementById("logoutBtn").style.display = "inline-block";
    document.getElementById("addContactBtn")?.addEventListener("click", () => {
      showContactModal();
    });
    fetchContacts();
  }

  // Header navigation buttons
  const homeBtn = document.getElementById("homeBtn");
  const helpBtn = document.getElementById("helpBtn");
  const contactBtn = document.getElementById("contactBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const addContactBtn = document.getElementById("addContactBtn");

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
  if (addContactBtn) {
    addContactBtn.addEventListener("click", () => {
      showContactModal();
    });
  }

  // Search contact logic
  const searchContact = document.getElementById("searchContact");
  if (searchContact) {
    searchContact.addEventListener("input", (e) => {
      filterContacts(e.target.value);
    });
  }

  // Handle contact form submission
  document.getElementById("contactForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    handleAddContact();
  });

  // Handle modal cancel
  document.getElementById("cancelModalBtn")?.addEventListener("click", closeContactModal);

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
function showContactModal(contact = null) {
  const modal = document.getElementById("contactModal");
  if (modal) {
    modal.style.display = "block";
    
  console.log("Ok");
    document.getElementById("modalTitle").textContent = contact ? "Edit Contact" : "Add Contact";
    
    if (contact) {
      document.getElementById("contactName").value = contact.fullname;
      document.getElementById("contactPhone").value = contact.phone;
      document.getElementById("contactEmail").value = contact.email;
    } else {
      document.getElementById("contactForm").reset();
    }
  }
}

// Function to close the modal
function closeContactModal() {
  document.getElementById("contactModal").style.display = "none";
}

// Fonction pour récupérer les contacts
function fetchContacts() {
  const xhr = new FXMLHttpRequest();
  xhr.open("GET", "/contacts");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      const { contacts } = JSON.parse(xhr.responseText);
      renderContacts(contacts);
    }
  };
  xhr.send();
}

// Fonction pour afficher les contacts
function renderContacts(contacts) {
  const contactsList = document.getElementById("contactsList");

  contactsList.innerHTML = ""; // Nettoie les anciens éléments avant d'ajouter les nouveaux

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

    contactItem.querySelector(".edit-contact-btn").addEventListener("click", () => showContactModal(contact));
    contactItem.querySelector(".delete-contact-btn").addEventListener("click", () => deleteContact(contact.id));

    contactsList.appendChild(contactItem);
  });

  // Ajout d'un contact
document.getElementById("addContactBtn")?.addEventListener("click", () => {
  showContactModal();
});

// Recherche de contacts
document.getElementById("searchContact")?.addEventListener("input", (e) => {
  filterContacts(e.target.value);
});

// Gestion du formulaire
document.getElementById("contactForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  handleAddContact();
});

// Fermeture du modal
document.getElementById("cancelModalBtn")?.addEventListener("click", closeContactModal);


}



// Function to handle adding a new contact
function handleAddContact() {
  const fullname = document.getElementById("contactName").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();
  const email = document.getElementById("contactEmail").value.trim();

  if (!fullname || !phone || !email) {
    alert("Please fill in all the fields");
    return;
  }

  const contactData = { fullname, phone, email };
  const xhr = new FXMLHttpRequest();
  xhr.open("POST", "/contacts");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      console.log("[handleAddContact] Server Response:", xhr.status, xhr.responseText);
      
      if (xhr.status === 201) {
        console.log("[handleAddContact] Contact added successfully.");
        fetchContacts();
        closeContactModal();
      } else {
        alert("Error adding contact: " + xhr.responseText);
      }
    }
  };
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(contactData));
}

// Function to delete a contact
function deleteContact(contactId) {
  const xhr = new FXMLHttpRequest();
  xhr.open("DELETE", `/contacts/${contactId}`);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      fetchContacts();
    }
  };
  xhr.send();
}

// Function to filter contacts based on search query
function filterContacts(query) {
  const contactsList = document.getElementById("contactsList");
  const items = contactsList.getElementsByClassName("contact-item");
  Array.from(items).forEach((item) => {
    const name = item.querySelector(".contact-name").textContent.toLowerCase();
    if (name.includes(query.toLowerCase())) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
}


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
        fetchContacts();
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
  //if (!fullname || !email || !password || !confirmPassword) {
  //  console.warn("[App] Registration validation failed: Missing required fields.");
  //  return showRegisterError("Please fill in all required fields.");
  //}
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
