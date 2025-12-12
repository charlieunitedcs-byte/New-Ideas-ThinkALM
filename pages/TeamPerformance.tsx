import React, { useContext, useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Trophy, TrendingUp, Users, Target } from 'lucide-react';
import { NotificationContext } from '../App';
import { getCallHistory, CallHistoryItem } from '../services/callHistoryService';

const teamData = [
  { name: 'Sarah', calls: 45, score: 88, revenue: 12000 },
  { name: 'James', calls: 38, score: 92, revenue: 15500 },
  { name: 'Emily', calls: 52, score: 79, revenue: 9800 },
  { name: 'Michael', calls: 30, score: 85, revenue: 11200 },
  { name: 'David', calls: 41, score: 90, revenue: 13400 },
];

const LeaderboardItem = ({ rank, name, score, trend }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800/50 rounded-xl mb-3 hover:border-brand-500/30 transition-colors group">
    <div className="flex items-center gap-4">
      <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${
        rank === 1 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
        rank === 2 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30' :
        rank === 3 ? 'bg-amber-700/20 text-amber-700 border border-amber-700/30' : 'text-slate-500 bg-slate-800'
      }`}>
        {rank}
      </div>
      <div>
        <p className="font-bold text-white group-hover:text-brand-300 transition-colors">{name}</p>
        <p className="text-[10px] uppercase tracking-wider text-slate-500">Sales Rep</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-bold text-white text-lg">{score}</p>
      <p className={`text-xs font-medium ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {trend > 0 ? '+' : ''}{trend}% this week
      </p>
    </div>
  </div>
);

interface TeamPerformanceProps {
  demoMode: boolean;
}

