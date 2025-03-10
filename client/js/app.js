/* app.js */

// Global state variables
let isEditing = false; // Flag to indicate if we are editing an existing contact
let Id = null;         // Stores the ID of the contact being edited
let currentUser;       // Stores the current user's email (or identifier)

document.addEventListener("DOMContentLoaded", () => {
  console.log("[App] DOM fully loaded.");

  // Initialize the router and set the default route if no hash is present
  Router.init();
  if (!location.hash) {
    console.log("[App] No hash detected. Redirecting to #/login");
    location.hash = "#/login";
  }

  // If the current route is "#/contacts", show logout button and fetch contacts
  if (location.hash === "#/contacts") {
    console.log("[App] Route is contacts.");
    document.getElementById("logoutBtn").style.display = "inline-block";

    // Attach the add contact button listener only once using a dataset flag
    const addContactBtn = document.getElementById("addContactBtn");
    if (addContactBtn && !addContactBtn.dataset.listenerAttached) {
      addContactBtn.addEventListener("click", () => showContactModal());
      addContactBtn.dataset.listenerAttached = "true";
    }
    fetchContacts(); // Fetch and display contacts
  }

  // Set up header navigation buttons and their event listeners
  const homeBtn = document.getElementById("homeBtn");
  const helpBtn = document.getElementById("helpBtn");
  const contactBtn = document.getElementById("contactBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      console.log("[App] Home button clicked. Navigating to contacts.");
      location.hash = "#/contacts"; // Change route to contacts
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
      handleLogout(); // Call logout function
    });
  }

  // Global form submit listener for both login and registration forms
  document.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the default form submission behavior
    const form = event.target;
    console.log("[App] Form submitted with ID:", form.id);
    if (form.id === "loginForm") {
      handleLogin();
    } else if (form.id === "registerForm") {
      handleRegister();
    }
  });
});

// Function to show the contact modal (used for both adding and editing a contact)
function showContactModal(contact = null, id) {
  Id = id; // Set the global Id variable for editing
  const modal = document.getElementById("contactModal");
  if (modal) {
    modal.style.display = "block"; // Show the modal
    console.log("[App] Showing contact modal.");
    // Set modal title depending on whether editing or adding
    document.getElementById("modalTitle").textContent = contact ? "Edit Contact" : "Add Contact";
    if (contact) {
      // Pre-fill form fields if editing an existing contact
      document.getElementById("contactName").value = contact.fullname;
      document.getElementById("contactPhone").value = contact.phone;
      document.getElementById("contactEmail").value = contact.email;
      isEditing = true;
    } else {
      // Otherwise, clear the form for a new contact
      document.getElementById("contactForm").reset();
    }
  }
}

// Function to close the contact modal
function closeContactModal() {
  const modal = document.getElementById("contactModal");
  if (modal) {
    modal.style.display = "none"; // Hide the modal
    isEditing = false;
  }
}

// Function to retrieve contacts for the current user and render them
function fetchContacts() {
  const contactsList = document.getElementById("contactsList");
  if (!contactsList) {
    console.log("[fetchContacts] contactsList element not found. Aborting fetchContacts.");
    return; // Exit if the contacts view isn't active
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
        //console.error("[fetchContacts] JSON parsing error:", error);
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

// Function to render contacts on the page and attach event listeners (once)
function renderContacts(contacts) {
  const contactsList = document.getElementById("contactsList");
  if (!contactsList) {
    console.log("[renderContacts] contactsList element not found.");
    return;
  }
  contactsList.innerHTML = ""; // Clear any existing contact items

  // Loop through each contact and create a list item
  contacts.forEach((contact) => {
    const contactItem = document.createElement("li");
    contactItem.classList.add("contact-item");
    contactItem.innerHTML = `
      <div class="contact-info">
        <span class="contact-name">${contact.fullname}</span>
        <span class="contact-phone">${contact.phone}</span>
        <span class="contact-email">${contact.email}</span>
      </div>
      <div class="contact-icons-all">
        <img src="../images/call-icon.png" alt="Call" class="contact-icon">
        <img src="../images/message-icon.png" alt="Message" class="contact-icon">
        <button class="edit-contact-btn" data-id="${contact.id}">
          <img src="../images/edit-icon.png" alt="Edit" class="contact-icon">
        </button>
        <button class="delete-contact-btn" data-id="${contact.id}">
          <img src="../images/trash-icon.png" alt="Delete" class="contact-icon">
        </button>
      </div>
    `;
    // Attach event listener for edit button
    contactItem.querySelector(".edit-contact-btn").addEventListener("click", () => {
      showContactModal(contact, contact.id);
    });
    // Attach event listener for delete button
    contactItem.querySelector(".delete-contact-btn").addEventListener("click", () => {
      deleteContact(contact.id);
    });
    contactsList.appendChild(contactItem);
  });

  // Attach listener for add contact button (once)
  const addContactBtn = document.getElementById("addContactBtn");
  if (addContactBtn && !addContactBtn.dataset.listenerAttached) {
    addContactBtn.addEventListener("click", () => showContactModal());
    addContactBtn.dataset.listenerAttached = "true";
  }
  // Attach listener for search input (once)
  const searchContact = document.getElementById("searchContact");
  if (searchContact && !searchContact.dataset.listenerAttached) {
    searchContact.addEventListener("input", (e) => filterContacts(e.target.value));
    searchContact.dataset.listenerAttached = "true";
  }
  // Attach listener for contact form submission (once)
  const contactForm = document.getElementById("contactForm");
  if (contactForm && !contactForm.dataset.listenerAttached) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault(); // Prevent the default form submission behavior
      handleAddandUpdateContact();
    });
    contactForm.dataset.listenerAttached = "true";
  }
  // Attach listener for modal cancel button (once)
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  if (cancelModalBtn && !cancelModalBtn.dataset.listenerAttached) {
    cancelModalBtn.addEventListener("click", closeContactModal);
    cancelModalBtn.dataset.listenerAttached = "true";
  }
}

