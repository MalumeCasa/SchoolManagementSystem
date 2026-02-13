import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    // FIX: Use formData() instead of json() since we're sending FormData
    const formData = await request.formData()
    
    const image = formData.get('image') as string | null
    const pdf = formData.get('pdf') as File | null
    const fileName = formData.get('fileName') as string | null
    const fileSize = formData.get('fileSize') as string | null
    const fileType = formData.get('fileType') as string | null

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // For PDF files
    if (pdf) {
      const pdfBuffer = await pdf.arrayBuffer()
      return await processPDFWithGemini(pdfBuffer, fileName || 'document.pdf')
    }

    // For images
    if (image) {
      return await processImageWithGemini(image)
    }

    return NextResponse.json(
      { error: 'No image or PDF provided' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Gemini API Error:', error)
    return NextResponse.json(
      { 
        error: 'AI processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function processImageWithGemini(imageData: string) {
  try {
    // Get the model - using Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    })

    // Remove data URL prefix if present
    const base64Image = imageData.replace(/^data:image\/\w+;base64,/, '')
    
    // Create prompt for document extraction
    const prompt = `
    Analyze this ID document image and extract the following information in JSON format.
    
    Extract these fields if present:
    1. fullName - Full name of the person
    2. idNumber - ID number, passport number, or identification number
    3. dateOfBirth - Date of birth in YYYY-MM-DD format
    4. gender - Gender (Male/Female/Other)
    5. address - Full residential address
    
    IMPORTANT INSTRUCTIONS:
    - Return ONLY valid JSON with no additional text, no markdown formatting, no code blocks
    - Use null for missing fields
    - Format dates as YYYY-MM-DD
    - If gender is not specified, use null
    - Include a confidence score from 0.0 to 1.0 for the overall extraction
    
    JSON structure:
    {
      "fullName": "string or null",
      "idNumber": "string or null",
      "dateOfBirth": "string or null",
      "gender": "string or null",
      "address": "string or null",
      "confidence": number
    }
    `

    // Generate content with image
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      }
    ])

    const response = await result.response
    let text = response.text()
    
    // Clean the response more aggressively
    text = text.replace(/```json\s*/g, '')
    text = text.replace(/```\s*/g, '')
    text = text.replace(/^\s*\{/, '{')
    text = text.replace(/\}\s*$/, '}')
    text = text.trim()
    
    console.log('Cleaned Gemini response:', text) // Debug log
    
    // Try to parse the JSON
    try {
      const extractedData = JSON.parse(text)
      
      // Validate the structure
      if (!extractedData.fullName && !extractedData.idNumber && !extractedData.dateOfBirth) {
        throw new Error('No valid data extracted')
      }
      
      return NextResponse.json({
        ...extractedData,
        fields: {
          fullName: { 
            value: extractedData.fullName || null, 
            confidence: extractedData.fullName ? 0.9 : 0 
          },
          idNumber: { 
            value: extractedData.idNumber || null, 
            confidence: extractedData.idNumber ? 0.95 : 0 
          },
          dateOfBirth: { 
            value: extractedData.dateOfBirth || null, 
            confidence: extractedData.dateOfBirth ? 0.8 : 0 
          },
          gender: { 
            value: extractedData.gender || null, 
            confidence: extractedData.gender ? 0.85 : 0 
          },
          address: { 
            value: extractedData.address || null, 
            confidence: extractedData.address ? 0.7 : 0 
          }
        },
        rawText: text
      })
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      console.error('Failed to parse:', text)
      
      // If JSON parsing fails, try to extract JSON from the text using regex
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const extractedData = JSON.parse(jsonMatch[0])
          return NextResponse.json({
            ...extractedData,
            fields: {
              fullName: { value: extractedData.fullName || null, confidence: extractedData.fullName ? 0.9 : 0 },
              idNumber: { value: extractedData.idNumber || null, confidence: extractedData.idNumber ? 0.95 : 0 },
              dateOfBirth: { value: extractedData.dateOfBirth || null, confidence: extractedData.dateOfBirth ? 0.8 : 0 },
              gender: { value: extractedData.gender || null, confidence: extractedData.gender ? 0.85 : 0 },
              address: { value: extractedData.address || null, confidence: extractedData.address ? 0.7 : 0 }
            },
            rawText: text
          })
        } catch (e) {
          // If still fails, use regex fallback
          return extractWithRegexFallback(text)
        }
      }
      
      return extractWithRegexFallback(text)
    }

  } catch (error) {
    console.error('Gemini Vision Error:', error)
    // Return a graceful fallback instead of throwing
    return NextResponse.json({
      fullName: null,
      idNumber: null,
      dateOfBirth: null,
      gender: null,
      address: null,
      confidence: 0.1,
      note: "Failed to process image with AI",
      fields: {
        fullName: { value: null, confidence: 0 },
        idNumber: { value: null, confidence: 0 },
        dateOfBirth: { value: null, confidence: 0 },
        gender: { value: null, confidence: 0 },
        address: { value: null, confidence: 0 }
      },
      rawText: ""
    })
  }
}

