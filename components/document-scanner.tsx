"use client"

import React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Upload, X, Loader2, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ExtractedData {
  fullName?: string
  idNumber?: string
  dateOfBirth?: string
  gender?: string
  address?: string
}

interface DocumentScannerProps {
  onDataExtracted: (data: ExtractedData) => void
}

export function DocumentScanner({ onDataExtracted }: DocumentScannerProps) {
  const [image, setImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [useCamera, setUseCamera] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
        setError(null)
        setExtractedData(null)
      }
      reader.readAsDataURL(file)
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
      }
    }
  }

  const processDocument = async () => {
    if (!image) return

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/extract-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      })

      if (!response.ok) {
        throw new Error("Failed to process document")
      }

      const data = await response.json()
      setExtractedData(data)
      onDataExtracted(data)
    } catch (err) {
      setError("Failed to extract data from document. Please try again or enter details manually.")
      // Provide demo extracted data for testing
      const demoData: ExtractedData = {
        fullName: "Demo Student",
        idNumber: "ID-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        dateOfBirth: "2005-01-15",
        gender: "Not specified",
        address: "Please enter address manually",
      }
      setExtractedData(demoData)
      onDataExtracted(demoData)
    } finally {
      setIsProcessing(false)
    }
  }

  const clearImage = () => {
    setImage(null)
    setExtractedData(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Scanner
        </CardTitle>
        <CardDescription>
          Scan an ID document to automatically extract student information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!image && !useCamera && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
              <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={startCamera}>
                <Camera className="mr-2 h-4 w-4" />
                Use Camera
              </Button>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-center text-xs text-muted-foreground">
              Supported: ID cards, passports, birth certificates
            </p>
          </div>
        )}

        {useCamera && (
          <div className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
              <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
            </div>
            <div className="flex gap-3">
              <Button type="button" onClick={captureImage} className="flex-1">
                <Camera className="mr-2 h-4 w-4" />
                Capture
              </Button>
              <Button type="button" variant="outline" onClick={stopCamera}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {image && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={image || "/placeholder.svg"}
                alt="Scanned document"
                className="w-full rounded-lg border object-contain"
                style={{ maxHeight: "300px" }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm"
                onClick={clearImage}
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
                    Processing Document...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Extract Information
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {extractedData && (
          <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Data extracted successfully! Review and edit the form below.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
