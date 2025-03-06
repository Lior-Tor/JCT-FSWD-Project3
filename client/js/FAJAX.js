/* FAJAX.js */
class FXMLHttpRequest {
  constructor() {
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
    this.readyState = 1; // Opened
    if (this.onreadystatechange) {
      this.onreadystatechange();
    }
  }
  
  setRequestHeader(header, value) {
    this._headers[header] = value;
  }
  
  send(body = null) {
    this.readyState = 2;
    if (this.onreadystatechange) {
        this.onreadystatechange();
    }

    console.log("[FXMLHttpRequest] Envoi de la requête :", {
        method: this._method,
        url: this._url,
        headers: this._headers,
        body: body
    });

    // Envoi au simulateur Network
    Network.send(
        {
            method: this._method,
            url: this._url,
            headers: this._headers,
            body: body
        },
        (error, response) => {
            console.log("[FXMLHttpRequest] Réponse reçue :", { error, response });

            if (error) {
                this.status = 0;
                this.responseText = "";
            } else {
                this.status = response.status;
                this.responseText = response.responseText;
            }

            this.readyState = 4;
            if (this.onreadystatechange) {
                this.onreadystatechange();
            }
        }
    );
}
}