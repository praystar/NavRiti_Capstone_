/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, RefreshCw, Zap, Calendar, Target, 
  TrendingUp, PieChart, ShieldCheck,
  Sparkles, Brain, X,
  CheckCircle, AlertCircle, ChevronRight, Clock // Added Clock icon
} from "lucide-react";
import AppNavbar from "../components/AppNavbar.tsx";
import Background from "../components/Background.tsx";
import { useNavigate } from "react-router-dom"; // Added import

const MARKET_API_BASE = import.meta.env.VITE_MARKET_API_BASE ?? '/market';

// --- Interfaces ---
interface MarketResponse {
  status: string;
  employability_baseline: number;
  analysis_report: string;
  top_careers: any[];
  conclusion?: string;
  metadata: { market_cycle: string };
}

interface ModelStatus {
  name: string;
  key: string;
  route: string;
  completed: boolean;
  data: any;
}

// --- Helper Components ---

const DashboardCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string 
}> = ({ title, value, icon: Icon, color }) => {
  const colorMap: Record<string, string> = {
    indigo: "border-indigo-500/20 from-indigo-500/20 to-indigo-900/20 text-indigo-300",
    purple: "border-purple-500/20 from-purple-500/20 to-purple-900/20 text-purple-300",
    emerald: "border-emerald-500/20 from-emerald-500/20 to-emerald-900/20 text-emerald-300",
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`relative backdrop-blur-xl bg-gray-900/40 border rounded-2xl p-6 shadow-xl ${colorMap[color].split(' ')[0]}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br border ${colorMap[color].split(' ').slice(1, 4).join(' ')}`}>
          <Icon className={colorMap[color].split(' ').pop()} />
        </div>
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

interface CareerPodiumCardProps {
  career: any;
  rank: number;
  highlight?: string;
  isLarge?: boolean;
  onClick?: () => void;
  isActive?: boolean;
}

const CareerPodiumCard: React.FC<CareerPodiumCardProps> = ({ 
  career, 
  rank, 
  highlight, 
  isLarge, 
  onClick, 
  isActive 
}) => {
  const isEmerald = highlight === 'emerald';
  const isIndigo = highlight === 'indigo';
  
  return (
    <motion.div
      whileHover={{ y: -10 }}
      onClick={onClick}
      className={`cursor-pointer p-6 rounded-3xl border transition-all duration-500 relative ${
        isActive ? 'ring-2 ring-white/50' : ''
      } ${
        isLarge ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/40 shadow-2xl shadow-emerald-500/20 scale-110 z-10' :
        isIndigo ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/40 shadow-xl shadow-indigo-500/20 z-5' :
        'bg-gray-900/40 border-gray-700 hover:border-gray-500'
      }`}
    >
      <div className="flex flex-col items-center text-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-4 font-bold text-xs ${
          isEmerald ? 'bg-emerald-500 text-white' : 
          isIndigo ? 'bg-indigo-500 text-white' : 
          'bg-gray-800 text-gray-400'
        }`}>
          #{rank}
        </div>
        
        <h3 className="text-sm font-bold text-white mb-2 leading-tight h-10 flex items-center justify-center">
          {career?.career_name || career?.role || `Career ${rank}`}
        </h3>
        
        <div className={`text-2xl font-black mb-1 ${
          isEmerald ? 'bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent' :
          isIndigo ? 'bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent' :
          'text-gray-400'
        }`}>
          {((career?.market_score || 0) * 100).toFixed(0)}%
        </div>
        
        <div className={`text-[9px] uppercase tracking-widest font-bold ${
          isEmerald ? 'text-emerald-400' : isIndigo ? 'text-indigo-400' : 'text-gray-500'
        }`}>
          Market Match
        </div>
      </div>
    </motion.div>
  );
};

// --- Model Status Panel Component ---

const ModelStatusPanel: React.FC = () => {
  const navigate = useNavigate();
  
  // Check each localStorage item
  const models: ModelStatus[] = [
    {
      name: 'Celestial Analysis',
      key: 'celestial',
      route: '/CelestialMapping',
      completed: Boolean(localStorage.getItem('celestial')),
      data: JSON.parse(localStorage.getItem('celestial') || 'null')
    },
    {
      name: 'Parent Preferences',
      key: 'parentalOutput',
      route: '/ParentForm',
      completed: Boolean(localStorage.getItem('parentalOutput')),
      data: JSON.parse(localStorage.getItem('parentalOutput') || 'null')
    },
    {
      name: 'Societal Insights',
      key: 'societal_result',
      route: '/Societal',
      completed: Boolean(localStorage.getItem('societal_result')),
      data: JSON.parse(localStorage.getItem('societal_result') || 'null')
    },
    {
      name: 'Student Profile',
      key: 'StudentInput',
      route: '/input', // Adjust this to your student form route
      completed: Boolean(localStorage.getItem('StudentInput')),
      data: JSON.parse(localStorage.getItem('StudentInput') || 'null')
    }
  ];

  // Check if data is valid (not just empty object)
  const isValidData = (data: any): boolean => {
    if (!data) return false;
    if (typeof data === 'object' && Object.keys(data).length === 0) return false;
    return true;
  };

  const handleModelClick = (model: ModelStatus) => {
    if (!model.completed) {
      // Navigate to form to complete it
      navigate(model.route);
    } else {
      // Already completed - show history or re-run
      navigate(model.route);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-gray-900/60 border border-indigo-500/30 rounded-3xl p-6 mb-8"
    >
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Activity className="text-indigo-400" />
        Data Collection Status
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        All models must be completed before market analysis. Click on any to view/edit.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((model) => {
          const hasValidData = isValidData(model.data);
          
          return (
            <motion.div
              key={model.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleModelClick(model)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                hasValidData 
                  ? 'border-emerald-500/30 bg-emerald-900/10 hover:bg-emerald-900/20' 
                  : 'border-gray-700/50 bg-gray-900/30 hover:bg-gray-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    hasValidData 
                      ? 'bg-emerald-500/20 border border-emerald-500/30' 
                      : 'bg-gray-800/50 border border-gray-700'
                  }`}>
                    {hasValidData ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{model.name}</h3>
                    <p className={`text-xs ${hasValidData ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {hasValidData ? 'Completed' : 'Incomplete'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {hasValidData && (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                      ✓ Ready
                    </span>
                  )}
                  <ChevronRight className={`w-5 h-5 ${
                    hasValidData ? 'text-emerald-400' : 'text-gray-600'
                  }`} />
                </div>
              </div>
              
              {/* Show data preview if available */}
              {hasValidData && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Last updated:</span>
                    <span className="text-gray-300">
                      {model.data.timestamp 
                        ? new Date(model.data.timestamp).toLocaleDateString() 
                        : 'Recently'}
                    </span>

                  </div>

                  {model.data.output?.top_career_recommendations && (
                    <div className="mt-2 text-xs text-gray-400">
                      {model.data.output.top_career_recommendations.length} careers analyzed
                    </div>
                  )}
                </div>
              )}
              
            </motion.div>
          );
        })}
         <div className="text-gray-400 text-sm mb-6">
  <p>Click any model to open it, then select "View History" to see your previous results.</p>
  <div className="flex items-center gap-2 mt-1 text-xs">
    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></div>
    <span className="text-gray-500">It Includes module-wise predictions and recommendations</span>
  </div>
</div>
      </div>
      
      {/* Overall Status */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-400 text-sm">Overall Completion:</span>
            <p className="text-white font-bold text-lg">
              {models.filter(m => isValidData(m.data)).length} / {models.length} models
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full ${
            models.every(m => isValidData(m.data))
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {models.every(m => isValidData(m.data))
              ? 'Ready for Synthesis'
              : 'Complete all models first'
            }
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Dashboard Component ---

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState<MarketResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [savedResults, setSavedResults] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load dashboard history on mount
  useEffect(() => {
  try {
    const savedRaw = localStorage.getItem('dashboard_result');
    
    if (!savedRaw) {
      setSavedResults([]);
      return;
    }
    
    const parsed = JSON.parse(savedRaw);
    
    // Handle both cases: array or single object
    if (Array.isArray(parsed)) {
      setSavedResults(parsed);
    } else if (parsed && typeof parsed === 'object') {
      // Single object - wrap in array
      setSavedResults([parsed]);
    } else {
      setSavedResults([]);
    }
  } catch (error) {
    console.error('Error loading dashboard history:', error);
    setSavedResults([]);
  }
}, []);

 const runSynthesis = async () => {
  setLoading(true);
  try {
    const celestialRaw = JSON.parse(localStorage.getItem('celestial') || "{}");
    const parentalRaw = JSON.parse(localStorage.getItem('parentalOutput') || "{}");
    const societalRaw = JSON.parse(localStorage.getItem('societal_result') || "{}");
    const studentRaw = JSON.parse(localStorage.getItem('StudentInput') || "{}");

    const stage2 = studentRaw.result?.stage2_result;
    const predictions = stage2?.ai_predictions;

    const payload = {
      celestial_recommendations: celestialRaw.output?.detailed_analysis || [],
      parental_scores: parentalRaw.output?.top_5_parent_scores || [],
      societal_insights: societalRaw.result || {},
      student_stage2: {
        top_career_recommendations: stage2?.top_career_recommendations || [],
        employability_score: predictions?.employability_score || 0,
        score_breakdown: predictions?.score_breakdown || {},
        skill_gap_analysis: predictions?.skill_gap_analysis || {}
      }
    };

    const res = await fetch(`${MARKET_API_BASE}/final-market-ranking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Synthesis Failed");

    const data = await res.json();
    setMarketData(data);

    // ✅ Save ONLY ONE result (latest)
    const dashboardResult = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      inputData: {
        celestial: JSON.parse(localStorage.getItem('celestial') || '{}'),
        parental: JSON.parse(localStorage.getItem('parentalOutput') || '{}'),
        societal: JSON.parse(localStorage.getItem('societal_result') || '{}'),
        student: JSON.parse(localStorage.getItem('StudentInput') || '{}')
      },
      marketData: data,
      summary: `Analysis ${new Date().toLocaleDateString()} - ${data.top_careers?.[0]?.career_name || 'No career'}`
    };

    // Save only the latest result (overwrites previous one)
  // In runSynthesis function, change:
// From:
localStorage.setItem('dashboard_result', JSON.stringify(dashboardResult));
setSavedResults([dashboardResult]);

// To:
const resultArray = [dashboardResult];
localStorage.setItem('dashboard_result', JSON.stringify(resultArray));
setSavedResults(resultArray);

  } catch (err) {
    console.error("Synthesis failed:", err);
  } finally {
    setLoading(false);
  }
};

  // Check if all models have valid data
  const checkAllModelsComplete = (): boolean => {
    const modelKeys = ['celestial', 'parentalOutput', 'societal_result', 'StudentInput'];
    
    return modelKeys.every(key => {
      const data = JSON.parse(localStorage.getItem(key) || 'null');
      if (!data) return false;
      if (typeof data === 'object' && Object.keys(data).length === 0) return false;
      return true;
    });
  };

  const allModelsComplete = checkAllModelsComplete();

  const loadHistoryResult = (result: any) => {
    setMarketData(result.marketData);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      <AppNavbar showAuthLinks={false} />
      <Background intensity="medium" showConstellations={true} />
  
      <div className="relative max-w-6xl mx-auto px-4 pt-28 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="inline-flex items-center px-4 py-2 rounded-full backdrop-blur-sm bg-indigo-500/10 border border-indigo-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-300 mr-2" />
              <span className="text-sm font-medium text-indigo-300">Strategic Career Synthesis</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-lg">Market Reality Analysis </p>
          </motion.div>

          <div className="flex gap-4">
            {/* History button */}
         
            
            {allModelsComplete ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={runSynthesis}
                disabled={loading}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold flex items-center gap-3 shadow-2xl shadow-indigo-500/20 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="animate-spin" /> : <Activity />}
                {loading ? "Synthesizing..." : "Analyze Market Reality"}
              </motion.button>
            ) : (
              <motion.button
                disabled
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-800 text-gray-400 font-bold flex items-center gap-3 cursor-not-allowed"
              >
                <AlertCircle className="w-5 h-5" />
                Complete all forms to enable analysis
              </motion.button>
            )}
          </div>
        </div>

        {/* Model Status Panel */}
        <ModelStatusPanel />

        {/* History Modal */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gray-900/90 border border-indigo-500/30 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Dashboard History</h3>
                  <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/10 rounded-full">
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {savedResults.map((result, idx) => (
                    <div key={result.id} className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-900/10 hover:bg-indigo-900/20 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-bold">
                            Analysis #{savedResults.length - idx}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {new Date(result.timestamp).toLocaleString()}
                          </p>
                          {result.marketData?.top_careers?.[0] && (
                            <p className="text-emerald-300 text-sm mt-1">
                              Top match: {result.marketData.top_careers[0].career_name} ({((result.marketData.top_careers[0].market_score || 0) * 100).toFixed(0)}%)
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => loadHistoryResult(result)}
                          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors"
                        >
                          Load
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {savedResults.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No saved results yet</p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
  
        {marketData ? (
          <div className="space-y-10">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DashboardCard 
                title="Readiness" 
                value={`${marketData.employability_baseline || 0}%`} 
                icon={Zap} 
                color="indigo" 
              />
              <DashboardCard 
                title="Cycle" 
                value={marketData.metadata?.market_cycle || "2026-Q1"} 
                icon={Calendar} 
                color="purple" 
              />
              <DashboardCard 
                title="Status" 
                value="Strategic" 
                icon={ShieldCheck} 
                color="emerald" 
              />
            </div>

            {/* Main Highlight Card - Replicating the "Doctor" Card UI */}
            {marketData.top_careers && marketData.top_careers.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative backdrop-blur-xl bg-gray-900/60 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} className="text-emerald-400" />
                      <span className="text-emerald-400 font-bold tracking-widest text-[10px] uppercase">RECOMMENDED</span>
                    </div>
                    <h2 className="text-5xl font-black text-white">
                      {marketData.top_careers[0].career_name}
                    </h2>
                    <p className="text-emerald-300/80 text-lg mt-2">
                      Here's why {marketData.top_careers[0].career_name} is a strategic powerhouse for 2026:
                    </p>
                  </div>
                  <div className="relative w-32 h-32 flex flex-col items-center justify-center rounded-full border-4 border-emerald-500/30 bg-emerald-500/5">
                    <span className="text-3xl font-black text-emerald-400">
                      {((marketData.top_careers[0].market_score || 0) * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-emerald-300 font-bold uppercase">Market Match</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Market Fit Card */}
                  <div className="flex gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-900/10">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {marketData.top_careers[0].market_explanation}
                    </p>
                  </div>

                  {/* Focus Area Card */}
                  <div className="flex gap-3 p-4 rounded-xl border border-indigo-500/20 bg-indigo-900/10">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <p className="text-gray-300 text-sm leading-relaxed">
                      <span className="text-indigo-300 font-bold">Focus Area:</span> {marketData.top_careers[0].focus_area}
                    </p>
                  </div>

                  {/* Steps Mapped to Grid */}
                  {marketData.top_careers[0].achieving_steps && marketData.top_careers[0].achieving_steps.map((step: string, idx: number) => (
                    <div key={idx} className="flex gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <p className="text-gray-300 text-sm leading-relaxed">
                        <span className="text-indigo-400 font-bold">Phase 0{idx + 1}:</span> {step}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
  
            {/* Expert Analysis Summary Report */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-gray-900/60 border border-indigo-500/30 rounded-3xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Brain className="text-emerald-400" />
                Market Outlook Analysis
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-line text-lg bg-white/5 p-6 rounded-2xl border border-white/5">
                  {marketData.analysis_report || "The analysis report is being generated..."}
                </p>
                {marketData.conclusion && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <span className="text-indigo-300 font-bold block mb-2 text-xs uppercase tracking-widest">Final Verdict</span>
                    <p className="text-gray-300 italic">{marketData.conclusion}</p>
                  </div>
                )}
              </div>
            </motion.div>
  
            {/* Career Podium Layout */}
            {marketData.top_careers && marketData.top_careers.length > 0 && (
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <Target className="text-indigo-400 w-8 h-8" />
                  <h2 className="text-2xl font-bold text-white">Top 5 Market Alignments</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end pt-10">
                  <CareerPodiumCard 
                    career={marketData.top_careers[3]} rank={4} 
                    onClick={() => setExpandedIdx(expandedIdx === 3 ? null : 3)}
                    isActive={expandedIdx === 3}
                  />
                  <CareerPodiumCard 
                    career={marketData.top_careers[1]} rank={2} highlight="indigo"
                    onClick={() => setExpandedIdx(expandedIdx === 1 ? null : 1)}
                    isActive={expandedIdx === 1}
                  />
                  <CareerPodiumCard 
                    career={marketData.top_careers[0]} rank={1} highlight="emerald" isLarge={true}
                    onClick={() => setExpandedIdx(expandedIdx === 0 ? null : 0)}
                    isActive={expandedIdx === 0}
                  />
                  <CareerPodiumCard 
                    career={marketData.top_careers[2]} rank={3} highlight="indigo"
                    onClick={() => setExpandedIdx(expandedIdx === 2 ? null : 2)}
                    isActive={expandedIdx === 2}
                  />
                  <CareerPodiumCard 
                    career={marketData.top_careers[4]} rank={5} 
                    onClick={() => setExpandedIdx(expandedIdx === 4 ? null : 4)}
                    isActive={expandedIdx === 4}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {expandedIdx !== null && expandedIdx !== 0 && marketData.top_careers[expandedIdx] && (
                    <motion.div
                      key={expandedIdx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="backdrop-blur-xl bg-indigo-900/30 border border-indigo-500/30 rounded-3xl p-8 mt-6 shadow-inner"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold border border-indigo-500/30">
                            #{expandedIdx + 1}
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold text-white">
                              {marketData.top_careers[expandedIdx].career_name}
                            </h3>
                            <p className="text-indigo-300 flex items-center gap-2">
                               <TrendingUp size={14}/> Strategic Execution Roadmap
                            </p>
                          </div>
                        </div>
                        <button onClick={() => setExpandedIdx(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                          <X className="text-gray-400" />
                        </button>
                      </div>
                      
                      <p className="text-gray-200 text-lg leading-relaxed mb-8 border-l-4 border-indigo-500/40 pl-6">
                        {marketData.top_careers[expandedIdx].market_explanation}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {marketData.top_careers[expandedIdx].achieving_steps && 
                         marketData.top_careers[expandedIdx].achieving_steps.map((step: string, sIdx: number) => (
                          <div key={sIdx} className="bg-gray-900/50 p-5 rounded-2xl border border-indigo-500/20 group hover:border-indigo-500/50 transition-all">
                            <span className="text-indigo-400 font-bold block mb-2 text-xs uppercase tracking-widest">Phase 0{sIdx + 1}</span>
                            <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-40 border border-dashed border-indigo-500/20 rounded-3xl bg-gray-900/20 backdrop-blur-md"
          >
             <PieChart className="w-16 h-16 text-gray-700 mx-auto mb-4" />
             <h3 className="text-xl font-semibold text-gray-400">Awaiting Market Data</h3>
             <p className="text-gray-500 mt-2">
               {allModelsComplete 
                 ? 'Click "Analyze Market Reality" to process your results.' 
                 : 'Complete all forms above to enable market analysis.'}
             </p>
          </motion.div>
        )}
      </div>
      {/* Floating History Button (Bottom Right) */}
{savedResults.length > 0 && (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setShowHistory(!showHistory)}
    className="fixed bottom-8 right-8 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold flex items-center gap-3 shadow-2xl shadow-purple-500/30 z-40"
  >
    <Clock className="w-5 h-5" />
    History
  </motion.button>
)}
    </div>
  );
};

export default Dashboard;