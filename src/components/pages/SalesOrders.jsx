import React, { useEffect, useState } from 'react';
import { salesOrderService } from '@/services/api/dataService';
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

function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchQuery, statusFilter, sortBy]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await salesOrderService.getAll();
      setOrders(data);
    } catch (err) {
      setError('Failed to load sales orders. Please try again.');
      console.error('Error loading sales orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status_c === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.order_number_c?.toLowerCase().includes(query) ||
        order.contact_id_c?.Name?.toLowerCase().includes(query) ||
        order.deal_id_c?.Name?.toLowerCase().includes(query) ||
        order.status_c?.toLowerCase().includes(query) ||
        order.description_c?.toLowerCase().includes(query)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.order_date_c || 0) - new Date(a.order_date_c || 0);
        case 'oldest':
          return new Date(a.order_date_c || 0) - new Date(b.order_date_c || 0);
        case 'amount':
          return (b.total_amount_c || 0) - (a.total_amount_c || 0);
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  };

  const handleAddOrder = () => {
    setShowQuickAdd(true);
  };

  const handleOrderSuccess = async () => {
    await loadOrders();
  };

  const handleModalClose = () => {
    setShowQuickAdd(false);
  };

  const handleDeleteOrder = async (id, orderNumber) => {
    if (window.confirm(`Are you sure you want to delete order ${orderNumber}?`)) {
      const result = await salesOrderService.delete(id);
      if (result.success) {
        await loadOrders();
      }
    }
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      'Draft': 'default',
      'Confirmed': 'info',
      'Shipped': 'warning',
      'Delivered': 'success',
      'Cancelled': 'error'
    };
    return variants[status] || 'default';
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Sales Orders</h1>
        </div>
        <Loading className="min-h-[calc(100vh-200px)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Sales Orders</h1>
        </div>
        <Error
          message={error}
          onRetry={loadOrders}
          className="min-h-[calc(100vh-200px)]"
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Orders</h1>
          <p className="text-slate-600 text-sm mt-1">
            Track and manage your sales orders
          </p>
        </div>
        <Button onClick={handleAddOrder} className="gap-2">
          <ApperIcon name="Plus" size={16} />
          Add Sales Order
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search orders by number, contact, deal..."
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
            <option value="Confirmed">Confirmed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount">Highest Amount</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-sm text-slate-600">Total Orders</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{orders.length}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-sm text-slate-600">Draft</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {orders.filter(o => o.status_c === 'Draft').length}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-sm text-slate-600">Confirmed</div>
          <div className="text-2xl font-bold text-info mt-1">
            {orders.filter(o => o.status_c === 'Confirmed').length}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-sm text-slate-600">Shipped</div>
          <div className="text-2xl font-bold text-warning mt-1">
            {orders.filter(o => o.status_c === 'Shipped').length}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-sm text-slate-600">Delivered</div>
          <div className="text-2xl font-bold text-success mt-1">
            {orders.filter(o => o.status_c === 'Delivered').length}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Empty
          icon="FileText"
          title="No sales orders found"
          description={searchQuery || statusFilter !== 'all' 
            ? "Try adjusting your search or filters"
            : "Get started by creating your first sales order"}
          action={
            <Button onClick={handleAddOrder} className="gap-2">
              <ApperIcon name="Plus" size={16} />
              Add Sales Order
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
                    Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Shipping Address
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.map((order) => (
                  <tr key={order.Id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <ApperIcon name="FileText" size={16} className="text-primary" />
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {order.order_number_c || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900">
                        {order.contact_id_c?.Name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900">
                        {order.deal_id_c?.Name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">
                        {order.order_date_c ? format(new Date(order.order_date_c), 'MMM d, yyyy') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(order.total_amount_c)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(order.status_c)}>
                        {order.status_c || 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 line-clamp-2">
                        {order.shipping_address_c || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toast.info('Edit functionality coming soon')}
                          className="text-slate-600 hover:text-slate-900 transition-colors"
                          title="Edit order"
                        >
                          <ApperIcon name="Edit2" size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.Id, order.order_number_c)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Delete order"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </button>
                      </div>
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
        activeTab="salesOrder"
        onSuccess={handleOrderSuccess}
      />
    </div>
  );
}

export default SalesOrders;