// Function to handle adding or updating a contact
function handleAddandUpdateContact() {
  // Get form values and trim whitespace
  const fullname = document.getElementById("contactName").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();
  const email = document.getElementById("contactEmail").value.trim();

  // Simple validation for required fields
  if (!fullname || !phone || !email) {
    alert("Please fill in all the fields");
    return;
  }

  // Prepare contact data including current user
  const contactData = { fullname, phone, email, currentUser };
  
  if (isEditing) {
    // If editing, create a new XHR instance for updating contact
    const xhrUpdate = new FXMLHttpRequest();
    xhrUpdate.open("PUT", `/contacts/${Id}`);
    xhrUpdate.setRequestHeader("Content-Type", "application/json");
    xhrUpdate.onreadystatechange = function () {
      if (xhrUpdate.readyState === 4) {
        console.log("[updateContact] Server Response:", xhrUpdate.status, xhrUpdate.responseText);
        if (xhrUpdate.status === 200) {
          console.log("[updateContact] Contact updated successfully.");
          fetchContacts(); // Refresh contacts list
          closeContactModal(); // Close the modal
        } else {
          alert("Error updating contact: " + xhrUpdate.responseText);
        }
      }
    };
    xhrUpdate.send(JSON.stringify(contactData));
  } else {
    // If adding a new contact, create a new XHR instance for adding
    const xhrAdd = new FXMLHttpRequest();
    xhrAdd.open("POST", "/contacts");
    xhrAdd.setRequestHeader("Content-Type", "application/json");
    xhrAdd.onreadystatechange = function () {
      if (xhrAdd.readyState === 4) {
        console.log("[handleAddContact] Server Response:", xhrAdd.status, xhrAdd.responseText);
        if (xhrAdd.status === 201) {
          console.log("[handleAddContact] Contact added successfully.");
          fetchContacts(); // Refresh contacts list
          closeContactModal(); // Close the modal
        } else {
          //alert("Error adding contact: " + xhrAdd.responseText);
        }
      }
    };
    xhrAdd.send(JSON.stringify(contactData));
  }
}

// Function to delete a contact
function deleteContact(contactId) {
  const xhrDelete = new FXMLHttpRequest();
  xhrDelete.open("DELETE", `/contacts/${contactId}`);
  xhrDelete.onreadystatechange = function () {
    if (xhrDelete.readyState === 4 && xhrDelete.status === 200) {
      fetchContacts(); // Refresh contacts list after deletion
    }
  };
  xhrDelete.send();
}

// Function to filter displayed contacts based on search
function filterContacts(query) {
  const contactsList = document.getElementById("contactsList");
  const items = contactsList.getElementsByClassName("contact-item");
  Array.from(items).forEach((item) => {
    const name = item.querySelector(".contact-name").textContent.toLowerCase();
    item.style.display = name.includes(query.toLowerCase()) ? "block" : "none";
  });
}

// Function to handle logout: clear session and redirect to login
function handleLogout() {
  currentUser = null;
  const contactData = "null"; // Use a string "null" to clear current user storage
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
  location.hash = "#/login"; // Redirect to login route
  showLoginError("You have been logged out.");
}

// Function to handle login
function handleLogin() {
  console.log("[App] Handling login.");
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  
  if (!email || !password) {
    console.warn("[App] Login validation failed: Missing email or password.");
    return showLoginError("Please enter both email and password.");
  }

  currentUser = email; // Set the global currentUser variable
  // New XHR instance to set current user in storage
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

  // New XHR instance for login request
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

// Function to handle registration
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

  // New XHR instance for registration request
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
          location.hash = "#/login"; // Redirect to login after a delay
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