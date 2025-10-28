import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { activityService, companyService, contactService, dealService, salesOrderService } from "@/services/api/dataService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Label from "@/components/atoms/Label";
import FormField from "@/components/molecules/FormField";

const QuickAddModal = ({ isOpen, onClose, activeTab: initialActiveTab = "contact", onSuccess, editData = null, editMode = false, companies = [], contacts = [], deals = [] }) => {
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

  // Sync dealForm with editData when it changes
  useEffect(() => {
    if (editMode && editData) {
      setDealForm({
        contactId: editData?.contact_id_c?.Id || editData?.contact_id_c || "",
        title: editData?.title_c || "",
        value: editData?.value_c || "",
        probability: editData?.probability_c || "50",
        stage: editData?.stage_c || "Lead",
        notes: editData?.notes_c || ""
      });
    } else if (!editMode) {
      // Reset to default values when switching to create mode
      setDealForm({
        contactId: "",
        title: "",
        value: "",
        probability: "50",
        stage: "Lead",
        notes: ""
      });
    }
  }, [editData, editMode]);

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
const [salesOrderForm, setSalesOrderForm] = useState({
    order_number_c: "",
    customer_name_c: "",
    order_date_c: "",
    total_amount_c: "",
    status_c: "Pending",
    notes_c: "",
    delivery_date_c: ""
  });
  const [quoteForm, setQuoteForm] = useState({
    company_id_c: "",
    contact_id_c: "",
    deal_id_c: "",
    quote_date_c: new Date().toISOString().split('T')[0],
    status_c: "Draft",
    delivery_method_c: "",
    expires_on_c: "",
    bill_to_name_c: "",
    bill_to_street_c: "",
    bill_to_city_c: "",
    bill_to_state_c: "",
    bill_to_country_c: "",
    bill_to_pincode_c: "",
    ship_to_name_c: "",
    ship_to_street_c: "",
    ship_to_city_c: "",
    ship_to_state_c: "",
    ship_to_country_c: "",
    ship_to_pincode_c: ""
  });

const resetForms = () => {
    setSalesOrderForm({
      order_number_c: "",
      customer_name_c: "",
      order_date_c: "",
      total_amount_c: "",
      status_c: "Pending",
      notes_c: "",
      delivery_date_c: ""
    });
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
    setQuoteForm({
      company_id_c: "",
      contact_id_c: "",
      deal_id_c: "",
      quote_date_c: new Date().toISOString().split('T')[0],
      status_c: "Draft",
      delivery_method_c: "",
      expires_on_c: "",
      bill_to_name_c: "",
      bill_to_street_c: "",
      bill_to_city_c: "",
      bill_to_state_c: "",
      bill_to_country_c: "",
      bill_to_pincode_c: "",
      ship_to_name_c: "",
      ship_to_street_c: "",
      ship_to_city_c: "",
      ship_to_state_c: "",
      ship_to_country_c: "",
      ship_to_pincode_c: ""
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
} else if (activeTab === "quote") {
        const { quoteService } = await import('@/services/api/dataService');
        await quoteService.create(quoteForm);
        toast.success("Quote created successfully!");
      } else if (activeTab === "salesOrder") {
        await salesOrderService.create(salesOrderForm);
        toast.success("Sales order created successfully!");
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
    { id: "company", label: "Company", icon: "Building2" },
    { id: "quote", label: "Quote", icon: "FileText" },
    { id: "salesOrder", label: "Sales Order", icon: "FileText" }
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

                    {/* Quote Form */}
                    {activeTab === "quote" && (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-slate-700">Basic Information</h4>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                              Company *
                            </label>
                            <select
                              value={quoteForm.company_id_c}
                              onChange={(e) => setQuoteForm(prev => ({
                                ...prev,
                                company_id_c: e.target.value
                              }))}
                              required
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                              <option value="">Select Company</option>
                              {companies.map(company => (
                                <option key={company.Id} value={company.Id}>
                                  {company.name_c}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                              Contact *
                            </label>
                            <select
                              value={quoteForm.contact_id_c}
                              onChange={(e) => setQuoteForm(prev => ({
                                ...prev,
                                contact_id_c: e.target.value
                              }))}
                              required
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                              <option value="">Select Contact</option>
                              {contacts.map(contact => (
                                <option key={contact.Id} value={contact.Id}>
                                  {contact.first_name_c} {contact.last_name_c}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                              Deal
                            </label>
                            <select
                              value={quoteForm.deal_id_c}
                              onChange={(e) => setQuoteForm(prev => ({
                                ...prev,
                                deal_id_c: e.target.value
                              }))}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                              <option value="">Select Deal</option>
                              {deals.map(deal => (
                                <option key={deal.Id} value={deal.Id}>
                                  {deal.title_c}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              label="Quote Date"
                              type="date"
                              value={quoteForm.quote_date_c}
                              onChange={(e) => setQuoteForm(prev => ({
                                ...prev,
                                quote_date_c: e.target.value
                              }))}
                              required
                            />
                            <FormField
                              label="Expires On"
                              type="date"
                              value={quoteForm.expires_on_c}
                              onChange={(e) => setQuoteForm(prev => ({
                                ...prev,
                                expires_on_c: e.target.value
                              }))}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Status
                              </label>
                              <select
                                value={quoteForm.status_c}
                                onChange={(e) => setQuoteForm(prev => ({
                                  ...prev,
                                  status_c: e.target.value
                                }))}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              >
                                <option value="Draft">Draft</option>
                                <option value="Sent">Sent</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </div>
                            <FormField
                              label="Delivery Method"
                              value={quoteForm.delivery_method_c}
                              onChange={(e) => setQuoteForm(prev => ({
                                ...prev,
                                delivery_method_c: e.target.value
                              }))}
                              placeholder="e.g., Email, Postal"
                            />
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                          <h4 className="text-sm font-medium text-slate-700">Billing Address</h4>
                          <FormField
                            label="Bill To Name"
                            value={quoteForm.bill_to_name_c}
                            onChange={(e) => setQuoteForm(prev => ({
                              ...prev,
                              bill_to_name_c: e.target.value
                            }))}
                          />
                          <FormField
                            label="Street"
                            value={quoteForm.bill_to_street_c}
                            onChange={(e) => setQuoteForm(prev => ({
                              ...prev,
                              bill_to_street_c: e.target.value
                            }))}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              label="City"
                              value={quoteForm.bill_to_city_c}
                              onChange={(e) => setQuoteForm(prev => ({
                                ...prev,
                                bill_to_city_c: e.target.value
                              }))}
                            />
                            <FormField
                              label="State"
                              value={quoteForm.bill_to_state_c}
                              onChange={(e) => setQuoteForm(prev => ({
                                ...prev,
                                bill_to_state_c: e.target.value
                              }))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              label="Country"
                              value={quoteForm.bill_to_country_c}
                              onChange={(e) => setQuoteForm(prev => ({
                                ...prev,
                                bill_to_country_c: e.target.value
                              }))}
                            />
                            <FormField
                              label="Pincode"
                              value={quoteForm.bill_to_pincode_c}
                              onChange={(e) => setQuoteForm(prev => ({
                                ...prev,
                                bill_to_pincode_c: e.target.value
                              }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t">
                          <h4 className="text-sm font-medium text-slate-700">Shipping Address</h4>
                          <FormField
                            label="Ship To Name"
                            value={quoteForm.ship_to_name_c}
                            onChange={(e) => setQuoteForm(prev => ({
                              ...prev,
                              ship_to_name_c: e.target.value
                            }))}
                          />
                          <FormField
                            label="Street"
                            value={quoteForm.ship_to_street_c}
                            onChange={(e) => setQuoteForm(prev => ({
                              ...prev,
                              ship_to_street_c: e.target.value
                            }))}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              label="City"
                              value={quoteForm.ship_to_city_c}
                              onChange={(e) => setQuoteForm(prev => ({
                                ...prev,
                                ship_to_city_c: e.target.value
                              }))}
                            />
                            <FormField
                              label="State"
                              value={quoteForm.ship_to_state_c}
                              onChange={(e) => setQuoteForm(prev => ({
                                ...prev,
                                ship_to_state_c: e.target.value
                              }))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              label="Country"
                              value={quoteForm.ship_to_country_c}
                              onChange={(e) => setQuoteForm(prev => ({
                                ...prev,
                                ship_to_country_c: e.target.value
                              }))}
                            />
                            <FormField
                              label="Pincode"
                              value={quoteForm.ship_to_pincode_c}
                              onChange={(e) => setQuoteForm(prev => ({
                                ...prev,
                                ship_to_pincode_c: e.target.value
                              }))}
                            />
                          </div>
                        </div>
                      </div>
                    )}
{/* Sales Order Form */}
          {activeTab === "salesOrder" && (
            <div className="space-y-4">
              <FormField
                label="Order Number"
                required
                value={salesOrderForm.order_number_c}
                onChange={(e) =>
                  setSalesOrderForm({ ...salesOrderForm, order_number_c: e.target.value })
                }
                placeholder="Enter order number"
              />

              <FormField
                label="Customer Name"
                required
                value={salesOrderForm.customer_name_c}
                onChange={(e) =>
                  setSalesOrderForm({ ...salesOrderForm, customer_name_c: e.target.value })
                }
                placeholder="Enter customer name"
              />

              <FormField
                label="Order Date"
                type="date"
                required
                value={salesOrderForm.order_date_c}
                onChange={(e) =>
                  setSalesOrderForm({ ...salesOrderForm, order_date_c: e.target.value })
                }
              />

              <FormField
                label="Total Amount"
                type="number"
                required
                value={salesOrderForm.total_amount_c}
                onChange={(e) =>
                  setSalesOrderForm({ ...salesOrderForm, total_amount_c: e.target.value })
                }
                placeholder="0.00"
              />

              <div>
                <Label>Status</Label>
                <select
                  value={salesOrderForm.status_c}
                  onChange={(e) =>
                    setSalesOrderForm({ ...salesOrderForm, status_c: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <FormField
                label="Delivery Date"
                type="date"
                value={salesOrderForm.delivery_date_c}
                onChange={(e) =>
                  setSalesOrderForm({ ...salesOrderForm, delivery_date_c: e.target.value })
                }
              />

              <FormField
                label="Notes"
                value={salesOrderForm.notes_c}
                onChange={(e) =>
                  setSalesOrderForm({ ...salesOrderForm, notes_c: e.target.value })
                }
                placeholder="Add any notes..."
                rows={3}
              />
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