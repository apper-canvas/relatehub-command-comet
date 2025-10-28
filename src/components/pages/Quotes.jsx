import React, { useEffect, useState } from 'react';
import { quoteService, companyService, contactService, dealService } from '@/services/api/dataService';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import QuickAddModal from '@/components/organisms/QuickAddModal';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import Error from '@/components/ui/Error';
import SearchBar from '@/components/molecules/SearchBar';

function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    loadQuotes();
    loadLookupData();
  }, []);

  useEffect(() => {
    filterAndSortQuotes();
  }, [quotes, searchQuery, statusFilter]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quoteService.getAll();
      setQuotes(data);
    } catch (err) {
      setError('Failed to load quotes. Please try again.');
      console.error('Error loading quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLookupData = async () => {
    try {
      const [companiesData, contactsData, dealsData] = await Promise.all([
        companyService.getAll(),
        contactService.getAll(),
        dealService.getAll()
      ]);
      setCompanies(companiesData);
      setContacts(contactsData);
      setDeals(dealsData);
    } catch (err) {
      console.error('Error loading lookup data:', err);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
  };

  const filterAndSortQuotes = () => {
    let filtered = [...quotes];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status_c === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(quote =>
        quote.company_id_c?.Name?.toLowerCase().includes(query) ||
        quote.contact_id_c?.Name?.toLowerCase().includes(query) ||
        quote.deal_id_c?.Name?.toLowerCase().includes(query) ||
        quote.status_c?.toLowerCase().includes(query) ||
        quote.delivery_method_c?.toLowerCase().includes(query)
      );
    }

    setFilteredQuotes(filtered);
  };

  const handleAddQuote = () => {
    setShowQuickAdd(true);
  };

  const handleQuoteSuccess = async () => {
    await loadQuotes();
  };

  const handleModalClose = () => {
    setShowQuickAdd(false);
  };

  const handleDeleteQuote = async (id, company) => {
    if (window.confirm(`Are you sure you want to delete this quote?`)) {
      const result = await quoteService.delete(id);
      if (result.success) {
        toast.success('Quote deleted successfully');
        await loadQuotes();
      }
    }
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      'Draft': 'default',
      'Sent': 'info',
      'Accepted': 'success',
      'Rejected': 'error'
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return <Loading className="min-h-[calc(100vh-200px)]" />;
  }

  if (error) {
    return (
      <Error
        message={error}
        onRetry={loadQuotes}
        className="min-h-[calc(100vh-200px)]"
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quotes</h1>
          <p className="text-slate-600 text-sm mt-1">
            Manage your sales quotes and proposals
          </p>
        </div>
        <Button onClick={handleAddQuote} className="gap-2">
          <ApperIcon name="Plus" size={16} />
          Add Quote
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search quotes..."
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-sm text-slate-600">Total Quotes</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{quotes.length}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-sm text-slate-600">Draft</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {quotes.filter(q => q.status_c === 'Draft').length}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-sm text-slate-600">Sent</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {quotes.filter(q => q.status_c === 'Sent').length}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-sm text-slate-600">Accepted</div>
          <div className="text-2xl font-bold text-success mt-1">
            {quotes.filter(q => q.status_c === 'Accepted').length}
          </div>
        </div>
      </div>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <Empty
          icon="FileText"
          title="No quotes found"
          description={searchQuery || statusFilter !== 'all' 
            ? "Try adjusting your search or filters"
            : "Get started by creating your first quote"}
          action={
            <Button onClick={handleAddQuote} className="gap-2">
              <ApperIcon name="Plus" size={16} />
              Add Quote
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Quote Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Expires On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.Id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <ApperIcon name="Building2" size={16} className="text-primary" />
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {quote.company_id_c?.Name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900">
                        {quote.contact_id_c?.Name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900">
                        {quote.deal_id_c?.Name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">
                        {quote.quote_date_c ? format(new Date(quote.quote_date_c), 'MMM d, yyyy') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">
                        {quote.expires_on_c ? format(new Date(quote.expires_on_c), 'MMM d, yyyy') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(quote.status_c)}>
                        {quote.status_c || 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">
                        {quote.delivery_method_c || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteQuote(quote.Id, quote.company_id_c?.Name)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Delete quote"
                      >
                        <ApperIcon name="Trash2" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={handleModalClose}
        activeTab="quote"
        onSuccess={handleQuoteSuccess}
        companies={companies}
        contacts={contacts}
        deals={deals}
      />
    </div>
  );
}

export default Quotes;