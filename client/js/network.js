/* network.js */
const Network = (() => {
  const minDelay = 1000;
  const maxDelay = 3000;
  const lossProbability = 0.3;

  // Dispatch request to the appropriate fake server
  function serverDispatcher(request, callback) {
    const url = request.url;
    const method = request.method;
    const body = request.body ? JSON.parse(request.body) : {};

    // Check which server should handle the request
    if (url.startsWith("/users")) {
      usersServer.handleRequest({ method, url, body }, callback);
    } else if (url.startsWith("/contacts")) {
      contactsServer.handleRequest({ method, url, body }, callback);
    } else {
      // 404 if no matching route
      callback(null, {
        status: 404,
        response: { error: "Endpoint not found" }
      });
    }
  }

  const send = (request, callback) => {
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    const drop = Math.random() < lossProbability;
    
    setTimeout(() => {
      if (drop) {
        // Simulate dropped request
        callback(new Error("Network error: message dropped"), null);
      } else {
        // Forward request to our "server dispatcher"
        serverDispatcher(request, (error, result) => {
          if (error) {
            callback(error, null);
          } else {
            callback(null, {
              status: result.status,
              responseText: JSON.stringify(result.response)
            });
          }
        });
      }
    }, delay);
  };

  return { send };
})();