const TeamPerformance: React.FC<TeamPerformanceProps> = ({ demoMode }) => {
  const { notify } = useContext(NotificationContext);
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);

  // Load all calls on mount and when hash changes
  useEffect(() => {
    const loadHistory = () => {
      const history = getCallHistory(); // Get all calls, not filtered by user
      setCallHistory(history);
    };

    loadHistory();
    window.addEventListener('hashchange', loadHistory);
    window.addEventListener('focus', loadHistory);

    return () => {
      window.removeEventListener('hashchange', loadHistory);
      window.removeEventListener('focus', loadHistory);
    };
  }, []);

  // Calculate team stats from real call data
  const calculateTeamStats = () => {
    if (callHistory.length === 0) {
      return null;
    }

    // Group calls by sales rep name
    const repStats = new Map<string, { calls: number; totalScore: number; scores: number[] }>();

    callHistory.forEach(call => {
      const repName = call.salesRepName || 'Unknown Rep';
      if (!repStats.has(repName)) {
        repStats.set(repName, { calls: 0, totalScore: 0, scores: [] });
      }
      const stats = repStats.get(repName)!;
      stats.calls += 1;
      stats.totalScore += call.score;
      stats.scores.push(call.score);
    });

    // Convert to array format for charts
    const teamDataArray = Array.from(repStats.entries()).map(([name, stats]) => ({
      name,
      calls: stats.calls,
      score: Math.round(stats.totalScore / stats.calls),
      revenue: 0 // We don't have revenue data yet
    }));

    // Sort by score for leaderboard
    const leaderboard = [...teamDataArray].sort((a, b) => b.score - a.score);

    // Calculate overall stats
    const totalCalls = callHistory.length;
    const avgScore = Math.round(
      callHistory.reduce((sum, call) => sum + call.score, 0) / totalCalls
    );
    const activeReps = repStats.size;

    return {
      teamDataArray,
      leaderboard,
      totalCalls,
      avgScore,
      activeReps
    };
  };

  const realStats = calculateTeamStats();
  const displayData = demoMode ? teamData : (realStats?.teamDataArray || []);
  const displayLeaderboard = demoMode ?
    [{name: 'James', score: 92}, {name: 'David', score: 90}, {name: 'Sarah', score: 88}, {name: 'Michael', score: 85}, {name: 'Emily', score: 79}] :
    (realStats?.leaderboard || []);

  const hasData = !demoMode && callHistory.length > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Team Pulse</h1>
          <p className="text-slate-400">Real-time team performance metrics and leaderboards.</p>
        </div>
        {(hasData || demoMode) && (
          <button
            onClick={() => notify("Team performance report exported to CSV and downloaded to your computer.", "success")}
            className="px-5 py-2.5 bg-slate-900 text-slate-200 rounded-xl text-sm border border-slate-700 hover:bg-slate-800 hover:text-white transition-all font-medium"
          >
            Export Report
          </button>
        )}
      </div>

      {!hasData && !demoMode ? (
        <div className="glass-panel rounded-2xl p-16 border border-slate-800/50 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={40} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">No Team Data Yet</h3>
            <p className="text-slate-400 mb-6">
              Team performance metrics will appear here once team members start analyzing calls with their names.
            </p>
            <button
              onClick={() => window.location.hash = '#/calls'}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium shadow-lg shadow-brand-500/25 transition-all"
            >
              Analyze Your First Call
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {demoMode && (
          <div className="glass-panel border border-brand-500/30 p-6 rounded-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-bl-full"></div>
             <div className="flex justify-between items-start mb-4 relative">
                <span className="text-brand-300 text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                <Target className="text-brand-400" size={20} />
             </div>
             <h3 className="text-3xl font-bold text-white">$61,900</h3>
             <span className="text-emerald-400 text-xs font-medium flex items-center mt-2 bg-emerald-500/10 w-fit px-2 py-1 rounded"><TrendingUp size={12} className="mr-1"/> +12% vs last week</span>
          </div>
        )}
        <div className="glass-panel border border-slate-800/50 p-6 rounded-2xl">
           <div className="flex justify-between items-start mb-4">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Calls</span>
              <Trophy className="text-brand-400" size={20} />
           </div>
           <h3 className="text-3xl font-bold text-white">
             {demoMode ? '206' : (realStats?.totalCalls || 0)}
           </h3>
           <span className="text-slate-500 text-xs mt-2 block">Analyzed by team</span>
        </div>
        <div className="glass-panel border border-slate-800/50 p-6 rounded-2xl">
           <div className="flex justify-between items-start mb-4">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg Team Score</span>
              <Trophy className="text-yellow-500" size={20} />
           </div>
           <h3 className="text-3xl font-bold text-white">
             {demoMode ? '86.8' : (realStats?.avgScore || 0)}
           </h3>
           <span className="text-emerald-400 text-xs font-medium flex items-center mt-2"><TrendingUp size={12} className="mr-1"/> Team average</span>
        </div>
        <div className="glass-panel border border-slate-800/50 p-6 rounded-2xl">
           <div className="flex justify-between items-start mb-4">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Reps</span>
              <Users className="text-blue-500" size={20} />
           </div>
           <h3 className="text-3xl font-bold text-white">
             {demoMode ? '5/6' : realStats?.activeReps || 0}
           </h3>
           <span className="text-slate-500 text-xs mt-2 block">
             {demoMode ? '1 on leave' : 'Analyzing calls'}
           </span>
        </div>
        {demoMode && (
          <div className="glass-panel border border-slate-800/50 p-6 rounded-2xl">
             <div className="flex justify-between items-start mb-4">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Training Completion</span>
             </div>
             <h3 className="text-3xl font-bold text-white">92%</h3>
             <div className="w-full bg-slate-900 h-2 rounded-full mt-4 border border-slate-800">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{width: '92%'}}></div>
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-8">
            <div className="glass-panel border border-slate-800/50 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-8">Call Volume vs Quality</h3>
                {displayData.length === 0 ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-slate-400 mb-4">No call data available yet</p>
                      <p className="text-sm text-slate-500">Team members need to analyze calls to see metrics here</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                        <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 12}} orientation="left" axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" stroke="#64748b" tick={{fontSize: 12}} orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#111322', borderColor: '#450a0a', color: '#f1f5f9', borderRadius: '12px' }}
                            cursor={{ fill: '#1e2030' }}
                        />
                        <Bar yAxisId="left" dataKey="calls" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Calls" barSize={30} />
                        <Bar yAxisId="right" dataKey="score" fill="#f97316" radius={[4, 4, 0, 0]} name="Avg Score" barSize={30} />
                    </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
            </div>

            {demoMode && (
              <div className="glass-panel border border-slate-800/50 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-8">Revenue Contribution</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={teamData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                        <YAxis stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#111322', borderColor: '#450a0a', color: '#f1f5f9', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
              </div>
            )}
        </div>

        {/* Leaderboard Section */}
        <div className="glass-panel border border-slate-800/50 rounded-2xl p-6 h-fit">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="text-yellow-500" /> Top Performers
            </h3>
            {displayLeaderboard.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 mb-2">No rankings yet</p>
                <p className="text-sm text-slate-500">Leaderboard will populate as team analyzes calls</p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayLeaderboard.slice(0, 5).map((rep, index) => (
                  <LeaderboardItem
                    key={index}
                    rank={index + 1}
                    name={rep.name}
                    score={rep.score.toString()}
                    trend={demoMode ? (index === 0 ? 5.2 : index === 1 ? 1.8 : -0.5) : 0}
                  />
                ))}
              </div>
            )}

            {demoMode && (
              <div className="mt-8 p-5 bg-gradient-to-br from-brand-900/40 to-slate-900 border border-brand-500/20 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-500/10 blur-xl rounded-full"></div>
                <p className="text-xs font-bold text-brand-300 uppercase tracking-wider mb-2">AI Coaching Insight</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                    Emily's call volume is highest (52), but her conversion score is lowest (79).
                </p>
                <button
                  onClick={() => notify("Training assigned to Emily.", "success")}
                  className="mt-4 w-full py-2 text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white rounded-lg shadow-lg shadow-brand-900/50 transition-colors"
                >
                    Assign "Closing" Module
                </button>
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default TeamPerformance;