import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ShieldCheck, AlertTriangle, FileText, Activity, ScanLine } from 'lucide-react';
import clsx from 'clsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Home = () => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(Object.assign(file, {
        preview: URL.createObjectURL(file)
      }));
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const analyzeImage = () => {
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult({
        diagnosis: 'Bacterial Pneumonia',
        confidence: 0.94,
        severity: 'High',
        heatmap: file.preview, // In real app, this would be a different image
        findings: [
          'Opacification in right lower lobe',
          'Pleural effusion detected',
          'Cardiac silhouette regular'
        ],
        riskHistory: [
          { day: 'M', value: 30 },
          { day: 'T', value: 45 },
          { day: 'W', value: 55 },
          { day: 'T', value: 60 },
          { day: 'F', value: 85 },
          { day: 'S', value: 94 },
          { day: 'S', value: 92 },
        ]
      });
    }, 3000);
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setResult(null);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          AI Diagnostics
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Upload X-Ray scans for instant automated analysis.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <section className="space-y-6">
          <div
            {...getRootProps()}
            className={clsx(
              "relative h-[500px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-300 overflow-hidden group cursor-pointer",
              isDragActive ? "border-primary-500 bg-primary-500/10" : "border-white/10 hover:border-white/20 hover:bg-white/5",
              file && "border-solid border-white/20 bg-dark-800"
            )}
          >
            <input {...getInputProps()} />

            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center p-6"
                >
                  <div className="w-20 h-20 rounded-2xl bg-dark-700 flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-10 h-10 text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Drag & Drop Scan</h3>
                  <p className="text-gray-400 max-w-xs mx-auto">
                    Supported formats: DICOM, PNG, JPEG. MAX size 50MB.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative w-full h-full p-4"
                >
                  <img
                    src={file.preview}
                    alt="Preview"
                    className="w-full h-full object-contain rounded-xl"
                  />
                  {isAnalyzing && (
                    <motion.div
                      className="absolute inset-4 rounded-xl border-2 border-primary-500/50 overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="w-full h-2 bg-primary-500/50 absolute top-0 shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                      />
                      <div className="absolute inset-0 bg-primary-500/10 mix-blend-overlay" />
                      <div className="absolute bottom-8 left-0 right-0 text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-primary-400 font-mono">
                          <ScanLine className="w-4 h-4 animate-spin-slow" />
                          ANALYZING EXPOSURE...
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {!isAnalyzing && !result && (
                    <button
                      onClick={removeFile}
                      className="absolute top-6 right-6 p-2 rounded-full bg-black/50 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setFile(null)}
              disabled={!file || isAnalyzing}
              className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 font-medium transition-colors disabled:opacity-50"
            >
              Clear
            </button>
            <button
              onClick={analyzeImage}
              disabled={!file || isAnalyzing}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="w-5 h-5 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Run Diagnosis
                </>
              )}
            </button>
          </div>
        </section>

        {/* Results Section */}
        <section className="space-y-6">
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Main Card */}
                <div className="p-6 rounded-3xl bg-dark-800 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-32 bg-primary-500/5 blur-[100px] rounded-full pointing-events-none" />

                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">Analysis Result</h2>
                      <p className="text-gray-400 text-sm">ID: #89201-AX • {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className={clsx(
                      "px-4 py-2 rounded-full border flex items-center gap-2",
                      result.severity === 'High' ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-green-500/10 border-green-500/20 text-green-500"
                    )}>
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-bold">{result.severity} Risk</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="56" fill="transparent" stroke="#1c1c2e" strokeWidth="12" />
                        <circle
                          cx="64" cy="64" r="56"
                          fill="transparent"
                          stroke="#0ea5e9"
                          strokeWidth="12"
                          strokeDasharray={351}
                          strokeDashoffset={351 - (351 * result.confidence)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-white">{Math.round(result.confidence * 100)}%</span>
                        <span className="text-xs text-gray-400">Confidence</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-white mb-1">{result.diagnosis}</h3>
                      <p className="text-gray-400 text-sm max-w-[200px]">
                        Algorithm detected patterns consistent with viral infection.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary-400" />
                      Key Findings
                    </h4>
                    <ul className="space-y-2">
                      {result.findings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2" />
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Chart Card */}
                <div className="p-6 rounded-3xl bg-dark-800 border border-white/10 h-64">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-medical-400" />
                    Infection Density Trend
                  </h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.riskHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="day" stroke="#666" tickLine={false} axisLine={false} />
                      <YAxis stroke="#666" tickLine={false} axisLine={false} hide />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#333', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#0a0a0f', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#0ea5e9' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};

export default Home;
