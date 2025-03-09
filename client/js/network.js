/* network.js */
const Network = (() => {
  // Simulated network delay and loss settings
  const minDelay = 0;
  const maxDelay = 0;
  const lossProbability = 0;

  // Dispatch request to the appropriate server based on URL.
  function serverDispatcher(request, callback) {
    console.log("[Network] Dispatching request:", request);
    const url = request.url;
    const method = request.method;
    // Parse the body if provided
    const body = request.body ? JSON.parse(request.body) : {};
    console.log("[Network] Parsed body:", body);

    // Dispatch to the appropriate server (users or contacts)
    if (url.startsWith("/users")) {
      console.log("[Network] Routing to usersServer.");
      usersServer.handleRequest({ method, url, body }, (error, result) => {
        console.log("[Network] usersServer returned:", { error, result });
        callback(error, result); // Forward the result to the caller
      });
    } else if (url.startsWith("/contacts")) {
      console.log("[Network] Routing to contactsServer.");
      contactsServer.handleRequest({ method, url, body }, (error, result) => {
        console.log("[Network] contactsServer returned:", { error, result });
        callback(error, result); // Forward the result to the caller
      });
    } else {
      console.warn("[Network] No matching route for URL:", url);
      callback(null, {
        status: 404,
        response: { error: "Endpoint not found" }
      }); // Return a 404 error
    }
  }

  // Simulate sending a network request.
  const send = (request, callback) => {
    console.log("[Network] Sending request:", request);
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    console.log(`[Network] Delay set to: ${delay} ms`);
    const drop = Math.random() < lossProbability;
    console.log(`[Network] Drop check: ${drop ? "Request will be dropped" : "Request will proceed"}`);

    // Simulate network delay and loss using callback for asynchronous
    setTimeout(() => {
      if (drop) {
        console.error("[Network] Request dropped due to simulated error.");
        callback(new Error("Network error: message dropped"), null);
      } else {
        console.log("[Network] Forwarding request to serverDispatcher.");
        serverDispatcher(request, (error, result) => {
          if (error) {
            console.error("[Network] Error from serverDispatcher:", error);
            callback(error, null);
          } else {
            console.log("[Network] Received response from dispatcher:", result);
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