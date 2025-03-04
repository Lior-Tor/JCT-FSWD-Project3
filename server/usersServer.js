/* usersServer.js */
const usersServer = (() => {
  // Login: Validate email and password.
  const login = (body) => {
    console.log("[usersServer] Login called with body:", body);
    const { email, password } = body;
    if (!email || !password) {
      console.warn("[usersServer] Missing email or password");
      return { status: 400, response: { error: "Missing email or password" } };
    }
    const user = dbAPI.findUser(email);
    if (!user) {
      console.warn("[usersServer] User not found for email:", email);
      return { status: 404, response: { error: "User not found" } };
    }
    if (user.password !== password) {
      console.warn("[usersServer] Incorrect password for email:", email);
      return { status: 401, response: { error: "Incorrect password" } };
    }
    console.log("[usersServer] Login successful for user:", user);
    return { status: 200, response: { message: "Login successful", user } };
  };

  // Register: Validate fullname, email, password, and confirmPassword.
  // Detailed error messages provided for missing fields, password mismatch,
  // and password complexity.
  const register = (body) => {
    console.log("[usersServer] Register called with body:", body);
    const { fullname, email, password, confirmPassword } = body;
    if (!fullname || !email || !password || !confirmPassword) {
      console.warn("[usersServer] Missing required fields");
      return { status: 400, response: { error: "Missing required fields" } };
    }
    if (password !== confirmPassword) {
      console.warn("[usersServer] Passwords do not match for email:", email);
      return { status: 400, response: { error: "Passwords do not match" } };
    }
    // Regex: At least 8 characters, one uppercase, one lowercase, and one number.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      console.warn("[usersServer] Password does not meet complexity requirements for email:", email);
      return {
        status: 400,
        response: {
          error:
            "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number."
        }
      };
    }
    if (dbAPI.findUser(email)) {
      console.warn("[usersServer] User already exists for email:", email);
      return { status: 409, response: { error: "User already exists" } };
    }
    const newUser = { fullname, email, password };
    dbAPI.addUser(newUser);
    console.log("[usersServer] Registration successful for user:", newUser);
    return { status: 201, response: { message: "Registration successful", user: newUser } };
  };

  // Handle incoming requests to /users/login and /users/register.
  const handleRequest = (request, callback) => {
    console.log("[usersServer] handleRequest called with request:", request);
    const { method, url, body } = request;
    let result;
    if (method === "POST" && url.includes("/users/login")) {
      result = login(body);
    } else if (method === "POST" && url.includes("/users/register")) {
      result = register(body);
    } else {
      console.warn("[usersServer] Invalid endpoint:", url);
      result = { status: 404, response: { error: "Endpoint not found" } };
    }
    console.log("[usersServer] Returning result:", result);
    callback(null, result);
  };

  return { handleRequest };
})();