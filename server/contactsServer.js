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
    const { fullname, phone, email, curent } = body;
    
    if (!fullname || !phone || !email) {
      console.warn("[contactsServer] Missing required fields");
      return { status: 400, response: { error: "Missing required fields" } };
    }
  
    // Vérifier si un contact avec le même numéro existe déjà
    const existingContact = dbAPI.findContactByPhone(phone);
    if (existingContact) {
      console.warn("[contactsServer] Contact already exists with phone:", phone);
      return { status: 409, response: { error: "A contact with this phone number already exists" } };
    }
  
    const newContact = dbAPI.addContact(body);
    console.log("[contactsServer] Contact added:", newContact);
    return { status: 201, response: { message: "Contact added", contact: newContact } };
  };


  const updateContact = (id, body) => {
    console.log("[contactsServer] updateContact called with id:", id, "and body:", body);
  
    // Si l'ID n'est pas fourni, essayer de retrouver le contact via son téléphone
    if (!id && body.phone) {
      console.log("[contactsServer] No ID provided, searching by phone:", body.phone);
      const existingContact = dbAPI.findContactByPhone(body.phone);
  
      if (existingContact) {
        id = existingContact.id; // Récupération de l'ID
        console.log("[contactsServer] Found contact ID:", id);
      } else {
        console.warn("[contactsServer] No contact found with phone:", body.phone);
        return { status: 404, response: { error: "Contact non trouvé avec ce numéro" } };
      }
    }
  
    // Vérifier si l'ID est valide après la recherche
    if (!id) {
      console.warn("[contactsServer] Aucun ID valide pour la mise à jour");
      return { status: 400, response: { error: "ID du contact manquant" } };
    }
  
    // Vérifier si un autre contact utilise déjà ce numéro
    if (body.phone) {
      const existingContact = dbAPI.findContactByPhone(body.phone);
      if (existingContact && existingContact.id !== id) {
        console.warn("[contactsServer] Ce numéro est déjà utilisé par un autre contact:", body.phone);
        return { status: 409, response: { error: "Ce numéro est déjà utilisé par un autre contact" } };
      }
    }
  
    // Mise à jour du contact dans la base de données
    const updated = dbAPI.updateContact(id, body);
  
    if (updated) {
      console.log("[contactsServer] Contact mis à jour:", updated);
      return { status: 200, response: { message: "Contact mis à jour", contact: updated } };
    } else {
      console.warn("[contactsServer] Contact non trouvé pour mise à jour avec id:", id);
      return { status: 404, response: { error: "Contact non trouvé" } };
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