"use client"

import React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Camera, Upload, X, Loader2, FileText, CheckCircle,
  AlertCircle, File, Image, Scan, Brain, Zap,
  User, Hash, Calendar, MapPin, Users, Bug
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface ExtractedData {
  fullName?: string
  idNumber?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  confidence?: number
  rawText?: string
  fields?: {
    [key: string]: {
      value: string
      confidence: number
    }
  }
  _metadata?: { // ADD THIS: Metadata interface
    source: string
    extractionMethod: string
    timestamp: number
    apiResponseTime?: string | null
    hasRawText: boolean
    rawTextLength: number
  }
}

// ADD THIS: New interfaces for validation
interface ExtractionQuality {
  isValid: boolean
  missingFields: string[]
  confidenceIssues: { field: string; confidence: number }[]
  formatIssues: { field: string; issue: string }[]
  rawTextPreview?: string
  extractedTimestamp: number
}

interface PDFProcessingInfo {
  numPages: number
  processedPages: number
  textExtracted: boolean
  hasImages: boolean
  fileSize: number
  processingTime: number
}

interface DocumentScannerProps {
  onDataExtracted: (data: ExtractedData) => void
}

interface AIProcessingOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
}

// Declare pdfjsLib globally
declare global {
  interface Window {
    pdfjsLib?: any
    Tesseract?: any
  }
}

