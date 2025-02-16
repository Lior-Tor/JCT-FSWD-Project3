/* usersDB.js */
const USERS_KEY = "usersDB";

// Initialize the users database if not already present
if (!localStorage.getItem(USERS_KEY)) {
  localStorage.setItem(USERS_KEY, JSON.stringify([]));
}

const usersDB = {
  getAll: () => JSON.parse(localStorage.getItem(USERS_KEY)),

  saveAll: (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users)),

  add: (user) => {
    const users = usersDB.getAll();
    // Assign a unique id to the new user (using current timestamp)
    user.id = Date.now();
    users.push(user);
    usersDB.saveAll(users);
    return user;
  },

  find: (identifier) => {
    // identifier can be a username or email
    const users = usersDB.getAll();
    return users.find(u => u.username === identifier || u.email === identifier);
  }
};

// For module environments or browser global
if (typeof module !== "undefined") {
  module.exports = usersDB;
} else {
  window.usersDB = usersDB;
}
