/* contactsDB.js */
const CONTACTS_KEY = "contactsDB";
const CONTACTS_ID_KEY = "contactsIdCounter";

// Initialize the contacts database if not already present
if (!localStorage.getItem(CONTACTS_KEY)) {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify([]));
}

// Initialize contacts ID counter if not present
if (!localStorage.getItem(CONTACTS_ID_KEY)) {
  localStorage.setItem(CONTACTS_ID_KEY, "1");
}

const contactsDB = {
  getAll: () => JSON.parse(localStorage.getItem(CONTACTS_KEY)),

  saveAll: (contacts) => localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts)),

  generateId: () => {
    const id = parseInt(localStorage.getItem(CONTACTS_ID_KEY), 10);
    localStorage.setItem(CONTACTS_ID_KEY, (id + 1).toString());
    return id;
  },

  add: (contact) => {
    const contacts = contactsDB.getAll();
    contact.id = contactsDB.generateId();
    contacts.push(contact);
    contactsDB.saveAll(contacts);
    return contact;
  },

  find: (id) => {
    const contacts = contactsDB.getAll();
    return contacts.find(c => c.id === id);
  },

  update: (id, newData) => {
    const contacts = contactsDB.getAll();
    const index = contacts.findIndex(c => c.id === id);
    if (index > -1) {
      contacts[index] = { ...contacts[index], ...newData };
      contactsDB.saveAll(contacts);
      return contacts[index];
    }
    return null;
  },

  remove: (id) => {
    let contacts = contactsDB.getAll();
    const index = contacts.findIndex(c => c.id === id);
    if (index > -1) {
      const deleted = contacts.splice(index, 1)[0];
      contactsDB.saveAll(contacts);
      return deleted;
    }
    return null;
  }
};

// For module environments or browser global
if (typeof module !== "undefined") {
  module.exports = contactsDB;
} else {
  window.contactsDB = contactsDB;
}
