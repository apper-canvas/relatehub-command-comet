import { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import ContactDetail from "@/components/organisms/ContactDetail";
import QuickAddModal from "@/components/organisms/QuickAddModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { contactService } from "@/services/api/dataService";
import { formatDistanceToNow } from "date-fns";

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactDetail, setShowContactDetail] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");

  const handleAddContact = () => {
    setShowQuickAdd(true);
  };

  const handleCloseQuickAdd = async () => {
    setShowQuickAdd(false);
    // Reload contacts after modal closes to show newly created contact
    await loadContacts();
  };
  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    filterAndSortContacts();
  }, [contacts, sortBy, filterBy]);

  const loadContacts = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await contactService.getAll();
      setContacts(data);
    } catch (err) {
      setError("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    try {
      const results = await contactService.search(query);
      setFilteredContacts(results);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const filterAndSortContacts = () => {
    let filtered = [...contacts];

    // Apply filters
    if (filterBy !== "all") {
      filtered = filtered.filter(contact => {
        if (filterBy === "recent") {
          return contact.lastContactedAt && 
            (new Date() - new Date(contact.lastContactedAt)) < (7 * 24 * 60 * 60 * 1000); // Last 7 days
        }
        if (filterBy === "enterprise") {
          return contact.tags?.includes("Enterprise");
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case "company":
          return (a.company || "").localeCompare(b.company || "");
        case "recent":
          const aDate = new Date(a.lastContactedAt || a.createdAt);
          const bDate = new Date(b.lastContactedAt || b.createdAt);
          return bDate - aDate;
        default:
          return 0;
      }
    });

    setFilteredContacts(filtered);
  };

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setShowContactDetail(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
        </div>
        <Loading variant="table" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
        </div>
        <Error message={error} onRetry={loadContacts} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-600 mt-2">Manage your customer relationships</p>
        </div>
<Button onClick={handleAddContact} className="flex items-center gap-2">
          <ApperIcon name="Plus" className="w-4 h-4" />
          Add Contact
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg card-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <SearchBar
            placeholder="Search contacts..."
            onSearch={handleSearch}
            className="flex-1"
          />
          
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="name">Sort by Name</option>
              <option value="company">Sort by Company</option>
              <option value="recent">Sort by Recent</option>
            </select>
            
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Contacts</option>
              <option value="recent">Recent Activity</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact List */}
{filteredContacts.length === 0 ? (
        <Empty
          icon="Users"
          title="No contacts found"
          description="Start building relationships by adding your first contact."
          actionLabel="Add Contact"
          onAction={handleAddContact}
        />
      ) : (
        <div className="bg-white rounded-lg card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.Id}
                    onClick={() => handleContactClick(contact)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                          <ApperIcon name="User" className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-sm text-slate-500">{contact.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{contact.company || "-"}</div>
                      <div className="text-sm text-slate-500">{contact.title || ""}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags?.map((tag, index) => (
                          <Badge key={index} variant="primary" className="text-xs">
                            {tag}
                          </Badge>
                        )) || <span className="text-slate-400">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {contact.lastContactedAt 
                        ? formatDistanceToNow(new Date(contact.lastContactedAt), { addSuffix: true })
                        : "Never"
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContactClick(contact);
                        }}
                        className="text-primary hover:text-primary/80 mr-4"
                      >
                        <ApperIcon name="Eye" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Edit contact:", contact.Id);
                        }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <ApperIcon name="Edit" className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

{/* Contact Detail Modal */}
      <ContactDetail
        isOpen={showContactDetail}
        onClose={() => setShowContactDetail(false)}
        contact={selectedContact}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={handleCloseQuickAdd}
      />
    </div>
  );
};

export default Contacts;