/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import {
  Save,
  RotateCcw,
  Wand2,
  Wallet,
  Shield,
  Award,
  MapPin,
  Plane,
  Ban,
  CheckCircle,
  AlertTriangle,
  Users,
  Globe,
  Star,
  Sparkles,
  Zap,
  Brain,
  Target,
  History,
  X,
  ChevronDown,
  ChevronUp,
  Home,
  Flag,
  Globe2,
} from "lucide-react";
import AppNavbar from "../components/AppNavbar.tsx";
import Background from "../components/Background.tsx";

const SERVER_BASE = import.meta.env.VITE_SERVER_BASE_API ?? '/api';


// New type matching AI server format
type AIRequestBody = {
  budget_max_tuition: number;
  importance_finances: number;      // 1-5
  importance_job_security: number;  // 1-5
  importance_prestige: number;      // 1-5
  parent_risk_tolerance: number;    // 1-5
  influence_from_people: number;    // 1-5
  location_preference: "local" | "national" | "international";
  migration_allowed: boolean;
  unacceptable_careers: string[];
};

type AIResponse = {
  top_5_parent_scores: Array<{
    career_id: string;
    parent_score: number;
  }>;
  final_recommendation: {
    career_id: string;
    parent_score: number;
    parent_explanation: string;
  };
};

type LocalStorageData = {
  timestamp: string;
  input: {
    // Store percentages as user sees them
    financial_stability_weight: number; // 0-100%
    job_security_weight: number;        // 0-100%
    prestige_weight: number;           // 0-100%
    parent_risk_tolerance: number;     // 0-100%
    weight_on_parent_layer: number;    // 0-100%
    location_preference: "local" | "national" | "international";
    migration_willingness: boolean;
    budget_constraints: { max_tuition_per_year: number };
    unacceptable_professions: string[];
  };
  output: AIResponse;
};

// Helper functions
const percentageTo1To5 = (percentage: number): number => {
  // Convert 0-100% to 1-5 scale
  // 0-20% = 1, 21-40% = 2, 41-60% = 3, 61-80% = 4, 81-100% = 5
  if (percentage <= 20) return 1;
  if (percentage <= 40) return 2;
  if (percentage <= 60) return 3;
  if (percentage <= 80) return 4;
  return 5;
};

const clampPercentage = (v: number) => Math.max(0, Math.min(100, v));

// Format career ID: capitalizes first letter of each word and replaces _ with space
const formatCareerId = (id: string): string => {
  if (!id) return "";
  return id
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};