async function processPDFWithGemini(pdfData: ArrayBuffer, fileName: string) {
  try {
    // For PDFs, we need to convert to image first
    // This is a placeholder - you'll need to implement PDF to image conversion
    // Consider using libraries like 'pdf-poppler' or 'pdf2img'
    
    return NextResponse.json({
      fullName: fileName.replace(/\.[^/.]+$/, ""),
      idNumber: null,
      dateOfBirth: null,
      gender: null,
      address: null,
      confidence: 0.2,
      note: "PDF processing requires additional setup. For best results, please use image files.",
      fields: {
        fullName: { value: fileName.replace(/\.[^/.]+$/, ""), confidence: 0.5 },
        idNumber: { value: null, confidence: 0 },
        dateOfBirth: { value: null, confidence: 0 },
        gender: { value: null, confidence: 0 },
        address: { value: null, confidence: 0 }
      }
    })
  } catch (error) {
    console.error('PDF Processing Error:', error)
    return NextResponse.json({
      fullName: null,
      idNumber: null,
      dateOfBirth: null,
      gender: null,
      address: null,
      confidence: 0.1,
      note: "Failed to process PDF",
      fields: {
        fullName: { value: null, confidence: 0 },
        idNumber: { value: null, confidence: 0 },
        dateOfBirth: { value: null, confidence: 0 },
        gender: { value: null, confidence: 0 },
        address: { value: null, confidence: 0 }
      }
    })
  }
}

function extractWithRegexFallback(text: string) {
  console.log('Using regex fallback for text:', text.substring(0, 200))
  
  const extractedData: any = {
    fullName: null,
    idNumber: null,
    dateOfBirth: null,
    gender: null,
    address: null,
    confidence: 0.3
  }

  // Try to extract name
  const nameMatch = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/)
  if (nameMatch) {
    extractedData.fullName = nameMatch[0]
    extractedData.confidence += 0.2
  }

  // Try to extract ID number
  const idMatch = text.match(/\b(?:ID|Passport|No\.?|Number)\s*[:#]?\s*([A-Z0-9\-]{6,20})\b/i)
  if (idMatch) {
    extractedData.idNumber = idMatch[1]
    extractedData.confidence += 0.2
  }

  // Try to extract date of birth - multiple formats
  const dateMatch = text.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\b/) || 
                    text.match(/\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/) ||
                    text.match(/\b(?:DOB|Birth|Born)\s*[:#]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\b/i)
  if (dateMatch) {
    extractedData.dateOfBirth = dateMatch[1]
    extractedData.confidence += 0.1
  }

  // Try to extract gender
  if (text.match(/\b(?:Male|M|Mr\.?)\b/i)) {
    extractedData.gender = 'Male'
    extractedData.confidence += 0.1
  } else if (text.match(/\b(?:Female|F|Ms\.?|Mrs\.?)\b/i)) {
    extractedData.gender = 'Female'
    extractedData.confidence += 0.1
  }

  // Try to extract address
  const addressPatterns = [
    /\b\d+\s+[A-Za-z\s,]+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Circle|Cir|Boulevard|Blvd)\b[\s,]*[A-Za-z\s]*[,]*\s*[A-Z]{2}\s*\d{5}/i,
    /\b\d+\s+[A-Za-z\s,]+(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln)\b/i
  ]
  
  for (const pattern of addressPatterns) {
    const addressMatch = text.match(pattern)
    if (addressMatch && !extractedData.address) {
      extractedData.address = addressMatch[0]
      extractedData.confidence += 0.1
      break
    }
  }

  // Cap confidence at 0.9
  extractedData.confidence = Math.min(0.9, extractedData.confidence)

  return NextResponse.json({
    ...extractedData,
    fields: {
      fullName: { value: extractedData.fullName, confidence: extractedData.fullName ? 0.7 : 0 },
      idNumber: { value: extractedData.idNumber, confidence: extractedData.idNumber ? 0.8 : 0 },
      dateOfBirth: { value: extractedData.dateOfBirth, confidence: extractedData.dateOfBirth ? 0.6 : 0 },
      gender: { value: extractedData.gender, confidence: extractedData.gender ? 0.9 : 0 },
      address: { value: extractedData.address, confidence: extractedData.address ? 0.5 : 0 }
    },
    rawText: text,
    note: "Used fallback extraction due to JSON parsing issues"
  })
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Gemini AI Document Extraction',
    supportedFeatures: ['image_analysis'],
    model: 'gemini-1.5-flash'
  })
}