
import React, { useState, useContext } from 'react';
import { Campaign } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Megaphone, 
  Plus, 
  TrendingUp, 
  Phone, 
  DollarSign, 
  Users, 
  Calendar, 
  ChevronRight, 
  Filter
} from 'lucide-react';
import { NotificationContext } from '../App';

const mockCampaigns: Campaign[] = [
  { 
    id: '1', 
    name: 'Q4 Enterprise Outreach', 
    status: 'Active', 
    startDate: '2023-10-01', 
    totalCalls: 1240, 
    avgScore: 82, 
    revenue: 450000, 
    teamMembers: ['Alex', 'Sarah', 'James'] 
  },
  { 
    id: '2', 
    name: 'SMB Cold Call Blitz', 
    status: 'Active', 
    startDate: '2023-11-15', 
    totalCalls: 850, 
    avgScore: 76, 
    revenue: 125000, 
    teamMembers: ['Emily', 'Michael'] 
  },
  { 
    id: '3', 
    name: 'Webinar Follow-up', 
    status: 'Paused', 
    startDate: '2023-09-01', 
    totalCalls: 320, 
    avgScore: 88, 
    revenue: 68000, 
    teamMembers: ['Alex', 'James'] 
  },
];

const repPerformanceData = [
  { name: 'Alex', calls: 145, conversion: 22 },
  { name: 'Sarah', calls: 132, conversion: 28 },
  { name: 'James', calls: 160, conversion: 18 },
  { name: 'Emily', calls: 98, conversion: 25 },
];

const Campaigns: React.FC = () => {
  const { notify } = useContext(NotificationContext);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>(mockCampaigns[0]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
             <Megaphone className="text-brand-500" size={32} /> Campaign Command
          </h1>
          <p className="text-slate-400">Track stats and performance for specific sales initiatives.</p>
        </div>
        <button 
          onClick={() => notify("Campaign creation wizard started.", "info")}
          className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 transition-all"
        >
          <Plus size={18} /> New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaign List */}
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Campaigns</h3>
                <button className="text-slate-500 hover:text-white transition-colors"><Filter size={16}/></button>
            </div>
            {mockCampaigns.map(campaign => (
                <div 
                    key={campaign.id}
                    onClick={() => setSelectedCampaign(campaign)}
                    className={`p-5 rounded-xl border cursor-pointer transition-all group relative overflow-hidden ${
                        selectedCampaign.id === campaign.id 
                        ? 'bg-brand-900/20 border-brand-500 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'
                    }`}
                >
                    <div className="flex justify-between items-start mb-3 relative z-10">
                        <div>
                            <h4 className={`font-bold text-lg ${selectedCampaign.id === campaign.id ? 'text-white' : 'text-slate-300'}`}>
                                {campaign.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${campaign.status === 'Active' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                                <span className="text-xs text-slate-500 font-medium">{campaign.status}</span>
                            </div>
                        </div>
                        <ChevronRight className={`transition-transform ${selectedCampaign.id === campaign.id ? 'text-brand-400 translate-x-1' : 'text-slate-600'}`} size={20} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 relative z-10">
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Calls</p>
                            <p className="text-sm font-bold text-slate-200">{campaign.totalCalls}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Revenue</p>
                            <p className="text-sm font-bold text-slate-200">${(campaign.revenue / 1000).toFixed(1)}k</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Campaign Analytics Detail View */}
        <div className="lg:col-span-2 glass-panel border border-slate-800/50 rounded-2xl p-8 animate-fade-in">
             <div className="flex justify-between items-start mb-8 border-b border-slate-800/50 pb-6">
                 <div>
                     <h2 className="text-2xl font-bold text-white mb-2">{selectedCampaign.name}</h2>
                     <div className="flex items-center gap-4 text-sm text-slate-400">
                         <span className="flex items-center gap-1.5"><Calendar size={14}/> Started {selectedCampaign.startDate}</span>
                         <span className="flex items-center gap-1.5"><Users size={14}/> {selectedCampaign.teamMembers.length} Reps Assigned</span>
                     </div>
                 </div>
                 <div className="text-right">
                     <p className="text-sm text-slate-500 uppercase tracking-wider font-bold">Total Revenue</p>
                     <p className="text-3xl font-bold text-white tracking-tight">${selectedCampaign.revenue.toLocaleString()}</p>
                 </div>
             </div>

             <div className="grid grid-cols-3 gap-4 mb-8">
                 <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                     <div className="flex items-center gap-2 mb-2 text-slate-400">
                         <Phone size={16} /> <span className="text-xs font-bold uppercase">Total Calls</span>
                     </div>
                     <p className="text-2xl font-bold text-white">{selectedCampaign.totalCalls}</p>
                 </div>
                 <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                     <div className="flex items-center gap-2 mb-2 text-slate-400">
                         <TrendingUp size={16} /> <span className="text-xs font-bold uppercase">Avg Score</span>
                     </div>
                     <p className="text-2xl font-bold text-accent-400">{selectedCampaign.avgScore}</p>
                 </div>
                 <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                     <div className="flex items-center gap-2 mb-2 text-slate-400">
                         <DollarSign size={16} /> <span className="text-xs font-bold uppercase">Conversion</span>
                     </div>
                     <p className="text-2xl font-bold text-emerald-400">18.5%</p>
                 </div>
             </div>

             <h3 className="text-lg font-bold text-white mb-6">Rep Performance Comparison</h3>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={repPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2030" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                        <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 12}} orientation="left" axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" stroke="#64748b" tick={{fontSize: 12}} orientation="right" axisLine={false} tickLine={false} unit="%" />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#111322', borderColor: '#450a0a', color: '#f1f5f9', borderRadius: '8px' }}
                            cursor={{ fill: '#1e2030' }}
                        />
                        <Bar yAxisId="left" dataKey="calls" fill="#dc2626" radius={[4, 4, 0, 0]} name="Calls Made" barSize={40} />
                        <Bar yAxisId="right" dataKey="conversion" fill="#f97316" radius={[4, 4, 0, 0]} name="Conversion Rate %" barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
