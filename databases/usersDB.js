/* usersDB.js */
const USERS_KEY = "usersDB";

// Initialize the users database if not already present
if (!localStorage.getItem(USERS_KEY)) {
  localStorage.setItem(USERS_KEY, JSON.stringify([]));
  console.log("[usersDB] Initialized users database.");
}

const usersDB = {
  // Retrieve all users
  getAll: () => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    console.log("[usersDB] getAll called. Users:", users);
    return users;
  },

  // Save all users
  saveAll: (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    console.log("[usersDB] saveAll called. Users saved:", users);
  },

  // Add a new user with a unique ID
  add: (user) => {
    console.log("[usersDB] add called with user:", user);
    const users = usersDB.getAll();
    user.id = Date.now();
    users.push(user);
    usersDB.saveAll(users);
    console.log("[usersDB] User added:", user);
    return user;
  },

  // Find a user by username or email
  find: (identifier) => {
    console.log("[usersDB] find called for identifier:", identifier);
    const users = usersDB.getAll();
    const found = users.find(u => u.username === identifier || u.email === identifier);
    console.log("[usersDB] find result:", found);
    return found;
  }
};

if (typeof module !== "undefined") {
  module.exports = usersDB;
} else {
  window.usersDB = usersDB;
}