/* router.js */

const Router = (() => {
  // Map routes to the corresponding template IDs in index.html
  const routes = {
    "/login": "loginTemplate",
    "/register": "registerTemplate",
    "/contacts": "contactsTemplate",
  };

  const loadView = (route) => {
    console.log("[Router] Loading view for route:", route);
    const templateId = routes[route] || routes["/login"]; // Default to login
    console.log("[Router] Using template ID:", templateId);
    const template = document.getElementById(templateId); // Get the template element
    if (template) {
      // Clone the template content and inject it into the app container
      const clone = template.content.cloneNode(true);
      const appContainer = document.getElementById("app"); // Get the app container
      appContainer.innerHTML = ""; // Clear the app container
      appContainer.appendChild(clone); // Inject the template content
      console.log("[Router] View loaded successfully.");
      
      // If contacts view loaded, call fetchContacts() to render contacts
      if (route === "/contacts") {
        fetchContacts();
      }
    } else {
      document.getElementById("app").innerHTML = `<p>Error loading view</p>`;
      console.log("[Router] ERROR: Template not found for route:", route);
    }
  };

  const init = () => {
    console.log("[Router] Initializing router...");
    window.addEventListener("hashchange", () => { // Listen for hash changes
      const route = location.hash.replace("#", ""); // Get the new route
      console.log("[Router] Detected hash change. New route:", route);
      loadView(route); // Load the view corresponding to the new route
    });
    const initialRoute = location.hash.replace("#", "") || "/login";
    console.log("[Router] Loading initial route:", initialRoute);
    loadView(initialRoute);
  };

  return { init };
})(); // Invoke the IIFE (Immediately Invoked Function Expression)