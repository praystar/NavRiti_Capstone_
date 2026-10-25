/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, User, BookOpen, ChevronRight,
  Star, Sparkles, Compass, GraduationCap, Trophy,
  Rocket, Cpu, AlertCircle, CheckCircle, Target,
  Calendar, X, ExternalLink, Zap, TrendingUp, Brain,Briefcase  
} from 'lucide-react';
import AppNavbar from '../components/AppNavbar.tsx';
import Background from '../components/Background.tsx';
import InputResult from './InputResult.tsx';
import { useNavigate } from 'react-router-dom';

/* =====================
   VALIDATORS (UPDATED)
===================== */

const validators = {
  name: (v: string) => /^[a-zA-Z\s]{2,50}$/.test(v),
  text: (v: string) => v.trim().length >= 2,
  cgpa: (v: string) => {
    const num = parseFloat(v);
    return !isNaN(num) && num >= 0 && num <= 10 && /^\d+(\.\d{1,2})?$/.test(v);
  },
  year: (v: string) => /^[1-4]$/.test(v),
  grade: (v: number) => v >= 6 && v <= 12,
  commaSeparated: (v: string) => v.split(',').filter(s => s.trim()).length > 0,
};

/* =====================
   TOAST
===================== */
const Toast = ({ message, type }: { message: string; type: 'error' | 'success' }) => (
  <motion.div
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -100, opacity: 0 }}
    className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl backdrop-blur-xl border flex items-center gap-3 shadow-2xl ${
      type === 'error'
        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
    }`}
  >
    {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
    <span className="text-sm font-medium">{message}</span>
  </motion.div>
);

/* =====================
   INPUT FIELD
===================== */
const InputField = ({ label, icon: Icon, error, children }: any) => (
  <div className="space-y-2 group w-full">
    <label className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-2">
      <Icon className="w-3.5 h-3.5 text-indigo-400 mr-2" /> {label}
    </label>
    <div className="relative">
      {children}
      <Compass className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-white/40 transition-colors pointer-events-none" />
    </div>
    {error && (
      <motion.p 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-rose-400 ml-3 flex items-center gap-1"
      >
        <AlertCircle size={12} /> {error}
      </motion.p>
    )}
  </div>
);

/* =====================
   RESULT DISPLAY COMPONENT
===================== */
/* =====================
   RESULT DISPLAY COMPONENT - ENHANCED
===================== */
const ResultDisplay = ({ data, onClose }: { data: any; onClose: () => void }) => {
  if (!data) return null;

  const isSchool = data.stage?.includes('Class') || data.stage === 'school';
  const isUndergrad = data.stage === 'Undergraduate';
  const predictions = data.ai_predictions;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-20 backdrop-blur-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/10 border border-indigo-500/30 rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-500/20"
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold mb-2 bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
            Celestial Career Map
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
              <Sparkles size={14} className="text-yellow-400" />
              <span className="text-sm font-bold text-indigo-200">AI-Powered Analysis</span>
            </div>
            <span className="text-sm text-gray-400">
              Generated {new Date(data.generated_at || Date.now()).toLocaleDateString()} at {new Date(data.generated_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      {/* Student Info Card */}
      <div className="mb-10 p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{data.student_name || data.name}</h3>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-medium">
                {isSchool ? 'School Explorer' : 'University Voyager'}
              </span>
              {isSchool && data.grade && (
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium">
                  Class {data.grade}
                </span>
              )}
              {isUndergrad && data.input_data?.cgpa && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium">
                  CGPA: {data.input_data.cgpa}
                </span>
              )}
            </div>
            <div className="mt-3">
              <span className="text-sm text-gray-400">Stage: {data.stage}</span>
              {data.ai_powered && (
                <span className="ml-4 text-sm text-emerald-400">✓ AI-Powered</span>
              )}
            </div>
          </div>
          {isUndergrad && predictions?.employability_score ? (
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {predictions.employability_score}%
              </div>
              <div className="text-sm text-gray-400">Employability Score</div>
            </div>
          ) : isSchool && predictions?.top_career_paths?.[0]?.match_percentage && (
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                {predictions.top_career_paths[0].match_percentage}%
              </div>
              <div className="text-sm text-gray-400">Top Career Match</div>
            </div>
          )}
        </div>
      </div>

      {/* Career Paths Section - Shows ALL 5 careers */}
      {predictions?.top_career_paths && (
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <TrendingUp size={20} className="text-indigo-400" />
              Top Career Constellations
            </h3>
            <span className="text-sm text-indigo-300 font-medium">
              {predictions.top_career_paths.length} Careers Recommended
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predictions.top_career_paths.map((career: any, idx: number) => (
              <div
                key={idx}
                className="group p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-lg text-white">{career.career_title}</h4>
                      <div className="flex items-center gap-1">
                        <Zap size={16} className="text-yellow-400 opacity-60" />
                        <span className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                          {career.match_percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${career.match_percentage}%` }}
                      />
                    </div>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">{career.why_this_fits}</p>
                    
                    {career.role_models && (
                      <div className="mb-3">
                        <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Role Model</div>
                        <div className="text-sm text-indigo-200">{career.role_models}</div>
                      </div>
                    )}
                    
                    {career.fun_fact && (
                      <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">✨ Fun Fact</div>
                        <div className="text-sm text-gray-200">{career.fun_fact}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills & Actions Grid - Shows ALL sections */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Skills Section */}
        {predictions?.skills_to_develop_now && predictions.skills_to_develop_now.length > 0 && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-transparent border border-indigo-500/20">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <Brain size={20} className="text-indigo-400" />
              Skills to Develop Now
            </h3>
            <div className="space-y-4">
              {predictions.skills_to_develop_now.map((skill: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                  <div className="px-2 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-bold flex-shrink-0 mt-1">
                    {idx + 1}
                  </div>
                  <span className="text-gray-200 group-hover:text-white transition-colors">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activities Section */}
        {predictions?.activities_to_try && predictions.activities_to_try.length > 0 && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/20">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <Rocket size={20} className="text-purple-400" />
              Activities to Try
            </h3>
            <div className="space-y-4">
              {predictions.activities_to_try.map((activity: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                  <div className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs font-bold flex-shrink-0 mt-1">
                    {idx + 1}
                  </div>
                  <span className="text-gray-200 group-hover:text-white transition-colors">{activity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Learning Resources Section */}
      {predictions?.learning_resources && predictions.learning_resources.length > 0 && (
        <section className="mb-10">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <BookOpen size={20} className="text-emerald-400" />
            Learning Resources
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.learning_resources.map((resource: string, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/10 to-transparent border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                <div className="text-sm text-gray-300 leading-relaxed">{resource}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Monthly Action Plan */}
      {predictions?.monthly_action_plan && predictions.monthly_action_plan.length > 0 && (
        <section className="mb-10">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <Calendar size={20} className="text-cyan-400" />
            Monthly Action Plan
          </h3>
          <div className="space-y-3">
            {predictions.monthly_action_plan.map((action: string, idx: number) => {
              // Extract month range from action text
              const monthMatch = action.match(/Month\s+(\d+-\d+)/);
              return (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-cyan-900/10 to-blue-900/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <span className="text-sm font-bold text-cyan-300">{idx + 1}</span>
                    </div>
                    {monthMatch && (
                      <div className="text-xs text-cyan-400 text-center mt-1 font-medium">
                        {monthMatch[1]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-200 leading-relaxed">{action}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Encouragement Message */}
      {predictions?.encouragement_message && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 mb-10">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                <Sparkles size={24} className="text-yellow-400" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-white mb-3">Cosmic Encouragement</h4>
              <p className="text-gray-200 leading-relaxed text-lg">{predictions.encouragement_message}</p>
            </div>
          </div>
        </div>
      )}

      {/* For UG: Additional Sections */}
      {isUndergrad && predictions?.skill_gap_analysis && (
        <div className="mb-10">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
            <Target size={20} className="text-rose-400" />
            Skill Gap Analysis
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {predictions.skill_gap_analysis.strengths && predictions.skill_gap_analysis.strengths.length > 0 && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-transparent border border-emerald-500/20">
                <h4 className="font-bold text-lg text-emerald-300 mb-4">Strengths ✅</h4>
                <div className="space-y-2">
                  {predictions.skill_gap_analysis.strengths.map((strength: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10">
                      <CheckCircle size={16} className="text-emerald-400" />
                      <span className="text-gray-200">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {predictions.skill_gap_analysis.gaps && predictions.skill_gap_analysis.gaps.length > 0 && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-900/20 to-transparent border border-rose-500/20">
                <h4 className="font-bold text-lg text-rose-300 mb-4">Gaps to Fill 🔄</h4>
                <div className="space-y-2">
                  {predictions.skill_gap_analysis.gaps.map((gap: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/10">
                      <AlertCircle size={16} className="text-rose-400" />
                      <span className="text-gray-200">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Raw Data View (Optional - for debugging) */}
      <details className="mt-8 border border-white/10 rounded-xl overflow-hidden">
        <summary className="cursor-pointer p-4 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between text-gray-400 hover:text-white">
          <span className="font-medium">📊 View Complete Raw Response Data</span>
          <ChevronRight size={18} className="transition-transform group-open:rotate-90" />
        </summary>
        <div className="p-4 bg-black/20">
          <pre className="text-xs text-gray-300 overflow-auto max-h-96 whitespace-pre-wrap break-words">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </details>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <p className="text-sm text-gray-400">
          This celestial map is generated using AI. Your journey is unique - use this as a guide, not a destination.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Generated by NaviRiti AI Career Predictor • {data.ai_powered ? 'AI-Powered Analysis' : 'Basic Analysis'}
        </p>
      </div>
    </motion.div>
  );
};

/* =====================
   LOCAL STORAGE
===================== */
/* =====================
   LOCAL STORAGE
===================== */
const saveToLocalStorage = (payload: {
  level: string;
  input: any;
  result: any;
  timestamp?: string;
}) => {
  const dataToSave = {
    ...payload,
    savedAt: payload.timestamp || new Date().toISOString()
  };
  
  localStorage.setItem('StudentInput', JSON.stringify(dataToSave));
  console.log('Saved to localStorage:', dataToSave);
};

/* =====================
   MAIN COMPONENT
===================== */
const StudentInputPage = () => {
  const [studentName, setStudentName] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [ugInputMethod, setUgInputMethod] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resultData, setResultData] = useState<any>(null);
  const navigate = useNavigate();

  const [schoolData, setSchoolData] = useState({
    subject_preference: '',
    extracurricular_activities: '',
    hobbies: '',
    achievements: '',
    dream_career: '',
  });

  const [ugData, setUgData] = useState({
    degree: '',
    university: '',
    current_year: '',
    cgpa: '',
    skills: '',
    experience: '',
    projects: '',
    preferred_roles: '',
  });

  const [submitLocked, setSubmitLocked] = useState(false);
  const [grade, setGrade] = useState<number | ''>('');

  const [submitStatus, setSubmitStatus] =
    useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [toast, setToast] =
    useState<{ msg: string; type: 'error' | 'success' } | null>(null);

  const showToast = (msg: string, type: 'error' | 'success' = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* =====================
     VALIDATION FUNCTIONS
  ===================== */
  const validateAllFields = () => {
    const errors: Record<string, string> = {};

    // Validate name
    if (!validators.name(studentName)) {
      errors.studentName = 'Enter a valid name (2-50 letters)';
    }

    // Validate based on selected level
    if (selectedLevel === 'school') {
      if (!validators.grade(Number(grade))) {
        errors.grade = 'Grade must be between 6 and 12';
      }
      if (!validators.commaSeparated(schoolData.subject_preference)) {
        errors.subject_preference = 'Enter at least one subject';
      }
      if (!validators.text(schoolData.dream_career)) {
        errors.dream_career = 'Dream career is required';
      }
    }

    if (selectedLevel === 'undergraduate' && ugInputMethod === 'manual') {
      if (!validators.text(ugData.degree)) {
        errors.degree = 'Degree is required';
      }
      if (!validators.text(ugData.university)) {
        errors.university = 'University is required';
      }
      if (!validators.year(ugData.current_year)) {
        errors.current_year = 'Enter year 1-4';
      }
      if (!validators.cgpa(ugData.cgpa)) {
        errors.cgpa = 'Enter valid CGPA (0-10)';
      }
      if (!validators.commaSeparated(ugData.skills)) {
        errors.skills = 'Enter at least one skill';
      }
    }

    if (selectedLevel === 'undergraduate' && ugInputMethod === 'upload') {
      if (!cvFile) {
        errors.cvFile = 'Please upload a CV file';
      } else if (cvFile.size > 5 * 1024 * 1024) {
        errors.cvFile = 'File size must be less than 5MB';
      } else if (cvFile.type !== 'application/pdf') {
        errors.cvFile = 'Only PDF files are allowed';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* =====================
     CHANGE HANDLERS
  ===================== */
  const handleSchoolDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSchoolData(prev => ({ ...prev, [name]: value }));
    
    let error = '';
    if (name === 'subject_preference') {
      error = validators.commaSeparated(value) ? '' : 'Enter at least one subject';
    } else if (name === 'dream_career') {
      error = validators.text(value) ? '' : 'Required field';
    } else if (name === 'extracurricular_activities') {
      error = validators.commaSeparated(value) ? '' : 'Enter at least one activity';
    }
    
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleUgDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUgData(prev => ({ ...prev, [name]: value }));

    let error = '';
    if (name === 'cgpa') {
      error = validators.cgpa(value) ? '' : 'Invalid CGPA (0–10)';
    } else if (name === 'current_year') {
      error = validators.year(value) ? '' : 'Enter year 1–4';
    } else if (name === 'skills' || name === 'preferred_roles') {
      error = validators.commaSeparated(value) ? '' : 'Enter at least one item';
    } else if (['degree', 'university'].includes(name)) {
      error = validators.text(value) ? '' : 'Required field';
    }

    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setFieldErrors(prev => ({ ...prev, cvFile: 'Only PDF files are allowed' }));
        setCvFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors(prev => ({ ...prev, cvFile: 'File size must be less than 5MB' }));
        setCvFile(null);
        return;
      }
      setCvFile(file);
      setFieldErrors(prev => ({ ...prev, cvFile: '' }));
    }
  };


const handleSubmit = async () => {
  if (submitLocked) {
    showToast('Please wait for current operation to complete');
    return;
  }

  // Validate all fields
  if (!validateAllFields()) {
    showToast('Please fix the errors before submitting');
    return;
  }

  try {
    const SERVER_BASE = import.meta.env.VITE_SERVER_BASE_API ?? '/api';
    setSubmitLocked(true);
    setSubmitStatus('submitting');

    let response: Response;
    let resultData: any;
    let payload: any = {};

    if (selectedLevel === 'school') {
      // Prepare payload for school
      payload = {
        name: studentName,
        schoolData: {
          grade: Number(grade),
          subject_preference: schoolData.subject_preference,
          extracurricular_activities: schoolData.extracurricular_activities,
          hobbies: schoolData.hobbies,
          achievements: schoolData.achievements,
          dream_career: schoolData.dream_career,
        }
      };

      console.log('Sending school payload:', payload);

      response = await fetch(`${SERVER_BASE}/student/stage1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      resultData = responseData.ai_result || responseData;
      //setResultData(resultData);

      // Save to localStorage for school
      saveToLocalStorage({
        level: 'school',
        input: {
          studentName,
          grade: Number(grade),
          schoolData: {
            subject_preference: schoolData.subject_preference,
            extracurricular_activities: schoolData.extracurricular_activities,
            hobbies: schoolData.hobbies,
            achievements: schoolData.achievements,
            dream_career: schoolData.dream_career,
          }
        },
        result: resultData,
        timestamp: new Date().toISOString()
      });
    }

    if (selectedLevel === 'undergraduate' && ugInputMethod === 'manual') {
      // Prepare payload for UG manual
      payload = {
        name: studentName,
        input_data: {
          degree: ugData.degree,
          university: ugData.university,
          current_year: ugData.current_year,
          cgpa: ugData.cgpa,
          skills: ugData.skills,
          experience: ugData.experience,
          projects: ugData.projects,
          preferred_roles: ugData.preferred_roles,
        }
      };

      console.log('Sending UG payload:', payload);

      response = await fetch(`${SERVER_BASE}/student/stage2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      resultData = responseData.ai_result || responseData;
      //setResultData(resultData);

      // Save to localStorage for UG manual
      saveToLocalStorage({
        level: 'undergraduate-manual',
        input: payload.input_data,
        result: resultData,
        timestamp: new Date().toISOString()
      });
    }

    if (selectedLevel === 'undergraduate' && ugInputMethod === 'upload' && cvFile) {
      const formData = new FormData();
  formData.append('name', studentName);
  formData.append('cv', cvFile); // CHANGE THIS LINE - 'cv' to 'file'
  
  response = await fetch(`${SERVER_BASE}/student/profile-cv`, {
    method: 'POST',
    body: formData,
  });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      resultData = responseData.ai_result || responseData;
      //setResultData(resultData);

      // Save to localStorage for CV upload
      saveToLocalStorage({
        level: 'undergraduate-cv',
        input: { 
          studentName, 
          fileName: cvFile.name,
          fileSize: cvFile.size,
          fileType: cvFile.type 
        },
        result: resultData,
        timestamp: new Date().toISOString()
      });
    }

    setSubmitStatus('success');
    showToast('Profile has been generated.', 'success');
    setTimeout(() => {
      navigate('/Celestialmapping'); 
    }, 1500);
    
    // Scroll to result
    setTimeout(() => {
      const resultElement = document.querySelector('.result-section');
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);

  } catch (error: any) {
    console.error('Submission error:', error);
    setSubmitStatus('error');
    showToast(error.message || ' Please try again.', 'error');
  } finally {
    setSubmitLocked(false);
  }
};
  // Check if form is valid for submission
  const isFormValid = () => {
    if (selectedLevel === 'school') {
      return validators.name(studentName) && 
             validators.grade(Number(grade)) &&
             validators.commaSeparated(schoolData.subject_preference) &&
             validators.text(schoolData.dream_career);
    }
    
    if (selectedLevel === 'undergraduate' && ugInputMethod === 'manual') {
      return validators.name(studentName) &&
             validators.text(ugData.degree) &&
             validators.text(ugData.university) &&
             validators.year(ugData.current_year) &&
             validators.cgpa(ugData.cgpa) &&
             validators.commaSeparated(ugData.skills);
    }
    
    if (selectedLevel === 'undergraduate' && ugInputMethod === 'upload') {
      return validators.name(studentName) && cvFile;
    }
    
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <Background intensity="medium" showConstellations={true} />
      <AppNavbar showAuthLinks={false} />
      
      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} />}
      </AnimatePresence>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-20">
        
        <header className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6 text-indigo-300 text-[10px] font-bold tracking-[0.3em] uppercase"
          >
            <Sparkles className="w-3 h-3 mr-2 text-yellow-400" /> Registration
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent mb-4">
            Student Profile
          </h1>
          <p className="text-gray-400">Initialize your academic coordinates to begin mapping.</p>
        </header>

        <div className="backdrop-blur-2xl bg-gray-900/40 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-500/10">
          
          {/* Identity Section */}
          <section className="mb-12">
            <InputField label="Full Name" icon={User} error={fieldErrors.studentName}>
              <input
                type="text"
                value={studentName}
                onChange={(e) => {
                  const v = e.target.value;
                  setStudentName(v);
                  setFieldErrors(prev => ({
                    ...prev,
                    studentName: validators.name(v) ? '' : 'Invalid name (2-50 letters)'
                  }));
                }}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-indigo-500/50 outline-none transition-all text-lg pr-14"
                placeholder="Enter your name"
              />
            </InputField>
          </section>

          {/* Level Selection */}
          <section className="mb-12">
            <label className="flex items-center text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 ml-2">
              <BookOpen className="w-3 h-3 text-indigo-400 mr-2" /> Current Phase
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'school', title: 'Schooling', desc: 'Classes 6 - 12', icon: GraduationCap },
                { id: 'undergraduate', title: 'Undergraduate', desc: 'University Orbit', icon: Rocket }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => { 
                    setSelectedLevel(lvl.id); 
                    setUgInputMethod('');
                    setResultData(null);
                    setFieldErrors({});
                  }}
                  className={`group p-5 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                    selectedLevel === lvl.id 
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <lvl.icon className={`w-6 h-6 transition-colors ${selectedLevel === lvl.id ? 'text-indigo-400' : 'text-gray-600'}`} />
                    <div>
                        <div className="text-base font-bold">{lvl.title}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-tighter font-bold">{lvl.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <AnimatePresence mode="wait">
            {/* SCHOOL FORM */}
            {selectedLevel === 'school' && (
  <motion.div key="school" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8 pt-10 border-t border-white/5">
    <div className="grid md:grid-cols-2 gap-8">
      <InputField label="Preferred Subjects" icon={BookOpen} error={fieldErrors.subject_preference}>
        <input 
          type="text" 
          name="subject_preference" 
          value={schoolData.subject_preference} 
          onChange={handleSchoolDataChange}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-indigo-500/50 outline-none transition-all" 
          placeholder="Math, Physics, Arts..." 
        />
      </InputField>
      
      <InputField label="Class / Grade" icon={GraduationCap} error={fieldErrors.grade}>
        <input
          type="number"
          min={6}
          max={12}
          value={grade}
          onChange={(e) => {
            const v = Number(e.target.value);
            setGrade(v);
            setFieldErrors(prev => ({
              ...prev,
              grade: validators.grade(v) ? '' : 'Grade must be 6–12'
            }));
          }}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-indigo-500/50 outline-none transition-all"
          placeholder="6 - 12"
        />
      </InputField>
    </div>
    
    <InputField label="Hobbies" icon={Star}>
      <input 
        type="text" 
        name="hobbies" 
        value={schoolData.hobbies} 
        onChange={handleSchoolDataChange}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-indigo-500/50 outline-none transition-all" 
        placeholder="Coding, Music..." 
      />
    </InputField>
    
    {/* ADD THIS ACHIEVEMENTS FIELD */}
    <InputField label="Achievements" icon={Trophy}>
      <textarea 
        name="achievements" 
        value={schoolData.achievements} 
        onChange={handleSchoolDataChange} 
        rows={3}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-indigo-500/50 outline-none transition-all resize-none" 
        placeholder="School-level coding competition finalist, Science fair winner..." 
      />
    </InputField>
    
    <InputField label="Extracurricular Exploration" icon={Trophy}>
      <textarea 
        name="extracurricular_activities" 
        value={schoolData.extracurricular_activities} 
        onChange={handleSchoolDataChange} 
        rows={3}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-indigo-500/50 outline-none transition-all resize-none" 
        placeholder="Coding Club, Chess, Drawing..." 
      />
    </InputField>
    
    <InputField label="Dream Trajectory" icon={Target} error={fieldErrors.dream_career}>
      <input 
        type="text" 
        name="dream_career" 
        value={schoolData.dream_career} 
        onChange={handleSchoolDataChange}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-indigo-500/50 outline-none transition-all" 
        placeholder="Software Engineer, Doctor, Artist..." 
      />
    </InputField>
  </motion.div>
)}
            {/* UG METHOD SELECTION */}
            {selectedLevel === 'undergraduate' && !ugInputMethod && (
              <motion.div key="ug-choice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-white/5">
                <button 
                  onClick={() => setUgInputMethod('upload')} 
                  className="flex-1 flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50 transition-all group"
                >
                  <Upload className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <span className="font-bold text-sm block">Transmit PDF CV</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Quick Scan</span>
                  </div>
                </button>
                <button 
                  onClick={() => setUgInputMethod('manual')} 
                  className="flex-1 flex items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50 transition-all group"
                >
                  <FileText className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <span className="font-bold text-sm block">Manual Configuration</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Detailed Entry</span>
                  </div>
                </button>
              </motion.div>
            )}

            {/* UG UPLOAD */}
            {selectedLevel === 'undergraduate' && ugInputMethod === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-10 border-t border-white/5">
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">PDF  Transmission</span>
                  <button 
                    onClick={() => {
                      setUgInputMethod('');
                      setCvFile(null);
                      setFieldErrors(prev => ({ ...prev, cvFile: '' }));
                    }} 
                    className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-tighter"
                  >
                    Back
                  </button>
                </div>
                <div className="relative border-2 border-dashed border-white/10 rounded-[2rem] p-12 text-center hover:border-indigo-500/40 transition-all bg-white/5 group">
                  <input 
                    type="file" 
                    id="cv-upload" 
                    onChange={handleFileChange} 
                    accept=".pdf" 
                    className="hidden" 
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer block">
                    <Upload className="w-12 h-12 mx-auto text-indigo-500/30 mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-lg font-bold">{cvFile ? cvFile.name : "Upload CV/Resume"}</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Max 5MB • PDF Document</p>
                  </label>
                  {fieldErrors.cvFile && (
                    <p className="text-sm text-rose-400 mt-4">{fieldErrors.cvFile}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* UG MANUAL */}
            {selectedLevel === 'undergraduate' && ugInputMethod === 'manual' && (
              <motion.div key="manual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 pt-10 border-t border-white/5">
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Manual Node Configuration</span>
                  <button 
                    onClick={() => {
                      setUgInputMethod('');
                      setUgData({
                        degree: '',
                        university: '',
                        current_year: '',
                        cgpa: '',
                        skills: '',
                        experience: '',
                        projects: '',
                        preferred_roles: '',
                      });
                    }} 
                    className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-tighter"
                  >
                    Back
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <InputField label="Degree" icon={GraduationCap} error={fieldErrors.degree}>
                    <input 
                      type="text" 
                      name="degree" 
                      value={ugData.degree} 
                      onChange={handleUgDataChange} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none transition-all focus:border-indigo-500/50" 
                      placeholder="B.Tech, B.Sc..." 
                    />
                  </InputField>
                  
                  <InputField label="University" icon={Compass} error={fieldErrors.university}>
                    <input 
                      type="text" 
                      name="university" 
                      value={ugData.university} 
                      onChange={handleUgDataChange} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/50" 
                      placeholder="Your university name" 
                    />
                  </InputField>
                  
                  <InputField label="Current Year" icon={Calendar} error={fieldErrors.current_year}>
                    <input 
                      type="number" 
                      name="current_year" 
                      min="1" 
                      max="4" 
                      value={ugData.current_year} 
                      onChange={handleUgDataChange} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/50" 
                      placeholder="1-4" 
                    />
                  </InputField>
                  
                  <InputField label="CGPA" icon={Star} error={fieldErrors.cgpa}>
                    <input 
                      type="number" 
                      name="cgpa" 
                      step="0.01" 
                      min="0" 
                      max="10" 
                      value={ugData.cgpa} 
                      onChange={handleUgDataChange} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/50" 
                      placeholder="0-10" 
                    />
                  </InputField>
                </div>
                
                <InputField label="Technical Skills" icon={Cpu} error={fieldErrors.skills}>
                  <textarea 
                    name="skills" 
                    value={ugData.skills} 
                    onChange={handleUgDataChange} 
                    rows={2} 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/50 resize-none" 
                    placeholder="Python, React, AWS..." 
                  />
                </InputField>
                 <InputField label="Experience" icon={Briefcase}>
      <textarea 
        name="experience" 
        value={ugData.experience} 
        onChange={handleUgDataChange} 
        rows={3} 
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/50 resize-none" 
        placeholder="Internship at fintech startup, Freelance projects..." 
      />
    </InputField>
                <InputField label="Projects" icon={Rocket}>
                  <textarea 
                    name="projects" 
                    value={ugData.projects} 
                    onChange={handleUgDataChange} 
                    rows={2} 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/50 resize-none" 
                    placeholder="Resume Parser, Stock Prediction..." 
                  />
                </InputField>
                
                <InputField label="Preferred Roles" icon={Target}>
                  <textarea 
                    name="preferred_roles" 
                    value={ugData.preferred_roles} 
                    onChange={handleUgDataChange} 
                    rows={2} 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/50 resize-none" 
                    placeholder="Data Scientist, ML Engineer..." 
                  />
                </InputField>
              </motion.div>
            )}
          </AnimatePresence>

          {/* GLOBAL ACTION BUTTON */}
          {(selectedLevel === 'school' || (selectedLevel === 'undergraduate' && ugInputMethod)) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16 flex justify-center">
              <button 
                onClick={handleSubmit} 
                disabled={submitLocked || !isFormValid() || Object.values(fieldErrors).some(Boolean)}
                className={`group relative w-full sm:w-auto min-w-[280px] px-12 py-5 rounded-[1.5rem] font-black text-lg shadow-xl transition-all ${
                  submitLocked || !isFormValid() || Object.values(fieldErrors).some(Boolean)
                    ? 'opacity-40 cursor-not-allowed bg-gray-700'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-500/20 hover:scale-[1.03] active:scale-[0.98]'
                }`}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {submitStatus === 'submitting' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing your Profile
                    </>
                  ) : (
                    <>
                      {submitStatus === 'success' ? 'Aligned' : 'Submit Profile'}
                      <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </motion.div>
          )}
        </div>

        {/* Result Display Section */}
     <AnimatePresence>
  {resultData && (
    <div className="result-section">
      <InputResult 
        data={resultData} 
        onClose={() => setResultData(null)} 
      />
    </div>
  )}
</AnimatePresence>
        {/* Add this inside the main section for testing */}
{/* History Button */}
{/* History Button */}
<button
  onClick={() => {
    const saved = localStorage.getItem('StudentInput');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        
        // Populate input fields based on saved data
        if (data.level === 'school') {
          // Set the level
          setSelectedLevel('school');
          
          // Populate student name
          setStudentName(data.input.studentName || '');
          
          // Populate grade
          setGrade(data.input.grade || '');
          
          // Populate school data
          setSchoolData({
            subject_preference: data.input.schoolData?.subject_preference || '',
            extracurricular_activities: data.input.schoolData?.extracurricular_activities || '',
            hobbies: data.input.schoolData?.hobbies || '',
            achievements: data.input.schoolData?.achievements || '',
            dream_career: data.input.schoolData?.dream_career || '',
          });
          
          // Set UG input method to empty
          setUgInputMethod('');
          
        } else if (data.level === 'undergraduate-manual') {
          // Set the level
          setSelectedLevel('undergraduate');
          setUgInputMethod('manual');
          
          // Populate student name (if available in the saved data)
          setStudentName(data.input?.name || '');
          
          // Populate UG data
          setUgData({
            degree: data.input.degree || '',
            university: data.input.university || '',
            current_year: data.input.current_year || '',
            cgpa: data.input.cgpa || '',
            skills: data.input.skills || '',
            experience: data.input.experience || '',
            projects: data.input.projects || '',
            preferred_roles: data.input.preferred_roles || '',
          });
          
        } else if (data.level === 'undergraduate-cv') {
          // Set the level
          setSelectedLevel('undergraduate');
          setUgInputMethod('upload');
          
          // Populate student name
          setStudentName(data.input.studentName || '');
          
          // Note: File cannot be restored from localStorage
          // You might want to show a message about this
          showToast('Note: CV file cannot be restored from history. Manual entry fields are populated instead.', 'success');
          
          // Optionally, switch to manual mode and populate what we can
          setTimeout(() => {
            setUgInputMethod('manual');
            // You could set some default values or leave empty
          }, 1500);
        }
        
        // Show the saved result
        setResultData(data.result);
        
        // Clear any existing errors
        setFieldErrors({});
        
        // Scroll to result
        setTimeout(() => {
          const resultElement = document.querySelector('.result-section');
          if (resultElement) {
            resultElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        
        showToast('Loaded previous analysis from history', 'success');
        
      } catch (err) {
        showToast('Error loading history', 'error');
        console.error('LocalStorage parse error:', err);
      }
    } else {
      showToast('No previous analysis found', 'error');
    }
  }}
  className="fixed bottom-4 right-4 px-4 py-2 text-xs bg-indigo-600/20 border border-indigo-500/30 rounded-lg hover:bg-indigo-600/30 flex items-center gap-2 backdrop-blur-sm"
>
  <BookOpen size={14} /> Load History
</button>


      </main>
    </div>
  );
};

export default StudentInputPage;