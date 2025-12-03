
import React, { useContext } from 'react';
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
import { ArrowUpRight, CheckCircle2, Mic, Users, Clock, Zap } from 'lucide-react';
import { NotificationContext } from '../App';

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

      {!demoMode ? (
        <div className="glass-panel rounded-2xl p-16 border border-slate-800/50 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart size={40} className="text-slate-600" />
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
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Calls Analyzed"
              value="1,284"
              change="+12%"
              icon={Mic}
              color="text-brand-400"
              bgGradient="from-brand-500 to-red-600"
            />
            <StatCard
              title="Avg. Quality Score"
              value="84"
              change="+4.5%"
              icon={Zap}
              color="text-accent-400"
              bgGradient="from-accent-500 to-orange-600"
            />
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
          </div>
        </>
      )}

      {demoMode && (
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
                <BarChart data={mockActivityData}>
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
        </div>
      )}
    </div>
  );
};

export default Dashboard;
