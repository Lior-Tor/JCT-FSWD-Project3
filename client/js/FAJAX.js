/* FAJAX.js */
class FXMLHttpRequest {
  constructor() {
    // Initialize properties
    this.readyState = 0;
    this.status = 0;
    this.responseText = "";
    this.onreadystatechange = null;
    this._method = null;
    this._url = null;
    this._async = true;
    this._headers = {};
  }
  
  open(method, url, async = true) {
    this._method = method;
    this._url = url;
    this._async = async;
    this.readyState = 1; // Mark as opened
    console.log("[FXMLHttpRequest] Opened:", { method, url, async });
    if (this.onreadystatechange) {
      this.onreadystatechange();
    }
  }
  
  setRequestHeader(header, value) {
    this._headers[header] = value;
    console.log("[FXMLHttpRequest] Set header:", header, value);
  }
  
  send(body = null) {
    this.readyState = 2; // Request is being sent
    if (this.onreadystatechange) {
      this.onreadystatechange();
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
          this.onreadystatechange();
        }
      }
    );
  }
}