import React, { useEffect, useState } from "react";
import { companyService } from "@/services/api/dataService";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import QuickAddModal from "@/components/organisms/QuickAddModal";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import SearchBar from "@/components/molecules/SearchBar";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      setLoading(true);
      setError(null);
      const data = await companyService.getAll();
      setCompanies(data);
    } catch (err) {
      setError(err.message || 'Failed to load companies');
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query) {
    setSearchQuery(query);
  }

  function filterAndSortCompanies() {
    let filtered = [...companies];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(company =>
company.name_c?.toLowerCase().includes(query) ||
        company.industry_c?.toLowerCase().includes(query) ||
        company.website_c?.toLowerCase().includes(query)
      );
    }

    if (filterStatus && filterStatus !== 'All') {
      filtered = filtered.filter(company =>
        company.status_c?.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.last_contact_c) - new Date(a.last_contact_c);
        case 'oldest':
          return new Date(a.last_contact_c) - new Date(b.last_contact_c);
        case 'name':
          return (a.name_c || '').localeCompare(b.name_c || '');
        default:
          return 0;
      }
    });

    return filtered;
  }

  function handleAddCompany() {
    setIsQuickAddOpen(true);
  }

async function handleCompanySuccess() {
    await loadCompanies();
    setIsQuickAddOpen(false);
  }

  function handleModalClose() {
    setIsQuickAddOpen(false);
  }

  async function handleDeleteCompany(id, name) {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      await companyService.delete(id);
      setCompanies(prev => prev.filter(c => c.Id !== id));
      toast.success('Company deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete company');
    }
  }

  const filteredCompanies = filterAndSortCompanies();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Error message={error} onRetry={loadCompanies} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your company relationships
          </p>
        </div>
        <Button onClick={handleAddCompany} className="gap-2">
          <ApperIcon name="Plus" size={16} />
          Add Company
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search companies..."
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <ApperIcon name="Building2" size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Companies</p>
              <p className="text-2xl font-bold text-slate-900">{companies.length}</p>
            </div>
          </div>
        </div>
<div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <ApperIcon name="CheckCircle" size={20} className="text-success" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active</p>
              <p className="text-2xl font-bold text-slate-900">
                {companies.filter(c => c.status_c === 'Active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <ApperIcon name="AlertCircle" size={20} className="text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Inactive</p>
              <p className="text-2xl font-bold text-slate-900">
                {companies.filter(c => c.status_c === 'Inactive').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Companies List */}
      {filteredCompanies.length === 0 ? (
        <Empty
          icon="Building2"
          title="No companies found"
          description={searchQuery ? "Try adjusting your search criteria" : "Add your first company to get started"}
          action={!searchQuery && {
            label: "Add Company",
            onClick: handleAddCompany
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <div
              key={company.Id}
              className="bg-white rounded-lg border border-slate-200 p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
            >
<div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
                    <ApperIcon name="Building2" size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
{company.name_c}
                    </h3>
                    <Badge variant={company.status_c === 'Active' ? 'success' : 'secondary'}>
                      {company.industry_c || 'No Industry'}
                    </Badge>
                  </div>
                </div>
              </div>
<div className="mt-4 space-y-2">
                {company.website_c && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <ApperIcon name="Globe" size={14} />
                    <span className="truncate">{company.website_c}</span>
                  </div>
                )}
                {company.size_c && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <ApperIcon name="Users" size={14} />
                    <span>{company.size_c}</span>
                  </div>
                )}
                {company.revenue_c && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <ApperIcon name="DollarSign" size={14} />
                    <span>{company.revenue_c}</span>
                  </div>
                )}
                {company.last_contact_c && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ApperIcon name="Clock" size={12} />
                    <span>
                      Last contact {formatDistanceToNow(new Date(company.last_contact_c), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info('Edit functionality coming soon');
                  }}
                >
                  <ApperIcon name="Edit2" size={14} />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 gap-1.5 text-error hover:bg-error/10 hover:text-error"
onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCompany(company.Id, company.name_c);
                  }}
                >
                  <ApperIcon name="Trash2" size={14} />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

{/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={handleModalClose}
        activeTab="company"
        onSuccess={handleCompanySuccess}
      />
    </div>
  );
}

export default Companies;