import { Request, Response } from 'express';
import BirthInfo from '../models/BirthInfo';
import { v4 as uuidv4 } from 'uuid';

export const analyzeBirthInfo = async (req: Request, res: Response) => {
  try {
    // Get data from request
    const { birth_date, birth_time, birth_place, personality_traits } = req.body;
    
    // Validation
    if (!birth_date || !birth_time || !birth_place) {
      return res.status(400).json({
        status: "error",
        message: "birth_date, birth_time, and birth_place are required"
      });
    }
    
    // Generate unique ID
    const birth_id = uuidv4();
    
    // Prepare request for Kundali API
    const kundaliRequest = {
      birth_date,
      birth_time,
      birth_place,
      ...(personality_traits && { personality_traits })
    };
    
    // Call Kundali API
    let kundaliResponse;
    try {
      const kundaliUrl = new URL('kundali', `${(process.env.KUNDALI_API_URL ?? 'http://localhost:8003').replace(/\/$/, '')}/`).toString();
      const response = await fetch(kundaliUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kundaliRequest),
      });
      
      if (response.ok) {
        kundaliResponse = await response.json();
      } else {
        kundaliResponse = {
          error: `API returned ${response.status}`,
          requested_data: kundaliRequest
        };
      }
    } catch (error: any) {
      kundaliResponse = {
        error: error.message,
        requested_data: kundaliRequest
      };
    }
    
    // Create document with COMPLETE input and COMPLETE output
    const birthInfoData = {
      birth_id,
      // Complete input
      input: {
        birth_date,
        birth_time,
        birth_place,
        ...(personality_traits && { personality_traits })
      },
      // Complete output from Kundali API
      output: kundaliResponse,
      timestamp: new Date()
    };
    
    // Save to MongoDB
    const savedDoc = await BirthInfo.create(birthInfoData);
    
    // Return COMPLETE output
    return res.status(201).json({
      status: kundaliResponse.error ? "partial_success" : "success",
      message: kundaliResponse.error 
        ? "Saved input data, but Kundali service had issues" 
        : "Analysis complete",
      data: {
        analysis_id: birth_id,
        database_id: savedDoc._id
      },
      // Return the complete Kundali API response
      ...kundaliResponse
    });
    
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message
    });
  }
};