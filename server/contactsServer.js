/* contactsServer.js */
const contactsServer = (() => {
  const getContacts = () => {
    const contacts = dbAPI.getContacts();
    return { status: 200, response: { contacts } };
  };

  const getContactById = (id) => {
    const contact = dbAPI.findContactById(id);
    return contact
      ? { status: 200, response: { contact } }
      : { status: 404, response: { error: "Contact not found" } };
  };

  const addContact = (body) => {
    const { fullname, phone, email } = body;
    if (!fullname || !phone || !email) {
      return { status: 400, response: { error: "Missing required fields" } };
    }
    const newContact = dbAPI.addContact({ fullname, phone, email });
    return { status: 201, response: { message: "Contact added", contact: newContact } };
  };

  const updateContact = (id, body) => {
    const updated = dbAPI.updateContact(id, body);
    return updated
      ? { status: 200, response: { message: "Contact updated", contact: updated } }
      : { status: 404, response: { error: "Contact not found" } };
  };

  const deleteContact = (id) => {
    const deleted = dbAPI.deleteContact(id);
    return deleted
      ? { status: 200, response: { message: "Contact deleted", contact: deleted } }
      : { status: 404, response: { error: "Contact not found" } };
  };

  const handleRequest = (request, callback) => {
    const { method, url, body } = request;
    let result;
    // URL expected format: /contacts or /contacts/{id}
    const parts = url.split("/");
    if (parts[1] !== "contacts") {
      result = { status: 404, response: { error: "Endpoint not found" } };
    } else {
      const id = parts[2] ? parseInt(parts[2], 10) : null;
      if (method === "GET") {
        result = id ? getContactById(id) : getContacts();
      } else if (method === "POST") {
        result = addContact(body);
      } else if (method === "PUT" && id) {
        result = updateContact(id, body);
      } else if (method === "DELETE" && id) {
        result = deleteContact(id);
      } else {
        result = { status: 404, response: { error: "Invalid request" } };
      }
    }
    callback(null, result);
  };

  return { handleRequest };
})();
