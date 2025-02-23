/* contactsServer.js */
const contactsServer = (() => {
  const getContacts = () => {
    console.log("[contactsServer] getContacts called");
    const contacts = dbAPI.getContacts();
    return { status: 200, response: { contacts } };
  };

  const getContactById = (id) => {
    console.log("[contactsServer] getContactById called with id:", id);
    const contact = dbAPI.findContactById(id);
    if (contact) {
      return { status: 200, response: { contact } };
    } else {
      console.warn("[contactsServer] Contact not found for id:", id);
      return { status: 404, response: { error: "Contact not found" } };
    }
  };

  const addContact = (body) => {
    console.log("[contactsServer] addContact called with body:", body);
    const { fullname, phone, email } = body;
    if (!fullname || !phone || !email) {
      console.warn("[contactsServer] Missing required fields");
      return { status: 400, response: { error: "Missing required fields" } };
    }
    const newContact = dbAPI.addContact({ fullname, phone, email });
    console.log("[contactsServer] Contact added:", newContact);
    return { status: 201, response: { message: "Contact added", contact: newContact } };
  };

  const updateContact = (id, body) => {
    console.log("[contactsServer] updateContact called with id:", id, "and body:", body);
    const updated = dbAPI.updateContact(id, body);
    if (updated) {
      console.log("[contactsServer] Contact updated:", updated);
      return { status: 200, response: { message: "Contact updated", contact: updated } };
    } else {
      console.warn("[contactsServer] Contact not found for update with id:", id);
      return { status: 404, response: { error: "Contact not found" } };
    }
  };

  const deleteContact = (id) => {
    console.log("[contactsServer] deleteContact called with id:", id);
    const deleted = dbAPI.deleteContact(id);
    if (deleted) {
      console.log("[contactsServer] Contact deleted:", deleted);
      return { status: 200, response: { message: "Contact deleted", contact: deleted } };
    } else {
      console.warn("[contactsServer] Contact not found for deletion with id:", id);
      return { status: 404, response: { error: "Contact not found" } };
    }
  };

  const handleRequest = (request, callback) => {
    console.log("[contactsServer] handleRequest called with request:", request);
    const { method, url, body } = request;
    let result;
    const parts = url.split("/");
    if (parts[1] !== "contacts") {
      console.warn("[contactsServer] Endpoint not found for url:", url);
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
        console.warn("[contactsServer] Invalid request for url:", url);
        result = { status: 404, response: { error: "Invalid request" } };
      }
    }
    console.log("[contactsServer] Returning result:", result);
    callback(null, result);
  };

  return { handleRequest };
})();