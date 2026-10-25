// src/controllers/societalController.ts
import { Request, Response } from 'express';
import SocietalAnalysis from '../models/SocietalAnalysis';
import axios from 'axios';

// Define survey questions
const surveyQuestions: SurveySection[] = [
  {
    section: "A",
    title: "Social Influence",
    icon: "Users",
    color: "from-indigo-500 to-purple-500",
    gradient: "bg-gradient-to-br from-indigo-500/20 to-purple-500/20",
    questions: [
      "Doctors or healthcare professionals inspire me to choose a medical career.",
      "My friends choosing technology-related careers does not affect my career preferences.",
      "If someone in my family or relatives works in government services, I feel encouraged to pursue a similar career.",
      "When my friends show interest in medical professions, it influences my career thinking.",
      "Technology professionals do not influence my career decisions.",
      "If someone in my family works in technology, I feel encouraged to pursue a similar field."
    ]
  },
  {
    section: "B",
    title: "Family & Community Impact",
    icon: "Globe",
    color: "from-emerald-500 to-teal-500",
    gradient: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20",
    questions: [
      "Friends preparing for government careers do not influence my career choice.",
      "Family members in the medical field encourage me to consider healthcare careers.",
      "Watching a respected government officer motivates me to consider government services.",
      "Family members working in technology do not influence my career choice.",
      "Doctors do not influence my career choice.",
      "If many of my close friends choose technology-related careers, I feel motivated to consider the same."
    ]
  },
  {
    section: "C",
    title: "Professional Inspiration",
    icon: "Target",
    color: "from-amber-500 to-orange-500",
    gradient: "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
    questions: [
      "Having family members or relatives in government services does not influence my interest in pursuing a government career.",
      "My friends' interest in medical professions has no impact on my career decisions.",
      "A successful technology professional inspires me to pursue a tech career.",
      "Seeing my friends prepare for government service careers makes me consider that path.",
      "A medical background in my family does not influence my career choice.", 
      "Government officers do not motivate me to pursue government services."
    ]
  }
];

const FASTAPI_URL = process.env.SOCIETY_API_URL ?? 'http://localhost:8004';

export const analyzeSocietal = async (req: Request, res: Response) => {
  let savedDocId: string | null = null;
  let fastApiSuccess = false;
  
  try {
    const inputPayload = req.body ?? {};

    // Validate that we have responses array
    if (!inputPayload.responses) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing "responses" field in request body'
      });
    }

    // Create structured responses with questions
    const structuredResponses = createStructuredResponses(inputPayload.responses);
    
    // Extract the answers array for the model
    const answersArray = extractAnswersArray(structuredResponses);

    if (answersArray.length !== 18) {
      return res.status(400).json({
        status: 'error',
        message: `Expected 18 responses, got ${answersArray.length}`
      });
    }

    let originalModelResponse: any = null;
    let fastApiError: string | null = null;

    // Try to call FastAPI recommendation endpoint
    try {
      const fastApiResponse = await axios.post(new URL('recommend', `${FASTAPI_URL.replace(/\/$/, '')}/`).toString(), {
        answers: answersArray
      }, {
        timeout: 100000 // 10 second timeout
      });

      originalModelResponse = fastApiResponse.data;
      fastApiSuccess = true;

    } catch (fastApiErr) {
      console.error('FastAPI call failed:', fastApiErr);
      
      // Store error details
      if (axios.isAxiosError(fastApiErr)) {
        fastApiError = fastApiErr.response?.data?.detail || fastApiErr.message;
      } else {
        fastApiError = (fastApiErr as Error).message;
      }

      // Create fallback when FastAPI fails
      originalModelResponse = {
        bias_scores: {},
        domain_scores: {},
        recommended_domains: [],
        reason: 'FastAPI analysis failed, data saved for retry',
        gemini_explanation: 'Analysis pending - FastAPI service unavailable'
      };
    }

    // Save to MongoDB with complete data
    const doc = new SocietalAnalysis({
      input: {
        ...inputPayload,
        responses: structuredResponses, // Now includes questions
        answersArray
      },
      analysis: {
        original_response: originalModelResponse, // Store full model response ONLY
      },
      meta: {
        receivedAt: new Date().toISOString(),
        sourceIp: req.ip,
        userAgent: req.get('user-agent'),
        fastApiStatus: fastApiSuccess ? 'success' : 'failed',
        fastApiError: fastApiError || undefined
      }
    });

    await doc.save();
    savedDocId = doc._id.toString();

    // Return response based on FastAPI status
    if (fastApiSuccess) {
      return res.status(201).json({
        status: 'success',
        message: 'Analysis completed and saved to database.',
        analysis: {
          original_response: originalModelResponse // Return ONLY the model response
        },
        saved_id: savedDocId
      });
    } else {
      return res.status(202).json({
        status: 'partial_success',
        message: 'Survey saved, but analysis failed. You can retry later.',
        analysis: {
          original_response: originalModelResponse
        },
        saved_id: savedDocId,
        error: fastApiError
      });
    }

  } catch (err) {
    console.error('Error in analyzeSocietal:', err);
    
    // If we saved to MongoDB before this error, include that info
    if (savedDocId) {
      return res.status(500).json({
        status: 'error',
        message: 'Server error after saving to database',
        saved_id: savedDocId,
        error: (err as Error).message
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: (err as Error).message
    });
  }
};

