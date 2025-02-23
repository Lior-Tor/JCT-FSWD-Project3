/* usersDB.js */
const USERS_KEY = "usersDB";

// Initialize the users database if not already present
if (!localStorage.getItem(USERS_KEY)) {
  localStorage.setItem(USERS_KEY, JSON.stringify([]));
  console.log("[usersDB] Initialized users database.");
}

const usersDB = {
  getAll: () => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    console.log("[usersDB] getAll called. Users:", users);
    return users;
  },

  saveAll: (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    console.log("[usersDB] saveAll called. Users saved:", users);
  },

  add: (user) => {
    console.log("[usersDB] add called with user:", user);
    const users = usersDB.getAll();
    // Assign a unique id to the new user (using current timestamp)
    user.id = Date.now();
    users.push(user);
    usersDB.saveAll(users);
    console.log("[usersDB] User added:", user);
    return user;
  },

  find: (identifier) => {
    console.log("[usersDB] find called for identifier:", identifier);
    const users = usersDB.getAll();
    const found = users.find(u => u.username === identifier || u.email === identifier);
    console.log("[usersDB] find result:", found);
    return found;
  }
};

// For module environments or browser global
if (typeof module !== "undefined") {
  module.exports = usersDB;
} else {
  window.usersDB = usersDB;
}