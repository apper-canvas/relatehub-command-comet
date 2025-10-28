import contactsData from "@/services/mockData/contacts.json";
import dealsData from "@/services/mockData/deals.json";
import activitiesData from "@/services/mockData/activities.json";
import companiesData from "@/services/mockData/companies.json";

// Simulate API delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Contact Service
export const contactService = {
  getAll: async () => {
    await delay();
    return [...contactsData];
  },

  getById: async (id) => {
    await delay(200);
    const contact = contactsData.find(item => item.Id === parseInt(id));
    if (!contact) throw new Error("Contact not found");
    return { ...contact };
  },

  create: async (contactData) => {
    await delay(400);
    const maxId = Math.max(...contactsData.map(item => item.Id), 0);
    const newContact = {
      ...contactData,
      Id: maxId + 1,
      tags: contactData.tags || [],
      createdAt: new Date().toISOString(),
      lastContactedAt: null
    };
    contactsData.push(newContact);
    return { ...newContact };
  },

  update: async (id, contactData) => {
    await delay(400);
    const index = contactsData.findIndex(item => item.Id === parseInt(id));
    if (index === -1) throw new Error("Contact not found");
    
    contactsData[index] = { ...contactsData[index], ...contactData };
    return { ...contactsData[index] };
  },

  delete: async (id) => {
    await delay(300);
    const index = contactsData.findIndex(item => item.Id === parseInt(id));
    if (index === -1) throw new Error("Contact not found");
    
    contactsData.splice(index, 1);
    return { success: true };
  },

  search: async (query) => {
    await delay(250);
    if (!query) return [...contactsData];
    
    const lowercaseQuery = query.toLowerCase();
    return contactsData.filter(contact => 
      contact.firstName.toLowerCase().includes(lowercaseQuery) ||
      contact.lastName.toLowerCase().includes(lowercaseQuery) ||
      contact.email.toLowerCase().includes(lowercaseQuery) ||
      contact.company?.toLowerCase().includes(lowercaseQuery) ||
      contact.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
};

// Company Service
let companies = [...companiesData];
let companyIdCounter = Math.max(...companies.map(c => c.Id)) + 1;

export const companyService = {
  getAll: async () => {
    await delay(300);
    return [...companies];
  },

  getById: async (id) => {
    await delay(200);
    const company = companies.find(c => c.Id === parseInt(id));
    if (!company) {
      throw new Error('Company not found');
    }
    return { ...company };
  },

  create: async (companyData) => {
    await delay(400);
    const newCompany = {
      ...companyData,
      Id: companyIdCounter++,
      LastContact: new Date().toISOString()
    };
    companies.push(newCompany);
    return { ...newCompany };
  },

  update: async (id, companyData) => {
    await delay(400);
    const index = companies.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Company not found');
    }
    companies[index] = {
      ...companies[index],
      ...companyData,
      Id: parseInt(id)
    };
    return { ...companies[index] };
  },

  delete: async (id) => {
    await delay(300);
    const index = companies.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Company not found');
    }
    companies.splice(index, 1);
    return { success: true };
  }
};

// Deal Service  
export const dealService = {
  getAll: async () => {
    await delay();
    return [...dealsData];
  },

  getById: async (id) => {
    await delay(200);
    const deal = dealsData.find(item => item.Id === parseInt(id));
    if (!deal) throw new Error("Deal not found");
    return { ...deal };
  },

  getByContactId: async (contactId) => {
    await delay(200);
    return dealsData.filter(deal => deal.contactId === parseInt(contactId));
  },

  create: async (dealData) => {
    await delay(400);
    const maxId = Math.max(...dealsData.map(item => item.Id), 0);
    const newDeal = {
      ...dealData,
      Id: maxId + 1,
      createdAt: new Date().toISOString(),
      stageChangedAt: new Date().toISOString()
    };
    dealsData.push(newDeal);
    return { ...newDeal };
  },

  update: async (id, dealData) => {
    await delay(400);
    const index = dealsData.findIndex(item => item.Id === parseInt(id));
    if (index === -1) throw new Error("Deal not found");
    
    const oldStage = dealsData[index].stage;
    const updatedDeal = { ...dealsData[index], ...dealData };
    
    // Update stage change timestamp if stage changed
    if (dealData.stage && dealData.stage !== oldStage) {
      updatedDeal.stageChangedAt = new Date().toISOString();
    }
    
    dealsData[index] = updatedDeal;
    return { ...updatedDeal };
  },

  delete: async (id) => {
    await delay(300);
    const index = dealsData.findIndex(item => item.Id === parseInt(id));
    if (index === -1) throw new Error("Deal not found");
    
    dealsData.splice(index, 1);
    return { success: true };
  }
};

// Activity Service
export const activityService = {
  getAll: async () => {
    await delay();
    return [...activitiesData];
  },

  getById: async (id) => {
    await delay(200);
    const activity = activitiesData.find(item => item.Id === parseInt(id));
    if (!activity) throw new Error("Activity not found");
    return { ...activity };
  },

  getByContactId: async (contactId) => {
    await delay(200);
    return activitiesData
      .filter(activity => activity.contactId === parseInt(contactId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  create: async (activityData) => {
    await delay(400);
    const maxId = Math.max(...activitiesData.map(item => item.Id), 0);
    const newActivity = {
      ...activityData,
      Id: maxId + 1,
      timestamp: new Date().toISOString()
    };
    activitiesData.push(newActivity);
    return { ...newActivity };
  },

  update: async (id, activityData) => {
    await delay(400);
    const index = activitiesData.findIndex(item => item.Id === parseInt(id));
    if (index === -1) throw new Error("Activity not found");
    
    activitiesData[index] = { ...activitiesData[index], ...activityData };
    return { ...activitiesData[index] };
  },

  delete: async (id) => {
    await delay(300);
    const index = activitiesData.findIndex(item => item.Id === parseInt(id));
    if (index === -1) throw new Error("Activity not found");
    
    activitiesData.splice(index, 1);
    return { success: true };
  }
};