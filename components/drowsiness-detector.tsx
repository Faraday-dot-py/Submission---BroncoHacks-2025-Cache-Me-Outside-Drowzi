"use client"

import { useState, useEffect, useRef } from "react"
import { AlertTriangle, Camera, CameraOff, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface DrowsinessDetectorProps {
  isActive: boolean
  onDrowsinessDetected: () => void
}

export default function DrowsinessDetector({ isActive, onDrowsinessDetected }: DrowsinessDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null)
  const [drowsyCount, setDrowsyCount] = useState(0)
  const [drowsyThreshold, setDrowsyThreshold] = useState(3)
  const [captureInterval, setCaptureInterval] = useState(3000) // 3 seconds
  const [lastPrediction, setLastPrediction] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize camera when component mounts and isActive changes
  useEffect(() => {
    if (isActive && !cameraActive) {
      initializeCamera()
    } else if (!isActive && cameraActive) {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isActive])

  // Initialize the camera
  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setCameraActive(true)
        setCameraPermission(true)
        startCapturing()
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setCameraPermission(false)
    }
  }

  // Stop the camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setCameraActive(false)
    setDrowsyCount(0)
    setLastPrediction(null)
  }

  // Start capturing images at regular intervals
  const startCapturing = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      captureAndSendImage()
    }, captureInterval)
  }

  // Capture image from video and send to AI endpoint
  const captureAndSendImage = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas to blob
    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
          },
          "image/jpeg",
          0.8,
        )
      })

      // Create form data
      const formData = new FormData()
      formData.append("image", blob, "capture.jpg")

      // Send to AI endpoint
      const response = await fetch("/predict", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        processAiResult(result)
      } else {
        console.error("Error from AI endpoint:", response.statusText)
        // For demo purposes, simulate random results
        simulateAiResult()
      }
    } catch (error) {
      console.error("Error capturing or sending image:", error)
      // For demo purposes, simulate random results
      simulateAiResult()
    }
  }

  // Process the AI result
  const processAiResult = (result: any) => {
    // Assuming the AI returns { isDrowsy: boolean, confidence: number }
    const isDrowsy = result.isDrowsy
    setLastPrediction(isDrowsy ? "Drowsy" : "Alert")

    if (isDrowsy) {
      setDrowsyCount((prev) => {
        const newCount = prev + 1
        if (newCount >= drowsyThreshold) {
          onDrowsinessDetected()
          return 0 // Reset after alerting
        }
        return newCount
      })
    } else {
      // Gradually reduce drowsy count if alert
      setDrowsyCount((prev) => (prev > 0 ? prev - 1 : 0))
    }
  }

  // Simulate AI result for demo purposes
  const simulateAiResult = () => {
    // 20% chance of drowsy detection for demo
    const isDrowsy = Math.random() < 0.2
    processAiResult({ isDrowsy, confidence: Math.random() * 0.5 + 0.5 })
  }

  // Update capture interval when settings change
  useEffect(() => {
    if (cameraActive && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = setInterval(captureAndSendImage, captureInterval)
    }
  }, [captureInterval])

  // Calculate drowsiness level as percentage
  const drowsinessLevel = Math.min((drowsyCount / drowsyThreshold) * 100, 100)

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-sky-900">Drowsiness Detection</h3>
        <div className="flex items-center space-x-2">
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detection Settings</DialogTitle>
                <DialogDescription>Configure drowsiness detection parameters</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="threshold">Drowsy Detection Threshold: {drowsyThreshold}</Label>
                  <Slider
                    id="threshold"
                    min={1}
                    max={10}
                    step={1}
                    value={[drowsyThreshold]}
                    onValueChange={(value) => setDrowsyThreshold(value[0])}
                  />
                  <p className="text-xs text-muted-foreground">Number of drowsy detections before alerting (1-10)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interval">Capture Interval: {captureInterval / 1000}s</Label>
                  <Slider
                    id="interval"
                    min={1000}
                    max={10000}
                    step={1000}
                    value={[captureInterval]}
                    onValueChange={(value) => setCaptureInterval(value[0])}
                  />
                  <p className="text-xs text-muted-foreground">Time between captures in seconds (1-10)</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="debug-mode" checked={showDebugInfo} onCheckedChange={setShowDebugInfo} />
                  <Label htmlFor="debug-mode">Show Debug Information</Label>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {cameraActive ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-red-200 text-red-600 hover:bg-red-50"
              onClick={stopCamera}
            >
              <CameraOff className="mr-1 h-4 w-4" />
              Stop
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-green-200 text-green-600 hover:bg-green-50"
              onClick={initializeCamera}
              disabled={!isActive}
            >
              <Camera className="mr-1 h-4 w-4" />
              Start
            </Button>
          )}
        </div>
      </div>

      <div className="relative mb-4 overflow-hidden rounded-lg bg-gray-100">
        {cameraActive ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="h-[200px] w-full object-cover md:h-[300px]" />
            <canvas ref={canvasRef} className="hidden" />
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-300 ${
                drowsinessLevel > 66 ? "bg-red-500" : drowsinessLevel > 33 ? "bg-amber-500" : "bg-green-500"
              }`}
              style={{ width: `${drowsinessLevel}%` }}
            ></div>
          </>
        ) : (
          <div className="flex h-[200px] w-full items-center justify-center bg-gray-100 md:h-[300px]">
            {cameraPermission === false ? (
              <div className="text-center text-gray-500">
                <CameraOff className="mx-auto mb-2 h-10 w-10" />
                <p>Camera access denied</p>
                <p className="mt-2 text-sm">Please enable camera access in your browser settings</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Camera className="mx-auto mb-2 h-10 w-10" />
                <p>{isActive ? "Click Start to enable drowsiness detection" : "Start your trip to enable camera"}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {cameraActive && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-sky-700">Drowsiness Level</span>
            <span
              className={`text-sm font-medium ${
                drowsinessLevel > 66 ? "text-red-600" : drowsinessLevel > 33 ? "text-amber-600" : "text-green-600"
              }`}
            >
              {drowsinessLevel.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all duration-300 ${
                drowsinessLevel > 66 ? "bg-red-500" : drowsinessLevel > 33 ? "bg-amber-500" : "bg-green-500"
              }`}
              style={{ width: `${drowsinessLevel}%` }}
            ></div>
          </div>

          {drowsinessLevel > 33 && (
            <div
              className={`mt-2 flex items-center rounded-md p-2 text-sm ${
                drowsinessLevel > 66 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {drowsinessLevel > 66
                ? "High drowsiness detected! Please stay alert."
                : "Moderate drowsiness detected. Stay focused."}
            </div>
          )}

          {showDebugInfo && (
            <div className="mt-4 rounded-md bg-gray-100 p-2 text-xs">
              <p>Last prediction: {lastPrediction || "None"}</p>
              <p>
                Drowsy count: {drowsyCount}/{drowsyThreshold}
              </p>
              <p>Capture interval: {captureInterval / 1000}s</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
