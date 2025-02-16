/* dbAPI.js */
const dbAPI = (() => {
  const USERS_KEY = "usersDB";
  const CONTACTS_KEY = "contactsDB";
  const CONTACTS_ID_KEY = "contactsIdCounter";

  // Initialize users database if not present.
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([]));
  }

  // Initialize contacts database if not present.
  if (!localStorage.getItem(CONTACTS_KEY)) {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify([]));
  }

  // Initialize contacts ID counter if not present.
  if (!localStorage.getItem(CONTACTS_ID_KEY)) {
    localStorage.setItem(CONTACTS_ID_KEY, "1");
  }

  /* Users functions */
  const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY));
  const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Now only check email.
  const findUser = (email) => {
    const users = getUsers();
    return users.find(u => u.email === email);
  };

  const addUser = (user) => {
    const users = getUsers();
    users.push(user);
    saveUsers(users);
  };

  /* Contacts functions */
  const getContacts = () => JSON.parse(localStorage.getItem(CONTACTS_KEY));
  const saveContacts = (contacts) => localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  const generateContactId = () => {
    let id = parseInt(localStorage.getItem(CONTACTS_ID_KEY), 10);
    localStorage.setItem(CONTACTS_ID_KEY, (id + 1).toString());
    return id;
  };
  const findContactById = (id) => {
    const contacts = getContacts();
    return contacts.find(c => c.id === id);
  };
  const addContact = (contact) => {
    const contacts = getContacts();
    contact.id = generateContactId();
    contacts.push(contact);
    saveContacts(contacts);
    return contact;
  };
  const updateContact = (id, newData) => {
    const contacts = getContacts();
    const index = contacts.findIndex(c => c.id === id);
    if (index > -1) {
      contacts[index] = { ...contacts[index], ...newData };
      saveContacts(contacts);
      return contacts[index];
    }
    return null;
  };
  const deleteContact = (id) => {
    let contacts = getContacts();
    const index = contacts.findIndex(c => c.id === id);
    if (index > -1) {
      const deleted = contacts.splice(index, 1)[0];
      saveContacts(contacts);
      return deleted;
    }
    return null;
  };

  return {
    getUsers,
    findUser,
    addUser,
    getContacts,
    findContactById,
    addContact,
    updateContact,
    deleteContact
  };
})();
