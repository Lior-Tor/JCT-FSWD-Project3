/* usersServer.js */
const usersServer = (() => {
  // Login: Validate email and password.
  const login = (body) => {
    const { email, password } = body;
    if (!email || !password) {
      return { status: 400, response: { error: "Missing email or password" } };
    }
    const user = dbAPI.findUser(email);
    if (!user) {
      return { status: 404, response: { error: "User not found" } };
    }
    if (user.password !== password) {
      return { status: 401, response: { error: "Incorrect password" } };
    }
    return { status: 200, response: { message: "Login successful", user } };
  };

  // Register: Validate fullname, email, password, and confirmPassword.
  // Detailed error messages are provided for missing fields, password mismatch,
  // and password complexity using a regex.
  const register = (body) => {
    const { fullname, email, password, confirmPassword } = body;
    if (!fullname || !email || !password || !confirmPassword) {
      return { status: 400, response: { error: "Missing required fields" } };
    }
    if (password !== confirmPassword) {
      return { status: 400, response: { error: "Passwords do not match" } };
    }
    // Regex: At least 8 characters, one uppercase, one lowercase, and one number.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return {
        status: 400,
        response: {
          error:
            "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number."
        }
      };
    }
    if (dbAPI.findUser(email)) {
      return { status: 409, response: { error: "User already exists" } };
    }
    const newUser = { fullname, email, password };
    dbAPI.addUser(newUser);
    return { status: 201, response: { message: "Registration successful", user: newUser } };
  };

  // Handle incoming requests to /users/login and /users/register.
  const handleRequest = (request, callback) => {
    const { method, url, body } = request;
    let result;
    if (method === "POST" && url.includes("/users/login")) {
      result = login(body);
    } else if (method === "POST" && url.includes("/users/register")) {
      result = register(body);
    } else {
      result = { status: 404, response: { error: "Endpoint not found" } };
    }
    callback(null, result);
  };

  return { handleRequest };
})();
