import React, { useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { activityService, companyService, contactService, dealService } from "@/services/api/dataService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";

const QuickAddModal = ({ isOpen, onClose, activeTab: initialActiveTab = "contact", onSuccess, editData = null, editMode = false }) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    title: ""
  });

  const [dealForm, setDealForm] = useState({
    contactId: editData?.contact_id_c?.Id || editData?.contact_id_c || "",
    title: editData?.title_c || "",
    value: editData?.value_c || "",
    probability: editData?.probability_c || "50",
    stage: editData?.stage_c || "Lead",
    notes: editData?.notes_c || ""
  });

  const [activityForm, setActivityForm] = useState({
    contactId: "",
    type: "call",
    subject: "",
    description: ""
});

const [companyForm, setCompanyForm] = useState({
    name_c: "",
    industry_c: "",
    website_c: "",
    size_c: "",
    revenue_c: "",
    status_c: "Active"
  });

const resetForms = () => {
    setContactForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      title: ""
    });
    setDealForm({
      contactId: "",
      title: "",
      value: "",
      probability: "50", 
      stage: "Lead",
      notes: ""
    });
    setActivityForm({
      contactId: "",
      type: "call",
      subject: "",
      description: ""
    });
  };

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanyForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === "contact") {
        await contactService.create(contactForm);
        toast.success("Contact created successfully!");
      } else if (activeTab === "deal") {
        if (editMode && editData) {
          await dealService.update(editData.Id, {
            ...dealForm,
            value_c: parseFloat(dealForm.value) || 0,
            probability_c: parseInt(dealForm.probability)
          });
          toast.success("Deal updated successfully!");
        } else {
          await dealService.create({
            ...dealForm,
            value_c: parseFloat(dealForm.value) || 0,
            probability_c: parseInt(dealForm.probability)
          });
          toast.success("Deal created successfully!");
        }
      } else if (activeTab === "activity") {
        await activityService.create(activityForm);
        toast.success("Activity logged successfully!");
      } else if (activeTab === "company") {
        await companyService.create(companyForm);
        toast.success("Company created successfully!");
      }
      
      // Call onSuccess before closing to refresh parent component data
      if (onSuccess) await onSuccess();
      
      resetForms();
      onClose();
    } catch (error) {
      toast.error(editMode && activeTab === "deal" ? "Failed to update deal. Please try again." : "Failed to create item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "contact", label: "Contact", icon: "User" },
    { id: "deal", label: "Deal", icon: "DollarSign" },
{ id: "activity", label: "Activity", icon: "Calendar" },
    { id: "company", label: "Company", icon: "Building2" }
  ];

if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-500 bg-opacity-75 transition-opacity"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
{/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full pointer-events-auto"
              >
                <div className="px-6 py-5">
{/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {editMode && activeTab === "deal" ? "Edit Deal" : "Quick Add"}
                    </h3>
                    <button
                      onClick={onClose}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <ApperIcon name="X" className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex space-x-1 mb-6 bg-slate-100 p-1 rounded-lg">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? "bg-white text-primary shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <ApperIcon name={tab.icon} className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Forms */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === "contact" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            label="First Name"
                            required
                            value={contactForm.firstName}
                            onChange={(e) => setContactForm(prev => ({
                              ...prev,
                              firstName: e.target.value
                            }))}
                          />
                          <FormField
                            label="Last Name"
                            required
                            value={contactForm.lastName}
                            onChange={(e) => setContactForm(prev => ({
                              ...prev,
                              lastName: e.target.value
                            }))}
                          />
                        </div>
                        <FormField
                          label="Email"
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm(prev => ({
                            ...prev,
                            email: e.target.value
                          }))}
                        />
                        <FormField
                          label="Phone"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm(prev => ({
                            ...prev,
                            phone: e.target.value
                          }))}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            label="Company"
                            value={contactForm.company}
                            onChange={(e) => setContactForm(prev => ({
                              ...prev,
                              company: e.target.value
                            }))}
                          />
                          <FormField
                            label="Title"
                            value={contactForm.title}
                            onChange={(e) => setContactForm(prev => ({
                              ...prev,
                              title: e.target.value
                            }))}
                          />
                        </div>
                      </>
                    )}

                    {activeTab === "deal" && (
                      <>
                        <FormField
                          label="Deal Title"
                          required
                          value={dealForm.title}
                          onChange={(e) => setDealForm(prev => ({
                            ...prev,
                            title: e.target.value
                          }))}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            label="Value ($)"
                            type="number"
                            required
                            value={dealForm.value}
                            onChange={(e) => setDealForm(prev => ({
                              ...prev,
                              value: e.target.value
                            }))}
                          />
                          <FormField
                            label="Probability (%)"
                            type="number"
                            min="0"
                            max="100"
                            value={dealForm.probability}
                            onChange={(e) => setDealForm(prev => ({
                              ...prev,
                              probability: e.target.value
                            }))}
                          />
                        </div>
                        <FormField label="Stage">
                          <select
                            value={dealForm.stage}
                            onChange={(e) => setDealForm(prev => ({
                              ...prev,
                              stage: e.target.value
                            }))}
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                          >
                            <option value="Lead">Lead</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Proposal">Proposal</option>
                            <option value="Negotiation">Negotiation</option>
                            <option value="Closed Won">Closed Won</option>
                            <option value="Closed Lost">Closed Lost</option>
                          </select>
</FormField>
                        <FormField label="Notes">
                          <textarea
                            rows={3}
                            value={dealForm.notes}
                            onChange={(e) => setDealForm(prev => ({
                              ...prev,
                              notes: e.target.value
                            }))}
                            placeholder="Add any additional notes about this deal..."
                            className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                          />
                        </FormField>
                      </>
                    )}

                    {activeTab === "activity" && (
                      <>
                        <FormField
                          label="Subject"
                          required
                          value={activityForm.subject}
                          onChange={(e) => setActivityForm(prev => ({
                            ...prev,
                            subject: e.target.value
                          }))}
                        />
                        <FormField label="Type">
                          <select
                            value={activityForm.type}
                            onChange={(e) => setActivityForm(prev => ({
                              ...prev,
                              type: e.target.value
                            }))}
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                          >
                            <option value="call">Call</option>
                            <option value="email">Email</option>
                            <option value="meeting">Meeting</option>
                            <option value="note">Note</option>
                            <option value="task">Task</option>
                          </select>
                        </FormField>
                        <FormField label="Description">
                          <textarea
                            rows={3}
                            value={activityForm.description}
                            onChange={(e) => setActivityForm(prev => ({
                              ...prev,
                              description: e.target.value
                            }))}
                            className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                          />
                        </FormField>
                      </>
)}

