"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Moon, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const features = [
  {
    id: 1,
    title: "Real-Time Drowsiness Monitoring",
    description: "Advanced facial tracking technology detects signs of drowsiness as you drive.",
    icon: "/monitoring.svg",
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: 2,
    title: "Instant Alerts",
    description: "Receive immediate visual and auditory alerts when signs of drowsiness are detected.",
    icon: "/alerts.svg",
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: 3,
    title: "Customize Alerts",
    description: "Adjust sensitivity and volume settings to match your preferences.",
    icon: <Sliders className="h-6 w-6" />,
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: 4,
    title: "Night Mode",
    description: "Optimized interface for nighttime driving with reduced glare and eye strain.",
    icon: <Moon className="h-6 w-6" />,
    image: "/placeholder.svg?height=300&width=500",
  },
]

export default function FeaturesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const goToNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const goToPrev = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + features.length) % features.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  useEffect(() => {
    const interval = setInterval(goToNext, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-xl bg-sky-50 p-6 shadow-sm md:p-8">
      <div
        className="transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        <div className="flex">
          {features.map((feature) => (
            <div key={feature.id} className="min-w-full flex-shrink-0 px-4">
              <div className="grid gap-6 md:grid-cols-2 md:gap-12">
                <div className="flex flex-col justify-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    {typeof feature.icon === "string" ? (
                      <div className="relative h-6 w-6">
                        <Image src={feature.icon || "/placeholder.svg"} alt="" fill className="object-contain" />
                      </div>
                    ) : (
                      feature.icon
                    )}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-sky-900 md:text-2xl">{feature.title}</h3>
                  <p className="text-sky-700">{feature.description}</p>
                </div>
                <div className="relative h-[200px] overflow-hidden rounded-lg md:h-[300px]">
                  <Image src={feature.image || "/placeholder.svg"} alt={feature.title} fill className="object-cover" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border-sky-200 bg-white/80 text-sky-700 backdrop-blur-sm hover:bg-sky-100 hover:text-sky-800"
        onClick={goToPrev}
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="sr-only">Previous</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border-sky-200 bg-white/80 text-sky-700 backdrop-blur-sm hover:bg-sky-100 hover:text-sky-800"
        onClick={goToNext}
      >
        <ChevronRight className="h-5 w-5" />
        <span className="sr-only">Next</span>
      </Button>

      <div className="mt-6 flex justify-center space-x-2">
        {features.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              currentIndex === index ? "bg-sky-600 w-6" : "bg-sky-200",
            )}
            onClick={() => {
              setIsAnimating(true)
              setCurrentIndex(index)
              setTimeout(() => setIsAnimating(false), 500)
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
