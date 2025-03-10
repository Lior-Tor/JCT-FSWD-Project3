/* FAJAX.js */

class FXMLHttpRequest {
  // Initialize properties
  constructor() {
    this.readyState = 0; // 0: UNSENT, 1: OPENED, 2: SENT, 3: LOADING, 4: DONE, 5: ERROR
    this.status = 0; // HTTP status code (e.g., 200 for OK, 201 for Created, 404 for Not Found)
    this.responseText = ""; // Response body
    this.onreadystatechange = null; // Callback function
    this._method = null; // Request method (GET, POST, etc.)
    this._url = null; // Request URL (e.g., /users/login)
    this._async = true; // Asynchronous flag (default to true)
    this._headers = {}; // Request headers (e.g., Content-Type)
  }
  
  // Implement the open, setRequestHeader, and send methods
  open(method, url, async = true) {
    this._method = method; // Method (GET, POST, etc.)
    this._url = url; // URL (e.g., /users/login)
    this._async = async; // Asynchronous flag (default to true)
    this.readyState = 1; // Mark as opened
    console.log("[FXMLHttpRequest] Opened:", { method, url, async });
    if (this.onreadystatechange) {
      this.onreadystatechange(); // Callback function, called whenever readyState changes
    }
  }
  
  setRequestHeader(header, value) {
    this._headers[header] = value; // Store the header key-value pair
    console.log("[FXMLHttpRequest] Set header:", header, value);
  }
  
  send(body = null) {
    this.readyState = 2; // Request is being sent
    if (this.onreadystatechange) {
      this.onreadystatechange(); // Callback function, called whenever readyState changes
    }

    console.log("[FXMLHttpRequest] Sending request:", {
      method: this._method,
      url: this._url,
      headers: this._headers,
      body: body
    });

    // Forward the request to the simulated network
    Network.send(
      {
        method: this._method,
        url: this._url,
        headers: this._headers,
        body: body
      },
      (error, response) => {
        console.log("[FXMLHttpRequest] Response received:", { error, response });
        if (error) {
          this.status = 0;
          this.responseText = "";
        } else {
          this.status = response.status;
          this.responseText = response.responseText;
        }
        this.readyState = 4; // Request completed
        if (this.onreadystatechange) {
          this.onreadystatechange(); // Callback function, called whenever readyState changes
        }
      }
    );
  }
}