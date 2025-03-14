/* contactsServer.js */

const contactsServer = (() => {
  // Return only the contacts that belong to the current user
  const getContacts = () => {
    console.log("[contactsServer] getContacts called");
    const allContacts = dbAPI.getContacts();
    const currentUser = dbAPI.getcurrentUser();
    console.log("[contactsServer] Current user:", currentUser);
    // Filter contacts by the currentUser property
    const userContacts = allContacts.filter(contact => contact.currentUser === currentUser);
    console.log("[contactsServer] Returning contacts for current user:", userContacts);
    return { status: 200, response: { contacts: userContacts } };
  };

  // Return a specific contact by its ID if it belongs to the current user
  const getContactById = (id) => {
    console.log("[contactsServer] getContactById called with id:", id);
    const contact = dbAPI.findContactById(id);
    if (contact) {
      const currentUser = dbAPI.getcurrentUser();
      if (contact.currentUser === currentUser) {
        return { status: 200, response: { contact } };
      } else {
        console.warn("[contactsServer] Access denied: Contact does not belong to current user.");
        return { status: 403, response: { error: "Access denied" } };
      }
    } else {
      console.warn("[contactsServer] Contact not found for id:", id);
      return { status: 404, response: { error: "Contact not found" } };
    }
  };

  // Add a new contact and associate it with the current user
  const addContact = (body) => {
    console.log("[contactsServer] addContact called with body:", body);
    let { fullname, phone, email } = body;
    if (!fullname || !phone || !email) {
      console.warn("[contactsServer] Missing required fields");
      return { status: 400, response: { error: "Missing required fields" } };
    }
    // Normalize the phone number
    phone = phone.trim();
    // Retrieve current user
    const currentUser = dbAPI.getcurrentUser();
    // Get current user's contacts
    const allContacts = dbAPI.getContacts();
    const userContacts = allContacts.filter(contact => contact.currentUser === currentUser);
    // Check for duplicate phone number within current user's contacts
    const existingContact = userContacts.find(c => c.phone === phone);
    if (existingContact) {
      console.warn("[contactsServer] Contact already exists with phone for current user:", phone);
      return { status: 409, response: { error: "A contact with this phone number already exists" } };
    }
    const newContact = dbAPI.addContact({ fullname, phone, email, currentUser });
    console.log("[contactsServer] Contact added:", newContact);
    return { status: 201, response: { message: "Contact added", contact: newContact } };
  };

  // Update an existing contact, ensuring it belongs to the current user
  const updateContact = (id, body) => {
    console.log("[contactsServer] updateContact called with id:", id, "and body:", body);
    
    // If no ID provided, try to find by phone (trim the phone number)
    if (!id && body.phone) {
      console.log("[contactsServer] No ID provided, searching by phone:", body.phone);
      const existingContact = dbAPI.findContactByPhone(body.phone.trim());
      if (existingContact) {
        id = existingContact.id;
        console.log("[contactsServer] Found contact ID:", id);
      } else {
        console.warn("[contactsServer] No contact found with phone:", body.phone);
        return { status: 404, response: { error: "Contact not found with this number" } };
      }
    }
    if (!id) {
      console.warn("[contactsServer] No valid ID provided for update");
      return { status: 400, response: { error: "Contact ID missing" } };
    }
    
    // Normalize the phone number and perform duplicate check only among current user's contacts
    if (body.phone) {
      const normalizedPhone = body.phone.trim();
      const currentUser = dbAPI.getcurrentUser();
      const userContacts = dbAPI.getContacts().filter(contact => contact.currentUser === currentUser);
      const existingContact = userContacts.find(c => c.phone === normalizedPhone);
      if (existingContact && existingContact.id !== id) {
        console.warn("[contactsServer] Phone number already used by another contact:", normalizedPhone);
        return { status: 409, response: { error: "This phone number is already used by another contact" } };
      }
      body.phone = normalizedPhone; // update the phone value in the request body
    }
    
    // Verify that the contact to update belongs to the current user
    const contactToUpdate = dbAPI.findContactById(id);
    const currentUser = dbAPI.getcurrentUser();
    if (!contactToUpdate || contactToUpdate.currentUser !== currentUser) {
      console.warn("[contactsServer] Access denied or contact not found for update with id:", id);
      return { status: 403, response: { error: "Access denied or contact not found" } };
    }
    
    const updated = dbAPI.updateContact(id, body);
    if (updated) {
      console.log("[contactsServer] Contact updated:", updated);
      return { status: 200, response: { message: "Contact updated", contact: updated } };
    } else {
      console.warn("[contactsServer] Contact not found for update with id:", id);
      return { status: 404, response: { error: "Contact not found" } };
    }
  };  

  // Delete a contact if it belongs to the current user
  const deleteContact = (id) => {
    console.log("[contactsServer] deleteContact called with id:", id);
    const contact = dbAPI.findContactById(id);
    const currentUser = dbAPI.getcurrentUser();
    if (!contact) {
      console.warn("[contactsServer] Contact not found for deletion with id:", id);
      return { status: 404, response: { error: "Contact not found" } };
    }
    if (contact.currentUser !== currentUser) {
      console.warn("[contactsServer] Access denied: Contact does not belong to current user.");
      return { status: 403, response: { error: "Access denied" } };
    }
    const deleted = dbAPI.deleteContact(id);
    if (deleted) {
      console.log("[contactsServer] Contact deleted:", deleted);
      return { status: 200, response: { message: "Contact deleted", contact: deleted } };
    } else {
      console.warn("[contactsServer] Contact not found for deletion with id:", id);
      return { status: 404, response: { error: "Contact not found" } };
    }
  };

  // Main handler: route requests based on method and URL
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
})(); // Invoke the IIFE (Immediately Invoked Function Expression)