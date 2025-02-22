/* router.js */
// This function is called when the app is first loaded
const Router = (() => {
  // Map routes to the corresponding template IDs
  const routes = {
    "/login": "loginTemplate",
    "/register": "registerTemplate",
    "/contacts": "contactsTemplate",
  };

  const loadView = (route) => {
    const templateId = routes[route] || routes["/login"]; // Default to login
    const template = document.getElementById(templateId); // Get the template element
    if (template) {
      // Clone the template content and inject it into the app container
      const clone = template.content.cloneNode(true);
      const appContainer = document.getElementById("app");
      appContainer.innerHTML = "";
      appContainer.appendChild(clone);
    } else {
      document.getElementById("app").innerHTML = `<p>Error loading view</p>`;
    }
  };
  
  const init = () => {
    window.addEventListener("hashchange", () => {
      const route = location.hash.replace("#", "");
      loadView(route);
    });
    // Load default view if no route is provided
    loadView(location.hash.replace("#", "") || "/login");
  };

  return { init };
})();