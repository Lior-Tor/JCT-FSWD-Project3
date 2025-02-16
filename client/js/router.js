/* router.js */
const Router = (() => {
  const routes = {
    "/login": "html/login.html",
    "/register": "html/register.html",
    "/contacts": "html/contacts.html",
  };

  const loadView = async (route) => {
    const path = routes[route] || routes["/login"];
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error("View not found");
      const html = await response.text();
      document.getElementById("app").innerHTML = html;
    } catch (error) {
      document.getElementById("app").innerHTML = `<p>Error loading view</p>`;
    }
  };

  const init = () => {
    window.addEventListener("hashchange", () => {
      const route = location.hash.replace("#", "");
      loadView(route);
    });
    loadView(location.hash.replace("#", "") || "/login");
  };

  return { init };
})();
