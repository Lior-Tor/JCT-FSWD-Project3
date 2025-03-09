/* usersServer.js */
const usersServer = (() => {
  // Validate login credentials
  const login = (body) => {
    console.log("[usersServer] Login called with body:", body);
    const { email, password } = body;
    if (!email || !password) {
      console.log("[usersServer] Missing email or password");
      return { status: 400, response: { error: "Missing email or password" } };
    }
    const user = dbAPI.findUser(email);
    if (!user) {
      console.log("[usersServer] User not found for email:", email);
      return { status: 404, response: { error: "User not found" } };
    }
    if (user.password !== password) {
      console.log("[usersServer] Incorrect password for email:", email);
      return { status: 401, response: { error: "Incorrect password" } };
    }
    console.log("[usersServer] Login successful for user:", user);
    return { status: 200, response: { message: "Login successful", user } };
  };

  // Register a new user with validation and detailed error messages
  const register = (body) => {
    console.log("[usersServer] Register called with body:", body);
    const { fullname, email, password, confirmPassword } = body;
    if (!fullname || !email || !password || !confirmPassword) {
      console.log("[usersServer] Missing required fields");
      return { status: 400, response: { error: "Missing required fields" } };
    }
    if (password !== confirmPassword) {
      console.log("[usersServer] Passwords do not match for email:", email);
      return { status: 400, response: { error: "Passwords do not match" } };
    }
    // Password must have at least 8 characters, one uppercase, one lowercase, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      console.log("[usersServer] Password does not meet complexity requirements for email:", email);
      return {
        status: 400,
        response: {
          error:
            "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number."
        }
      };
    }
    if (dbAPI.findUser(email)) {
      console.log("[usersServer] User already exists for email:", email);
      return { status: 409, response: { error: "User already exists" } };
    }
    const newUser = { fullname, email, password, items: [] };
    dbAPI.addUser(newUser);
    console.log("[usersServer] Registration successful for user:", newUser);
    return { status: 201, response: { message: "Registration successful", user: newUser } };
  };

  // Set the current user in storage
  const setcurentuser = (body) => {
    console.log("[usersServer] setcurentuser called with body:", body);
    if (!body) {
      console.log("[usersServer] Missing required fields for current user");
      return { status: 400, response: { error: "Missing required fields" } };
    }
    dbAPI.setcurrentUser(body);  // Store the plain value
    console.log("[usersServer] Current user set:", body);
    return { status: 201, response: { message: "Current user set successfully", user: body } };
  };  

  // Retrieve the current user from storage
  const getcurentuser = () => {
    let result = dbAPI.getcurrentUser();
    console.log("[usersServer] getcurentuser called. Result:", result);
    return {
      status: 201,
      response: { user: result }
    };
  };

  // Handle incoming user-related requests
  const handleRequest = (request, callback) => {
    console.log("[usersServer] handleRequest called with request:", request);
    const { method, url, body } = request;
    let result;
    if (method === "POST" && url.includes("/users/login")) {
      result = login(body);
    } else if (method === "POST" && url.includes("/users/setcurentuser")) {
      result = setcurentuser(body);
    } else if (method === "POST" && url.includes("/users/getcurentuser")) {
      result = getcurentuser();
      callback(null, JSON.stringify(result));
      return;
    } else if (method === "POST" && url.includes("/users/register")) {
      result = register(body);
    } else {
      console.log("[usersServer] Invalid endpoint:", url);
      result = { status: 404, response: { error: "Endpoint not found" } };
    }
    console.log("[usersServer] Returning result:", result);
    callback(null, result);
  };

  return { handleRequest };
})();