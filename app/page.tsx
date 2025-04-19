import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Facebook, Instagram, Twitter, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import FeaturesCarousel from "@/components/features-carousel"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-50 to-white">
      <header className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center">
          <div className="relative h-10 w-24">
            <Image src="/logo.svg" alt="Drowzi Logo" fill className="object-contain" priority />
          </div>
        </div>
        <nav className="hidden space-x-6 md:flex">
          <Link href="#features" className="text-sm font-medium text-sky-900 hover:text-sky-700">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-sky-900 hover:text-sky-700">
            How It Works
          </Link>
          <Link href="#privacy" className="text-sm font-medium text-sky-900 hover:text-sky-700">
            Privacy
          </Link>
        </nav>
        <Button
          variant="outline"
          className="hidden border-sky-200 text-sky-700 hover:bg-sky-100 hover:text-sky-800 md:inline-flex"
        >
          Support
        </Button>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center md:py-32">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-sky-900 md:text-6xl">
            Are you ready to stay alert?
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-sky-700 md:text-xl">
            Drive safely with real-time drowsiness monitoring.
          </p>
          <Link href="/drive">
            <Button className="group relative mx-auto mb-8 overflow-hidden rounded-full bg-sky-600 px-8 py-6 text-lg font-semibold text-white transition-all hover:bg-sky-700 md:text-xl">
              <span className="relative z-10 flex items-center">
                Start Your Drive
                <ChevronRight className="ml-2 h-5 w-5" />
              </span>
              <span className="absolute inset-0 z-0 bg-gradient-to-r from-sky-400 to-sky-600 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-70"></span>
            </Button>
          </Link>
          <p className="mx-auto max-w-2xl text-sky-700">
            Drowzi uses your camera to track your alertness while you drive. If you start to nod off, we&apos;ll warn
            you with loud sounds and flashing stop signs.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-sky-500">
            Your privacy is important to us.
            
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-sky-500">
            Camera data is never stored.
          </p>
        </section>

        <section id="features" className="bg-white py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-sky-900 md:text-4xl">Features</h2>
            <FeaturesCarousel />
          </div>
        </section>

        <section id="how-it-works" className="bg-sky-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-sky-900 md:text-4xl">How It Works</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-sky-900">Mount Your Phone</h3>
                <p className="text-sky-700">Securely place your phone where it can see your face while you drive.</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-sky-900">Start Drowzi</h3>
                <p className="text-sky-700">Tap the "Start Your Drive" button before you begin your journey.</p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-sky-900">Drive Safely</h3>
                <p className="text-sky-700">
                  Drowzi monitors your alertness and warns you if you show signs of drowsiness.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="privacy" className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl rounded-xl bg-sky-50 p-8 shadow-sm">
              <h2 className="mb-6 text-center text-3xl font-bold text-sky-900">Your Privacy Matters</h2>
              <div className="space-y-4 text-sky-700">
                <p>
                  At Drowzi, we take your privacy seriously. Our app processes all camera data directly on your device.
                </p>
                <p>
                  <strong>We never:</strong>
                </p>
                <ul className="list-inside list-disc space-y-2 pl-4">
                  <li>Upload or store your camera footage</li>
                  <li>Share your personal information with third parties</li>
                  <li>Track your location without your explicit permission</li>
                </ul>
                <p>The app only needs camera access to monitor your alertness and keep you safe on the road.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-sky-900 py-10 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col justify-between space-y-6 md:flex-row md:space-y-0">
            <div>
              <div className="relative h-10 w-24">
                <Image src="/logo-white.svg" alt="Drowzi Logo" fill className="object-contain" />
              </div>
              <p className="mt-2 text-sm text-sky-200">Stay alert. Stay safe.</p>
            </div>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase text-sky-200">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#features" className="text-sm text-sky-100 hover:text-white">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#how-it-works" className="text-sm text-sky-100 hover:text-white">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-sky-100 hover:text-white">
                      Download
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase text-sky-200">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-sm text-sky-100 hover:text-white">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-sky-100 hover:text-white">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-sky-100 hover:text-white">
                      Careers
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase text-sky-200">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#privacy" className="text-sm text-sky-100 hover:text-white">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-sky-100 hover:text-white">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase text-sky-200">Connect</h3>
              <div className="flex space-x-4">
                <Link href="#" className="text-sky-200 hover:text-white">
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Link>
                <Link href="#" className="text-sky-200 hover:text-white">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="#" className="text-sky-200 hover:text-white">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
                <Link href="#" className="text-sky-200 hover:text-white">
                  <HelpCircle className="h-5 w-5" />
                  <span className="sr-only">Support</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-sky-800 pt-8 text-center">
            <p className="text-sm text-sky-300">&copy; {new Date().getFullYear()} Drowzi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
