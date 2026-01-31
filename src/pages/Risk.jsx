import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Activity, Heart, Thermometer, Brain, AlertCircle } from 'lucide-react';

const RiskData = [
  { month: 'Jan', heartRate: 72, risk: 20 },
  { month: 'Feb', heartRate: 75, risk: 25 },
  { month: 'Mar', heartRate: 80, risk: 40 },
  { month: 'Apr', heartRate: 78, risk: 35 },
  { month: 'May', heartRate: 85, risk: 60 },
  { month: 'Jun', heartRate: 82, risk: 55 },
];

const PredictionData = [
  { name: 'Pneumonia', prob: 85, color: '#0ea5e9' },
  { name: 'Cardiomegaly', prob: 45, color: '#34d399' },
  { name: 'Fibrosis', prob: 20, color: '#fbbf24' },
  { name: 'Effusion', prob: 60, color: '#f87171' },
];

const Risk = () => {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Risk Analysis
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Predictive health insights and trend monitoring.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vital Cards */}
        <div className="p-6 rounded-3xl bg-dark-800 border border-white/10 flex flex-col justify-between group hover:border-primary-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-red-500/10 text-red-500">
              <Heart className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full">+2.4%</span>
          </div>
          <div>
            <span className="text-4xl font-bold text-white block mb-1">98 <span className="text-lg text-gray-400 font-normal">bpm</span></span>
            <span className="text-gray-400 text-sm">Avg. Heart Rate</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-dark-800 border border-white/10 flex flex-col justify-between group hover:border-primary-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">-1.2%</span>
          </div>
          <div>
            <span className="text-4xl font-bold text-white block mb-1">96 <span className="text-lg text-gray-400 font-normal">%</span></span>
            <span className="text-gray-400 text-sm">Oxygen Saturation</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-dark-800 border border-white/10 flex flex-col justify-between group hover:border-primary-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
              <Brain className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">Stable</span>
          </div>
          <div>
            <span className="text-4xl font-bold text-white block mb-1">Low <span className="text-lg text-gray-400 font-normal">Risk</span></span>
            <span className="text-gray-400 text-sm">Neural Activity</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Chart */}
        <div className="p-6 rounded-3xl bg-dark-800 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Patient Health Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RiskData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#666" axisLine={false} tickLine={false} />
                <YAxis stroke="#666" axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#333', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="risk" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Stats */}
        <div className="p-6 rounded-3xl bg-dark-800 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6">Condition Probability</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PredictionData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} tick={{ fontSize: 14 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#333', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="prob" radius={[0, 4, 4, 0]} barSize={30}>
                  {PredictionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-primary-900/40 to-dark-800 border border-primary-500/20 flex items-start gap-4">
        <div className="p-3 rounded-full bg-primary-500/20 text-primary-400 mt-1">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-white mb-2">AI Recommendation</h4>
          <p className="text-gray-300 leading-relaxed">
            Based on the recent trend analysis, the patient shows a <span className="text-white font-bold">24% increase</span> in inflammatory markers. It is recommended to schedule a follow-up CT scan within the next 48 hours to rule out potential complications in the lower respiratory tract.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Risk;
