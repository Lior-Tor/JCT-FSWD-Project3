/* router.js */
const Router = (() => {
  // Map routes to the corresponding template IDs
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
      const appContainer = document.getElementById("app");
      appContainer.innerHTML = "";
      appContainer.appendChild(clone);
      console.log("[Router] View loaded successfully.");
    } else {
      document.getElementById("app").innerHTML = `<p>Error loading view</p>`;
      console.error("[Router] Error: Template not found for route:", route);
    }
  };
  
  const init = () => {
    console.log("[Router] Initializing router...");
    window.addEventListener("hashchange", () => {
      const route = location.hash.replace("#", "");
      console.log("[Router] Detected hash change. New route:", route);
      loadView(route);
    });
    const initialRoute = location.hash.replace("#", "") || "/login";
    console.log("[Router] Loading initial route:", initialRoute);
    loadView(initialRoute);
  };

  return { init };
})();
