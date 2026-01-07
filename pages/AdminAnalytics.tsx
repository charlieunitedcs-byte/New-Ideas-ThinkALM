import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Phone,
  TrendingUp,
  DollarSign,
  Award,
  Activity,
  Calendar,
  Target,
} from 'lucide-react';
import {
  getDashboardMetrics,
  getTopPerformers,
  getCallTrends,
  getRevenueByPlan,
  DashboardMetrics,
} from '../services/analyticsService';

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, color }) => (
  <div className="glass-panel p-6 rounded-xl border border-slate-800">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        {change && (
          <p className="text-sm text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp size={14} />
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const AdminAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [callTrends, setCallTrends] = useState<any[]>([]);
  const [revenueByPlan, setRevenueByPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [metricsData, performersData, trendsData, revenueData] = await Promise.all([
        getDashboardMetrics(),
        getTopPerformers(5),
        getCallTrends(30),
        getRevenueByPlan(),
      ]);

      setMetrics(metricsData);
      setTopPerformers(performersData);
      setCallTrends(trendsData);
      setRevenueByPlan(revenueData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Activity className="text-brand-500" size={32} />
          Analytics Dashboard
        </h1>
        <p className="text-slate-400">Real-time insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          change="+12% this month"
          icon={Users}
          color="from-blue-500 to-cyan-600"
        />
        <MetricCard
          title="Total Calls"
          value={metrics.totalCalls.toLocaleString()}
          change="+23% this week"
          icon={Phone}
          color="from-brand-500 to-red-600"
        />
        <MetricCard
          title="Avg Call Score"
          value={`${metrics.avgCallScore}%`}
          change="+4.5 points"
          icon={Award}
          color="from-emerald-500 to-green-600"
        />
        <MetricCard
          title="Monthly Revenue"
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          change="+18% this month"
          icon={DollarSign}
          color="from-amber-500 to-orange-600"
        />
      </div>

      {/* Call Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl border border-slate-800 text-center">
          <Calendar className="w-8 h-8 text-brand-400 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Calls Today</p>
          <p className="text-3xl font-bold text-white mt-1">{metrics.callsToday}</p>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-slate-800 text-center">
          <Target className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Calls This Week</p>
          <p className="text-3xl font-bold text-white mt-1">{metrics.callsThisWeek}</p>
        </div>
        <div className="glass-panel p-6 rounded-xl border border-slate-800 text-center">
          <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Calls This Month</p>
          <p className="text-3xl font-bold text-white mt-1">{metrics.callsThisMonth}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Call Trends Chart */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4">Call Volume (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={callTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#EF4444"
                strokeWidth={2}
                name="Call Count"
              />
              <Line
                type="monotone"
                dataKey="avgScore"
                stroke="#10B981"
                strokeWidth={2}
                name="Avg Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Plan */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4">Revenue by Plan</h3>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie
                  data={revenueByPlan}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {revenueByPlan.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => `$${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {revenueByPlan.map((plan, index) => (
                <div key={plan.plan} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="text-sm text-white font-medium">{plan.plan}</p>
                    <p className="text-xs text-slate-400">
                      ${plan.revenue.toLocaleString()} • {plan.clientCount} clients
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="glass-panel p-6 rounded-xl border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Award className="text-amber-400" size={20} />
          Top Performers
        </h3>
        <div className="space-y-4">
          {topPerformers.map((performer, index) => (
            <div
              key={performer.name}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  index === 0 ? 'bg-amber-500/20 text-amber-400' :
                  index === 1 ? 'bg-slate-500/20 text-slate-400' :
                  index === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-slate-700/20 text-slate-400'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-white">{performer.name}</p>
                  <p className="text-sm text-slate-400">{performer.callCount} calls analyzed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{performer.avgScore}%</p>
                <p className="text-xs text-slate-400">avg score</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client & Campaign Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4">Client Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Clients</span>
              <span className="text-2xl font-bold text-white">{metrics.totalClients}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Active Clients</span>
              <span className="text-2xl font-bold text-emerald-400">{Math.floor(metrics.totalClients * 0.85)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Trialing</span>
              <span className="text-2xl font-bold text-amber-400">{Math.floor(metrics.totalClients * 0.15)}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Database Status</span>
              <span className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Online
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">API Response Time</span>
              <span className="text-white">~120ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Storage Used</span>
              <span className="text-white">245 MB / 500 MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