/**
 * Helper: Create structured responses with questions
 * Converts: { A: {0: 4, 1: 3, ...} } -> { A: {0: {question: "...", answer: 4}, 1: {...}}}
 */
function createStructuredResponses(responses: Record<string, Record<string, number>>): Record<string, Record<string, { question: string; answer: number }>> {
  const structured: Record<string, Record<string, { question: string; answer: number }>> = {};
  
  // Map sections A, B, C
  ['A', 'B', 'C'].forEach((section, sectionIndex) => {
    if (!responses[section]) {
      throw new Error(`Missing section ${section} in responses`);
    }
    
    structured[section] = {};
    
    // Find the survey section
    const surveySection = surveyQuestions.find(s => s.section === section);
    if (!surveySection) {
      throw new Error(`No questions defined for section ${section}`);
    }
    
    // Map each question index to question text and answer
    Object.entries(responses[section]).forEach(([questionIndexStr, answer]) => {
      const questionIndex = parseInt(questionIndexStr);
      
      if (questionIndex < 0 || questionIndex >= surveySection.questions.length) {
        throw new Error(`Invalid question index ${questionIndex} for section ${section}`);
      }
      
      if (typeof answer !== 'number' || answer < 1 || answer > 5) {
        throw new Error(
          `Invalid answer for section ${section}, question ${questionIndex}: expected number 1-5, got ${answer}`
        );
      }
      
      structured[section][questionIndex] = {
        question: surveySection.questions[questionIndex],
        answer: answer
      };
    });
  });
  
  return structured;
}

/**
 * Helper: Extract flat answers array from structured responses for the model
 */
function extractAnswersArray(structuredResponses: Record<string, Record<string, { question: string; answer: number }>>): number[] {
  const sections = ['A', 'B', 'C'];
  const answersArray: number[] = [];
  
  for (const section of sections) {
    const sectionResponses = structuredResponses[section];
    
    // Get answers in order (0, 1, 2, 3, 4, 5)
    for (let i = 0; i < 6; i++) {
      if (!sectionResponses[i]) {
        throw new Error(`Missing answer for section ${section}, question ${i}`);
      }
      answersArray.push(sectionResponses[i].answer);
    }
  }
  
  return answersArray;
}

// Type definitions for survey sections
interface SurveySection {
  section: string;
  title: string;
  icon: string;
  color: string;
  gradient: string;
  questions: string[];
}