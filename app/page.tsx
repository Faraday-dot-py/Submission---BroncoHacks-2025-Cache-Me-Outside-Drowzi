"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, StopCircle, ArrowLeft, Clock, Timer, RotateCcw, AlertTriangle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import DrowsinessDetector from "@/components/drowsiness-detector"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import axios from 'axios';

const API_BASE_URL = "http://10.110.171.116:5000";

export default function DrivePage() {
  const router = useRouter()
  const [tripStarted, setTripStarted] = useState(false)
  const [onBreak, setOnBreak] = useState(false)

  // Timer states in seconds
  const [drivingTime, setDrivingTime] = useState(0)
  const [breakInTime, setBreakInTime] = useState(7200) // 2 hours in seconds
  const [totalTripTime, setTotalTripTime] = useState(0)

  // Timer intervals
  const [drivingInterval, setDrivingInterval] = useState<NodeJS.Timeout | null>(null)
  const [totalTripInterval, setTotalTripInterval] = useState<NodeJS.Timeout | null>(null)

  // Drowsiness alert state
  const [showDrowsyAlert, setShowDrowsyAlert] = useState(false)
  const [drowsyAlertCount, setDrowsyAlertCount] = useState(0)
  const alertSoundRef = useRef<HTMLAudioElement | null>(null)

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":")
  }

  // Initialize audio element
  useEffect(() => {
    alertSoundRef.current = new Audio("/alert.mp3")
    alertSoundRef.current.loop = true

    return () => {
      if (alertSoundRef.current) {
        alertSoundRef.current.pause()
        alertSoundRef.current = null
      }
    }
  }, [])

  // Example usage of the API_BASE_URL
  // You can replace this with actual API calls using axios or fetch
  useEffect(() => {
    axios.post(`${API_BASE_URL}/predict`)
      .then(response => {
        console.log('API Response:', response.data);
      })
      .catch(error => {
        console.error('API Error:', error);
      });
  }, []);

  // Start the trip
  const startTrip = () => {
    setTripStarted(true)
    setOnBreak(false)

    // Start driving timer
    const drivingInt = setInterval(() => {
      setDrivingTime((prev) => prev + 1)
      setBreakInTime((prev) => prev - 1)
    }, 1000)
    setDrivingInterval(drivingInt)

    // Start total trip timer
    const tripInt = setInterval(() => {
      setTotalTripTime((prev) => prev + 1)
    }, 1000)
    setTotalTripInterval(tripInt)
  }

  // Take a break
  const takeBreak = () => {
    setOnBreak(true)

    // Pause driving timer
    if (drivingInterval) {
      clearInterval(drivingInterval)
      setDrivingInterval(null)
    }
  }

  // Resume driving after break
  const resumeDriving = () => {
    setOnBreak(false)

    // Reset break timer
    setBreakInTime(7200) // Reset to 2 hours

    // Resume driving timer
    const drivingInt = setInterval(() => {
      setDrivingTime((prev) => prev + 1)
      setBreakInTime((prev) => prev - 1)
    }, 1000)
    setDrivingInterval(drivingInt)
  }

  // End trip
  const endTrip = () => {
    // Clear all intervals
    if (drivingInterval) clearInterval(drivingInterval)
    if (totalTripInterval) clearInterval(totalTripInterval)

    // Show confirmation before ending
    if (confirm("Are you sure you want to end your trip?")) {
      // Reset all states
      setTripStarted(false)
      setOnBreak(false)
      setDrivingTime(0)
      setBreakInTime(7200)
      setTotalTripTime(0)
      setDrivingInterval(null)
      setTotalTripInterval(null)
    }
  }

  // Handle drowsiness detection
  const handleDrowsinessDetected = () => {
    setShowDrowsyAlert(true)
    setDrowsyAlertCount((prev) => prev + 1)

    // Play alert sound
    if (alertSoundRef.current) {
      alertSoundRef.current.play().catch((err) => console.error("Error playing alert sound:", err))
    }
  }

  // Handle drowsy alert acknowledgment
  const handleDrowsyAlertAcknowledge = () => {
    setShowDrowsyAlert(false)

    // Stop alert sound
    if (alertSoundRef.current) {
      alertSoundRef.current.pause()
      alertSoundRef.current.currentTime = 0
    }

    // Automatically take a break
    takeBreak()
  }

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (drivingInterval) clearInterval(drivingInterval)
      if (totalTripInterval) clearInterval(totalTripInterval)

      if (alertSoundRef.current) {
        alertSoundRef.current.pause()
      }
    }
  }, [drivingInterval, totalTripInterval])

  // Alert when break is needed
  useEffect(() => {
    if (breakInTime === 0 && !onBreak) {
      handleDrowsinessDetected()
    }
  }, [breakInTime, onBreak])

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <header className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <div className="relative h-10 w-24">
            <Image src="/logo.svg" alt="Drowzi Logo" fill className="object-contain" priority />
          </div>
        </Link>
        <Link href="/" className="flex items-center text-sky-700 hover:text-sky-900">
          <ArrowLeft className="mr-2 h-5 w-5" />
          <span>Back to Home</span>
        </Link>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-center text-3xl font-bold text-sky-900 md:text-4xl">
          {!tripStarted ? "Ready to Drive?" : onBreak ? "Taking a Break" : "Drive Safely"}
        </h1>

        <div className="mx-auto max-w-3xl">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Driving Time */}
            <Card className={`overflow-hidden ${!onBreak && tripStarted ? "border-sky-500 shadow-md" : ""}`}>
              <CardContent className="p-0">
                <div className="bg-sky-100 p-4">
                  <div className="flex items-center justify-center text-sky-700">
                    <Clock className="mr-2 h-5 w-5" />
                    <h2 className="text-lg font-semibold">Driving Time</h2>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <p className="text-3xl font-bold tabular-nums text-sky-900">{formatTime(drivingTime)}</p>
                  <p className="mt-2 text-sm text-sky-600">Current driving session</p>
                </div>
              </CardContent>
            </Card>

            {/* Break In */}
            <Card
              className={`overflow-hidden ${breakInTime < 300 && !onBreak && tripStarted ? "border-red-500 shadow-md" : ""}`}
            >
              <CardContent className="p-0">
                <div className="bg-sky-100 p-4">
                  <div className="flex items-center justify-center text-sky-700">
                    <Timer className="mr-2 h-5 w-5" />
                    <h2 className="text-lg font-semibold">Break In</h2>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <p
                    className={`text-3xl font-bold tabular-nums ${
                      breakInTime < 300 && !onBreak && tripStarted ? "text-red-600" : "text-sky-900"
                    }`}
                  >
                    {onBreak ? "--:--:--" : formatTime(breakInTime)}
                  </p>
                  <p className="mt-2 text-sm text-sky-600">Time until next break</p>
                </div>
              </CardContent>
            </Card>

            {/* Total Trip */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-sky-100 p-4">
                  <div className="flex items-center justify-center text-sky-700">
                    <RotateCcw className="mr-2 h-5 w-5" />
                    <h2 className="text-lg font-semibold">Total Trip</h2>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <p className="text-3xl font-bold tabular-nums text-sky-900">{formatTime(totalTripTime)}</p>
                  <p className="mt-2 text-sm text-sky-600">Total trip duration</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <DrowsinessDetector isActive={tripStarted && !onBreak} onDrowsinessDetected={handleDrowsinessDetected} />
          </div>

          <div className="mt-10 flex flex-col items-center justify-center space-y-4">
            {!tripStarted ? (
              <Button
                onClick={startTrip}
                className="group relative h-14 overflow-hidden rounded-full bg-sky-600 px-8 text-lg font-semibold text-white transition-all hover:bg-sky-700"
              >
                <span className="relative z-10 flex items-center">
                  <Play className="mr-2 h-5 w-5" />
                  Start Trip
                </span>
                <span className="absolute inset-0 z-0 bg-gradient-to-r from-sky-400 to-sky-600 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-70"></span>
              </Button>
            ) : (
              <div className="flex flex-wrap justify-center gap-4">
                {onBreak ? (
                  <Button
                    onClick={resumeDriving}
                    className="h-14 rounded-full bg-green-600 px-8 text-lg font-semibold text-white hover:bg-green-700"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Resume Driving
                  </Button>
                ) : (
                  <Button
                    onClick={takeBreak}
                    className="h-14 rounded-full bg-amber-500 px-8 text-lg font-semibold text-white hover:bg-amber-600"
                  >
                    <Pause className="mr-2 h-5 w-5" />
                    Take a Break
                  </Button>
                )}

                <Button
                  onClick={endTrip}
                  variant="outline"
                  className="h-14 rounded-full border-red-200 px-8 text-lg font-semibold text-red-600 hover:bg-red-50"
                >
                  <StopCircle className="mr-2 h-5 w-5" />
                  End Trip
                </Button>
              </div>
            )}
          </div>

          {tripStarted && (
            <div className="mt-10 rounded-xl bg-sky-50 p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold text-sky-900">Driving Status</h3>
              <div className="space-y-2">
                <p className="flex items-center text-sky-700">
                  <span
                    className={`mr-2 inline-block h-3 w-3 rounded-full ${onBreak ? "bg-amber-500" : "bg-green-500"}`}
                  ></span>
                  {onBreak ? "Currently on break" : "Currently driving"}
                </p>
                {!onBreak && breakInTime < 1800 && (
                  <p className="text-amber-600">
                    {breakInTime < 300
                      ? "⚠️ You should take a break very soon!"
                      : "Consider taking a break in the next 30 minutes."}
                  </p>
                )}
                <p className="text-sm text-sky-600">
                  Remember: Regular breaks help prevent drowsiness and keep you safe on the road.
                </p>

                {drowsyAlertCount > 0 && (
                  <div className="mt-4 rounded-md bg-red-50 p-3 text-red-800">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                      <div className="ml-3">
                        <h4 className="text-sm font-medium">Drowsiness alerts: {drowsyAlertCount}</h4>
                        <p className="mt-1 text-xs">
                          You've received {drowsyAlertCount} drowsiness {drowsyAlertCount === 1 ? "alert" : "alerts"}{" "}
                          during this trip. Consider getting more rest before continuing your journey.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Drowsiness Alert Dialog */}
      <AlertDialog open={showDrowsyAlert} onOpenChange={setShowDrowsyAlert}>
        <AlertDialogContent className="border-red-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Drowsiness Detected!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Multiple signs of drowsiness have been detected. Please pull over safely and take a break.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Driving while drowsy is dangerous</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc space-y-1 pl-5">
                      <li>Drowsy driving causes thousands of accidents each year</li>
                      <li>Your reaction time is significantly impaired</li>
                      <li>Even a 15-minute break can help restore alertness</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleDrowsyAlertAcknowledge}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Take a Break Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
