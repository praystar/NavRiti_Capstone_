import { Request, Response } from 'express';
import ParentPreference from '../models/ParentPreference';
import axios from 'axios';

export const submitParentPreferences = async (req: Request, res: Response) => {
  try {
    const userInput = req.body;
    const aiEndpoint = new URL('rescore-parent', `${(process.env.PARENTAL_API_URL ?? 'http://localhost:8002').replace(/\/$/, '')}/`).toString();

    // Step 1: Forward EXACT request to AI server
    let aiResponse;
    let aiStatus = 200;
    
    try {
      const response = await axios.post(aiEndpoint, userInput, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      aiResponse = response.data;
      aiStatus = response.status;
      
    } catch (aiError: any) {
      console.error("AI Server Error:", aiError);
      
      // If AI server fails, return the error
      return res.status(aiError.response?.status || 502).json({
        status: "error",
        message: "AI service request failed",
        error: aiError.message,
        ai_response: aiError.response?.data || null
      });
    }

    // Step 2: Save EXACT input and EXACT output
    const newPreference = new ParentPreference({
      user_input: userInput,        // Save user input exactly as received
      ai_output: aiResponse,        // Save AI output exactly as received
      ai_server_status: aiStatus
    });

    await newPreference.save();

    // Step 3: Return EXACT AI output to client
    res.status(201).json({
      status: "success",
      saved_id: newPreference._id,
      ai_response: aiResponse      // Return exact AI response
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ 
      status: "error",
      message: "Internal server error" 
    });
  }
};