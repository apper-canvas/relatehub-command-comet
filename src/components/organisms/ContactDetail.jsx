import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ActivityItem from "@/components/molecules/ActivityItem";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { activityService, dealService } from "@/services/api/dataService";
import { formatDistanceToNow } from "date-fns";

const ContactDetail = ({ isOpen, onClose, contact }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [activities, setActivities] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && contact) {
      loadActivities();
      loadDeals();
    }
  }, [isOpen, contact]);

  const loadActivities = async () => {
    if (!contact) return;
    
    setLoadingActivities(true);
    setError("");
    
    try {
      const data = await activityService.getByContactId(contact.Id);
      setActivities(data);
    } catch (err) {
      setError("Failed to load activities");
    } finally {
      setLoadingActivities(false);
    }
  };

  const loadDeals = async () => {
    if (!contact) return;
    
    setLoadingDeals(true);
    
    try {
      const data = await dealService.getByContactId(contact.Id);
      setDeals(data);
    } catch (err) {
      console.error("Failed to load deals:", err);
    } finally {
      setLoadingDeals(false);
    }
  };

  if (!isOpen || !contact) return null;

  const tabs = [
    { id: "info", label: "Information", icon: "User" },
    { id: "deals", label: "Deals", icon: "DollarSign", count: deals.length },
    { id: "activity", label: "Activity", icon: "Clock", count: activities.length }
  ];

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
          >
            <div className="bg-white">
              {/* Header */}
              <div className="border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <ApperIcon name="User" className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
{contact.first_name_c} {contact.last_name_c}
                      </h2>
                      <p className="text-slate-600">
                        {contact.title_c && contact.company_c 
                          ? `${contact.title_c} at ${contact.company_c}`
                          : contact.title_c || contact.company_c || contact.email_c
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <ApperIcon name="X" className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-slate-200">
                <nav className="flex px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <ApperIcon name={tab.icon} className="w-4 h-4" />
                      {tab.label}
                      {tab.count > 0 && (
                        <Badge variant="default" className="ml-1">
                          {tab.count}
                        </Badge>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
                {activeTab === "info" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 mb-3">Contact Information</h3>
                        <dl className="space-y-3">
                          <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</dt>
                            <dd className="text-sm text-slate-900 mt-1">
<a href={`mailto:${contact.email_c}`} className="text-primary hover:underline">
                                {contact.email_c}
                              </a>
                            </dd>
                          </div>
                          {contact.phone_c && (
                            <div>
                              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone</dt>
                              <dd className="text-sm text-slate-900 mt-1">
                                <a href={`tel:${contact.phone_c}`} className="text-primary hover:underline">
                                  {contact.phone_c}
                                </a>
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>

                      <div className="border-t border-slate-200 pt-4">
                        <dl className="space-y-3">
                          {contact.company_c && (
                            <div>
                              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Company</dt>
                              <dd className="text-sm text-slate-900 mt-1">{contact.company_c}</dd>
                            </div>
                          )}
                          {contact.title_c && (
                            <div>
                              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Title</dt>
                              <dd className="text-sm text-slate-900 mt-1">{contact.title_c}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>

                    {contact.tags_c && contact.tags_c.trim() && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {contact.tags_c.split(',').filter(t => t.trim()).map((tag, index) => (
                            <Badge key={index} variant="primary">{tag.trim()}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {contact.notes_c && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 mb-3">Notes</h3>
                        <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                          {contact.notes_c}
                        </p>
                      </div>
                    )}

                    <div className="border-t border-slate-200 pt-4">
                      <dl className="grid grid-cols-2 gap-3">
                        <div>
                          <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Created</dt>
                          <dd className="text-sm text-slate-900 mt-1">
                            {formatDistanceToNow(new Date(contact.created_at_c), { addSuffix: true })}
                          </dd>
                        </div>
                        {contact.last_contacted_at_c && (
                          <div>
                            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">Last Contact</dt>
                            <dd className="text-sm text-slate-900 mt-1">
                              {formatDistanceToNow(new Date(contact.last_contacted_at_c), { addSuffix: true })}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                )}

                {activeTab === "deals" && (
                  <div className="space-y-4">
                    {loadingDeals ? (
                      <Loading />
                    ) : deals.length === 0 ? (
                      <Empty
                        icon="DollarSign"
                        title="No deals found"
                        description="This contact doesn't have any deals yet."
                        showAction={false}
                      />
                    ) : (
                      <div className="space-y-3">
{deals.map((deal) => (
                          <div key={deal.Id} className="bg-slate-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-slate-900">{deal.title_c}</h4>
                              <Badge 
                                variant={
                                  deal.stage_c === "Closed Won" ? "success" :
                                  deal.stage_c === "Closed Lost" ? "error" :
                                  "primary"
                                }
                              >
                                {deal.stage_c}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-600">
                              <span>${(deal.value_c || 0).toLocaleString()}</span>
                              <span>{deal.probability_c}% probability</span>
                            </div>
                            {deal.notes_c && (
                              <p className="text-sm text-slate-600 mt-2">{deal.notes_c}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "activity" && (
                  <div className="space-y-4">
                    {loadingActivities ? (
                      <Loading />
                    ) : error ? (
                      <Error message={error} onRetry={loadActivities} />
                    ) : activities.length === 0 ? (
                      <Empty
                        icon="Clock"
                        title="No activities found"
                        description="No activities have been logged for this contact yet."
                        showAction={false}
                      />
                    ) : (
                      <div className="space-y-4">
                        {activities.map((activity) => (
                          <ActivityItem key={activity.Id} activity={activity} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-slate-200 px-6 py-4">
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <Button className="flex items-center gap-2">
                    <ApperIcon name="Edit" className="w-4 h-4" />
                    Edit Contact
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default ContactDetail;