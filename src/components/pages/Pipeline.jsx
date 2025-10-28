import React, { useEffect, useState } from "react";
import { contactService, dealService } from "@/services/api/dataService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import QuickAddModal from "@/components/organisms/QuickAddModal";
import DealCard from "@/components/organisms/DealCard";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";

const Pipeline = () => {
const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const handleAddDeal = () => {
    setIsQuickAddOpen(true);
  };

const handleDealCreated = async () => {
    await loadPipelineData();
  };

  const stages = [
    { id: "Lead", name: "Lead", color: "bg-slate-100" },
    { id: "Qualified", name: "Qualified", color: "bg-primary/10" },
    { id: "Proposal", name: "Proposal", color: "bg-accent/10" },
    { id: "Negotiation", name: "Negotiation", color: "bg-warning/10" },
    { id: "Closed Won", name: "Closed Won", color: "bg-success/10" },
    { id: "Closed Lost", name: "Closed Lost", color: "bg-error/10" }
  ];

  useEffect(() => {
    loadPipelineData();
  }, []);

  const loadPipelineData = async () => {
    setLoading(true);
    setError("");

    try {
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ]);
      
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError("Failed to load pipeline data");
    } finally {
      setLoading(false);
    }
  };

  const getDealsByStage = (stage) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const getContactById = (contactId) => {
    return contacts.find(contact => contact.Id === contactId);
  };

  const getStageTotal = (stage) => {
    const stageDeals = getDealsByStage(stage);
    return stageDeals.reduce((sum, deal) => sum + deal.value, 0);
  };

  const moveDeal = async (dealId, newStage) => {
    try {
      await dealService.update(dealId, { stage: newStage });
      
      // Update local state
      setDeals(prev => prev.map(deal => 
        deal.Id === dealId 
          ? { ...deal, stage: newStage, stageChangedAt: new Date().toISOString() }
          : deal
      ));
      
      toast.success(`Deal moved to ${newStage}`);
    } catch (err) {
      toast.error("Failed to move deal");
    }
  };

  const handleEditDeal = (deal) => {
    console.log("Edit deal:", deal);
    // TODO: Open edit modal
  };

  const handleDeleteDeal = async (deal) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      try {
        await dealService.delete(deal.Id);
        setDeals(prev => prev.filter(d => d.Id !== deal.Id));
        toast.success("Deal deleted successfully");
      } catch (err) {
        toast.error("Failed to delete deal");
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Pipeline</h1>
        </div>
        <Loading variant="kanban" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Pipeline</h1>
        </div>
        <Error message={error} onRetry={loadPipelineData} />
      </div>
    );
  }

  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pipeline</h1>
          <p className="text-slate-600 mt-2">Track deals through your sales process</p>
        </div>
<Button onClick={handleAddDeal} className="flex items-center gap-2">
          <ApperIcon name="Plus" className="w-4 h-4" />
          Add Deal
        </Button>
      </div>

      {/* Pipeline Stats */}
      <div className="bg-white p-6 rounded-lg card-shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">{totalDeals}</p>
            <p className="text-sm text-slate-600">Total Deals</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">${totalValue.toLocaleString()}</p>
            <p className="text-sm text-slate-600">Total Value</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">
              ${totalDeals > 0 ? Math.round(totalValue / totalDeals).toLocaleString() : 0}
            </p>
            <p className="text-sm text-slate-600">Average Deal Size</p>
          </div>
        </div>
      </div>

      {/* Pipeline Board */}
      {totalDeals === 0 ? (
        <Empty
          icon="Target"
          title="No deals found"
          description="Start tracking your sales opportunities by adding your first deal."
actionLabel="Add Deal"
          onAction={handleAddDeal}
        />
) : (
        <div className="overflow-x-auto">
          <div className="flex gap-6 pb-4 min-w-max">
            {stages.map((stage) => {
              const stageDeals = getDealsByStage(stage.id);
              const stageTotal = getStageTotal(stage.id);

              return (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  <div className={`${stage.color} rounded-lg p-4`}>
                    {/* Stage Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">{stage.name}</h3>
                      <div className="text-xs text-slate-600">
                        {stageDeals.length} deals
                      </div>
                    </div>

                    {/* Stage Total */}
                    <div className="text-sm text-slate-600 mb-4">
                      Total: ${stageTotal.toLocaleString()}
                    </div>

                    {/* Deal Cards */}
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                      {stageDeals.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                          <ApperIcon name="Plus" className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Drop deals here</p>
                        </div>
                      ) : (
                        stageDeals.map((deal) => {
                          const contact = getContactById(deal.contactId);
                          return (
                            <DealCard
                              key={deal.Id}
                              deal={deal}
                              contact={contact}
                              onEdit={handleEditDeal}
                              onDelete={handleDeleteDeal}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <QuickAddModal 
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        activeTab="deal"
        onSuccess={handleDealCreated}
/>
    </div>
  );
};

export default Pipeline;