import { useState, useEffect } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import SearchBar from '@/components/molecules/SearchBar';
import QuickAddModal from '@/components/organisms/QuickAddModal';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { companyService } from '@/services/api/dataService';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';

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
        company.Name?.toLowerCase().includes(query) ||
        company.Industry?.toLowerCase().includes(query) ||
        company.Website?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(company =>
        company.Status?.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.LastContact) - new Date(a.LastContact);
        case 'oldest':
          return new Date(a.LastContact) - new Date(b.LastContact);
        case 'name':
          return (a.Name || '').localeCompare(b.Name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }

  function handleAddCompany() {
    setIsQuickAddOpen(true);
  }

  async function handleCloseQuickAdd() {
    setIsQuickAddOpen(false);
    await loadCompanies();
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
                {companies.filter(c => c.Status === 'Active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <ApperIcon name="XCircle" size={20} className="text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Inactive</p>
              <p className="text-2xl font-bold text-slate-900">
                {companies.filter(c => c.Status === 'Inactive').length}
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
                      {company.Name}
                    </h3>
                    <Badge variant={company.Status === 'Active' ? 'success' : 'secondary'}>
                      {company.Industry || 'No Industry'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {company.Website && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <ApperIcon name="Globe" size={14} />
                    <span className="truncate">{company.Website}</span>
                  </div>
                )}
                {company.Size && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <ApperIcon name="Users" size={14} />
                    <span>{company.Size}</span>
                  </div>
                )}
                {company.Revenue && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <ApperIcon name="DollarSign" size={14} />
                    <span>{company.Revenue}</span>
                  </div>
                )}
                {company.LastContact && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ApperIcon name="Clock" size={12} />
                    <span>
                      Last contact {formatDistanceToNow(new Date(company.LastContact), { addSuffix: true })}
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
                    handleDeleteCompany(company.Id, company.Name);
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
        onClose={handleCloseQuickAdd}
        activeTab="company"
        onSuccess={handleCloseQuickAdd}
      />
    </div>
  );
}

export default Companies;