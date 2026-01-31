import React, { useState } from 'react';
import { FileText, Upload, CheckCircle, Clock, File } from 'lucide-react';
import { motion } from 'framer-motion';

const Reports = () => {
  const [reports, setReports] = useState([
    { id: 1, name: 'Blood_Work_Jan_24.pdf', date: '2026-01-24', status: 'Analyzed', summary: 'Normal ranges observed. Slight Vitamin D deficiency.' },
    { id: 2, name: 'MRI_Spine_Dec_12.pdf', date: '2025-12-12', status: 'Analyzed', summary: 'L4-L5 disc herniation detected. Physical therapy recommended.' },
  ]);

  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newReport = {
        id: reports.length + 1,
        name: `Lab_Report_${new Date().toLocaleDateString().replace(/\//g, '_')}.pdf`,
        date: new Date().toISOString().split('T')[0],
        status: 'Analyzed',
        summary: 'Detailed analysis pending. Initial scan indicates elevated WBC count.'
      };
      setReports([newReport, ...reports]);
      setIsUploading(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Medical Reports
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Centralized repository for patient documentation and AI summaries.</p>
        </div>
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="px-6 py-3 rounded-xl bg-white text-dark-900 font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
          Upload Report
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Recent Documents</h3>
          {reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-dark-800 border border-white/10 hover:bg-white/5 transition-colors group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary-500/10 text-primary-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-primary-400 transition-colors">{report.name}</h4>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {report.date}
                    </span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {report.status}
                </div>
              </div>
              <div className="pl-[52px]">
                <p className="text-sm text-gray-400 bg-black/20 p-3 rounded-lg border border-white/5">
                  <span className="text-gray-500 font-medium block text-xs mb-1 uppercase tracking-wider">AI Summary</span>
                  {report.summary}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div>
          <div className="p-6 rounded-3xl bg-dark-800 border border-white/10 sticky top-8">
            <h3 className="text-xl font-bold text-white mb-6">Quick Stats</h3>
            <div className="space-y-6">
              <div>
                <span className="text-gray-500 text-sm block mb-1">Total Reports</span>
                <span className="text-3xl font-bold text-white">{reports.length}</span>
              </div>
              <div>
                <span className="text-gray-500 text-sm block mb-1">Abnormalities Found</span>
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <div className="pt-6 border-t border-white/10">
                <h4 className="text-white font-medium mb-3">Pending Actions</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Review MRI Analysis
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    Sign off on Blood Work
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