export function DocumentScanner({ onDataExtracted }: DocumentScannerProps) {
  const [image, setImage] = useState<string | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfPages, setPdfPages] = useState<string[]>([])
  const [selectedPdfPage, setSelectedPdfPage] = useState<number>(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [useCamera, setUseCamera] = useState(false)
  const [activeTab, setActiveTab] = useState<"upload" | "camera">("upload")
  const [isLoadingPdf, setIsLoadingPdf] = useState(false)
  const [pdfInfo, setPdfInfo] = useState<{ numPages: number; fileName: string } | null>(null)
  const [aiMethod, setAiMethod] = useState<string>("api") // Changed default to "api"
  const [useAIEnhancement, setUseAIEnhancement] = useState(true)
  const [isTesseractLoaded, setIsTesseractLoaded] = useState(false)
  const [ocrProgress, setOcrProgress] = useState({ progress: 0, status: "" })
  const [isValidatingData, setIsValidatingData] = useState(false)
  const [manualEditMode, setManualEditMode] = useState(false)

  // ADD THIS: New state variables for validation
  const [extractionQuality, setExtractionQuality] = useState<ExtractionQuality | null>(null)
  const [pdfProcessingInfo, setPdfProcessingInfo] = useState<PDFProcessingInfo | null>(null)
  const [fieldLoadStatus, setFieldLoadStatus] = useState<Record<string, boolean>>({})
  const [showDebug, setShowDebug] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // AI processing options - UPDATED to remove Tesseract as default
  const aiOptions: AIProcessingOption[] = [
    {
      id: "api",
      name: "Gemini AI",
      description: "Google's advanced AI for document analysis",
      icon: <Brain className="h-4 w-4" />,
    },
    {
      id: "hybrid",
      name: "Hybrid Mode",
      description: "Local processing + AI enhancement",
      icon: <Zap className="h-4 w-4" />,
    }
  ]

  // Initialize PDF.js dynamically
  const loadPdfJs = useCallback(async () => {
    if (typeof window !== 'undefined' && !window.pdfjsLib) {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
        script.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
          resolve()
        }
        script.onerror = reject
        document.head.appendChild(script)
      })
    }
  }, [])

  // ADD THIS: Validate image data before processing
  const validateImageData = (imageData: string): boolean => {
    if (!imageData) return false
    if (!imageData.startsWith('data:image/')) {
      console.error('Invalid image data format:', imageData.substring(0, 100))
      return false
    }
    return true
  }

  // ADD THIS: Field validation function
  const validateField = (fieldName: string, value: any, confidence?: number): {
    isValid: boolean
    issues: string[]
    confidenceLevel: 'high' | 'medium' | 'low'
  } => {
    const issues: string[] = []
    let isValid = true

    switch (fieldName) {
      case 'fullName':
        if (!value || typeof value !== 'string') {
          isValid = false
          issues.push('Missing or invalid name')
        } else if (value.length < 2 || value.length > 100) {
          isValid = false
          issues.push('Name length invalid')
        } else if (!/^[A-Za-z\s\-'.]+$/.test(value)) {
          issues.push('Contains special characters')
          // Still valid but flagged
        }
        break

      case 'idNumber':
        if (!value) {
          isValid = false
          issues.push('Missing ID number')
        } else if (typeof value !== 'string') {
          isValid = false
          issues.push('Invalid ID format')
        } else if (value.length < 6 || value.length > 20) {
          issues.push('ID length suspicious')
        }
        break

      case 'dateOfBirth':
        if (!value) {
          isValid = false
          issues.push('Missing date of birth')
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(value) && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
          isValid = false
          issues.push('Invalid date format')
        } else {
          // Validate date is reasonable
          const date = new Date(value)
          const now = new Date()
          if (date > now) {
            isValid = false
            issues.push('Future date not allowed')
          }
          if (date.getFullYear() < 1900) {
            isValid = false
            issues.push('Date too far in past')
          }
        }
        break

      case 'gender':
        if (!value) {
          issues.push('Gender not specified')
        } else if (!['Male', 'Female', 'Other'].includes(value)) {
          issues.push('Invalid gender value')
        }
        break

      case 'address':
        if (!value) {
          issues.push('Address missing')
        } else if (value.length < 10) {
          issues.push('Address too short')
        } else if (value.length > 500) {
          issues.push('Address too long')
        }
        break
    }

    // Determine confidence level
    let confidenceLevel: 'high' | 'medium' | 'low' = 'medium'
    if (confidence !== undefined) {
      if (confidence >= 0.8) confidenceLevel = 'high'
      else if (confidence >= 0.5) confidenceLevel = 'medium'
      else confidenceLevel = 'low'
    }

    return { isValid, issues, confidenceLevel }
  }

  // ADD THIS: Complete extracted data validation
  const validateExtractedData = (data: ExtractedData): ExtractionQuality => {
    const missingFields: string[] = []
    const confidenceIssues: { field: string; confidence: number }[] = []
    const formatIssues: { field: string; issue: string }[] = []

    const requiredFields = ['fullName', 'idNumber', 'dateOfBirth']
    const optionalFields = ['gender', 'address']

    // Check required fields
    requiredFields.forEach(field => {
      if (!data[field as keyof ExtractedData]) {
        missingFields.push(field)
      }
    })

    // Validate each field
    Object.entries(data.fields || {}).forEach(([field, fieldData]) => {
      const validation = validateField(field, fieldData.value, fieldData.confidence)

      if (!validation.isValid) {
        formatIssues.push({
          field,
          issue: validation.issues.join(', ')
        })
      }

      if (validation.confidenceLevel === 'low') {
        confidenceIssues.push({
          field,
          confidence: fieldData.confidence
        })
      }
    })

    // Check overall confidence
    if (data.confidence && data.confidence < 0.5) {
      confidenceIssues.push({
        field: 'overall',
        confidence: data.confidence
      })
    }

    const isValid = missingFields.length === 0 &&
      formatIssues.length === 0 &&
      (data.confidence || 0) >= 0.3

    return {
      isValid,
      missingFields,
      confidenceIssues,
      formatIssues,
      rawTextPreview: data.rawText ? data.rawText.substring(0, 200) + '...' : undefined,
      extractedTimestamp: Date.now()
    }
  }

  // ADD THIS: Track field loading status
  const trackFieldLoad = (fieldName: string, success: boolean) => {
    setFieldLoadStatus(prev => ({
      ...prev,
      [fieldName]: success
    }))
  }

  // ADD THIS: Check field loading status
  const checkFieldLoadStatus = () => {
    const extractedFields = Object.keys(extractedData?.fields || {})
    const loadedFields = Object.keys(fieldLoadStatus).filter(field => fieldLoadStatus[field])

    return {
      allLoaded: extractedFields.length === loadedFields.length,
      loadedCount: loadedFields.length,
      extractedCount: extractedFields.length,
      missingFields: extractedFields.filter(field => !fieldLoadStatus[field])
    }
  }

  // ADD THIS: Detect common PDF extraction issues
  const detectCommonPDFIssues = (data: ExtractedData, pdfInfo: any): string[] => {
    const issues: string[] = []

    // Check if raw text is too short (possible OCR failure)
    if (data.rawText && data.rawText.length < 50) {
      issues.push('Extracted text seems too short for a document')
    }

    // Check for garbled text (common in PDF OCR)
    if (data.rawText && data.rawText.match(/[^\x00-\x7F]{10,}/)) {
      issues.push('Text contains unusual characters (possible encoding issue)')
    }

    // Check if all fields are null (complete extraction failure)
    const hasAnyData = Object.values(data.fields || {}).some(field => field.value)
    if (!hasAnyData) {
      issues.push('No data could be extracted from the PDF')
    }

    // Check for placeholder values
    const placeholderPatterns = [
      /demo/i,
      /example/i,
      /test/i,
      /sample/i,
      /placeholder/i
    ]

    Object.values(data.fields || {}).forEach((field, index) => {
      placeholderPatterns.forEach(pattern => {
        if (field.value && pattern.test(field.value)) {
          issues.push(`Field ${Object.keys(data.fields || {})[index]} contains placeholder text`)
        }
      })
    })

    return issues
  }

  // Load Tesseract.js for OCR (simplified version)
  const loadTesseract = useCallback(async () => {
    // We're not using Tesseract anymore since we have Gemini
    console.warn('Tesseract is deprecated, using Gemini AI instead')
    return Promise.resolve()
  }, [])

  // Preload AI libraries when component mounts
  useEffect(() => {
    loadTesseract().catch(console.error)
  }, [loadTesseract])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setExtractedData(null)
    setPdfFile(null)
    setPdfPages([])
    setPdfInfo(null)
    setImage(null)
    setManualEditMode(false)
    // ADD THIS: Reset validation states
    setExtractionQuality(null)
    setPdfProcessingInfo(null)
    setFieldLoadStatus({})

    // Check file type
    const fileType = file.type
    const isImage = fileType.startsWith('image/')
    const isPDF = fileType === 'application/pdf'

    if (isImage) {
      // Handle image files
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
      setActiveTab("upload")
    } else if (isPDF) {
      // Handle PDF files
      setPdfFile(file)
      await processPDF(file)
    } else {
      setError("Unsupported file format. Please upload an image (JPEG, PNG) or PDF.")
    }
  }

  const processPDF = async (file: File) => {
    setIsLoadingPdf(true)
    try {
      await loadPdfJs()

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise

      setPdfInfo({
        numPages: pdf.numPages,
        fileName: file.name
      })

      // Render first page as preview
      const pages: string[] = []
      const page = await pdf.getPage(1)
      const scale = 1.5
      const viewport = page.getViewport({ scale })

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      if (context) {
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        pages.push(canvas.toDataURL('image/jpeg', 0.8))
        setPdfPages(pages)
        setImage(pages[0])
        setSelectedPdfPage(0)
      }
    } catch (err) {
      console.error('Error processing PDF:', err)
      setError("Failed to process PDF file. Please try again.")
    } finally {
      setIsLoadingPdf(false)
    }
  }

  // Enhanced AI processing with pattern recognition
  const extractDataWithAI = async (text: string): Promise<ExtractedData> => {
    const data: ExtractedData = {
      confidence: 0,
      rawText: text,
      fields: {}
    }

    // Split text into lines
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

    // Pattern matching for common document formats
    for (const line of lines) {
      // Full Name detection (look for title case patterns)
      if (!data.fullName && line.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/)) {
        data.fullName = line
        data.fields = { ...data.fields, fullName: { value: line, confidence: 0.8 } }
      }

      // ID Number detection (alphanumeric patterns)
      const idPatterns = [
        /\b\d{13}\b/, // South African ID
        /\b[A-Z]{2}\d{6}\b/, // Passport-like
        /\b\d{9}\b/, // 9-digit ID
        /\bID\s*[:#]?\s*([A-Z0-9]{6,12})\b/i,
      ]

      for (const pattern of idPatterns) {
        const match = line.match(pattern)
        if (match && !data.idNumber) {
          data.idNumber = match[1] || match[0]
          data.fields = { ...data.fields, idNumber: { value: data.idNumber, confidence: 0.9 } }
          break
        }
      }

      // Date of Birth detection
      const datePatterns = [
        /\b(\d{1,2}[/-]\d{1,2}[/-]\d{4})\b/,
        /\b(\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/,
        /\b(?:DOB|Birth)\s*[:#]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})\b/i,
        /\bBorn\s+(\d{1,2}\s+\w+\s+\d{4})\b/i,
      ]

      for (const pattern of datePatterns) {
        const match = line.match(pattern)
        if (match && !data.dateOfBirth) {
          data.dateOfBirth = match[1]
          data.fields = { ...data.fields, dateOfBirth: { value: data.dateOfBirth, confidence: 0.85 } }
          break
        }
      }

      // Gender detection
      if (!data.gender) {
        if (line.match(/\b(?:Male|M)\b/i)) {
          data.gender = 'Male'
          data.fields = { ...data.fields, gender: { value: 'Male', confidence: 0.95 } }
        } else if (line.match(/\b(?:Female|F)\b/i)) {
          data.gender = 'Female'
          data.fields = { ...data.fields, gender: { value: 'Female', confidence: 0.95 } }
        } else if (line.match(/\bGender\s*[:#]?\s*(\w+)\b/i)) {
          const match = line.match(/\bGender\s*[:#]?\s*(\w+)\b/i)
          if (match) {
            data.gender = match[1]
            data.fields = { ...data.fields, gender: { value: match[1], confidence: 0.7 } }
          }
        }
      }

      // Address detection (looks for longer lines with common address keywords)
      if (!data.address && line.length > 20 && line.match(/\b(?:Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Ln|City|Town|Province|State|Country|Zip|Code)\b/i)) {
        data.address = line
        data.fields = { ...data.fields, address: { value: line, confidence: 0.6 } }
      }
    }

    // Calculate overall confidence
    if (data.fields) {
      const confidences = Object.values(data.fields).map(field => field.confidence)
      data.confidence = confidences.length > 0
        ? confidences.reduce((a, b) => a + b) / confidences.length
        : 0
    }

    return data
  }

  // Use external AI API (Gemini)
  const extractDataWithAPI = async (imageData: string, file?: File): Promise<ExtractedData> => {
    try {
      const formData = new FormData()

      if (file) {
        formData.append('pdf', file)
        formData.append('fileName', file.name)
        formData.append('fileSize', file.size.toString())
        formData.append('fileType', file.type)
      } else {
        formData.append('image', imageData)
      }

      const response = await fetch("/api/ai-extract", {
        method: "POST",
        body: formData, // Don't set Content-Type header, browser will set it with boundary
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API Error: ${response.status}`)
      }

      const data = await response.json()

      return {
        ...data,
        _metadata: {
          source: file ? 'pdf' : 'image',
          extractionMethod: aiMethod,
          timestamp: Date.now(),
          apiResponseTime: response.headers.get('x-response-time') || null,
          hasRawText: !!data.rawText,
          rawTextLength: data.rawText?.length || 0
        }
      }
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  // Validate and clean extracted data
  const validateAndCleanExtractedData = (data: ExtractedData): ExtractedData => {
    const validated = { ...data }

    // Clean up dates
    if (validated.dateOfBirth) {
      // Try to standardize date format
      validated.dateOfBirth = validated.dateOfBirth.replace(/\s+/g, '-').replace(/\//g, '-')
    }

    // Clean up names
    if (validated.fullName) {
      validated.fullName = validated.fullName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }

    // Clean up ID numbers
    if (validated.idNumber) {
      validated.idNumber = validated.idNumber.toUpperCase().replace(/\s+/g, '')
    }

    return validated
  }

  const processDocument = async () => {
    if (!image) return

    // ADD THIS: Validate image data
    if (!validateImageData(image)) {
      setError("Invalid image data. Please try uploading again.")
      return
    }

    setIsProcessing(true)
    setError(null)
    setOcrProgress({ progress: 0, status: "Starting..." })
    // ADD THIS: Reset validation states
    setExtractionQuality(null)
    setPdfProcessingInfo(null)
    setFieldLoadStatus({})

    try {
      let extractedData: ExtractedData
      let processingInfo: PDFProcessingInfo | null = null

      if (aiMethod === "api") {
        // Use external AI API
        setOcrProgress({ progress: 0.3, status: "Sending to Gemini AI..." })
        extractedData = await extractDataWithAPI(image, pdfFile || undefined)
      } else if (aiMethod === "hybrid") {
        // Hybrid approach
        setOcrProgress({ progress: 0.1, status: "Analyzing locally..." })

        // Simple hybrid: try local patterns first, then Gemini
        const localData = await extractDataWithAI("") // Pass empty text for now
        setOcrProgress({ progress: 0.5, status: "Enhancing with AI..." })
        const aiData = await extractDataWithAPI(image, pdfFile || undefined)

        // Merge results
        extractedData = {
          ...localData,
          ...aiData,
          confidence: Math.max(localData.confidence || 0, aiData.confidence || 0)
        }
      } else {
        // Default to API
        extractedData = await extractDataWithAPI(image, pdfFile || undefined)
      }

      // ADD THIS: Track PDF processing info
      if (pdfFile) {
        const startTime = Date.now()

        processingInfo = {
          numPages: pdfInfo?.numPages || 0,
          processedPages: 1,
          textExtracted: !!extractedData.rawText && extractedData.rawText.length > 10,
          hasImages: true,
          fileSize: pdfFile.size,
          processingTime: Date.now() - startTime
        }
        setPdfProcessingInfo(processingInfo)

        // ADD THIS: Detect PDF issues
        const pdfIssues = detectCommonPDFIssues(extractedData, pdfInfo)
        if (pdfIssues.length > 0) {
          console.warn('PDF extraction issues detected:', pdfIssues)
        }
      }

      // ADD THIS: Validate the extracted data
      const quality = validateExtractedData(extractedData)
      setExtractionQuality(quality)

      // ADD THIS: Check for potential loading issues
      if (!quality.isValid) {
        console.warn('Extracted data has quality issues:', quality)

        // Create warning message for user
        let warningMessage = 'Data extracted but with some issues:\n'

        if (quality.missingFields.length > 0) {
          warningMessage += `• Missing: ${quality.missingFields.join(', ')}\n`
        }

        if (quality.confidenceIssues.length > 0) {
          warningMessage += `• Low confidence: ${quality.confidenceIssues.map(ci => ci.field).join(', ')}\n`
        }

        if (quality.formatIssues.length > 0) {
          warningMessage += `• Format issues: ${quality.formatIssues.map(fi => fi.field).join(', ')}\n`
        }

        // Show warning but continue
        setError(warningMessage)
      }

      // Validate and clean data
      setIsValidatingData(true)
      setOcrProgress({ progress: 0.8, status: "Validating data..." })

      const validatedData = validateAndCleanExtractedData(extractedData)
      validatedData.confidence = validatedData.confidence || 0.7

      setExtractedData(validatedData)
      onDataExtracted(validatedData)

      // ADD THIS: Track field loading
      if (validatedData.fields) {
        Object.keys(validatedData.fields).forEach(field => {
          trackFieldLoad(field, true)
        })
      }

      setOcrProgress({ progress: 1, status: "Complete!" })

    } catch (err) {
      console.error('Processing Error:', err)
      setError(err instanceof Error ? err.message : "Failed to process document. Please try again.")

      // Provide manual entry option
      setManualEditMode(true)
    } finally {
      setIsProcessing(false)
      setIsValidatingData(false)
      setTimeout(() => {
        setOcrProgress({ progress: 0, status: "" })
      }, 2000)
    }
  }

  const handleManualSave = () => {
    if (extractedData) {
      const updatedData = validateAndCleanExtractedData(extractedData)
      setExtractedData(updatedData)
      onDataExtracted(updatedData)
      setManualEditMode(false)
    }
  }

  const renderPDFPage = async (pageNumber: number) => {
    if (!pdfFile || !window.pdfjsLib) return

    try {
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const page = await pdf.getPage(pageNumber)
      const scale = 1.5
      const viewport = page.getViewport({ scale })

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      if (context) {
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        const newPages = [...pdfPages]
        if (newPages[pageNumber - 1]) {
          newPages[pageNumber - 1] = canvas.toDataURL('image/jpeg', 0.8)
        } else {
          newPages[pageNumber - 1] = canvas.toDataURL('image/jpeg', 0.8)
        }

        setPdfPages(newPages)
        setImage(newPages[pageNumber - 1])
        setSelectedPdfPage(pageNumber - 1)
      }
    } catch (err) {
      console.error('Error rendering PDF page:', err)
      setError("Failed to render PDF page.")
    }
  }

  const handlePageSelect = (pageIndex: number) => {
    if (pdfPages[pageIndex]) {
      setImage(pdfPages[pageIndex])
      setSelectedPdfPage(pageIndex)
    } else {
      renderPDFPage(pageIndex + 1)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setUseCamera(true)
      setActiveTab("camera")
      setError(null)
    } catch (err) {
      setError("Unable to access camera. Please use file upload instead.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setUseCamera(false)
    setActiveTab("upload")
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
        setImage(dataUrl)
        stopCamera()
        setExtractedData(null)
        setPdfFile(null)
        setPdfPages([])
      }
    }
  }

  const clearAll = () => {
    setImage(null)
    setPdfFile(null)
    setPdfPages([])
    setPdfInfo(null)
    setExtractedData(null)
    setError(null)
    setManualEditMode(false)
    // ADD THIS: Clear validation states
    setExtractionQuality(null)
    setPdfProcessingInfo(null)
    setFieldLoadStatus({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    stopCamera()
  }

  const updateExtractedField = (field: keyof ExtractedData, value: string) => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        [field]: value,
        fields: {
          ...extractedData.fields,
          [field]: { value, confidence: 0.5 } // Lower confidence for manual edits
        }
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Document Scanner
        </CardTitle>
        <CardDescription>
          Scan documents with AI-powered text extraction and data recognition
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Processing Options */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            AI Processing Method
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {aiOptions.map((option) => (
              <Button
                key={option.id}
                type="button"
                variant={aiMethod === option.id ? "default" : "outline"}
                onClick={() => setAiMethod(option.id)}
                className="h-auto py-3 flex flex-col items-center justify-center gap-2"
              >
                {option.icon}
                <div className="text-xs font-medium">{option.name}</div>
                <div className="text-[10px] text-muted-foreground text-center">
                  {option.description}
                </div>
              </Button>
            ))}
          </div>

          {aiMethod === "hybrid" && (
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                checked={useAIEnhancement}
                onCheckedChange={setUseAIEnhancement}
              />
              <Label className="text-sm">
                Enable AI Pattern Recognition
              </Label>
            </div>
          )}
        </div>

        <Separator />

        {/* Document Input Section */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "upload" | "camera")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="camera">
              <Camera className="mr-2 h-4 w-4" />
              Use Camera
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {!image && !pdfFile && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Upload Document</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Drag & drop or click to browse
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2"
                    >
                      Select File
                    </Button>
                  </div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,application/pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Image className="h-3 w-3" />
                    Images
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <File className="h-3 w-3" />
                    PDFs
                  </Badge>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="camera" className="space-y-4">
            {!useCamera ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <Button onClick={startCamera} className="w-full">
                  Start Camera
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                  <video ref={videoRef} className="h-full w-full object-contain" playsInline muted />
                </div>
                <div className="flex gap-3">
                  <Button type="button" onClick={captureImage} className="flex-1">
                    <Camera className="mr-2 h-4 w-4" />
                    Capture Image
                  </Button>
                  <Button type="button" variant="outline" onClick={stopCamera}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Progress Indicators */}
        {(isProcessing || isLoadingPdf) && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{isLoadingPdf ? "Loading PDF..." : ocrProgress.status}</span>
              <span className="font-medium">
                {Math.round((isLoadingPdf ? (selectedPdfPage + 1) / (pdfInfo?.numPages || 1) : ocrProgress.progress) * 100)}%
              </span>
            </div>
            <Progress
              value={
                isLoadingPdf
                  ? ((selectedPdfPage + 1) / (pdfInfo?.numPages || 1)) * 100
                  : ocrProgress.progress * 100
              }
            />
          </div>
        )}

        {/* PDF Info */}
        {pdfInfo && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium truncate">{pdfInfo.fileName}</span>
                <Badge variant="secondary">{pdfInfo.numPages} pages</Badge>
              </div>
            </div>
            {pdfInfo.numPages > 1 && (
              <div className="space-y-2">
                <Label className="text-xs">Select Page to Process</Label>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: pdfInfo.numPages }).map((_, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant={selectedPdfPage === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageSelect(index)}
                      className="h-8"
                    >
                      Page {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADD THIS: Extraction Quality Monitor */}
        {extractionQuality && !extractionQuality.isValid && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="space-y-2">
              <div className="font-medium text-amber-800">
                Data extracted with quality issues
              </div>
              <ul className="text-sm text-amber-700 space-y-1">
                {extractionQuality.missingFields.length > 0 && (
                  <li>• Missing: {extractionQuality.missingFields.join(', ')}</li>
                )}
                {extractionQuality.confidenceIssues.length > 0 && (
                  <li>• Low confidence on: {extractionQuality.confidenceIssues.map(ci => ci.field).join(', ')}</li>
                )}
                {extractionQuality.formatIssues.length > 0 && (
                  <li>• Format issues: {extractionQuality.formatIssues.map(fi => `${fi.field} (${fi.issue})`).join(', ')}</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* ADD THIS: PDF Processing Info */}
        {pdfProcessingInfo && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  PDF Processing Details
                </span>
                <Badge variant="outline" className="text-xs">
                  {pdfProcessingInfo.textExtracted ? 'Text Found' : 'No Text'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">File Size</Label>
                  <div className="font-medium">
                    {(pdfProcessingInfo.fileSize / 1024).toFixed(1)} KB
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Pages</Label>
                  <div className="font-medium">
                    {pdfProcessingInfo.numPages} page{pdfProcessingInfo.numPages !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Processing Time</Label>
                  <div className="font-medium">
                    {pdfProcessingInfo.processingTime}ms
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Text Extraction</Label>
                  <div className="font-medium">
                    {pdfProcessingInfo.textExtracted ? '✓ Successful' : '✗ Failed'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ADD THIS: Field Loading Monitor */}
        {extractedData && (
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center justify-between mb-1">
              <span>Field Loading Status</span>
              <span>
                {checkFieldLoadStatus().loadedCount}/{checkFieldLoadStatus().extractedCount} loaded
              </span>
            </div>
            <div className="flex gap-1">
              {Object.keys(extractedData.fields || {}).map(field => (
                <Badge
                  key={field}
                  variant={fieldLoadStatus[field] ? "default" : "outline"}
                  className="text-xs px-2 py-0"
                >
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Document Preview */}
        {image && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={image || "/placeholder.svg"}
                alt={pdfFile ? `PDF page ${selectedPdfPage + 1}` : "Scanned document"}
                className="w-full rounded-lg border object-contain bg-muted"
                style={{ maxHeight: "400px" }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={clearAll}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!extractedData && (
              <Button
                type="button"
                onClick={processDocument}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isValidatingData ? "Validating..." : "AI Processing..."}
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Extract with AI
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Manual Edit Mode */}
        {manualEditMode && extractedData && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm">Manual Data Entry</CardTitle>
              <CardDescription>
                AI extraction failed. Please enter the details manually:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    Full Name
                  </Label>
                  <Input
                    value={extractedData.fullName || ""}
                    onChange={(e) => updateExtractedField("fullName", e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Hash className="h-3 w-3" />
                    ID Number
                  </Label>
                  <Input
                    value={extractedData.idNumber || ""}
                    onChange={(e) => updateExtractedField("idNumber", e.target.value)}
                    placeholder="Enter ID number"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Date of Birth
                  </Label>
                  <Input
                    value={extractedData.dateOfBirth || ""}
                    onChange={(e) => updateExtractedField("dateOfBirth", e.target.value)}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    Gender
                  </Label>
                  <Select
                    value={extractedData.gender || ""}
                    onValueChange={(value) => updateExtractedField("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Address
                </Label>
                <Textarea
                  value={extractedData.address || ""}
                  onChange={(e) => updateExtractedField("address", e.target.value)}
                  placeholder="Enter full address"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleManualSave} className="flex-1">
                  Save Manual Entry
                </Button>
                <Button variant="outline" onClick={() => setManualEditMode(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extracted Data Display */}
        {extractedData && !manualEditMode && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  AI Extracted Data
                </span>
                {extractedData.confidence && (
                  <Badge variant={extractedData.confidence > 0.7 ? "default" : "secondary"}>
                    {Math.round(extractedData.confidence * 100)}% Confidence
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {extractedData.fullName && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <p className="font-medium">{extractedData.fullName}</p>
                    </div>
                  </div>
                )}
                {extractedData.idNumber && (
                  <div>
                    <Label className="text-xs text-muted-foreground">ID Number</Label>
                    <div className="flex items-center gap-2">
                      <Hash className="h-3 w-3" />
                      <p className="font-medium">{extractedData.idNumber}</p>
                    </div>
                  </div>
                )}
                {extractedData.dateOfBirth && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <p className="font-medium">{extractedData.dateOfBirth}</p>
                    </div>
                  </div>
                )}
                {extractedData.gender && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Gender</Label>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <p className="font-medium">{extractedData.gender}</p>
                    </div>
                  </div>
                )}
              </div>
              {extractedData.address && (
                <div>
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 mt-0.5" />
                    <p className="font-medium">{extractedData.address}</p>
                  </div>
                </div>
              )}
              {extractedData.rawText && extractedData.confidence && extractedData.confidence < 0.7 && (
                <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-300">
                    Low confidence extraction detected. Please review and edit the data above if needed.
                  </AlertDescription>
                </Alert>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManualEditMode(true)}
                className="w-full"
              >
                Edit Extracted Data
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ADD THIS: Debug View for Developers */}
        <div className="mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs"
          >
            <Bug className="mr-2 h-3 w-3" />
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </Button>

          {showDebug && extractedData && (
            <Card className="mt-2 border-dashed">
              <CardHeader>
                <CardTitle className="text-sm">Debug Information</CardTitle>
              </CardHeader>
              <CardContent className="text-xs font-mono">
                <pre className="whitespace-pre-wrap break-words max-h-60 overflow-auto">
                  {JSON.stringify({
                    extractedData,
                    extractionQuality,
                    pdfProcessingInfo,
                    fieldLoadStatus,
                    checkFieldLoadStatus: checkFieldLoadStatus(),
                    imageSize: image?.length,
                    pdfInfo
                  }, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  )
}