// Enhanced RangeInput with percentage display
const RangeInput = ({ 
  label, 
  value, // 0-100%
  onChange, 
  icon: Icon, 
  error 
}: { 
  label: string; 
  value: number; 
  onChange: (val: number) => void; 
  icon: any; 
  error?: string 
}) => {
  const scaleLabels = ["Low", "Below Avg", "Average", "Above Avg", "High"];
  const scaleIndex = Math.floor(value / 20);
  
  return (
    <div className="relative group">
      <div className="relative backdrop-blur-sm bg-gray-900/40 border border-indigo-500/20 rounded-2xl p-5 transition-all duration-300 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
              <Icon size={18} className="text-indigo-300" />
            </div>
            <div>
              <div className="font-semibold text-white">{label}</div>
              <div className="text-xs text-gray-400">{scaleLabels[scaleIndex] || "High"} priority</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              {Math.round(value)}%
            </span>
          </div>
        </div>
        
        <div className="relative">
          {/* Custom track */}
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            {/* Filled portion with gradient */}
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${value}%` }}
            ></div>
          </div>
          
          {/* Hidden input */}
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-transparent"
          />
          
          {/* Custom thumb */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-white to-indigo-200 border-2 border-indigo-400 shadow-lg shadow-indigo-500/50 transition-transform hover:scale-125 pointer-events-none"
            style={{ left: `${value}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 text-red-400 text-xs mt-2"
          >
            <AlertTriangle size={12} />
            {error}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Enhanced Select Input with better styling - NO LOGOS in options
const EnhancedSelect = ({ 
  label, 
  value, 
  onChange, 
  options, 
  icon: Icon,
  error 
}: { 
  label: string; 
  value: string; 
  onChange: (val: any) => void; 
  options: Array<{ value: string; label: string; description?: string; icon?: any }>; 
  icon: any;
  error?: string 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-10" ref={dropdownRef}>
      <div className="backdrop-blur-sm bg-gray-900/40 border border-indigo-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
            <Icon size={18} className="text-indigo-300" />
          </div>
          <div>
            <div className="font-semibold text-white">{label}</div>
            <div className="text-xs text-gray-400">Select an option</div>
          </div>
        </div>
        
        <div className="relative">
          <button
            type="button"
            className="w-full backdrop-blur-sm bg-gray-900/30 border border-gray-700 rounded-xl px-4 py-3 text-white flex items-center justify-between cursor-pointer hover:bg-gray-800/30 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-2">
              {selectedOption?.icon && (
                <selectedOption.icon size={16} className="text-indigo-300" />
              )}
              <span>{selectedOption?.label || "Select..."}</span>
            </div>
            <ChevronDown 
              size={20} 
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
          
          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-indigo-500/30 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`w-full text-left px-4 py-3 hover:bg-indigo-500/10 transition-colors flex items-center gap-2 ${
                    value === opt.value ? 'bg-indigo-500/20' : ''
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  {opt.icon && (
                    <opt.icon size={16} className="text-indigo-300" />
                  )}
                  <div>
                    <div className="text-white font-medium">{opt.label}</div>
                    {opt.description && (
                      <div className="text-xs text-gray-400">{opt.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {selectedOption?.description && (
          <div className="mt-2 text-xs text-gray-400">
            {selectedOption.description}
          </div>
        )}
        
        {error && (
          <div className="text-red-400 text-xs mt-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
// Enhanced Migration Switch Component with dot indicators
const MigrationSwitch = ({ 
  label, 
  value, 
  onChange, 
  icon: Icon,
  error 
}: { 
  label: string; 
  value: boolean; 
  onChange: (val: boolean) => void; 
  icon: any;
  error?: string 
}) => (
  <div className="relative group">
    <div className={`relative backdrop-blur-sm border rounded-2xl p-5 transition-all duration-300 hover:shadow-lg ${
      value 
        ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 hover:border-emerald-500/40 hover:shadow-emerald-500/20' 
        : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:border-amber-500/40 hover:shadow-amber-500/20'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${
            value 
              ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30' 
              : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30'
          }`}>
            <Icon size={18} className={value ? 'text-emerald-300' : 'text-amber-300'} />
          </div>
          <div>
            <div className="font-semibold text-white">{label}</div>
            <div className="text-xs text-gray-400">Click to toggle ON/OFF</div>
          </div>
        </div>
        
        {/* Enhanced ON/OFF Switch with dot indicator */}
        <button
          type="button"
          onClick={() => onChange(!value)}
          className="relative flex items-center focus:outline-none"
        >
          {/* Switch container */}
          <div className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
            value 
              ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30' 
              : 'bg-gradient-to-r from-amber-500/30 to-orange-500/30'
          }`}>
            {/* Dot indicator */}
            <div className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full transition-all duration-300 ${
              value 
                ? 'left-8 bg-gradient-to-br from-emerald-400 to-teal-400 shadow-lg shadow-emerald-500/50' 
                : 'left-2 bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg shadow-amber-500/50'
            }`}>
              {/* Inner dot */}
              <div className={`absolute inset-1 rounded-full ${
                value 
                  ? 'bg-gradient-to-br from-emerald-200 to-emerald-100' 
                  : 'bg-gradient-to-br from-amber-200 to-amber-100'
              }`}></div>
            </div>
            
            {/* ON/OFF labels */}
            <span className={`absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold transition-all duration-300 ${
              value ? 'opacity-0' : 'opacity-100 text-amber-300'
            }`}>
              OFF
            </span>
            <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold transition-all duration-300 ${
              value ? 'opacity-100 text-emerald-300' : 'opacity-0'
            }`}>
              ON
            </span>
          </div>
        </button>
      </div>
      
      <div className={`text-xs mt-2 ${
        value ? 'text-emerald-400' : 'text-amber-400'
      }`}>
        {value ? "ᯓ✈︎ Migration is allowed for career opportunities" : "⋆˚꩜｡ Migration is not allowed"}
      </div>
      
      {error && (
        <div className="flex items-center gap-1 text-red-400 text-xs mt-2">
          <AlertTriangle size={12} />
          {error}
        </div>
      )}
    </div>
  </div>
);

export default function ParentForm() {
  const [expanded, setExpanded] = useState(false);
    const [expandedBulletPoints, setExpandedBulletPoints] = useState<Record<number, boolean>>({});

  // --- STATE MANAGEMENT (Store percentages 0-100%) ---
  const [financial, setFinancial] = useState<number>(50); // 0-100%
  const [jobSecurity, setJobSecurity] = useState<number>(50);
  const [prestige, setPrestige] = useState<number>(50);
  const [riskTolerance, setRiskTolerance] = useState<number>(50);
  const [weightOnParent, setWeightOnParent] = useState<number>(50);

  const [location, setLocation] = useState<AIRequestBody["location_preference"]>("national");
  const [migrationAllowed, setMigrationAllowed] = useState<boolean>(true);

  const [maxTuition, setMaxTuition] = useState<number>(30000);
  const [unacceptable, setUnacceptable] = useState<string>(""); 

  const [loading, setLoading] = useState(false);
  const [serverResult, setServerResult] = useState<any | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<LocalStorageData | null>(null);
  const navigate = useNavigate();

  // Load history on mount
  useEffect(() => {
    console.log('\n=== parental ===');
console.log(JSON.parse(localStorage.getItem('parentalOutput') || 'null'));
    const saved = localStorage.getItem("parentalOutput");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistoryData(parsed);
      } catch (e) {
        console.error("Failed to parse saved data:", e);
      }
    }
  }, []);

  // --- VALIDATION ---
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    
    // Validate tuition (no leading zeros issue fixed)
    if (isNaN(maxTuition) || maxTuition < 0) {
      e.maxTuition = "Must be a positive number";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // --- API CALL ---
 // --- API CALL --- FIXED VERSION
const onSubmit = async (ev?: React.FormEvent) => {
  ev?.preventDefault();
  setServerResult(null);
  if (!validate()) return;

  // Convert percentages to 1-5 scale for backend
  const payload: AIRequestBody = {
    budget_max_tuition: Number(maxTuition),
    importance_finances: percentageTo1To5(financial),
    importance_job_security: percentageTo1To5(jobSecurity),
    importance_prestige: percentageTo1To5(prestige),
    parent_risk_tolerance: percentageTo1To5(riskTolerance),
    influence_from_people: percentageTo1To5(weightOnParent),
    location_preference: location,
    migration_allowed: migrationAllowed,
    unacceptable_careers: unacceptable.split(",").map(s => s.trim()).filter(Boolean)
  };

  try {
    setLoading(true);
    const res = await fetch(`${SERVER_BASE}/parent/preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || `Server ${res.status}: ${res.statusText}`);
    }

    // ✅ FIRST: Set the server result (triggers UI if needed)
    setServerResult({ ok: true, data });
    
    // ✅ Save to localStorage - Store percentages as user input
    if (data.status === "success" && data.ai_response) {
      const saveData: LocalStorageData = {
        timestamp: new Date().toISOString(),
        input: {
          financial_stability_weight: financial, // Store as percentage
          job_security_weight: jobSecurity,      // Store as percentage
          prestige_weight: prestige,            // Store as percentage
          parent_risk_tolerance: riskTolerance, // Store as percentage
          weight_on_parent_layer: weightOnParent, // Store as percentage
          location_preference: location,
          migration_willingness: migrationAllowed,
          budget_constraints: { max_tuition_per_year: maxTuition },
          unacceptable_professions: unacceptable.split(",").map(s => s.trim()).filter(Boolean)
        },
        output: data.ai_response
      };
      
      localStorage.setItem("parentalOutput", JSON.stringify(saveData));
      setHistoryData(saveData);
    }
    
    // ✅ Navigation happens LAST - after everything is saved
    setTimeout(() => {
      navigate('/Societal');
    }, 1500);
    
  } catch (err) {
    setServerResult({ 
      ok: false, 
      error: (err as Error).message || String(err),
      timestamp: new Date().toISOString()
    });
  } finally {
    setLoading(false);
  }
};

  // --- LOAD HISTORY ---
  const loadHistory = () => {
    if (!historyData) return;
    
    const { input } = historyData;
    
    // Load percentages as stored
    setFinancial(input.financial_stability_weight);
    setJobSecurity(input.job_security_weight);
    setPrestige(input.prestige_weight);
    setRiskTolerance(input.parent_risk_tolerance);
    setWeightOnParent(input.weight_on_parent_layer);
    
    setLocation(input.location_preference);
    setMigrationAllowed(input.migration_willingness);
    setMaxTuition(input.budget_constraints.max_tuition_per_year);
    setUnacceptable(input.unacceptable_professions.join(", "));
    
    setServerResult({ ok: true, data: { ai_response: historyData.output } });
    setShowHistory(false);
  };

  // --- QUICK FILL ---
  const handleQuickFill = () => {
    const r = () => Math.floor(Math.random() * 100);
    const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

    setFinancial(r());
    setJobSecurity(r());
    setPrestige(r());
    setRiskTolerance(r());
    setWeightOnParent(r());

    setLocation(pick(["local", "national", "international"]));
    setMigrationAllowed(pick([true, false]));

    setMaxTuition(Math.floor(Math.random() * 90000) + 10000);

    const pool = [
      "Engineer", "Doctor", "Pilot", "Artist", "Lawyer", 
      "Chef", "Teacher", "Scientist", "Musician", "Writer", 
      "Architect", "Soldier", "Banker"
    ];
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    
    setUnacceptable(shuffled.slice(0, 3).join(", "));

    setErrors({});
  };

  // --- RESET ---
  const handleReset = () => {
    setFinancial(50); 
    setJobSecurity(50); 
    setPrestige(50);
    setRiskTolerance(50);
    setWeightOnParent(50);
    
    setLocation("national"); 
    setMigrationAllowed(true);
    
    setMaxTuition(30000); 
    setUnacceptable("");
    
    setErrors({});
    setServerResult(null);
  };

  // Format explanation text
  const formatExplanation = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Format ID to a star name
  const formatStarName = (id: string) => {
    if (!id) return "NEW-STAR";
    const starNames = [
      "Sirius", "Canopus", "Arcturus", "Vega", "Capella",
      "Rigel", "Procyon", "Achernar", "Betelgeuse", "Hadar",
      "Altair", "Aldebaran", "Spica", "Antares", "Pollux"
    ];
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return starNames[hash % starNames.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      <AppNavbar showAuthLinks={false} />
      <Background intensity="medium" showConstellations={true} showZodiac={true} showPlanets={true} />
      
      {/* Add custom scrollbar styles */}
<style>{`
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(99, 102, 241, 0.5) rgba(31, 41, 55, 0.5);
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.3);
    border-radius: 10px;
    margin: 4px 0;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.5);
    border-radius: 10px;
    border: 1px solid rgba(99, 102, 241, 0.2);
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(99, 102, 241, 0.7);
  }

  .custom-scrollbar::-webkit-scrollbar-corner {
    background: transparent;
  }
`}</style>
      {/* History Button */}
      <button
        onClick={() => setShowHistory(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl backdrop-blur-sm bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 hover:text-white hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 group"
      >
        <History size={20} className="group-hover:rotate-12 transition-transform" />
        <span className="font-medium">History</span>
      </button>

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
              className="relative backdrop-blur-xl bg-gray-900/90 border border-indigo-500/30 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl shadow-indigo-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-indigo-500/30 p-6 bg-gradient-to-r from-gray-900 to-indigo-900/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                      <History className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Saved Cosmic Analysis</h3>
                      <p className="text-gray-400 text-sm">Load your previous celestial alignment</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {historyData ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                      <div className="text-sm text-emerald-400 font-medium mb-1">Last Celestial Analysis</div>
                      <div className="text-lg font-bold text-white mb-2">
                        {formatCareerId(historyData.output.final_recommendation.career_id)}
                      </div>
                      <div className="text-sm text-gray-300">
                        {new Date(historyData.timestamp).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl backdrop-blur-sm bg-gray-800/30 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1">Top Match</div>
                        <div className="text-lg font-bold text-white">
                          {formatCareerId(historyData.output.final_recommendation.career_id)}
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent mt-2">
                          {(historyData.output.final_recommendation.parent_score * 100).toFixed(1)}%
                        </div>
                      </div>

                      <div className="p-4 rounded-xl backdrop-blur-sm bg-gray-800/30 border border-gray-700">
                        <div className="text-xs text-gray-400 mb-1">Other Matches</div>
                        <div className="space-y-1">
                          {historyData.output.top_5_parent_scores.slice(1, 3).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-300">{formatCareerId(item.career_id)}</span>
                              <span className="text-emerald-400">{(item.parent_score * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={loadHistory}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/30"
                    >
                      Load This Cosmic Alignment
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-gray-800/30 to-gray-900/30 border border-gray-700 inline-block mb-4">
                      <History className="w-12 h-12 text-gray-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">No History Found</h4>
                    <p className="text-gray-400">Submit a cosmic analysis to save it here</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-6xl mx-auto px-4 pt-28 pb-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full backdrop-blur-sm bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-6">
            <Users className="w-4 h-4 text-indigo-300 mr-2" />
            <span className="text-sm font-medium bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              Family  Input
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Parental Influence
            </span>
            <br />
            <span className="text-3xl md:text-4xl text-gray-300"></span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Share your family's values and constraints. We'll align them with celestial wisdom to guide your child's career path.
          </p>
        </motion.div>

        <form onSubmit={onSubmit} className="space-y-8">
          
          {/* Section 1: Core Weights (3 scrollbars) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="relative backdrop-blur-xl bg-gray-900/40 border border-indigo-500/20 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10">
              <div className="border-b border-indigo-500/20 p-8 bg-gradient-to-r from-gray-900/50 to-gray-900/30">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                    <Target className="w-6 h-6 text-indigo-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Family Priorities</h2>
                    <p className="text-gray-400 text-sm mt-1">Adjust the celestial importance of each factor (0-100%)</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <RangeInput 
                  label="Financial Stability" 
                  value={financial} 
                  onChange={setFinancial} 
                  icon={Wallet}
                  error={errors.financial}
                />
                <RangeInput 
                  label="Job Security" 
                  value={jobSecurity} 
                  onChange={setJobSecurity} 
                  icon={Shield}
                  error={errors.jobSecurity}
                />
                <RangeInput 
                  label="Social Prestige" 
                  value={prestige} 
                  onChange={setPrestige} 
                  icon={Award}
                  error={errors.prestige}
                />
              </div>
            </div>
          </motion.div>

          {/* Section 2: Logistics */}
        <motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
  className="relative"
>
  <div className="relative z-10 backdrop-blur-xl bg-gray-900/40 border border-emerald-500/20 rounded-3xl overflow-visible shadow-2xl shadow-emerald-500/10">
    <div className="border-b  border-emerald-500/20 p-8 bg-gradient-to-r from-gray-900/50 to-gray-900/30">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
          <Globe className="w-6 h-6 text-emerald-300" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Logistics & Constraints</h2>
          <p className="text-gray-400 text-sm mt-1">Define geographical and financial boundaries</p>
        </div>
      </div>
    </div>
    
    <div className="p-8 min-h-[320px]"> {/* Added min-height */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
        {/* Column 1: Location Preference - Enhanced Dropdown with Lucide icons */}
        <div className="relative "> {/* Added wrapper div */}
          <EnhancedSelect 
            label="Location Preference" 
            value={location} 
            onChange={setLocation}
            icon={MapPin}
            error={errors.location}
            options={[
              { 
                value: "local", 
                label: "Local ", 
                description: "Same city or region",
                icon: Home
              },
              { 
                value: "national", 
                label: "National", 
                description: "Within the country",
                icon: Flag
              },
              { 
                value: "international", 
                label: "Global", 
                description: "Global opportunities",
                icon: Globe2
              }
            ]}
          />
        </div>

        {/* Column 2: Two rows */}
        <div className="space-y-8">
          {/* Row 1: Migration Switch - Enhanced with dot indicator */}
          <MigrationSwitch 
            label="Migration Allowed" 
            value={migrationAllowed} 
            onChange={setMigrationAllowed}
            icon={Plane}
            error={errors.migration}
          />

          {/* Row 2: Budget Input */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                <Wallet className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Maximum Tuition per Year (₹)</h3>
                <p className="text-gray-400 text-sm">Set your education budget</p>
              </div>
            </div>
            
            <div className="relative backdrop-blur-sm bg-gray-900/40 border border-amber-500/20 rounded-xl overflow-hidden">
              <div className="flex items-center">
                <div className="px-4 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-r border-amber-500/30">
                  <span className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                    ₹
                  </span>
                </div>
                <input 
                  type="number" 
                  min={0} 
                  step="1"
                  value={maxTuition}
                  onChange={e => {
                    const value = e.target.value;
                    const numValue = value === '' ? 0 : parseInt(value, 10);
                    if (!isNaN(numValue) && numValue >= 0) {
                      setMaxTuition(numValue);
                    }
                  }}
                  onBlur={e => {
                    if (e.target.value === '' || parseInt(e.target.value, 10) < 0) {
                      setMaxTuition(0);
                    }
                  }}
                  className="flex-1 backdrop-blur-sm bg-transparent px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
                  placeholder="Enter cosmic budget..."
                />
                <div className="px-4 py-3 border-l border-amber-500/30">
                  <span className="text-gray-400 text-sm">/year</span>
                </div>
              </div>
            </div>
            
            {errors.maxTuition && (
              <div className="flex items-center gap-1 text-red-400 text-xs mt-2">
                <AlertTriangle size={12} />
                {errors.maxTuition}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</motion.div>

          {/* Section 3: Professions & Cosmic Constraints */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="relative backdrop-blur-xl bg-gray-900/40 border border-purple-500/20 rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/10 z-1">
              <div className="border-b border-purple-500/20 p-8 bg-gradient-to-r from-gray-900/50 to-gray-900/30">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <Brain className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Career & Constraints</h2>
                    <p className="text-gray-400 text-sm mt-1">Define avoided paths and your celestial </p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="relative backdrop-blur-sm bg-gray-900/40 border border-rose-500/20 rounded-2xl p-6 transition-all duration-300 hover:border-rose-500/40">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30">
                      <Ban className="w-5 h-5 text-rose-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Avoided Professions</h3>
                      <p className="text-gray-400 text-sm">Paths outside your family's alignment</p>
                    </div>
                  </div>
                  
                  <textarea 
                    value={unacceptable} 
                    onChange={e => setUnacceptable(e.target.value)} 
                    className="w-full backdrop-blur-sm bg-gray-900/30 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-transparent transition-all duration-300 min-h-[120px] custom-scrollbar" 
                    placeholder="e.g., Artist, Musician, Professional Gamer (separate with commas)"
                  />
                  
                  <div className="text-xs text-gray-500 mt-2">
                    These  paths will be filtered from recommendations. Separate constellations with commas.
                  </div>
                </div>

                {/* Last 2 scrollbars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-800">
                  <RangeInput 
                    label="Family Risk Tolerance" 
                    value={riskTolerance} 
                    onChange={setRiskTolerance} 
                    icon={Zap}
                    error={errors.riskTolerance}
                  />
                  <RangeInput 
                    label="Parental Influence" 
                    value={weightOnParent} 
                    onChange={setWeightOnParent} 
                    icon={Sparkles}
                    error={errors.weightOnParent}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 pt-8"
          >
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button 
                type="button" 
                onClick={handleReset} 
                className="relative group flex items-center justify-center gap-3 px-6 py-3 rounded-xl backdrop-blur-sm bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white transition-all duration-300 w-full sm:w-auto"
              >
                <RotateCcw size={18} className="relative z-10" />
                <span className="relative z-10 font-medium">Reset  Alignment</span>
              </button>
              
              <button 
                type="button" 
                onClick={handleQuickFill} 
                className="relative group flex items-center justify-center gap-3 px-6 py-3 rounded-xl backdrop-blur-sm bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-400/50 text-purple-300 hover:text-white transition-all duration-300 w-full sm:w-auto"
              >
                <Wand2 size={18} className="relative z-10" />
                <span className="relative z-10 font-medium">Random Alignment</span>
              </button>
            </div>

            <button 
              type="submit"
              disabled={loading} 
              className="relative group flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300 w-full sm:w-auto shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700"></div>
              
              <div className="relative z-10 flex items-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Aligning Celestial Bodies...</span>
                  </>
                ) : (
                  <>
                    <Star size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span>Submit</span>
                    <Save size={20} className="group-hover:scale-110 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </motion.div>

          {/* Server Response Notification */}
         <AnimatePresence>
  {serverResult && (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="mt-8"
    >
      {serverResult.ok && serverResult.data?.ai_response ? (
        // SUCCESS CARD
        <div className="relative overflow-hidden rounded-3xl">
          <div className="relative backdrop-blur-xl bg-gray-900/60 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/20">
            {/* Header */}
            <div className="backdrop-blur-sm bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20">
                    <CheckCircle size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Celestial Analysis Complete
                    </h3>
                    <p className="text-emerald-100 text-sm">
                      Your family's cosmic preferences have been mapped to the stars
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-emerald-100/80 text-xs font-medium bg-white/10 px-3 py-1 rounded-lg mb-1">
                    STAR ID: {formatStarName(serverResult.data.saved_id || "NEW-STAR")}
                  </div>
                  <div className="text-emerald-100/60 text-xs">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
         {/* Body */}
<div className="p-8">
  {/* Top Recommendation - Reorganized layout */}
  <div className="mb-12">
    {/* Header and Career Name */}
   <div className="mb-6">
  <div className="flex flex-col md:flex-row md:items-end justify-center gap-6">
    
    {/* LEFT SECTION */}
<div className="flex flex-col gap-2 mt-4 items-start mr-auto">
      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
        <Sparkles size={14} />
        Recommended
      </div>

      <div className="text-4xl font-bold text-white">
        {formatCareerId(
          serverResult.data.ai_response.final_recommendation.career_id
        )}
      </div>
<div className="text-lg font-semibold text-emerald-300 mb-4">
        Here's why {formatCareerId(serverResult.data.ai_response.final_recommendation.career_id)} is an excellent consideration for your child:
      </div>
     
    </div>

    {/* RIGHT SECTION (ORB) */}
    <div className="flex justify-around w-full md:w-auto">
      <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-emerald-500/30 bg-gradient-to-br from-gray-900 to-emerald-900/30 flex flex-col items-center justify-center">
        <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
          {(serverResult.data.ai_response.final_recommendation.parent_score * 100).toFixed(1)}%
        </span>
        <span className="text-xs font-medium text-emerald-300 uppercase tracking-wider mt-1">
          Celestial Match
        </span>
      </div>
    </div>
  <div className="invisible hidden md:flex justify-around w-full md:w-auto">
  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-emerald-500/30 bg-gradient-to-br from-gray-900 to-emerald-900/30 flex flex-col items-center justify-center">
    <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
      {(serverResult.data.ai_response.final_recommendation.parent_score * 100).toFixed(1)}%
    </span>
    <span className="text-xs font-medium text-emerald-300 uppercase tracking-wider mt-1">
      Celestial Match
    </span>
  </div>
</div>


  </div>
</div>

    
    {/* Here's Why Section - Takes full width */}
    <div className="w-full">
      
      
      {/* Bullet Points in 2-column grid - Full width */}
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(() => {
            const explanation = formatExplanation(serverResult.data.ai_response.final_recommendation.parent_explanation);
            const bulletPoints = explanation.split('*').filter(point => point.trim().length > 0);
            const MAX_LENGTH = 150;
            
            return (
              <>
                {bulletPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group w-full"
                  >
                    <div className="h-full flex gap-3 p-4 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-gray-900/50 to-emerald-900/10 hover:border-emerald-500/40 transition-all duration-300 w-full">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </div>
                      <div className="flex-1 min-w-0"> {/* Added min-w-0 for proper text truncation */}
                        <div className="text-gray-200 leading-relaxed break-words">
                          {(() => {
                            const isExpanded = expandedBulletPoints[index] || false;
                            const shouldTruncate = point.length > MAX_LENGTH;
                            const displayText = shouldTruncate && !isExpanded 
                              ? `${point.substring(0, MAX_LENGTH)}...` 
                              : point.trim();
                            
                            return (
                              <>
                                {displayText}
                                {shouldTruncate && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setExpandedBulletPoints(prev => ({
                                        ...prev,
                                        [index]: !prev[index]
                                      }));
                                    }}
                                    className="ml-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium whitespace-nowrap"
                                  >
                                    {isExpanded ? 'Show less' : 'Show more'}
                                  </button>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  </div>
  {/* Top 5 Careers - Enhanced Layout with specific colors */}
  <div>
    <div className="flex items-center gap-2 mb-8">
      <Award className="text-amber-400" size={20} />
      <h4 className="text-lg font-semibold text-white">Top 5 Celestial Matches</h4>
    </div>
    
    {/* Rest of your Top 5 Careers code remains the same */}
    <div className="relative">
      {/* Custom arrangement: 4th, 2nd, 1st, 3rd, 5th */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {/* 4th Position - Leftmost */}
        {serverResult.data.ai_response.top_5_parent_scores[3] && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl backdrop-blur-sm border border-transparent hover:scale-105 transition-all duration-300 bg-gradient-to-br from-gray-900/40 to-gray-800/40 shadow-md"
          >
            <div className="flex flex-col items-center text-center">
              {/* Rank Badge */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-3 bg-gray-800 text-gray-400">
                <span className="text-sm font-bold">#4</span>
              </div>
              
              {/* Career Name */}
              <div className="text-lg font-bold text-white mb-2">
                {formatCareerId(serverResult.data.ai_response.top_5_parent_scores[3].career_id)}
              </div>
              
              {/* Score */}
              <div className="text-3xl font-black mb-1 text-gray-300">
                {(serverResult.data.ai_response.top_5_parent_scores[3].parent_score * 100).toFixed(1)}%
              </div>
              
              {/* Subtle label */}
              <div className="text-xs text-gray-500 mt-1">
                Good Match
              </div>
            </div>
          </motion.div>
        )}

        {/* 2nd Position */}
        {serverResult.data.ai_response.top_5_parent_scores[1] && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-2xl backdrop-blur-sm border border-indigo-500/40 hover:scale-105 transition-all duration-300 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-lg shadow-indigo-500/20 relative z-5"
          >
            <div className="flex flex-col items-center text-center">
              {/* Rank Badge */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-3 bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                <span className="text-sm font-bold">#2</span>
              </div>
              
              {/* Career Name */}
              <div className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                {formatCareerId(serverResult.data.ai_response.top_5_parent_scores[1].career_id)}
              </div>
              
              {/* Score */}
              <div className="text-3xl font-black mb-1 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                {(serverResult.data.ai_response.top_5_parent_scores[1].parent_score * 100).toFixed(1)}%
              </div>
              
              {/* Subtle label */}
              <div className="text-xs text-indigo-400 mt-1">
                Excellent Match
              </div>
            </div>
          </motion.div>
        )}

        {/* 1st Position - Center */}
        {serverResult.data.ai_response.top_5_parent_scores[0] && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-2xl backdrop-blur-sm border border-emerald-500/40 hover:scale-105 transition-all duration-300 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 shadow-2xl shadow-emerald-500/30 relative z-10 md:col-start-3 md:row-start-1 scale-110"
          >
            <div className="flex flex-col items-center text-center">
              {/* Rank Badge */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-3 bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                <span className="text-sm font-bold">#1</span>
              </div>
              
              {/* Career Name */}
              <div className="text-lg font-bold text-white mb-2">
                {formatCareerId(serverResult.data.ai_response.top_5_parent_scores[0].career_id)}
              </div>
              
              {/* Score */}
              <div className="text-3xl font-black mb-1 bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                {(serverResult.data.ai_response.top_5_parent_scores[0].parent_score * 100).toFixed(1)}%
              </div>
              
              {/* Subtle label */}
              <div className="text-xs text-emerald-400 mt-1">
                Best Match
              </div>
              
              {/* Special badge for top match */}
              <div className="mt-3 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                <div className="flex items-center gap-1">
                  <Star size={10} className="text-emerald-300" />
                  <span className="text-xs font-bold text-emerald-300">NORTH STAR</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3rd Position */}
        {serverResult.data.ai_response.top_5_parent_scores[2] && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-5 rounded-2xl backdrop-blur-sm border border-indigo-500/40 hover:scale-105 transition-all duration-300 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-lg shadow-indigo-500/20 relative z-5"
          >
            <div className="flex flex-col items-center text-center">
              {/* Rank Badge */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-3 bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                <span className="text-sm font-bold">#3</span>
              </div>
              
              {/* Career Name */}
              <div className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                {formatCareerId(serverResult.data.ai_response.top_5_parent_scores[2].career_id)}
              </div>
              
              {/* Score */}
              <div className="text-3xl font-black mb-1 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                {(serverResult.data.ai_response.top_5_parent_scores[2].parent_score * 100).toFixed(1)}%
              </div>
              
              {/* Subtle label */}
              <div className="text-xs text-indigo-400 mt-1">
                Great Match
              </div>
            </div>
          </motion.div>
        )}

        {/* 5th Position - Rightmost */}
        {serverResult.data.ai_response.top_5_parent_scores[4] && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-5 rounded-2xl backdrop-blur-sm border border-transparent hover:scale-105 transition-all duration-300 bg-gradient-to-br from-gray-900/40 to-gray-800/40 shadow-md"
          >
            <div className="flex flex-col items-center text-center">
              {/* Rank Badge */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-3 bg-gray-800 text-gray-400">
                <span className="text-sm font-bold">#5</span>
              </div>
              
              {/* Career Name */}
              <div className="text-lg font-bold text-white mb-2">
                {formatCareerId(serverResult.data.ai_response.top_5_parent_scores[4].career_id)}
              </div>
              
              {/* Score */}
              <div className="text-3xl font-black mb-1 text-gray-300">
                {(serverResult.data.ai_response.top_5_parent_scores[4].parent_score * 100).toFixed(1)}%
              </div>
              
              {/* Subtle label */}
              <div className="text-xs text-gray-500 mt-1">
                Good Match
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  </div>
</div>
          </div>
        </div>
      ) : (
        // ERROR CARD
        <div className="relative overflow-hidden rounded-2xl">
          <div className="relative backdrop-blur-xl bg-gray-900/60 border border-rose-500/30 rounded-2xl overflow-hidden">
            <div className="flex items-start gap-4 p-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30">
                <AlertTriangle className="text-rose-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Cosmic Connection Failed</h3>
                <p className="text-rose-200/80">
                  {serverResult.error || "The celestial bodies could not align. Please try again."}
                </p>
                <button
                  onClick={() => setServerResult(null)}
                  className="mt-4 px-4 py-2 rounded-lg backdrop-blur-sm bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-white hover:bg-rose-500/30 transition-colors text-sm"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )}
</AnimatePresence>
        </form>
      </div>
    </div>
  );
}