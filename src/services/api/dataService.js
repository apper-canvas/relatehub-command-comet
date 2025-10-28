import { toast } from "react-toastify";
import React from "react";
import { getApperClient } from "@/services/apperClient";

// Contact Service
export const contactService = {
  getAll: async () => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('contact_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "last_contacted_at_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching contacts:", error?.response?.data?.message || error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('contact_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "last_contacted_at_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching contact ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  create: async (contactData) => {
    try {
      const apperClient = getApperClient();
      const payload = {
        records: [{
          first_name_c: contactData.firstName || contactData.first_name_c,
          last_name_c: contactData.lastName || contactData.last_name_c,
          email_c: contactData.email || contactData.email_c,
          phone_c: contactData.phone || contactData.phone_c,
          company_c: contactData.company || contactData.company_c,
          title_c: contactData.title || contactData.title_c,
          tags_c: contactData.tags || contactData.tags_c || "",
          notes_c: contactData.notes || contactData.notes_c || "",
          created_at_c: new Date().toISOString(),
          last_contacted_at_c: null
        }]
      };

      const response = await apperClient.createRecord('contact_c', payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} contacts:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error creating contact:", error?.response?.data?.message || error);
      return null;
    }
  },

  update: async (id, contactData) => {
    try {
      const apperClient = getApperClient();
      const payload = {
        records: [{
          Id: parseInt(id),
          ...(contactData.firstName || contactData.first_name_c ? { first_name_c: contactData.firstName || contactData.first_name_c } : {}),
          ...(contactData.lastName || contactData.last_name_c ? { last_name_c: contactData.lastName || contactData.last_name_c } : {}),
          ...(contactData.email || contactData.email_c ? { email_c: contactData.email || contactData.email_c } : {}),
          ...(contactData.phone || contactData.phone_c ? { phone_c: contactData.phone || contactData.phone_c } : {}),
          ...(contactData.company || contactData.company_c ? { company_c: contactData.company || contactData.company_c } : {}),
          ...(contactData.title || contactData.title_c ? { title_c: contactData.title || contactData.title_c } : {}),
          ...(contactData.tags || contactData.tags_c ? { tags_c: contactData.tags || contactData.tags_c } : {}),
          ...(contactData.notes || contactData.notes_c ? { notes_c: contactData.notes || contactData.notes_c } : {}),
          ...(contactData.lastContactedAt || contactData.last_contacted_at_c ? { last_contacted_at_c: contactData.lastContactedAt || contactData.last_contacted_at_c } : {})
        }]
      };

      const response = await apperClient.updateRecord('contact_c', payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} contacts:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error updating contact:", error?.response?.data?.message || error);
      return null;
    }
  },

  delete: async (id) => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('contact_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return { success: false };
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} contacts:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return { success: false };
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting contact:", error?.response?.data?.message || error);
      return { success: false };
    }
  },

  search: async (query) => {
    try {
      if (!query) {
        return await contactService.getAll();
      }

      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('contact_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "company_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "notes_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "last_contacted_at_c"}}
        ],
        whereGroups: [{
          operator: "OR",
          subGroups: [
            {
              conditions: [
                { fieldName: "first_name_c", operator: "Contains", values: [query] },
                { fieldName: "last_name_c", operator: "Contains", values: [query] },
                { fieldName: "email_c", operator: "Contains", values: [query] },
                { fieldName: "company_c", operator: "Contains", values: [query] },
                { fieldName: "tags_c", operator: "Contains", values: [query] }
              ],
              operator: "OR"
            }
          ]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error searching contacts:", error);
      return [];
    }
  }
};

// Company Service
export const companyService = {
  getAll: async () => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('company_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "industry_c"}},
          {"field": {"Name": "website_c"}},
          {"field": {"Name": "size_c"}},
          {"field": {"Name": "revenue_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "last_contact_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching companies:", error?.response?.data?.message || error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('company_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "industry_c"}},
          {"field": {"Name": "website_c"}},
          {"field": {"Name": "size_c"}},
          {"field": {"Name": "revenue_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "last_contact_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  create: async (companyData) => {
    try {
      const apperClient = getApperClient();
      const payload = {
        records: [{
          name_c: companyData.Name || companyData.name_c,
          industry_c: companyData.Industry || companyData.industry_c || "",
          website_c: companyData.Website || companyData.website_c || "",
          size_c: companyData.Size || companyData.size_c || "",
          revenue_c: companyData.Revenue || companyData.revenue_c || "",
          status_c: companyData.Status || companyData.status_c || "Active",
          last_contact_c: new Date().toISOString(),
          notes_c: companyData.Notes || companyData.notes_c || ""
        }]
      };

      const response = await apperClient.createRecord('company_c', payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} companies:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error creating company:", error?.response?.data?.message || error);
      return null;
    }
  },

  update: async (id, companyData) => {
    try {
      const apperClient = getApperClient();
      const payload = {
        records: [{
          Id: parseInt(id),
          ...(companyData.Name || companyData.name_c ? { name_c: companyData.Name || companyData.name_c } : {}),
          ...(companyData.Industry || companyData.industry_c ? { industry_c: companyData.Industry || companyData.industry_c } : {}),
          ...(companyData.Website || companyData.website_c ? { website_c: companyData.Website || companyData.website_c } : {}),
          ...(companyData.Size || companyData.size_c ? { size_c: companyData.Size || companyData.size_c } : {}),
          ...(companyData.Revenue || companyData.revenue_c ? { revenue_c: companyData.Revenue || companyData.revenue_c } : {}),
          ...(companyData.Status || companyData.status_c ? { status_c: companyData.Status || companyData.status_c } : {}),
          ...(companyData.Notes || companyData.notes_c ? { notes_c: companyData.Notes || companyData.notes_c } : {})
        }]
      };

      const response = await apperClient.updateRecord('company_c', payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} companies:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error updating company:", error?.response?.data?.message || error);
      return null;
    }
  },

  delete: async (id) => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('company_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return { success: false };
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} companies:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return { success: false };
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting company:", error?.response?.data?.message || error);
      return { success: false };
    }
  }
};

// Deal Service
export const dealService = {
  getAll: async () => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('deal_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "contact_id_c"}, "referenceField": {"field": {"Name": "first_name_c"}}},
          {"field": {"Name": "contact_id_c"}, "referenceField": {"field": {"Name": "last_name_c"}}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "stage_changed_at_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching deals:", error?.response?.data?.message || error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('deal_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "stage_changed_at_c"}},
          {"field": {"Name": "notes_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching deal ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  getByContactId: async (contactId) => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('deal_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "value_c"}},
          {"field": {"Name": "probability_c"}},
          {"field": {"Name": "stage_c"}},
          {"field": {"Name": "expected_close_date_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "stage_changed_at_c"}},
          {"field": {"Name": "notes_c"}}
        ],
        where: [{
          FieldName: "contact_id_c",
          Operator: "EqualTo",
          Values: [parseInt(contactId)]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching deals by contact:", error);
      return [];
    }
  },

  create: async (dealData) => {
    try {
      const apperClient = getApperClient();
      const payload = {
        records: [{
          contact_id_c: parseInt(dealData.contactId || dealData.contact_id_c),
          title_c: dealData.title || dealData.title_c,
          value_c: parseFloat(dealData.value || dealData.value_c) || 0,
          probability_c: parseInt(dealData.probability || dealData.probability_c) || 50,
          stage_c: dealData.stage || dealData.stage_c || "Lead",
          expected_close_date_c: dealData.expectedCloseDate || dealData.expected_close_date_c || null,
          created_at_c: new Date().toISOString(),
          stage_changed_at_c: new Date().toISOString(),
          notes_c: dealData.notes || dealData.notes_c || ""
        }]
      };

      const response = await apperClient.createRecord('deal_c', payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} deals:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error creating deal:", error?.response?.data?.message || error);
      return null;
    }
  },

update: async (id, dealData) => {
    try {
      const apperClient = getApperClient();
      const updatePayload = {
        Id: parseInt(id)
      };

      // Track if stage is being updated for email generation
      const isStageUpdate = !!(dealData.stage || dealData.stage_c);
      let stageValue = null;

      if (dealData.contactId || dealData.contact_id_c) {
        updatePayload.contact_id_c = parseInt(dealData.contactId || dealData.contact_id_c);
      }
      if (dealData.title || dealData.title_c) {
        updatePayload.title_c = dealData.title || dealData.title_c;
      }
      if (dealData.value !== undefined || dealData.value_c !== undefined) {
        updatePayload.value_c = parseFloat(dealData.value || dealData.value_c);
      }
      if (dealData.probability !== undefined || dealData.probability_c !== undefined) {
        updatePayload.probability_c = parseInt(dealData.probability || dealData.probability_c);
      }
      if (dealData.stage || dealData.stage_c) {
        stageValue = dealData.stage || dealData.stage_c;
        updatePayload.stage_c = stageValue;
        updatePayload.stage_changed_at_c = new Date().toISOString();
      }
      if (dealData.expectedCloseDate || dealData.expected_close_date_c) {
        updatePayload.expected_close_date_c = dealData.expectedCloseDate || dealData.expected_close_date_c;
      }
      if (dealData.notes || dealData.notes_c) {
        updatePayload.notes_c = dealData.notes || dealData.notes_c;
      }

      // If stage is being updated, generate email template
      if (isStageUpdate && stageValue) {
        try {
          toast.info('Generating email template...');
          
          // Prepare data for email generation
          const emailRequestBody = {
            dealTitle: dealData.title_c || dealData.title || 'Untitled Deal',
            stage: stageValue,
            dealValue: dealData.value_c || dealData.value,
            contactName: dealData.contactName || null
          };

          // Invoke Edge Function to generate email
          const emailResponse = await apperClient.functions.invoke(
            import.meta.env.VITE_GENERATE_DEAL_EMAIL,
            {
              body: JSON.stringify(emailRequestBody),
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          // Check if email generation was successful
          if (emailResponse && emailResponse.success && emailResponse.emailTemplate) {
            // Add generated email to notes field
            updatePayload.notes_c = emailResponse.emailTemplate;
            toast.success('Email template generated successfully');
          } else {
            // Log error but continue with deal update
            console.info(`apper_info: Got an error in this function: ${import.meta.env.VITE_GENERATE_DEAL_EMAIL}. The response body is: ${JSON.stringify(emailResponse)}.`);
            toast.warning('Deal updated, but email generation failed');
          }
        } catch (emailError) {
          // Log error but continue with deal update
          console.info(`apper_info: Got this error in this function: ${import.meta.env.VITE_GENERATE_DEAL_EMAIL}. The error is: ${emailError.message}`);
          toast.warning('Deal updated, but email generation encountered an error');
        }
      }
      const payload = { records: [updatePayload] };

      const response = await apperClient.updateRecord('deal_c', payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} deals:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error updating deal:", error?.response?.data?.message || error);
      return null;
    }
  },

  delete: async (id) => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('deal_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return { success: false };
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} deals:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return { success: false };
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting deal:", error?.response?.data?.message || error);
      return { success: false };
    }
  }
};

// Activity Service
export const activityService = {
  getAll: async () => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('activity_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "duration_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching activities:", error?.response?.data?.message || error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('activity_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "duration_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  getByContactId: async (contactId) => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('activity_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "duration_c"}}
        ],
        where: [{
          FieldName: "contact_id_c",
          Operator: "EqualTo",
          Values: [parseInt(contactId)]
        }],
        orderBy: [{
          fieldName: "timestamp_c",
          sorttype: "DESC"
        }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching activities by contact:", error);
      return [];
    }
  },

  create: async (activityData) => {
    try {
      const apperClient = getApperClient();
      const payload = {
        records: [{
          contact_id_c: parseInt(activityData.contactId || activityData.contact_id_c),
          type_c: activityData.type || activityData.type_c || "note",
          subject_c: activityData.subject || activityData.subject_c,
          description_c: activityData.description || activityData.description_c || "",
          timestamp_c: new Date().toISOString(),
          duration_c: activityData.duration || activityData.duration_c || null
        }]
      };

      const response = await apperClient.createRecord('activity_c', payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} activities:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error creating activity:", error?.response?.data?.message || error);
      return null;
    }
  },

  update: async (id, activityData) => {
    try {
      const apperClient = getApperClient();
      const payload = {
        records: [{
          Id: parseInt(id),
          ...(activityData.contactId || activityData.contact_id_c ? { contact_id_c: parseInt(activityData.contactId || activityData.contact_id_c) } : {}),
          ...(activityData.type || activityData.type_c ? { type_c: activityData.type || activityData.type_c } : {}),
          ...(activityData.subject || activityData.subject_c ? { subject_c: activityData.subject || activityData.subject_c } : {}),
          ...(activityData.description || activityData.description_c ? { description_c: activityData.description || activityData.description_c } : {}),
          ...(activityData.duration !== undefined || activityData.duration_c !== undefined ? { duration_c: activityData.duration || activityData.duration_c } : {})
        }]
      };

      const response = await apperClient.updateRecord('activity_c', payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} activities:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error updating activity:", error?.response?.data?.message || error);
      return null;
    }
  },

  delete: async (id) => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('activity_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return { success: false };
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} activities:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return { success: false };
        }
      }

      return { success: true };
    } catch (error) {
console.error("Error deleting activity:", error?.response?.data?.message || error);
      return { success: false };
    }
  }
};

// Quote Service
export const quoteService = {
  getAll: async () => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('quote_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "company_id_c"}, "referenceField": {"field": {"Name": "Name"}}},
          {"field": {"Name": "contact_id_c"}, "referenceField": {"field": {"Name": "Name"}}},
          {"field": {"Name": "deal_id_c"}, "referenceField": {"field": {"Name": "Name"}}},
          {"field": {"Name": "quote_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "delivery_method_c"}},
          {"field": {"Name": "expires_on_c"}},
          {"field": {"Name": "bill_to_name_c"}},
          {"field": {"Name": "bill_to_street_c"}},
          {"field": {"Name": "bill_to_city_c"}},
          {"field": {"Name": "bill_to_state_c"}},
          {"field": {"Name": "bill_to_country_c"}},
          {"field": {"Name": "bill_to_pincode_c"}},
          {"field": {"Name": "ship_to_name_c"}},
          {"field": {"Name": "ship_to_street_c"}},
          {"field": {"Name": "ship_to_city_c"}},
          {"field": {"Name": "ship_to_state_c"}},
          {"field": {"Name": "ship_to_country_c"}},
          {"field": {"Name": "ship_to_pincode_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching quotes:", error?.response?.data?.message || error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('quote_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "company_id_c"}},
          {"field": {"Name": "contact_id_c"}},
          {"field": {"Name": "deal_id_c"}},
          {"field": {"Name": "quote_date_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "delivery_method_c"}},
          {"field": {"Name": "expires_on_c"}},
          {"field": {"Name": "bill_to_name_c"}},
          {"field": {"Name": "bill_to_street_c"}},
          {"field": {"Name": "bill_to_city_c"}},
          {"field": {"Name": "bill_to_state_c"}},
          {"field": {"Name": "bill_to_country_c"}},
          {"field": {"Name": "bill_to_pincode_c"}},
          {"field": {"Name": "ship_to_name_c"}},
          {"field": {"Name": "ship_to_street_c"}},
          {"field": {"Name": "ship_to_city_c"}},
          {"field": {"Name": "ship_to_state_c"}},
          {"field": {"Name": "ship_to_country_c"}},
          {"field": {"Name": "ship_to_pincode_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching quote ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  create: async (quoteData) => {
    try {
      const apperClient = getApperClient();
      const payload = {
        records: [{
          company_id_c: parseInt(quoteData.company_id_c?.Id || quoteData.company_id_c),
          contact_id_c: parseInt(quoteData.contact_id_c?.Id || quoteData.contact_id_c),
          deal_id_c: parseInt(quoteData.deal_id_c?.Id || quoteData.deal_id_c),
          quote_date_c: quoteData.quote_date_c || new Date().toISOString().split('T')[0],
          status_c: quoteData.status_c || "Draft",
          delivery_method_c: quoteData.delivery_method_c || "",
          expires_on_c: quoteData.expires_on_c || null,
          bill_to_name_c: quoteData.bill_to_name_c || "",
          bill_to_street_c: quoteData.bill_to_street_c || "",
          bill_to_city_c: quoteData.bill_to_city_c || "",
          bill_to_state_c: quoteData.bill_to_state_c || "",
          bill_to_country_c: quoteData.bill_to_country_c || "",
          bill_to_pincode_c: quoteData.bill_to_pincode_c || "",
          ship_to_name_c: quoteData.ship_to_name_c || "",
          ship_to_street_c: quoteData.ship_to_street_c || "",
          ship_to_city_c: quoteData.ship_to_city_c || "",
          ship_to_state_c: quoteData.ship_to_state_c || "",
          ship_to_country_c: quoteData.ship_to_country_c || "",
          ship_to_pincode_c: quoteData.ship_to_pincode_c || ""
        }]
      };

      const response = await apperClient.createRecord('quote_c', payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} quotes:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error creating quote:", error?.response?.data?.message || error);
      return null;
    }
  },

  update: async (id, quoteData) => {
    try {
      const apperClient = getApperClient();
      const payload = {
        records: [{
          Id: parseInt(id),
          ...(quoteData.company_id_c ? { company_id_c: parseInt(quoteData.company_id_c?.Id || quoteData.company_id_c) } : {}),
          ...(quoteData.contact_id_c ? { contact_id_c: parseInt(quoteData.contact_id_c?.Id || quoteData.contact_id_c) } : {}),
          ...(quoteData.deal_id_c ? { deal_id_c: parseInt(quoteData.deal_id_c?.Id || quoteData.deal_id_c) } : {}),
          ...(quoteData.quote_date_c ? { quote_date_c: quoteData.quote_date_c } : {}),
          ...(quoteData.status_c ? { status_c: quoteData.status_c } : {}),
          ...(quoteData.delivery_method_c ? { delivery_method_c: quoteData.delivery_method_c } : {}),
          ...(quoteData.expires_on_c ? { expires_on_c: quoteData.expires_on_c } : {}),
          ...(quoteData.bill_to_name_c ? { bill_to_name_c: quoteData.bill_to_name_c } : {}),
          ...(quoteData.bill_to_street_c ? { bill_to_street_c: quoteData.bill_to_street_c } : {}),
          ...(quoteData.bill_to_city_c ? { bill_to_city_c: quoteData.bill_to_city_c } : {}),
          ...(quoteData.bill_to_state_c ? { bill_to_state_c: quoteData.bill_to_state_c } : {}),
          ...(quoteData.bill_to_country_c ? { bill_to_country_c: quoteData.bill_to_country_c } : {}),
          ...(quoteData.bill_to_pincode_c ? { bill_to_pincode_c: quoteData.bill_to_pincode_c } : {}),
          ...(quoteData.ship_to_name_c ? { ship_to_name_c: quoteData.ship_to_name_c } : {}),
          ...(quoteData.ship_to_street_c ? { ship_to_street_c: quoteData.ship_to_street_c } : {}),
          ...(quoteData.ship_to_city_c ? { ship_to_city_c: quoteData.ship_to_city_c } : {}),
          ...(quoteData.ship_to_state_c ? { ship_to_state_c: quoteData.ship_to_state_c } : {}),
          ...(quoteData.ship_to_country_c ? { ship_to_country_c: quoteData.ship_to_country_c } : {}),
          ...(quoteData.ship_to_pincode_c ? { ship_to_pincode_c: quoteData.ship_to_pincode_c } : {})
        }]
      };

      const response = await apperClient.updateRecord('quote_c', payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} quotes:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error updating quote:", error?.response?.data?.message || error);
      return null;
    }
  },

  delete: async (id) => {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.deleteRecord('quote_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return { success: false };
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} quotes:`, JSON.stringify(failed));
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return { success: false };
        }
      }
return { success: true };
    } catch (error) {
      console.error("Error deleting quote:", error?.response?.data?.message || error);
      return { success: false };
    }
  }
};