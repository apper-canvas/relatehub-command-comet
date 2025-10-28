import { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import ActivityItem from "@/components/molecules/ActivityItem";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { contactService, dealService, activityService } from "@/services/api/dataService";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalContacts: 0,
    activeDeals: 0,
    totalDealValue: 0,
    averageDealValue: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [contacts, deals, activities] = await Promise.all([
        contactService.getAll(),
        dealService.getAll(),
        activityService.getAll()
      ]);

      // Calculate stats
      const activeDeals = deals.filter(deal => 
        !["Closed Won", "Closed Lost"].includes(deal.stage)
      );
      const totalDealValue = activeDeals.reduce((sum, deal) => sum + deal.value, 0);
      const averageDealValue = activeDeals.length > 0 ? totalDealValue / activeDeals.length : 0;

      setStats({
        totalContacts: contacts.length,
        activeDeals: activeDeals.length,
        totalDealValue,
        averageDealValue
      });

      // Get recent activities (last 5)
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
      
      setRecentActivities(sortedActivities);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2">Welcome to your CRM overview</p>
        </div>
        <Loading variant="cards" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2">Welcome to your CRM overview</p>
        </div>
        <Error message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome to your CRM overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Contacts"
          value={stats.totalContacts.toLocaleString()}
          icon="Users"
          change="+12%"
          trend="up"
        />
        <StatCard
          title="Active Deals"
          value={stats.activeDeals.toLocaleString()}
          icon="Target"
          change="+8%"
          trend="up"
        />
        <StatCard
          title="Pipeline Value"
          value={`$${stats.totalDealValue.toLocaleString()}`}
          icon="DollarSign"
          change="+15%"
          trend="up"
        />
        <StatCard
          title="Avg Deal Value"
          value={`$${Math.round(stats.averageDealValue).toLocaleString()}`}
          icon="TrendingUp"
          change="+5%"
          trend="up"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg card-shadow">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
          <p className="text-slate-600 mt-1">Latest interactions with your contacts</p>
        </div>
        
        <div className="p-6">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No recent activity found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <ActivityItem key={activity.Id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;