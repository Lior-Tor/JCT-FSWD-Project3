/* dbAPI.js */

const dbAPI = (() => {
  // Keys used for storing data in localStorage
  const USERS_KEY = "usersDB";
  const CURRENT_USERS_KEY = "currentusersDB";
  const CONTACTS_KEY = "contactsDB";
  const CONTACTS_ID_KEY = "contactsIdCounter";

  // Initialize users database if it doesn't exist
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([]));
    console.log("[dbAPI] Initialized users database.");
  }

  // Initialize current user storage if it doesn't exist
  if (!localStorage.getItem(CURRENT_USERS_KEY)) {
    localStorage.setItem(CURRENT_USERS_KEY, "null");
    console.log("[dbAPI] Initialized current user storage.");
  }

  // Initialize contacts database if it doesn't exist
  if (!localStorage.getItem(CONTACTS_KEY)) {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify([]));
    console.log("[dbAPI] Initialized contacts database.");
  }

  // Initialize contacts ID counter if it doesn't exist
  if (!localStorage.getItem(CONTACTS_ID_KEY)) {
    localStorage.setItem(CONTACTS_ID_KEY, "1");
    console.log("[dbAPI] Initialized contacts ID counter.");
  }

  /* USERS FUNCTIONS */

  // Retrieve all users from localStorage
  const getUsers = () => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    console.log("[dbAPI] getUsers called. Users:", users);
    return users;
  };

  // Retrieve the current user from localStorage
  const getcurrentUser = () => {
    const userData = JSON.parse(localStorage.getItem(CURRENT_USERS_KEY));
    console.log("[dbAPI] getcurrentUser called. User:", userData);
    return userData;
  };

  // Save the current user into localStorage
  const setcurrentUser = (user) => {
    localStorage.setItem(CURRENT_USERS_KEY, JSON.stringify(user));
    console.log("[dbAPI] setcurrentUser called. User saved:", user);
  };

  // Save the updated users array back into localStorage
  const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    console.log("[dbAPI] saveUsers called. Users saved:", users);
  };

  // Find a user by email
  const findUser = (email) => {
    console.log("[dbAPI] findUser called for email:", email);
    const users = getUsers();
    const found = users.find(u => u.email === email);
    console.log("[dbAPI] findUser result:", found);
    return found;
  };

  // Add a new user and update localStorage
  const addUser = (user) => {
    console.log("[dbAPI] addUser called with user:", user);
    const users = getUsers();
    users.push(user);
    saveUsers(users);
    return user;

    // console.log("[dbAPI] addUser called with user:", user);
    // const users = getUsers();
    // users.push(user);
    // saveUsers(users);
    // return usersDB.addUser(user);
  };

  // Find a contact by phone number (searches all contacts)
  const findContactByPhone = (phone) => {
    console.log("[dbAPI] findContactByPhone called for phone:", phone);
    const contacts = getContacts();
    const found = contacts.find(c => c.phone === phone);
    console.log("[dbAPI] findContactByPhone result:", found);
    return found;
  };

  /* CONTACTS FUNCTIONS */

  // Retrieve all contacts from localStorage
  const getContacts = () => {
    const contacts = JSON.parse(localStorage.getItem(CONTACTS_KEY));
    console.log("[dbAPI] getContacts called. Contacts:", contacts);
    return contacts;
  };

  // Save the contacts array back into localStorage
  const saveContacts = (contacts) => {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
    console.log("[dbAPI] saveContacts called. Contacts saved:", contacts);
  };

  // Generate a unique ID for a new contact using a counter in localStorage
  const generateContactId = () => {
    let id = parseInt(localStorage.getItem(CONTACTS_ID_KEY), 10);
    localStorage.setItem(CONTACTS_ID_KEY, (id + 1).toString());
    console.log("[dbAPI] Generated new contact ID:", id);
    return id;
  };

  // Find a contact by its ID
  const findContactById = (id) => {
    console.log("[dbAPI] findContactById called for id:", id);
    const contacts = getContacts();
    const found = contacts.find(c => c.id === id);
    console.log("[dbAPI] findContactById result:", found);
    return found;
  };

  // Add a new contact, assign it a unique ID, and save it
  const addContact = (contact) => {
    console.log("[dbAPI] addContact called with contact:", contact);
    const contacts = getContacts();
    contact.id = generateContactId();
    contacts.push(contact);
    saveContacts(contacts);
    console.log("[dbAPI] Contact added:", contact, contacts);
    return contact;
  };

  // Update an existing contact identified by its ID
  const updateContact = (id, newData) => {
    console.log("[dbAPI] updateContact called for id:", id, "with newData:", newData);
    let contacts = getContacts();
    if (!contacts || contacts.length === 0) {
      console.log("[dbAPI] No contacts found in database.");
      return null;
    }
    const index = contacts.findIndex(c => c.id === id);
    if (index > -1) {
      contacts[index] = { ...contacts[index], ...newData }; // Merge the new data into the existing contact
      saveContacts(contacts);
      console.log("[dbAPI] Contact updated:", contacts[index]);
      return contacts[index];
    } else {
      console.log("[dbAPI] Contact not found for update with id:", id);
      return null;
    }
  };

  // Delete a contact from the contacts array by its ID
  const deleteContact = (id) => {
    console.log("[dbAPI] deleteContact called for id:", id);
    let contacts = getContacts();
    const index = contacts.findIndex(c => c.id === id);
    if (index > -1) {
      const deleted = contacts.splice(index, 1)[0];
      saveContacts(contacts);
      console.log("[dbAPI] Contact deleted:", deleted);
      return deleted;
    }
    console.log("[dbAPI] Contact not found for deletion with id:", id);
    return null;
  };

  // Expose the public API methods
  return {
    getcurrentUser,
    setcurrentUser,
    getUsers,
    findUser,
    addUser,
    getContacts,
    findContactByPhone,
    findContactById,
    addContact,
    updateContact,
    deleteContact
  };
})(); // Immediately Invoked Function Expression (IIFE)