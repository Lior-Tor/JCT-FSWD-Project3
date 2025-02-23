/* contactsDB.js */
const CONTACTS_KEY = "contactsDB";
const CONTACTS_ID_KEY = "contactsIdCounter";

// Initialize the contacts database if not already present
if (!localStorage.getItem(CONTACTS_KEY)) {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify([]));
  console.log("[contactsDB] Initialized contacts database.");
}

// Initialize contacts ID counter if not present
if (!localStorage.getItem(CONTACTS_ID_KEY)) {
  localStorage.setItem(CONTACTS_ID_KEY, "1");
  console.log("[contactsDB] Initialized contacts ID counter.");
}

const contactsDB = {
  getAll: () => {
    const contacts = JSON.parse(localStorage.getItem(CONTACTS_KEY));
    console.log("[contactsDB] getAll called. Contacts:", contacts);
    return contacts;
  },

  saveAll: (contacts) => {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
    console.log("[contactsDB] saveAll called. Contacts saved:", contacts);
  },

  generateId: () => {
    const id = parseInt(localStorage.getItem(CONTACTS_ID_KEY), 10);
    localStorage.setItem(CONTACTS_ID_KEY, (id + 1).toString());
    console.log("[contactsDB] Generated new contact ID:", id);
    return id;
  },

  add: (contact) => {
    console.log("[contactsDB] add called with contact:", contact);
    const contacts = contactsDB.getAll();
    contact.id = contactsDB.generateId();
    contacts.push(contact);
    contactsDB.saveAll(contacts);
    console.log("[contactsDB] Contact added:", contact);
    return contact;
  },

  find: (id) => {
    console.log("[contactsDB] find called for id:", id);
    const contacts = contactsDB.getAll();
    const found = contacts.find(c => c.id === id);
    console.log("[contactsDB] find result:", found);
    return found;
  },

  update: (id, newData) => {
    console.log("[contactsDB] update called for id:", id, "with newData:", newData);
    const contacts = contactsDB.getAll();
    const index = contacts.findIndex(c => c.id === id);
    if (index > -1) {
      contacts[index] = { ...contacts[index], ...newData };
      contactsDB.saveAll(contacts);
      console.log("[contactsDB] Contact updated:", contacts[index]);
      return contacts[index];
    }
    console.warn("[contactsDB] Contact not found for update with id:", id);
    return null;
  },

  remove: (id) => {
    console.log("[contactsDB] remove called for id:", id);
    let contacts = contactsDB.getAll();
    const index = contacts.findIndex(c => c.id === id);
    if (index > -1) {
      const deleted = contacts.splice(index, 1)[0];
      contactsDB.saveAll(contacts);
      console.log("[contactsDB] Contact deleted:", deleted);
      return deleted;
    }
    console.warn("[contactsDB] Contact not found for deletion with id:", id);
    return null;
  }
};

if (typeof module !== "undefined") {
  module.exports = contactsDB;
} else {
  window.contactsDB = contactsDB;
}