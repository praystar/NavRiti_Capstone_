/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, ChevronRight, ChevronLeft, 
  Sparkles, Star, Zap, Target, BrainCircuit, Globe, Compass, 
  AlertCircle, CheckCircle, History, X, RotateCcw,
  Briefcase, TrendingUp, Award, Navigation, TargetIcon,
  Home, User, Globe as GlobeIcon, ChevronDown, ChevronUp 
} from 'lucide-react';
import AppNavbar from '../components/AppNavbar.tsx';
import Background from '../components/Background.tsx';
import { useNavigate } from 'react-router-dom';

// --- Custom Toast Component ---
const Toast = ({ message, type }: { message: string, type: 'error' | 'success' | 'warning' }) => (
  <motion.div 
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -100, opacity: 0 }}
    className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl backdrop-blur-md border flex items-center gap-3 shadow-2xl ${
      type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 
      type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' :
      'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
    }`}
  >
    {type === 'error' ? <AlertCircle size={18} /> : 
     type === 'warning' ? <AlertCircle size={18} /> : 
     <CheckCircle size={18} />}
    <span className="text-sm font-medium">{message}</span>
  </motion.div>
);

// --- History Panel Component ---
const HistoryPanel = ({ isOpen, onClose, history, onLoadHistory }: { 
  isOpen: boolean; 
  onClose: () => void; 
  history: any[]; 
  onLoadHistory: (data: any) => void;
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900/90 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="text-indigo-400" size={24} />
                <h3 className="text-xl font-bold text-white">Celestial History</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-2">Your previous astrological analyses</p>
          </div>
          
          <div className="overflow-y-auto max-h-[60vh] p-4">
            {history.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No previous analyses found</p>
                <p className="text-gray-500 text-sm mt-2">Submit a new analysis to see it here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <motion.div 
                    key={item.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-indigo-500/30 transition-all cursor-pointer group"
                    onClick={() => onLoadHistory(item)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                          <Calendar size={16} className="text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                            Analysis #{index + 1}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {item.input?.birth_date} • {item.input?.birth_time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {item.output?.final_recommendations?.length || 0} careers
                        </span>
                        <ChevronRight className="text-gray-500 group-hover:text-indigo-400 transition-colors" size={20} />
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      {item.input?.birth_place}
                    </div>
                    {item.output?.error && (
                      <div className="text-xs px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
                        <AlertCircle size={10} /> Partial data
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Result Card Component ---
const ResultCard = ({ 
  detailedAnalysis = [], 
  finalRecommendations = [], 
  onReset,
  showInputData,
  personalityTraits // ADD THIS PROP
}: { 
  detailedAnalysis: any[]; 
  finalRecommendations: any[]; 
  onReset: () => void;
  showInputData?: any;
  personalityTraits?: any; // ADD THIS
}) => {
  const [activePlanet, setActivePlanet] = useState(0);

  // Personality trait icons mapping
  const traitIcons = {
    creative: Sparkles,
    analytical: BrainCircuit,
    technical: Zap,
    leadership: Target,
    communication: Globe,
    healing: Star,
    business: Target
  };

  // Personality trait labels
  const traitLabels = {
    creative: "Creativity",
    analytical: "Analytical",
    technical: "Technical",
    leadership: "Leadership",
    communication: "Communication",
    healing: "Healing",
    business: "Business"
  };

  // If no data, show empty state
  if (detailedAnalysis.length === 0 && finalRecommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
          <AlertCircle className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">No Analysis Data Available</h3>
        <p className="text-gray-400 mb-6">The astrology service may have timed out or returned incomplete data.</p>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white hover:border-white/30 transition-all"
        >
          <RotateCcw size={16} />
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
            {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 text-emerald-300 text-[10px] font-bold tracking-widest uppercase">
          <Star className="w-3.5 h-3.5 mr-2 text-yellow-400" /> Stellar Analysis Complete
        </div>
        <h2 className="text-4xl font-serif font-bold text-white mb-3">Celestial Career Guidance</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Based on planetary positions and nakshatra influences
        </p>
        
        {/* Show input data if provided */}
        {showInputData && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 space-y-4"
          >
            {/* Birth Info */}
            <div className="inline-flex flex-wrap gap-3 justify-center">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                <Calendar size={14} className="text-indigo-400" />
                <span className="text-sm text-white">{showInputData.birth_date}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                <Clock size={14} className="text-indigo-400" />
                <span className="text-sm text-white">{showInputData.birth_time}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                <MapPin size={14} className="text-indigo-400" />
                <span className="text-sm text-white truncate max-w-[200px]">{showInputData.birth_place}</span>
              </div>
            </div>
            
            {/* Personality Traits - ADD THIS SECTION */}
            {personalityTraits && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-2xl mx-auto"
              >
                <h4 className="text-sm font-bold text-gray-400 mb-3 text-center">PERSONALITY ASSESSMENT</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(personalityTraits).map(([trait, score]) => {
                    const IconComponent = traitIcons[trait as keyof typeof traitIcons];
                    const label = traitLabels[trait as keyof typeof traitLabels];
                    const scoreNum = Number(score);
                    
                    return (
                      <div 
                        key={trait}
                        className="flex flex-col items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:border-indigo-500/20 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-2">
                          {IconComponent && <IconComponent size={14} className="text-indigo-400" />}
                        </div>
                        <span className="text-xs text-gray-400 mb-1">{label}</span>
                        <div className="flex items-center gap-1">
                          <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              style={{ width: `${(scoreNum / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-white">{scoreNum}/10</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Planet Analysis Section (only if we have detailed analysis) */}
      {detailedAnalysis.length > 0 && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {detailedAnalysis.map((analysis, index) => (
              <button
                key={analysis.planet || index}
                onClick={() => setActivePlanet(index)}
                className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
                  activePlanet === index
                    ? 'bg-indigo-500/20 border-indigo-500 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                }`}
              >
                {analysis.planet === 'Sun' && <Sparkles size={14} />}
                {analysis.planet === 'Moon' && <Star size={14} />}
                {analysis.planet === 'Mercury' && <BrainCircuit size={14} />}
                {analysis.planet === 'Venus' && <Sparkles size={14} />}
                {analysis.planet === 'Mars' && <Zap size={14} />}
                {analysis.planet === 'Jupiter' && <Award size={14} />}
                {analysis.planet === 'Saturn' && <Target size={14} />}
                {analysis.planet === 'Rahu' && <Navigation size={14} />}
                {analysis.planet === 'Ketu' && <TargetIcon size={14} />}
                <span>{analysis.planet || `Planet ${index + 1}`}</span>
              </button>
            ))}
          </motion.div>

          <motion.div 
            key={activePlanet}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="backdrop-blur-md bg-gray-900/60 border border-white/10 rounded-3xl p-8"
          >
            {detailedAnalysis[activePlanet] && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                      {detailedAnalysis[activePlanet].planet === 'Sun' && <Sparkles className="text-yellow-400" size={24} />}
                      {detailedAnalysis[activePlanet].planet === 'Moon' && <Star className="text-blue-400" size={24} />}
                      {detailedAnalysis[activePlanet].planet === 'Mercury' && <BrainCircuit className="text-green-400" size={24} />}
                      {detailedAnalysis[activePlanet].planet === 'Venus' && <Sparkles className="text-pink-400" size={24} />}
                      {detailedAnalysis[activePlanet].planet === 'Mars' && <Zap className="text-red-400" size={24} />}
                      {detailedAnalysis[activePlanet].planet === 'Jupiter' && <Award className="text-orange-400" size={24} />}
                      {detailedAnalysis[activePlanet].planet === 'Saturn' && <Target className="text-gray-400" size={24} />}
                      {detailedAnalysis[activePlanet].planet === 'Rahu' && <Navigation className="text-purple-400" size={24} />}
                      {detailedAnalysis[activePlanet].planet === 'Ketu' && <TargetIcon className="text-indigo-400" size={24} />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{detailedAnalysis[activePlanet].planet || 'Planet'} Analysis</h3>
                      <p className="text-gray-400">
                        House {detailedAnalysis[activePlanet].house || 'N/A'} • {detailedAnalysis[activePlanet].nakshatra || 'Nakshatra N/A'}
                      </p>
                    </div>
                  </div>
                  {detailedAnalysis[activePlanet].planet_strength?.score && (
                    <div className="text-right">
                      <div className="text-xs text-gray-400 mb-1">Planet Strength</div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-white/5 h-2 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${detailedAnalysis[activePlanet].planet_strength.score}%` }}
                            className={`h-full rounded-full ${
                              detailedAnalysis[activePlanet].planet_strength.score > 70 ? 'bg-emerald-500' :
                              detailedAnalysis[activePlanet].planet_strength.score > 40 ? 'bg-yellow-500' : 'bg-rose-500'
                            }`}
                          />
                        </div>
                        <span className="text-lg font-bold text-white">{detailedAnalysis[activePlanet].planet_strength.score}/100</span>
                      </div>
                    </div>
                  )}
                </div>

                {detailedAnalysis[activePlanet].planet_strength?.factors?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-400 mb-3">STRENGTH FACTORS</h4>
                    <div className="flex flex-wrap gap-2">
                      {detailedAnalysis[activePlanet].planet_strength.factors.map((factor: string, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 bg-white/5 rounded-xl text-xs border border-white/10">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                      <Briefcase size={14} /> HOUSE INFLUENCE
                    </h4>
                    <p className="text-white leading-relaxed">
                      {detailedAnalysis[activePlanet].house_signification || 'House influence not specified.'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                      <Target size={14} /> SUGGESTED DOMAINS
                    </h4>
                    <div className="space-y-2">
                      {(detailedAnalysis[activePlanet].career_domains || []).slice(0, 4).map((domain: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-white">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          {domain}
                        </div>
                      ))}
                      {(!detailedAnalysis[activePlanet].career_domains || detailedAnalysis[activePlanet].career_domains.length === 0) && (
                        <p className="text-gray-500 text-sm">No specific domains suggested for this planet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}

      {/* Final Recommendations */}
      {finalRecommendations.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-md bg-gray-900/60 border border-white/10 rounded-3xl p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Final Career Recommendations</h3>
              <p className="text-gray-400">Top domains based on planetary alignment</p>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
              <TrendingUp size={18} />
              <span className="font-bold">Personalized</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {finalRecommendations.map((rec, index) => (
              <motion.div 
                key={rec.career_domain || index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <Briefcase className="text-indigo-400" size={20} />
                  </div>
                  <span className="text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
                    #{index + 1}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                  {rec.career_domain || `Career Option ${index + 1}`}
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Salary Range</span>
                  <span className="font-bold text-emerald-400">{rec.estimated_salary_range || '₹4–15 LPA'}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Reset Button */}
      <div className="text-center pt-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white hover:border-white/30 transition-all hover:scale-105"
        >
          <RotateCcw size={18} />
          Perform New Analysis
        </button>
      </div>
    </div>
  );
};

function BirthInfoForm() {
  // Form state
  const [formData, setFormData] = useState({
    birthDate: '',
    birthTime: '',
    birthPlace: ''
  });

  const [showPersonalityTraits, setShowPersonalityTraits] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Personality traits
  const [personalityTraits, setPersonalityTraits] = useState({
    creative: null as number | null,
    analytical: null as number | null,
    technical: null as number | null,
    leadership: null as number | null,
    communication: null as number | null,
    healing: null as number | null,
    business: null as number | null
  });

  // Results state
  const [analysisResults, setAnalysisResults] = useState<{
    detailed_analysis: any[];
    final_recommendations: any[];
    inputData: any;
    fullOutput: any;
  } | null>(null);

  const navigate = useNavigate();

  // History state
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);

  const [submitLocked, setSubmitLocked] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  // Toast State
  const [toast, setToast] = useState<{ msg: string, type: 'error' | 'success' | 'warning' } | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('celestial');
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory);
        setAnalysisHistory(Array.isArray(parsed) ? parsed : [parsed]);
      } catch (error) {
        console.error('Error parsing history:', error);
      }
    }
  }, []);

  const triggerToast = (msg: string, type: 'error' | 'success' | 'warning' = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Questions for personality assessment
  const questions = [
    { key: 'creative', label: 'How creative are you?', description: 'Rate your creativity and artistic abilities', icon: Sparkles },
    { key: 'analytical', label: 'How analytical are you?', description: 'Rate your logical thinking and problem-solving skills', icon: BrainCircuit },
    { key: 'technical', label: 'How technical are you?', description: 'Rate your technical and engineering abilities', icon: Zap },
    { key: 'leadership', label: 'How strong is your leadership?', description: 'Rate your leadership and management skills', icon: Target },
    { key: 'communication', label: 'How good are your communication skills?', description: 'Rate your ability to communicate effectively', icon: Globe },
    { key: 'healing', label: 'How strong is your healing nature?', description: 'Rate your empathy and caring abilities', icon: Star },
    { key: 'business', label: 'How business-minded are you?', description: 'Rate your entrepreneurial and business skills', icon: Target }
  ];

  const currentQuestion = questions[currentQuestionIndex];

  // Keyboard listeners for personality assessment
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showPersonalityTraits || showResults) return;
      
      let val: number | null = null;
      if (e.key >= '1' && e.key <= '9') val = parseInt(e.key);
      if (e.key === '0') val = 10;

      if (val !== null) {
        setPersonalityTraits(prev => ({ ...prev, [currentQuestion.key]: val }));
      }

      if (e.key === 'Enter' && (personalityTraits as any)[currentQuestion.key]) {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          handleFinalSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPersonalityTraits, currentQuestionIndex, personalityTraits, showResults]);

  // Save to localStorage - REPLACE old data with new
  const saveToLocalStorage = (input: any, output: any) => {
    const analysisData = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      input: {
        birth_date: input.birth_date,
        birth_time: input.birth_time,
        birth_place: input.birth_place,
        personality_traits: input.personality_traits
      },
      output: {
        detailed_analysis: output.career_analysis?.detailed_analysis || [],
        final_recommendations: output.final_recommendations || [],
        // Save complete output
        full_output: output
      }
    };

    // REPLACE existing history with new one (single object)
    localStorage.setItem('celestial', JSON.stringify(analysisData));
    setAnalysisHistory([analysisData]);
    
    triggerToast('Analysis saved to celestial history', 'success');
  };

  // Load from history
  const loadFromHistory = (historyItem: any) => {
    console.log('Loading history item:', historyItem);
    setAnalysisResults({
      detailed_analysis: historyItem.output.detailed_analysis || [],
      final_recommendations: historyItem.output.final_recommendations || [],
      inputData: historyItem.input,
      fullOutput: historyItem.output.full_output || historyItem.output
    });
    setShowResults(true);
    setShowPersonalityTraits(false);
    setShowHistory(false);
    
    triggerToast('Loaded from history', 'success');
  };

  // Start personality assessment
  const handleSubmit = async () => {
    if (!formData.birthDate || !formData.birthTime || !formData.birthPlace) {
      triggerToast('Please complete all birth coordinates.', 'error');
      return;
    }
    setShowPersonalityTraits(true);
  };

  // Final submission to API
   // Final submission to API
 // Final submission to API - FIXED VERSION
const handleFinalSubmit = async () => {
  if (submitLocked || submitStatus === 'submitting') return;
  
  // Check if all personality traits are filled
  const allTraitsFilled = Object.values(personalityTraits).every(trait => trait !== null);
  if (!allTraitsFilled) {
    triggerToast('Please rate all personality traits before submitting.', 'error');
    return;
  }
  
  setSubmitLocked(true);
  setSubmitStatus('submitting');
  
  try {
    const SERVER_BASE = import.meta.env.VITE_SERVER_BASE_API ?? '/api';
    
    // Prepare request exactly as backend expects
    const requestBody = { 
      birth_date: formData.birthDate,
      birth_time: formData.birthTime,
      birth_place: formData.birthPlace,
      personality_traits: personalityTraits
    };
    
    console.log('Submitting to:', `${SERVER_BASE}/birthinfo/analyze`);
    
    const response = await fetch(`${SERVER_BASE}/birthinfo/analyze`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const result = await response.json();
    
    console.log('API Response:', result);
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}`);
    }
    
    // Extract data from response
    const detailedAnalysis = result.career_analysis?.detailed_analysis || [];
    const finalRecommendations = result.final_recommendations || [];
    
    // ✅ CHECK FOR VALID DATA FIRST
    const hasValidData = (detailedAnalysis.length > 0 || finalRecommendations.length > 0);
    
    // ✅ SET ANALYSIS RESULTS FIRST (this triggers UI updates if needed)
    setAnalysisResults({
      detailed_analysis: detailedAnalysis,
      final_recommendations: finalRecommendations,
      inputData: requestBody,
      fullOutput: result
    });
    
    if (hasValidData) {
      // ✅ SAVE TO LOCALSTORAGE (REPLACE old data)
      const analysisData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        input: {
          birth_date: requestBody.birth_date,
          birth_time: requestBody.birth_time,
          birth_place: requestBody.birth_place,
          personality_traits: requestBody.personality_traits
        },
        output: {
          detailed_analysis: detailedAnalysis,
          final_recommendations: finalRecommendations,
          full_output: result
        }
      };
      
      localStorage.setItem('celestial', JSON.stringify(analysisData));
      setAnalysisHistory([analysisData]);
      
      triggerToast('Celestial analysis saved!', 'success');
    } else {
      // No valid data, show warning
      triggerToast('Analysis completed but no career data was found.', 'warning');
    }
    
    setSubmitStatus('success');
    
    // ✅ NAVIGATE LAST (after everything is saved)
    setTimeout(() => {
      navigate('/ParentForm');
    }, 1500);
    
  } catch (error: any) {
    console.error('Submission error:', error);
    setSubmitStatus('error');
    setSubmitLocked(false);
    
    if (error.message.includes('timed out') || error.message.includes('timeout')) {
      triggerToast('The astrology service is taking longer than expected. Please try again.', 'warning');
    } else {
      triggerToast(error.message || 'Celestial interference. Please try again.', 'error');
    }
    
    // ❌ DON'T SAVE TO LOCALSTORAGE ON ERROR
    const requestBody = { 
      birth_date: formData.birthDate,
      birth_time: formData.birthTime,
      birth_place: formData.birthPlace,
      personality_traits: personalityTraits
    };
    
    const errorOutput = {
      error: error.message,
      note: "API call failed",
      timestamp: new Date().toISOString()
    };
    
    setAnalysisResults({
      detailed_analysis: [],
      final_recommendations: [],
      inputData: requestBody,
      fullOutput: errorOutput
    });
  }
};

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      birthDate: '',
      birthTime: '',
      birthPlace: ''
    });
    setPersonalityTraits({
      creative: null,
      analytical: null,
      technical: null,
      leadership: null,
      communication: null,
      healing: null,
      business: null
    });
    setCurrentQuestionIndex(0);
    setShowPersonalityTraits(false);
    setShowResults(false);
    setAnalysisResults(null);
    setSubmitStatus('idle');
    setSubmitLocked(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      <Background intensity="medium" showConstellations={true} />
      <AppNavbar showAuthLinks={false} />
      
      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} />}
      </AnimatePresence>

      {/* History Button - Always visible except in form */}
      {!showPersonalityTraits && !showResults  && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHistory(true)}
          className="fixed bottom-6 right-6 z-30 bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-md rounded-2xl p-4 shadow-2xl hover:bg-indigo-500/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <History className="text-indigo-300 group-hover:text-white" size={20} />
            <span className="text-sm font-bold">History</span>
          </div>
        </motion.button>
      )}

      <div className="relative z-10 flex items-center justify-center py-24 px-4 min-h-screen">
        {/* Main Container */}
        <div className={`w-full transition-all duration-500 ease-in-out ${
          showResults ? 'max-w-6xl' : 
          showPersonalityTraits ? 'max-w-md' : 'max-w-2xl'
        }`}>
          
          {/* FORM STATE */}
          {!showPersonalityTraits && !showResults && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-md bg-gray-900/40 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl"
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 text-indigo-300 text-[10px] font-bold tracking-widest uppercase">
                  <Star className="w-3.5 h-3.5 mr-2 text-yellow-400" />  Coordinates
                </div>
                <h2 className="text-4xl font-serif font-bold text-white">Birth Information</h2>
              </div>

              <div className="space-y-6">
                {[
                  { id: 'birthDate', label: 'Birth Date', type: 'date', icon: Calendar },
                  { id: 'birthTime', label: 'Birth Time', type: 'time', icon: Clock },
                  { id: 'birthPlace', label: 'Birth Place', type: 'text', icon: MapPin, placeholder: "City, Country" }
                ].map((field) => (
                  <div key={field.id} className="relative group">
                    <label className="flex items-center text-xs font-bold text-gray-400 mb-2 ml-1 uppercase tracking-wider">
                      <field.icon className="w-3.5 h-3.5 text-indigo-400 mr-2" /> {field.label}
                    </label>
                    <div className="relative">
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={(formData as any)[field.id]}
                        onChange={(e) => handleChange(field.id as any, e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-indigo-500/50 outline-none transition-all pr-12 text-white"
                      />
                      <Compass className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-white/40 transition-colors pointer-events-none" />
                    </div>
                  </div>
                ))}

                <button 
                  onClick={handleSubmit}
                  className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 py-5 rounded-2xl font-bold hover:scale-[1.02] transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3"
                >
                  Continue to Assessment <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* PERSONALITY ASSESSMENT STATE */}
          {showPersonalityTraits && !showResults && (
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentQuestionIndex} 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="backdrop-blur-md bg-gray-900/60 border border-indigo-500/20 rounded-[2.5rem] p-8 shadow-2xl"
              >
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest">
                      Question {currentQuestionIndex + 1} / {questions.length}
                    </span>
                    <span className="text-gray-500 text-[10px] font-mono">
                      {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-500" 
                      initial={{ width: 0 }} 
                      animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} 
                    />
                  </div>
                </div>

                <div className="text-center mb-8">
                  <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
                    <currentQuestion.icon className="w-8 h-8 text-indigo-300" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2 leading-tight px-2">{currentQuestion.label}</h4>
                  <p className="text-gray-400 text-xs px-4 leading-relaxed">{currentQuestion.description}</p>
                </div>

                {/* 1-10 Rating Grid */}
                <div className="grid grid-cols-5 gap-2 mb-8 px-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                    <button
                      key={val}
                      onClick={() => setPersonalityTraits(prev => ({ ...prev, [currentQuestion.key]: val }))}
                      className={`h-11 rounded-xl border-2 font-bold transition-all text-sm flex items-center justify-center ${
                        (personalityTraits as any)[currentQuestion.key] === val
                          ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-lg shadow-indigo-500/20'
                          : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setCurrentQuestionIndex(i => i - 1)} 
                    disabled={currentQuestionIndex === 0}
                    className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 disabled:opacity-0 transition-all flex items-center justify-center"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => currentQuestionIndex < questions.length - 1 ? setCurrentQuestionIndex(prev => prev + 1) : handleFinalSubmit()}
                    disabled={!(personalityTraits as any)[currentQuestion.key] || submitLocked}
                    className="flex-[3] py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-30 transition-all"
                  >
                    {submitStatus === 'submitting' ? 'Aligning...' : currentQuestionIndex === questions.length - 1 ? 'Complete Assessment' : 'Next'}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* RESULTS STATE */}
          {showResults && analysisResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <ResultCard 
                detailedAnalysis={analysisResults.detailed_analysis}
                finalRecommendations={analysisResults.final_recommendations}
                onReset={resetForm}
                showInputData={analysisResults.inputData}
                 personalityTraits={analysisResults.inputData?.personality_traits} 
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* History Panel */}
      <HistoryPanel 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={analysisHistory}
        onLoadHistory={loadFromHistory}
      />
    </div>
  );
}

export default BirthInfoForm;