
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ArrowUpRight, CheckCircle2, Mic, Users, Clock, Zap, Phone, Trash2, Eye, BarChart as BarChartIcon } from 'lucide-react';
import { NotificationContext } from '../App';
import { getCallHistory, deleteCallFromHistory, CallHistoryItem } from '../services/callHistoryService';
import { getCurrentUser } from '../services/authService';

const mockActivityData = [
  { name: 'Mon', calls: 12, score: 78 },
  { name: 'Tue', calls: 19, score: 82 },
  { name: 'Wed', calls: 15, score: 75 },
  { name: 'Thu', calls: 22, score: 85 },
  { name: 'Fri', calls: 28, score: 88 },
  { name: 'Sat', calls: 5, score: 90 },
  { name: 'Sun', calls: 2, score: 80 },
];

const StatCard = ({ title, value, change, icon: Icon, color, bgGradient }: any) => (
  <div className="glass-panel p-6 rounded-2xl hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgGradient} opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity`}></div>
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 border border-white/5`}>
        <Icon className={color} size={22} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2 text-sm relative z-10">
      <div className="flex items-center text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-bold">
        <ArrowUpRight size={14} className="mr-1" />
        {change}
      </div>
      <span className="text-slate-500 text-xs">vs last month</span>
    </div>
  </div>
);

interface DashboardProps {
  demoMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ demoMode }) => {
  const { notify } = useContext(NotificationContext);
  const navigate = useNavigate();
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
  const [selectedCall, setSelectedCall] = useState<CallHistoryItem | null>(null);

  // Refresh call history on mount, route change, and when window regains focus
  useEffect(() => {
    const loadHistory = () => {
      const currentUser = getCurrentUser();
      if (currentUser) {
        const history = getCallHistory(currentUser.id);
        setCallHistory(history);
      }
    };

    // Load history immediately
    loadHistory();

    // Reload when hash changes (navigation in HashRouter)
    window.addEventListener('hashchange', loadHistory);

    // Reload when window regains focus (user switches tabs)
    window.addEventListener('focus', loadHistory);

    return () => {
      window.removeEventListener('hashchange', loadHistory);
      window.removeEventListener('focus', loadHistory);
    };
  }, []); // Run once on mount and set up listeners

  const handleDeleteCall = (callId: string) => {
    if (confirm("Are you sure you want to delete this call analysis?")) {
      deleteCallFromHistory(callId);
      setCallHistory(prev => prev.filter(c => c.id !== callId));
      notify("Call analysis deleted", "success");
    }
  };

  // Calculate real stats from call history
  const calculateStats = () => {
    if (callHistory.length === 0) {
      return null;
    }

    const totalCalls = callHistory.length;
    const avgScore = Math.round(
      callHistory.reduce((sum, call) => sum + call.score, 0) / totalCalls
    );

    return {
      totalCalls,
      avgScore
    };
  };

  // Generate performance chart data from real calls
  const generateChartData = () => {
    if (callHistory.length === 0) {
      return [];
    }

    // Group calls by day for last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        name: days[date.getDay()],
        date: date.toDateString(),
        calls: 0,
        totalScore: 0,
        score: 0
      };
    });

    // Populate with actual call data
    callHistory.forEach(call => {
      const callDate = new Date(call.analyzedAt).toDateString();
      const dayData = last7Days.find(d => d.date === callDate);
      if (dayData) {
        dayData.calls += 1;
        dayData.totalScore += call.score;
      }
    });

    // Calculate average scores
    last7Days.forEach(day => {
      if (day.calls > 0) {
        day.score = Math.round(day.totalScore / day.calls);
      }
    });

    return last7Days;
  };

  const stats = calculateStats();
  const chartData = demoMode ? mockActivityData : generateChartData();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Command Center</h1>
          <p className="text-slate-400">Overview of your team's AI-driven performance metrics.</p>
        </div>
        <div className="flex gap-3">
             <button
                onClick={() => notify("Exporting dashboard analytics to CSV...", "success")}
                className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-white transition-colors"
             >
                Export Data
             </button>
             <button
                onClick={() => navigate('/campaigns')}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-brand-500/25 transition-all"
             >
                New Campaign
             </button>
        </div>
      </div>

      {/* Show real stats if available, otherwise show appropriate message */}
      {stats || demoMode ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Calls Analyzed"
              value={demoMode ? "1,284" : stats?.totalCalls.toString() || "0"}
              change="+12%"
              icon={Mic}
              color="text-brand-400"
              bgGradient="from-brand-500 to-red-600"
            />
            <StatCard
              title="Avg. Quality Score"
              value={demoMode ? "84" : stats?.avgScore.toString() || "0"}
              change="+4.5%"
              icon={Zap}
              color="text-accent-400"
              bgGradient="from-accent-500 to-orange-600"
            />
            {demoMode && (
              <>
                <StatCard
                  title="Roleplay Sessions"
                  value="342"
                  change="+18%"
                  icon={Users}
                  color="text-blue-400"
                  bgGradient="from-blue-500 to-cyan-600"
                />
                <StatCard
                  title="Training Hours"
                  value="45h"
                  change="+2%"
                  icon={Clock}
                  color="text-emerald-400"
                  bgGradient="from-emerald-500 to-green-600"
                />
              </>
            )}
          </div>
        </>
      ) : (
        <div className="glass-panel rounded-2xl p-16 border border-slate-800/50 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChartIcon size={40} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">No Data Yet</h3>
            <p className="text-slate-400 mb-6">
              Start analyzing calls and using AI features to see your performance metrics here.
            </p>
            <button
              onClick={() => navigate('/calls')}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium shadow-lg shadow-brand-500/25 transition-all"
            >
              Analyze Your First Call
            </button>
          </div>
        </div>
      )}

      {(stats || demoMode) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800/50">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold text-white">Performance Analytics</h3>
              <select className="bg-slate-900/50 border border-slate-700 text-slate-300 text-xs font-medium rounded-lg px-3 py-2 outline-none focus:border-brand-500">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <defs>
                      <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0.3}/>
                      </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111322', borderColor: '#450a0a', color: '#f1f5f9', borderRadius: '8px' }}
                    cursor={{ fill: '#1e2030' }}
                  />
                  <Bar dataKey="calls" fill="url(#colorCalls)" radius={[4, 4, 0, 0]} name="Calls" barSize={32} />
                  <Bar dataKey="score" fill="url(#colorScore)" radius={[4, 4, 0, 0]} name="Avg Score" barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {demoMode && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800/50 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-6">Recommended Training</h3>
              <div className="flex-1 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    onClick={() => notify("Added to your personalized learning path.", "success")}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-brand-500/30 hover:bg-slate-900/60 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <span className="text-2xl">📚</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 group-hover:text-brand-300 transition-colors">Objection Handling {i}</h4>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                         <p className="text-xs text-slate-500">High Priority</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => window.location.hash = '#/training'}
                className="w-full mt-6 py-3 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700"
              >
                View All Materials
              </button>
            </div>
          )}
        </div>
      )}

      {/* Call History Section */}
      <div className="glass-panel border border-slate-800/50 rounded-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Phone size={24} className="text-brand-400" />
              Recent Call Analysis
            </h2>
            <p className="text-slate-400 text-sm">View and manage your analyzed calls</p>
          </div>
          <button
            onClick={() => navigate('/calls')}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-brand-500/25 transition-all"
          >
            Analyze New Call
          </button>
        </div>

        {callHistory.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
            <Phone size={48} className="text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-400 mb-2">No Calls Analyzed Yet</h3>
            <p className="text-slate-500 mb-6">Start analyzing your sales calls to see insights here</p>
            <button
              onClick={() => navigate('/calls')}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium shadow-lg shadow-brand-500/25 transition-all"
            >
              Analyze Your First Call
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {callHistory.slice(0, 10).map((call) => (
              <div
                key={call.id}
                className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-brand-500/50 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold text-white ${
                        call.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                        call.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {call.score}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {call.salesRepName && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-medium">
                              {call.salesRepName}
                            </span>
                          )}
                          <p className="text-sm text-slate-400">
                            {new Date(call.analyzedAt).toLocaleDateString()} at {new Date(call.analyzedAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <p className="text-white font-medium mt-1 line-clamp-1">{call.summary}</p>
                      </div>
                    </div>

                    {selectedCall?.id === call.id && (
                      <div className="mt-4 pt-4 border-t border-slate-800 animate-fade-in">
                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                          <div>
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Strengths</h4>
                            <ul className="space-y-2">
                              {call.strengths.map((s, i) => (
                                <li key={i} className="text-sm text-slate-300 flex gap-2">
                                  <span className="text-emerald-500">•</span> {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-accent-400 uppercase tracking-wider mb-2">Areas for Improvement</h4>
                            <ul className="space-y-2">
                              {call.improvements.map((s, i) => (
                                <li key={i} className="text-sm text-slate-300 flex gap-2">
                                  <span className="text-accent-500">•</span> {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                            <p className="text-xs text-slate-500 mb-1">Tone</p>
                            <p className="text-white font-medium capitalize">{call.tone}</p>
                          </div>
                          <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                            <p className="text-xs text-slate-500 mb-1">Emotional Intelligence</p>
                            <p className="text-white font-medium">{call.emotionalIntelligence}/100</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setSelectedCall(selectedCall?.id === call.id ? null : call)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                      title={selectedCall?.id === call.id ? "Hide details" : "View details"}
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCall(call.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete call"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {callHistory.length > 10 && (
              <button
                onClick={() => navigate('/calls')}
                className="w-full py-3 text-sm text-slate-400 hover:text-white transition-colors"
              >
                View all {callHistory.length} calls →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