{/* Company Form */}
                    {activeTab === "company" && (
                      <div className="space-y-4">
                        <FormField
                          label="Company Name"
                          name="name_c"
                          value={companyForm.name_c}
                          onChange={handleCompanyChange}
                          placeholder="Enter company name"
                          required
                        />

                        <FormField
                          label="Industry"
                          name="industry_c"
                          value={companyForm.industry_c}
                          onChange={handleCompanyChange}
                          placeholder="e.g., Technology, Healthcare"
                        />

                        <FormField
                          label="Website"
                          name="website_c"
                          type="url"
                          value={companyForm.website_c}
                          onChange={handleCompanyChange}
                          placeholder="https://example.com"
                        />

                        <FormField
                          label="Company Size"
                          name="size_c"
                          value={companyForm.size_c}
                          onChange={handleCompanyChange}
                          placeholder="e.g., 50-200 employees"
                        />

                        <FormField
                          label="Annual Revenue"
                          name="revenue_c"
                          value={companyForm.revenue_c}
                          onChange={handleCompanyChange}
                          placeholder="e.g., $10M-$50M"
                        />

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Status
                          </label>
                          <select
                            name="status_c"
                            value={companyForm.status_c}
                            onChange={handleCompanyChange}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
</select>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                      >
                        Cancel
                      </Button>
<Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2"
                      >
                        {isSubmitting && (
                          <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                        )}
                        {editMode && activeTab === "deal" ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default QuickAddModal;