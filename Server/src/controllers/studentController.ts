import { Request, Response } from 'express';
import StudentProfile from '../models/StudentProfile';
import multer from 'multer';
import path from 'path';
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';


const CAREER_API_BASE_URL = process.env.CAREER_API_URL ?? 'http://localhost:8001';

const careerApiUrl = (path: string) => new URL(path, `${CAREER_API_BASE_URL.replace(/\/$/, '')}/`).toString();


/* =========================
   Multer Config (CV Upload)
========================= */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/cvs/'),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `cv-${unique}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (_req: any, file: any, cb: any) => {
  file.mimetype === 'application/pdf'
    ? cb(null, true)
    : cb(new Error('Only PDF files allowed'), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});
const uploadDir = 'uploads/cvs';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadDir);
}
/* =========================
   STAGE 1 — School Student
========================= */
export const submitStage1 = async (req: Request, res: Response) => {
  try {
    const { name, schoolData } = req.body;

    if (!name || !schoolData) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and schoolData are required'
      });
    }

    // Prepare data for AI (convert comma-separated strings to arrays)
    const aiPayload = {
      name,
      grade: schoolData.grade,
      subject_preferences: schoolData.subject_preference 
        ? schoolData.subject_preference.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      extracurricular_activities: schoolData.extracurricular_activities
        ? schoolData.extracurricular_activities.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      hobbies: schoolData.hobbies || '',
      achievements: schoolData.achievements || '',
      dream_career: schoolData.dream_career || ''
    };

    console.log('Sending to AI:', aiPayload);

    // Call FastAPI Stage1
    const aiResponse = await axios.post(careerApiUrl('stage1'), aiPayload);

    // Persist to DB (use manual inputMethod as per schema enum)
    const profile = new StudentProfile({
      student_id: crypto.randomUUID(),
      name,
      level: 'school',
      inputMethod: 'manual', // Changed from 'api' to 'manual' to match enum
      schoolData: {
        subject_preference: schoolData.subject_preference || '',
        extracurricular_activities: schoolData.extracurricular_activities || '',
        hobbies: schoolData.hobbies || '',
        achievements: schoolData.achievements || '',
        dream_career: schoolData.dream_career || ''
      },
      aiResult: aiResponse.data,
      timestamp: new Date()
    });

    await profile.save();

    return res.status(201).json({
      status: 'success',
      message: 'Stage 1 analysis completed',
      ai_result: aiResponse.data,
      saved_id: profile._id
    });

  } catch (err: any) {
    console.error('Stage1 Error:', err?.response?.data || err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Stage1 AI processing failed',
      error: err?.response?.data || err.message
    });
  }
};

/* =========================
   STAGE 2 — UG (Manual)
========================= */
export const submitStage2 = async (req: Request, res: Response) => {
  try {
    const { name, input_data } = req.body;

    if (!name || !input_data) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and input_data are required'
      });
    }

    // Prepare data for AI (convert comma-separated strings to arrays)
    const aiInputData = {
      ...input_data,
      skills: input_data.skills 
        ? input_data.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      projects: input_data.projects
        ? input_data.projects.split(',').map((p: string) => p.trim()).filter(Boolean)
        : [],
      preferred_roles: input_data.preferred_roles
        ? input_data.preferred_roles.split(',').map((r: string) => r.trim()).filter(Boolean)
        : []
    };

    // Call FastAPI Stage2
    const aiResponse = await axios.post(careerApiUrl('stage2'), {
      name,
      input_data: aiInputData
    });

    const profile = new StudentProfile({
      student_id: crypto.randomUUID(),
      name,
      level: 'undergraduate',
      inputMethod: 'manual',
      ugData: input_data, // Store original string data
      aiResult: aiResponse.data,
      timestamp: new Date()
    });

    await profile.save();

    return res.status(201).json({
      status: 'success',
      message: 'Stage 2 analysis completed',
      ai_result: aiResponse.data,
      saved_id: profile._id
    });

  } catch (err: any) {
    console.error('Stage2 Error:', err?.response?.data || err.message);
    return res.status(500).json({
      status: 'error',
      message: 'Stage2 AI processing failed',
      error: err?.response?.data || err.message
    });
  }
};

/* =========================
   STAGE 2 — UG (CV Upload)
========================= */
/* =========================
   STAGE 2 — UG (CV Upload)
========================= */
export const submitStudentProfileWithCV = async (req: Request, res: Response) => {
  try {
    // console.log('🔍 DEBUG: Multer received file?', !!req.file);
    // console.log('🔍 DEBUG: File field name expected: "cv"');
    // console.log('🔍 DEBUG: File details:', req.file);
    // console.log('🔍 DEBUG: Request body:', req.body);
    
    const { name } = req.body;
    const file = req.file;

    if (!name || !file) {
      console.log('❌ Missing name or file:', { name: !!name, file: !!file });
      return res.status(400).json({
        status: 'error',
        message: 'Name and CV file are required'
      });
    }

    console.log('✅ File received successfully:', file.originalname);

    // Create FormData for Python backend
    const form = new FormData();
    
    // IMPORTANT: Send the file with proper metadata
    form.append('file', fs.createReadStream(file.path), {
      filename: file.originalname,
      contentType: file.mimetype
    });

    console.log('🚀 Sending to Python backend...');
    console.log('FormData headers:', form.getHeaders());
    
    // Call FastAPI upload_cv WITH NAME AS QUERY PARAMETER
    const aiResponse = await axios.post(
      `${careerApiUrl('upload_cv')}?name=${encodeURIComponent(name)}`, // <-- NAME IN QUERY
      form,
      { 
        headers: {
          'accept': 'application/json',
          ...form.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    console.log('✅ Python response status:', aiResponse.status);

    // Save to database
    const profile = new StudentProfile({
      student_id: crypto.randomUUID(),
      name,
      level: 'undergraduate',
      inputMethod: 'upload',
      cvFile: {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        uploadDate: new Date()
      },
      aiResult: aiResponse.data,
      timestamp: new Date()
    });

    await profile.save();

    // Clean up file after some time
    setTimeout(() => {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
        else console.log('Cleaned up file:', file.path);
      });
    }, 30000);

    return res.status(201).json({
      status: 'success',
      message: 'CV analyzed successfully',
      ai_result: aiResponse.data,
      saved_id: profile._id
    });

  } catch (err: any) {
    console.error('❌ CV Upload Error Details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      headers: err.response?.headers
    });
    
    // Clean up file on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'CV analysis failed',
      error: err.response?.data || err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};