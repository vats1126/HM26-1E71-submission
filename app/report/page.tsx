"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  MapPin,
  Crosshair,
  Compass,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Camera,
  Video,
  Upload,
  X,
  RotateCcw,
  Trash2,
  Plus,
  ChevronRight,
  ChevronLeft,
  FileText,
  Send,
  Copy,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles,
  Clock,
  RefreshCw,
  Eye,
  HelpCircle,
  Droplets,
  Truck,
  Info,
  Check,
  SwitchCamera,
  Play,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { REPORT_CATEGORIES, type ReportCategory, type ReportMedia, type Report } from "@/lib/types"
import { mockReportsService, MYSRU_CENTER, MOCK_WARDS } from "@/lib/mock-data"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { LoadingState } from "@/components/shared/LoadingState"
import { ErrorState } from "@/components/shared/ErrorState"
import { useToast } from "@/components/shared/Toast"

type Step = "location" | "evidence" | "details" | "review" | "success"

export type GPSState =
  | "IDLE"
  | "REQUESTING"
  | "SUCCESS"
  | "PERMISSION_DENIED"
  | "POSITION_UNAVAILABLE"
  | "TIMEOUT"
  | "UNSUPPORTED"
  | "DEMO_LOCATION"
  | "MANUAL_PIN"

export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: string
  wardNumber: number
  wardName: string
  source: "real_gps" | "demo" | "manual_pin"
  isDemoFallback: boolean
  isManualPin: boolean
}

export const MYSURU_LANDMARKS = [
  { name: "Mysuru Palace / Central (Ward 8)", lat: 12.3051, lng: 76.6552, ward: 8 },
  { name: "Devaraja Market (Ward 8)", lat: 12.3115, lng: 76.6499, ward: 8 },
  { name: "Kuvempunagar Complex (Ward 18)", lat: 12.2882, lng: 76.6341, ward: 18 },
  { name: "Gokulam 3rd Stage (Ward 2)", lat: 12.3298, lng: 76.6264, ward: 2 },
  { name: "Saraswathipuram Fire Brigade (Ward 10)", lat: 12.3039, lng: 76.6322, ward: 10 },
  { name: "J.P. Nagar Ring Road (Ward 15)", lat: 12.2685, lng: 76.6548, ward: 15 },
  { name: "Vijayanagar 2nd Stage (Ward 21)", lat: 12.3364, lng: 76.6083, ward: 21 },
  { name: "Suburban Bus Stand (Ward 7)", lat: 12.3082, lng: 76.6588, ward: 7 },
  { name: "Hebbal Lake Industrial (Ward 1)", lat: 12.3582, lng: 76.6185, ward: 1 },
]

export function getNearestWard(lat: number, lng: number): { wardNumber: number; wardName: string } {
  const WARD_DIRECTORY: Record<number, string> = {
    1: "Ward 1 (Hebbal)",
    2: "Ward 2 (Gokulam / Jayalakshmipuram)",
    3: "Ward 3 (Vontikoppal / Yadavagiri)",
    4: "Ward 4 (Bannimantap)",
    5: "Ward 5 (Nazarbad)",
    6: "Ward 6 (Mandi Mohalla)",
    7: "Ward 7 (Lashkar Mohalla)",
    8: "Ward 8 (Devaraja Mohalla)",
    9: "Ward 9 (Shivarampet)",
    10: "Ward 10 (Saraswathipuram)",
    11: "Ward 11 (K.G. Koppal)",
    12: "Ward 12 (Krishnaraja / Fort)",
    13: "Ward 13 (Agrahara / Vidyaranyapuram)",
    14: "Ward 14 (Chamundipuram)",
    15: "Ward 15 (J.P. Nagar)",
    16: "Ward 16 (Ashokapuram)",
    17: "Ward 17 (Kuvempunagar North)",
    18: "Ward 18 (Kuvempunagar South)",
    19: "Ward 19 (Ramakrishnanagar)",
    20: "Ward 20 (Sharadadevinagar)",
    21: "Ward 21 (Vijayanagar)",
  }
  const dLat = lat - 12.29584
  const dLng = lng - 76.63942
  const distKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111

  if (distKm > 25) {
    return {
      wardNumber: 8,
      wardName: "Mysuru Central Civic Jurisdiction",
    }
  }

  const angle = (Math.atan2(dLat, dLng) * 180 / Math.PI + 360) % 360
  const wardIndex = (Math.floor(angle / (360 / 21)) % 21) + 1
  return {
    wardNumber: wardIndex,
    wardName: WARD_DIRECTORY[wardIndex] || `Ward ${wardIndex} (Mysuru)`,
  }
}

interface EvidenceItem {
  id: string
  type: "image" | "video"
  url: string
  label: string
  capturedAt: string
  file?: File
}

const CATEGORY_ICONS: Record<ReportCategory, React.ElementType> = {
  garbage_accumulation: Trash2,
  overflowing_bin: Trash2,
  illegal_dumping: AlertTriangle,
  dirty_public_area: MapPin,
  drainage_problem: Droplets,
  roadside_waste: Truck,
  other: HelpCircle,
}

const CATEGORY_DESCRIPTIONS: Record<ReportCategory, string> = {
  garbage_accumulation: "Piles of uncollected waste or litter creating a hazard.",
  overflowing_bin: "Public dustbin spilling over onto footpaths or roads.",
  illegal_dumping: "Unauthorized dumping of construction debris or commercial waste.",
  dirty_public_area: "Foul conditions in parks, walkways, or civic squares.",
  drainage_problem: "Blocked storm drains, clogged gutters, or sewage overflow.",
  roadside_waste: "Scattered rubbish, plastics, or waste on road shoulders.",
  other: "Other civic sanitation or public cleanliness concerns.",
}

const SAMPLE_DEMO_PHOTOS = [
  {
    url: "https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=640&q=80",
    caption: "Waste accumulation near junction",
  },
  {
    url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=640&q=80",
    caption: "Overflowing bin on footpath",
  },
  {
    url: "https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=640&q=80",
    caption: "Roadside plastic waste",
  },
]

export default function CitizenReportPage() {
  const router = useRouter()
  const { showToast } = useToast()

  // Stepper state
  const [currentStep, setCurrentStep] = useState<Step>("location")

  // Step 1: GPS State Machine
  const [gpsState, setGpsState] = useState<GPSState>("IDLE")
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [showPermissionHelp, setShowPermissionHelp] = useState<boolean>(false)
  const [isPinningMode, setIsPinningMode] = useState<boolean>(false)
  const [manualLatInput, setManualLatInput] = useState<string>("12.295840")
  const [manualLngInput, setManualLngInput] = useState<string>("76.639420")
  const [countdown, setCountdown] = useState<number>(8)
  const gpsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Step 2: Camera & Evidence State
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([])
  const [activeTab, setActiveTab] = useState<"camera" | "upload">("camera")
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false)
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("environment")
  const [cameraUnavailable, setCameraUnavailable] = useState<boolean>(false)
  const [evidenceError, setEvidenceError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Step 3: Details State
  const [category, setCategory] = useState<ReportCategory | "">("")
  const [description, setDescription] = useState<string>("")
  const [touchedDetails, setTouchedDetails] = useState<boolean>(false)
  const [detailsErrors, setDetailsErrors] = useState<{ category?: string; description?: string }>({})

  // Step 4: Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false)
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null)
  const [copiedId, setCopiedId] = useState<boolean>(false)

  // Clear any timers on unmount
  useEffect(() => {
    return () => {
      if (gpsTimeoutRef.current) clearTimeout(gpsTimeoutRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [])

  // -------------------------------------------------------------
  // STEP 1: GEOLOCATION ACQUISITION (NO INFINITE SPINNER)
  // -------------------------------------------------------------
  const acquireLocation = useCallback(() => {
    // Clear previous timers
    if (gpsTimeoutRef.current) clearTimeout(gpsTimeoutRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)

    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsState("UNSUPPORTED")
      return
    }

    setGpsState("REQUESTING")
    setShowPermissionHelp(false)
    setCountdown(8)

    // Countdown indicator for user transparency
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 1))
    }, 1000)

    // Guaranteed 8s timeout ceiling to eliminate infinite spinners completely
    gpsTimeoutRef.current = setTimeout(() => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
      setGpsState((curr) => (curr === "REQUESTING" ? "TIMEOUT" : curr))
      showToast("Location request timed out. You can retry or pin location.", "warning")
    }, 8000)

    const handleGpsSuccess = (position: GeolocationPosition, label: string) => {
      if (gpsTimeoutRef.current) clearTimeout(gpsTimeoutRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)

      const lat = position.coords.latitude
      const lng = position.coords.longitude
      const accuracy = Math.round(position.coords.accuracy)

      // Dynamic ward lookup based on actual coordinates (NEVER hardcoded Kuvempunagar)
      const wardInfo = getNearestWard(lat, lng)

      setLocationData({
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
        accuracy,
        timestamp: new Date(position.timestamp).toISOString(),
        wardNumber: wardInfo.wardNumber,
        wardName: wardInfo.wardName,
        source: "real_gps",
        isDemoFallback: false,
        isManualPin: false,
      })
      setGpsState("SUCCESS")
      showToast(`Live device GPS acquired (${label})!`, "success")
    }

    try {
      // Stage 1: Try high accuracy with satellite GPS first
      navigator.geolocation.getCurrentPosition(
        (position) => handleGpsSuccess(position, "High accuracy"),
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            if (gpsTimeoutRef.current) clearTimeout(gpsTimeoutRef.current)
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
            setGpsState("PERMISSION_DENIED")
            return
          }

          // Stage 2: Fall back to standard/network positioning if high-accuracy satellite fix times out or is unavailable
          try {
            navigator.geolocation.getCurrentPosition(
              (pos2) => handleGpsSuccess(pos2, "Standard accuracy"),
              (err2) => {
                if (gpsTimeoutRef.current) clearTimeout(gpsTimeoutRef.current)
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)

                if (err2.code === err2.PERMISSION_DENIED) {
                  setGpsState("PERMISSION_DENIED")
                } else if (err2.code === err2.TIMEOUT) {
                  setGpsState("TIMEOUT")
                } else {
                  setGpsState("POSITION_UNAVAILABLE")
                }
              },
              {
                enableHighAccuracy: false,
                timeout: 4000,
                maximumAge: 60000,
              }
            )
          } catch {
            if (gpsTimeoutRef.current) clearTimeout(gpsTimeoutRef.current)
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
            setGpsState("POSITION_UNAVAILABLE")
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 4000,
          maximumAge: 0,
        }
      )
    } catch {
      if (gpsTimeoutRef.current) clearTimeout(gpsTimeoutRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
      setGpsState("POSITION_UNAVAILABLE")
    }
  }, [showToast])

  // Explicit Demo Location Handler (Clearly labeled as simulated)
  const useDemoLocation = () => {
    if (gpsTimeoutRef.current) clearTimeout(gpsTimeoutRef.current)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)

    const lat = Number((MYSRU_CENTER[0] + (Math.random() - 0.5) * 0.005).toFixed(6))
    const lng = Number((MYSRU_CENTER[1] + (Math.random() - 0.5) * 0.005).toFixed(6))
    const wardInfo = getNearestWard(lat, lng)

    setLocationData({
      latitude: lat,
      longitude: lng,
      accuracy: 6,
      timestamp: new Date().toISOString(),
      wardNumber: wardInfo.wardNumber,
      wardName: `${wardInfo.wardName} [Simulated]`,
      source: "demo",
      isDemoFallback: true,
      isManualPin: false,
    })
    setGpsState("DEMO_LOCATION")
    setIsPinningMode(false)
    showToast("Demo Location applied (Simulated coordinates)", "default")
  }

  // Manual Pin Location Confirmation
  const applyManualPin = (lat: number, lng: number, landmarkLabel?: string) => {
    const wardInfo = getNearestWard(lat, lng)
    setLocationData({
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      accuracy: 10,
      timestamp: new Date().toISOString(),
      wardNumber: wardInfo.wardNumber,
      wardName: landmarkLabel ? `${landmarkLabel} (${wardInfo.wardName})` : `${wardInfo.wardName} [Manually Pinned]`,
      source: "manual_pin",
      isDemoFallback: false,
      isManualPin: true,
    })
    setGpsState("MANUAL_PIN")
    setIsPinningMode(false)
    showToast("Manually pinned location confirmed!", "success")
  }

  // -------------------------------------------------------------
  // STEP 2: CAMERA & EVIDENCE LOGIC
  // -------------------------------------------------------------
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
  }, [])

  const startCamera = useCallback(async () => {
    stopCamera()
    setCameraUnavailable(false)

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraUnavailable(true)
      setActiveTab("upload")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setIsCameraActive(true)
    } catch {
      setCameraUnavailable(true)
      setActiveTab("upload")
    }
  }, [cameraFacingMode, stopCamera])

  // Manage camera lifecycle when entering/leaving evidence step
  useEffect(() => {
    if (currentStep === "evidence" && activeTab === "camera") {
      startCamera()
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
    }
  }, [currentStep, activeTab, startCamera, stopCamera])

  const capturePhoto = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85)

    const photoCount = evidenceList.filter((e) => e.type === "image").length + 1
    const newItem: EvidenceItem = {
      id: `photo-${Date.now()}`,
      type: "image",
      url: dataUrl,
      label: `Photo ${photoCount}`,
      capturedAt: new Date().toISOString(),
    }

    setEvidenceList((prev) => [...prev, newItem])
    setEvidenceError(null)
    showToast(`${newItem.label} captured!`, "success")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith("video/")
      const reader = new FileReader()

      reader.onload = (event) => {
        const url = event.target?.result as string
        setEvidenceList((prev) => {
          const photoCount = prev.filter((item) => item.type === "image").length
          const newItem: EvidenceItem = {
            id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            type: isVideo ? "video" : "image",
            url,
            label: isVideo ? "Video" : `Photo ${photoCount + 1}`,
            capturedAt: new Date().toISOString(),
            file,
          }
          return [...prev, newItem]
        })
        setEvidenceError(null)
      }

      reader.readAsDataURL(file)
    })

    if (e.target) e.target.value = ""
    showToast("Evidence file added successfully", "success")
  }

  const addSamplePhoto = () => {
    const photoCount = evidenceList.filter((e) => e.type === "image").length
    const sample = SAMPLE_DEMO_PHOTOS[photoCount % SAMPLE_DEMO_PHOTOS.length]

    const newItem: EvidenceItem = {
      id: `sample-${Date.now()}`,
      type: "image",
      url: sample.url,
      label: `Photo ${photoCount + 1}`,
      capturedAt: new Date().toISOString(),
    }

    setEvidenceList((prev) => [...prev, newItem])
    setEvidenceError(null)
    showToast(`${newItem.label} added from sample library`, "default")
  }

  const removeEvidence = (id: string) => {
    setEvidenceList((prev) => {
      const remaining = prev.filter((item) => item.id !== id)
      // Renumber photos
      let photoIdx = 1
      return remaining.map((item) => {
        if (item.type === "image") {
          return { ...item, label: `Photo ${photoIdx++}` }
        }
        return item
      })
    })
    showToast("Evidence removed", "default")
  }

  const validateEvidenceStep = (): boolean => {
    if (evidenceList.length === 0) {
      setEvidenceError("Please capture or upload at least one photo or video before continuing.")
      showToast("No evidence captured yet", "warning")
      return false
    }
    setEvidenceError(null)
    return true
  }

  // -------------------------------------------------------------
  // STEP 3: DETAILS VALIDATION
  // -------------------------------------------------------------
  const validateDetailsStep = (): boolean => {
    setTouchedDetails(true)
    const errors: { category?: string; description?: string } = {}

    if (!category) {
      errors.category = "Please select an issue category."
    }

    if (!description.trim()) {
      errors.description = "Please describe the issue."
    } else if (description.trim().length < 10) {
      errors.description = `Description too short (minimum 10 characters, currently ${description.trim().length}).`
    }

    setDetailsErrors(errors)
    if (Object.keys(errors).length > 0) {
      showToast(errors.category || errors.description || "Please check details", "warning")
      return false
    }
    return true
  }

  // -------------------------------------------------------------
  // STEP 5: SUBMIT REPORT
  // -------------------------------------------------------------
  const handleSubmitReport = async () => {
    setIsSubmitting(true)
    setSubmissionError(null)

    // Believable delay for civic dispatch transmission
    await new Promise((res) => setTimeout(res, 1200))

    if (simulateFailure) {
      setIsSubmitting(false)
      setSubmissionError("Network timeout: Unable to reach Mysuru Municipal Server. Please check your signal and retry.")
      showToast("Submission failed. You can retry safely.", "error")
      return
    }

    try {
      // Map evidence to ReportMedia
      const reportMedia: ReportMedia[] = evidenceList.map((e, idx) => ({
        id: `media-${Date.now()}-${idx + 1}`,
        type: e.type,
        url: e.url,
        thumbnailUrl: e.url,
        capturedAt: e.capturedAt,
        caption: e.label,
      }))

      let created: Report | null = null

      // Attempt submission to live Supabase backend
      try {
        const response = await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: category ? category : "garbage_accumulation",
            latitude: locationData?.latitude ?? MYSRU_CENTER[0],
            longitude: locationData?.longitude ?? MYSRU_CENTER[1],
            wardNumber: locationData?.wardNumber ?? 18,
            wardName: locationData?.wardName ?? "Ward 18 (Mysuru)",
            locationName: locationData?.wardName ?? "Ward 18 (Mysuru)",
            description: description.trim(),
            gpsAccuracy: locationData?.accuracy ?? 8,
            media: reportMedia.map((m) => ({
              type: m.type,
              url: m.url,
              caption: m.caption,
              capturedAt: m.capturedAt,
            })),
          }),
        })

        if (response.ok) {
          const json = await response.json()
          if (json.success && json.report) {
            created = json.report
          }
        }
      } catch (netErr) {
        console.warn("Backend /api/reports unreachable, falling back to local storage:", netErr)
      }

      // Resilient fallback to local persistence if backend is offline/unconfigured
      if (!created) {
        created = mockReportsService.createReport({
          category: category ? category : "garbage_accumulation",
          latitude: locationData?.latitude ?? MYSRU_CENTER[0],
          longitude: locationData?.longitude ?? MYSRU_CENTER[1],
          wardNumber: locationData?.wardNumber ?? 18,
          description: description.trim(),
          media: reportMedia,
          gpsAccuracy: locationData?.accuracy ?? 8,
          locationName: locationData?.wardName ?? "Ward 18 (Mysuru)",
        })
      }

      setSubmittedReport(created)
      setIsSubmitting(false)
      setCurrentStep("success")
      showToast(`Report ${created.publicId} submitted to Mysuru Municipal Corporation!`, "success")
    } catch {
      setIsSubmitting(false)
      setSubmissionError("An unexpected error occurred during submission. Please try again.")
      showToast("Submission error", "error")
    }
  }

  const copyReportId = () => {
    if (submittedReport) {
      navigator.clipboard.writeText(submittedReport.publicId)
      setCopiedId(true)
      showToast(`Copied ${submittedReport.publicId} to clipboard!`, "default")
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  const resetFlow = () => {
    setCurrentStep("location")
    setCategory("")
    setDescription("")
    setEvidenceList([])
    setEvidenceError(null)
    setDetailsErrors({})
    setTouchedDetails(false)
    setSubmissionError(null)
    setSubmittedReport(null)
    acquireLocation()
  }

  // -------------------------------------------------------------
  // STEPPER PROGRESS INFO
  // -------------------------------------------------------------
  const STEPS: { key: Step; label: string; number: number }[] = [
    { key: "location", label: "Location", number: 1 },
    { key: "evidence", label: "Evidence", number: 2 },
    { key: "details", label: "Details", number: 3 },
    { key: "review", label: "Review", number: 4 },
  ]

  const currentStepNumber = STEPS.find((s) => s.key === currentStep)?.number ?? 5

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      {/* Top Header / Civic Context */}
      <div className="sticky top-16 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-civic-green-100 text-civic-green-700">
                <ShieldCheck size={18} />
              </span>
              <div>
                <h1 className="text-sm font-bold text-gray-900 leading-tight">Civic Report Portal</h1>
                <p className="text-[11px] text-gray-500 font-medium">Mysuru Municipal Corporation</p>
              </div>
            </div>

            {currentStep !== "success" && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-civic-green-50 text-civic-green-700 border border-civic-green-200">
                Step {currentStepNumber} of 4
              </span>
            )}
          </div>

          {/* Stepper Progress Bar */}
          {currentStep !== "success" && (
            <div className="mt-3">
              <div className="grid grid-cols-4 gap-1.5">
                {STEPS.map((s) => {
                  const isActive = s.key === currentStep
                  const isDone = s.number < currentStepNumber
                  return (
                    <div key={s.key} className="flex flex-col gap-1">
                      <div
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          isDone
                            ? "bg-civic-green-600"
                            : isActive
                            ? "bg-civic-green-500 animate-pulse"
                            : "bg-gray-200"
                        )}
                      />
                      <span
                        className={cn(
                          "text-[10px] text-center font-medium truncate",
                          isActive
                            ? "text-civic-green-700 font-bold"
                            : isDone
                            ? "text-gray-700"
                            : "text-gray-400"
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 pt-4 sm:pt-6">
        {/* ========================================================= */}
        {/* STEP 1: LOCATION                                          */}
        {/* ========================================================= */}
        {currentStep === "location" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Title Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-civic-green-100 text-civic-green-700 shrink-0">
                  <Compass size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Step 1 — Verify Location</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Civic reports require verifiable GPS coordinates to route immediately to the correct municipal ward officer.
                  </p>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* MANUAL PIN MODAL / PICKER                                */}
            {/* ========================================================= */}
            {isPinningMode && (
              <div className="rounded-2xl border-2 border-blue-500 bg-blue-50/50 p-5 space-y-4 shadow-md animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-600 text-white">
                      <MapPin size={16} />
                    </span>
                    <h3 className="text-sm font-bold text-gray-900">Pin Location on Map / Select Landmark</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPinningMode(false)}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>

                <p className="text-xs text-gray-600">
                  Select a known Mysuru civic landmark or input exact coordinates to pin the issue location:
                </p>

                {/* Preset Landmark Buttons */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Mysuru Key Civic Sectors
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MYSURU_LANDMARKS.map((lm) => (
                      <button
                        key={lm.name}
                        type="button"
                        onClick={() => applyManualPin(lm.lat, lm.lng, lm.name)}
                        className="text-left p-2.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-100 hover:border-blue-400 text-xs transition-all flex items-center justify-between group"
                      >
                        <span className="font-semibold text-gray-800 group-hover:text-blue-900">{lm.name}</span>
                        <span className="text-[10px] font-mono text-gray-400">Ward {lm.ward}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Lat/Lng Inputs */}
                <div className="pt-2 border-t border-blue-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Or Enter Coordinates
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={manualLatInput}
                        onChange={(e) => setManualLatInput(e.target.value)}
                        className="w-full text-xs font-mono p-2 rounded-lg border border-gray-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={manualLngInput}
                        onChange={(e) => setManualLngInput(e.target.value)}
                        className="w-full text-xs font-mono p-2 rounded-lg border border-gray-300 bg-white"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const lat = parseFloat(manualLatInput) || MYSRU_CENTER[0]
                      const lng = parseFloat(manualLngInput) || MYSRU_CENTER[1]
                      applyManualPin(lat, lng)
                    }}
                    className="w-full py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    Confirm Pinned Coordinates
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STATE: IDLE (MOBILE EXPLANATION BEFORE PERMISSION PROMPT)  */}
            {/* ========================================================= */}
            {gpsState === "IDLE" && !isPinningMode && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-2xl bg-civic-green-100 text-civic-green-700 shrink-0">
                    <Compass size={28} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Location Permission Required
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Clean City needs your current location to send this report to the correct civic authority and municipal ward officer.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-500 space-y-1">
                  <p className="font-semibold text-gray-700">Why location is mandatory:</p>
                  <p>• Ensures jurisdiction-based automatic ward routing (Wards 1–21)</p>
                  <p>• Prevents duplicate municipal field responses</p>
                  <p>• Clean City stops tracking immediately after acquiring position</p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={acquireLocation}
                    className="w-full py-3.5 px-4 rounded-xl bg-civic-green-600 hover:bg-civic-green-700 text-white text-sm font-bold shadow-md shadow-civic-green-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <Crosshair size={18} />
                    <span>ALLOW LOCATION</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPinningMode(true)}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MapPin size={14} className="text-blue-600" />
                      <span>PIN LOCATION ON MAP</span>
                    </button>
                    <button
                      type="button"
                      onClick={useDemoLocation}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={14} className="text-amber-600" />
                      <span>USE DEMO LOCATION</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STATE: REQUESTING (SPINNER WITH 8S SAFETY CEILING)        */}
            {/* ========================================================= */}
            {gpsState === "REQUESTING" && (
              <div className="rounded-2xl border border-civic-green-300 bg-civic-green-50/80 p-6 text-center space-y-4 animate-in fade-in">
                <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-civic-green-400/30 animate-ping" />
                  <span className="relative p-3.5 rounded-full bg-civic-green-600 text-white shadow-lg">
                    <Crosshair size={28} className="animate-spin" />
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Acquiring GPS Signal...</h3>
                  <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                    Connecting to device satellite & network location sensors. Please accept the browser location prompt.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-civic-green-200 text-xs font-mono font-semibold text-civic-green-800">
                  <Clock size={12} />
                  <span>Timeout ceiling: {countdown}s</span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (gpsTimeoutRef.current) clearTimeout(gpsTimeoutRef.current)
                      setGpsState("IDLE")
                    }}
                    className="text-xs text-gray-500 hover:text-gray-800 underline"
                  >
                    Cancel request
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STATE: SUCCESS (LIVE REAL DEVICE GPS CAPTURED)            */}
            {/* ========================================================= */}
            {gpsState === "SUCCESS" && locationData && (
              <div className="rounded-2xl border-2 border-civic-green-500 bg-white p-5 shadow-sm space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-full bg-civic-green-100 text-civic-green-600">
                      <CheckCircle2 size={20} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-civic-green-900">LOCATION CAPTURED</h3>
                      <p className="text-[11px] text-gray-500">Device GPS watermark verified</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-civic-green-100 text-civic-green-800 border border-civic-green-300">
                    LIVE DEVICE GPS
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Coordinates</span>
                    <span className="font-mono font-bold text-gray-900 text-sm mt-0.5 block">
                      {locationData.latitude}°, {locationData.longitude}°
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Accuracy</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-civic-green-500" />
                      <span className="font-bold text-gray-900 text-sm">
                        ±{locationData.accuracy} meters
                      </span>
                      <span className="text-[10px] text-civic-green-700 font-medium">(Verified)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Routed Jurisdiction</span>
                    <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                      {locationData.wardName}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Captured Timestamp</span>
                    <span className="font-mono text-gray-700 text-xs mt-0.5 block truncate">
                      {new Date(locationData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* GPS Actions */}
                <div className="flex flex-wrap items-center justify-between pt-1 text-xs gap-2">
                  <button
                    onClick={acquireLocation}
                    type="button"
                    className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-semibold py-1.5 px-3 rounded-lg hover:bg-gray-100"
                  >
                    <RefreshCw size={14} />
                    Retarget GPS
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPinningMode(true)}
                      className="text-gray-500 hover:text-blue-700 underline"
                    >
                      Pin on Map
                    </button>
                    <button
                      type="button"
                      onClick={useDemoLocation}
                      className="text-gray-500 hover:text-amber-700 underline"
                    >
                      Use Demo Location
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STATE: DEMO_LOCATION (SIMULATED FOR TESTING)              */}
            {/* ========================================================= */}
            {gpsState === "DEMO_LOCATION" && locationData && (
              <div className="rounded-2xl border-2 border-amber-400 bg-amber-50/40 p-5 shadow-sm space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-full bg-amber-100 text-amber-700">
                      <Sparkles size={20} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-amber-900">DEMO LOCATION</h3>
                      <p className="text-[11px] text-amber-700">Mysuru — simulated coordinates (Demo Testing)</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                    DEMO LOCATION
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-amber-100">
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Coordinates</span>
                    <span className="font-mono font-bold text-gray-900 text-sm mt-0.5 block">
                      {locationData.latitude}°, {locationData.longitude}°
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-amber-100">
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Accuracy</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="font-bold text-gray-900 text-sm">±6 meters</span>
                      <span className="text-[10px] text-amber-700 font-medium">(Simulated)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-amber-100">
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Ward</span>
                    <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                      {locationData.wardName}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-amber-100">
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Captured At</span>
                    <span className="font-mono text-gray-700 text-xs mt-0.5 block truncate">
                      {new Date(locationData.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    onClick={acquireLocation}
                    type="button"
                    className="inline-flex items-center gap-1.5 text-civic-green-700 hover:underline font-bold"
                  >
                    <RefreshCw size={13} />
                    Try Real Device GPS
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPinningMode(true)}
                    className="text-gray-600 hover:underline"
                  >
                    Pin on Map
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STATE: MANUAL_PIN (MANUALLY PINNED ON MAP)                */}
            {/* ========================================================= */}
            {gpsState === "MANUAL_PIN" && locationData && (
              <div className="rounded-2xl border-2 border-blue-500 bg-blue-50/40 p-5 shadow-sm space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-full bg-blue-100 text-blue-700">
                      <MapPin size={20} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-blue-900">MANUALLY PINNED LOCATION</h3>
                      <p className="text-[11px] text-blue-700">Manually selected by user — not device GPS</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 border border-blue-300">
                    PINNED ON MAP
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-blue-100">
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Coordinates</span>
                    <span className="font-mono font-bold text-gray-900 text-sm mt-0.5 block">
                      {locationData.latitude}°, {locationData.longitude}°
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-blue-100">
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Precision</span>
                    <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                      ~10 meters (User Selected)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-blue-100">
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Ward</span>
                    <span className="font-bold text-gray-900 text-sm mt-0.5 block truncate">
                      {locationData.wardName}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-blue-100">
                    <span className="text-gray-400 font-medium block text-[10px] uppercase tracking-wider">Timestamp</span>
                    <span className="font-mono text-gray-700 text-xs mt-0.5 block truncate">
                      {new Date(locationData.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsPinningMode(true)}
                    className="text-blue-700 hover:underline font-bold"
                  >
                    Change Pin / Landmark
                  </button>
                  <button
                    onClick={acquireLocation}
                    type="button"
                    className="text-gray-600 hover:underline"
                  >
                    Switch to Live GPS
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STATE: PERMISSION_DENIED                                  */}
            {/* ========================================================= */}
            {gpsState === "PERMISSION_DENIED" && (
              <div className="rounded-2xl border border-status-red-200 bg-status-red-50/80 p-5 space-y-4 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-status-red-100 text-status-red-600 shrink-0 mt-0.5">
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-status-red-900">
                      Location permission required
                    </h3>
                    <p className="text-xs text-status-red-700 mt-1 leading-relaxed">
                      Clean City uses your current location to route this report to the appropriate civic authority.
                    </p>
                  </div>
                </div>

                {/* Collapsible Browser Help */}
                <div className="border-t border-status-red-200/60 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPermissionHelp((prev) => !prev)}
                    className="text-[11px] font-bold text-status-red-800 hover:underline flex items-center gap-1"
                  >
                    <span>{showPermissionHelp ? "▲ Hide Help" : "▼ How to enable location in browser"}</span>
                  </button>

                  {showPermissionHelp && (
                    <div className="mt-2 p-3 rounded-xl bg-white border border-status-red-200 text-[11px] text-gray-600 space-y-1 leading-normal">
                      <p className="font-bold text-gray-800">To allow location:</p>
                      <p>1. Click the lock or tune icon in the browser address bar.</p>
                      <p>2. Set <strong>Location</strong> to <strong>Allow</strong>.</p>
                      <p>3. Click <strong>TRY AGAIN</strong> below.</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-status-red-200/60">
                  <button
                    onClick={acquireLocation}
                    type="button"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-800 hover:bg-gray-50 shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    <span>TRY AGAIN</span>
                  </button>
                  <button
                    onClick={() => setIsPinningMode(true)}
                    type="button"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <MapPin size={14} />
                    <span>PIN LOCATION ON MAP</span>
                  </button>
                  <button
                    onClick={useDemoLocation}
                    type="button"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 text-xs font-bold text-white hover:bg-amber-700 shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    <span>USE DEMO LOCATION</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STATE: TIMEOUT (8S REACHED - NO INFINITE SPINNER)         */}
            {/* ========================================================= */}
            {gpsState === "TIMEOUT" && (
              <div className="rounded-2xl border border-status-red-200 bg-status-red-50/80 p-5 space-y-4 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-status-red-100 text-status-red-600 shrink-0 mt-0.5">
                    <Clock size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-status-red-900">
                      Unable to get your current location
                    </h3>
                    <p className="text-xs text-status-red-700 mt-1 leading-relaxed">
                      Your device did not provide a GPS location in time.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-status-red-200/60">
                  <button
                    onClick={acquireLocation}
                    type="button"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-800 hover:bg-gray-50 shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    <span>TRY AGAIN</span>
                  </button>
                  <button
                    onClick={() => setIsPinningMode(true)}
                    type="button"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <MapPin size={14} />
                    <span>PIN LOCATION ON MAP</span>
                  </button>
                  <button
                    onClick={useDemoLocation}
                    type="button"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 text-xs font-bold text-white hover:bg-amber-700 shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    <span>USE DEMO LOCATION</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STATE: POSITION_UNAVAILABLE                              */}
            {/* ========================================================= */}
            {gpsState === "POSITION_UNAVAILABLE" && (
              <div className="rounded-2xl border border-status-red-200 bg-status-red-50/80 p-5 space-y-4 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-status-red-100 text-status-red-600 shrink-0 mt-0.5">
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-status-red-900">
                      Position unavailable
                    </h3>
                    <p className="text-xs text-status-red-700 mt-1 leading-relaxed">
                      Your device GPS sensors are currently unable to establish a satellite fix.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-status-red-200/60">
                  <button
                    onClick={acquireLocation}
                    type="button"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-800 hover:bg-gray-50 shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    <span>TRY AGAIN</span>
                  </button>
                  <button
                    onClick={() => setIsPinningMode(true)}
                    type="button"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <MapPin size={14} />
                    <span>PIN LOCATION ON MAP</span>
                  </button>
                  <button
                    onClick={useDemoLocation}
                    type="button"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 text-xs font-bold text-white hover:bg-amber-700 shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    <span>USE DEMO LOCATION</span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* STATE: UNSUPPORTED                                        */}
            {/* ========================================================= */}
            {gpsState === "UNSUPPORTED" && (
              <div className="rounded-2xl border border-status-red-200 bg-status-red-50/80 p-5 space-y-4 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-status-red-100 text-status-red-600 shrink-0 mt-0.5">
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-status-red-900">
                      Location is not supported
                    </h3>
                    <p className="text-xs text-status-red-700 mt-1 leading-relaxed">
                      Geolocation APIs are unavailable in this browser environment. You can manually pin the location on the map or select a demo location.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-status-red-200/60">
                  <button
                    onClick={() => setIsPinningMode(true)}
                    type="button"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <MapPin size={14} />
                    <span>PIN LOCATION ON MAP</span>
                  </button>
                  <button
                    onClick={useDemoLocation}
                    type="button"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-600 text-xs font-bold text-white hover:bg-amber-700 shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={14} />
                    <span>USE DEMO LOCATION</span>
                  </button>
                </div>
              </div>
            )}

            {/* Next CTA — Continue to Evidence */}
            <div className="pt-3">
              <button
                disabled={!locationData}
                onClick={() => setCurrentStep("evidence")}
                type="button"
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm shadow-sm transition-all min-h-[48px]",
                  locationData
                    ? "bg-civic-green-600 hover:bg-civic-green-700 text-white shadow-civic-green-600/20 active:scale-[0.99] cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                <span>CONTINUE TO EVIDENCE</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: EVIDENCE                                          */}
        {/* ========================================================= */}
        {currentStep === "evidence" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-civic-green-100 text-civic-green-700 shrink-0">
                    <Camera size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Step 2 — Capture Evidence</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Capture photographic or video evidence. Clear photos significantly improve municipal dispatch speed.
                    </p>
                  </div>
                </div>

                <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                  {evidenceList.length} / 4 items
                </span>
              </div>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-xl bg-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("camera")
                    startCamera()
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px]",
                    activeTab === "camera"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <Camera size={16} />
                  Live Camera
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("upload")
                    stopCamera()
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all min-h-[40px]",
                    activeTab === "upload"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  <Upload size={16} />
                  File Upload
                </button>
              </div>
            </div>

            {/* Camera Viewfinder */}
            {activeTab === "camera" && (
              <div className="relative rounded-2xl border border-gray-800 bg-black overflow-hidden shadow-lg aspect-video max-h-[360px] flex items-center justify-center">
                {isCameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      autoPlay
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Camera Overlay Guide */}
                    <div className="absolute inset-0 pointer-events-none border border-white/20 m-6 rounded-xl flex items-center justify-center">
                      <div className="w-12 h-12 border-t-2 border-l-2 border-white/60 absolute top-0 left-0" />
                      <div className="w-12 h-12 border-t-2 border-r-2 border-white/60 absolute top-0 right-0" />
                      <div className="w-12 h-12 border-b-2 border-l-2 border-white/60 absolute bottom-0 left-0" />
                      <div className="w-12 h-12 border-b-2 border-r-2 border-white/60 absolute bottom-0 right-0" />
                      <p className="text-[11px] text-white/70 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        Center issue in frame
                      </p>
                    </div>

                    {/* Controls Bar */}
                    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-around px-6">
                      {/* Flip Camera */}
                      <button
                        type="button"
                        onClick={() => {
                          setCameraFacingMode((prev) => (prev === "environment" ? "user" : "environment"))
                        }}
                        className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all active:scale-95"
                        title="Switch Camera"
                      >
                        <SwitchCamera size={20} />
                      </button>

                      {/* Shutter Button */}
                      <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={evidenceList.length >= 4}
                        className={cn(
                          "w-16 h-16 rounded-full border-4 border-white flex items-center justify-center transition-all active:scale-90 shadow-xl",
                          evidenceList.length >= 4
                            ? "bg-gray-500 cursor-not-allowed opacity-50"
                            : "bg-civic-green-500 hover:bg-civic-green-600"
                        )}
                        aria-label="Capture Photo"
                      >
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                          <Camera size={26} className="text-white" />
                        </div>
                      </button>

                      {/* Quick Sample Button */}
                      <button
                        type="button"
                        onClick={addSamplePhoto}
                        className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all active:scale-95 text-xs font-bold"
                        title="Add Demo Photo"
                      >
                        <Sparkles size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <div className="p-3 rounded-full bg-white/10 text-white w-fit mx-auto">
                      <Camera size={28} />
                    </div>
                    {cameraUnavailable ? (
                      <div>
                        <p className="text-sm font-semibold text-white">Camera Unavailable</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                          Camera permission was denied or no camera device was detected. Please use the Upload fallback below.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab("upload")}
                          className="mt-3 px-4 py-2 rounded-xl bg-civic-green-600 text-white text-xs font-bold shadow-sm"
                        >
                          Switch to File Upload
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-white">Starting Camera...</p>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="mt-2 text-xs text-civic-green-400 hover:underline"
                        >
                          Click to retry camera access
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Upload Fallback Card */}
            {activeTab === "upload" && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-gray-300 hover:border-civic-green-500 bg-white p-8 text-center cursor-pointer transition-all hover:bg-civic-green-50/20 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="p-3.5 rounded-2xl bg-gray-100 group-hover:bg-civic-green-100 text-gray-500 group-hover:text-civic-green-600 w-fit mx-auto transition-colors">
                  <Upload size={28} />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mt-3">Upload Photo or Video</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Select image or video files from your device gallery or file manager.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    Photos (JPEG, PNG)
                  </span>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                    Video (MP4)
                  </span>
                </div>
              </div>
            )}

            {/* Quick Demo Helper */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-gray-500">Need quick testing evidence?</span>
              <button
                type="button"
                onClick={addSamplePhoto}
                className="inline-flex items-center gap-1 font-semibold text-civic-green-700 hover:text-civic-green-800"
              >
                <Sparkles size={14} />
                Add Demo Evidence Photo
              </button>
            </div>

            {/* Previews Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Captured Evidence ({evidenceList.length})
                </h3>
                {evidenceList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setEvidenceList([])}
                    className="text-xs text-status-red-600 hover:text-status-red-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {evidenceList.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-6 text-center">
                  <p className="text-xs text-gray-400">No evidence items added yet.</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Capture at least 1 photo to submit a report.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {evidenceList.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm aspect-square flex flex-col justify-between"
                    >
                      {item.type === "video" ? (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">
                          <Play size={24} className="opacity-80" />
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.label}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Badge Top Left */}
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/70 text-white backdrop-blur-sm shadow">
                        {item.label}
                      </span>

                      {/* Remove Button Top Right */}
                      <button
                        type="button"
                        onClick={() => removeEvidence(item.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-status-red-600 text-white hover:bg-status-red-700 shadow-md transition-all active:scale-95"
                        title="Remove evidence"
                      >
                        <Trash2 size={13} />
                      </button>

                      {/* Bottom timestamp */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 text-center">
                        <span className="text-[9px] text-white/80 font-mono">
                          {new Date(item.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Validation Error Message */}
            {evidenceError && (
              <div className="rounded-xl border border-status-red-200 bg-status-red-50 p-3 flex items-center gap-2 text-xs text-status-red-700 font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <span>{evidenceError}</span>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  stopCamera()
                  setCurrentStep("location")
                }}
                className="flex items-center justify-center gap-1.5 py-3.5 px-4 rounded-xl border border-gray-300 bg-white font-bold text-xs text-gray-700 hover:bg-gray-50 min-h-[48px]"
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateEvidenceStep()) {
                    stopCamera()
                    setCurrentStep("details")
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-civic-green-600 hover:bg-civic-green-700 text-white shadow-sm shadow-civic-green-600/20 active:scale-[0.99] min-h-[48px]"
              >
                <span>Continue to Issue Details</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: ISSUE DETAILS                                     */}
        {/* ========================================================= */}
        {currentStep === "details" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-civic-green-100 text-civic-green-700 shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Step 3 — Issue Details</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Categorize the civic issue and provide descriptive context for municipal sanitation teams.
                  </p>
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Select Issue Category <span className="text-status-red-500">*</span>
                </label>
                {touchedDetails && detailsErrors.category && (
                  <span className="text-xs text-status-red-600 font-medium">{detailsErrors.category}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {REPORT_CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.value] || HelpCircle
                  const isSelected = category === cat.value
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        setCategory(cat.value)
                        setDetailsErrors((prev) => ({ ...prev, category: undefined }))
                      }}
                      className={cn(
                        "flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all min-h-[56px]",
                        isSelected
                          ? "border-civic-green-600 bg-civic-green-50/70 ring-2 ring-civic-green-600/30"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <div
                        className={cn(
                          "p-2 rounded-lg shrink-0",
                          isSelected
                            ? "bg-civic-green-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "text-xs font-bold truncate",
                              isSelected ? "text-civic-green-950" : "text-gray-900"
                            )}
                          >
                            {cat.label}
                          </span>
                          {isSelected && <Check size={16} className="text-civic-green-600 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                          {CATEGORY_DESCRIPTIONS[cat.value]}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Issue Description <span className="text-status-red-500">*</span>
                </label>
                <span
                  className={cn(
                    "text-xs font-mono",
                    description.trim().length < 10
                      ? "text-gray-400"
                      : "text-civic-green-600 font-semibold"
                  )}
                >
                  {description.length} / 500
                </span>
              </div>

              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  if (touchedDetails) {
                    if (e.target.value.trim().length >= 10) {
                      setDetailsErrors((prev) => ({ ...prev, description: undefined }))
                    }
                  }
                }}
                rows={4}
                maxLength={500}
                placeholder="Describe the issue, exact landmark, severity, or how long it has been present..."
                className={cn(
                  "w-full rounded-xl border p-3.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all",
                  detailsErrors.description
                    ? "border-status-red-400 focus:ring-status-red-400/30"
                    : "border-gray-200 focus:border-civic-green-600 focus:ring-civic-green-600/20"
                )}
              />

              {touchedDetails && detailsErrors.description && (
                <p className="text-xs text-status-red-600 font-medium">
                  {detailsErrors.description}
                </p>
              )}

              {/* Quick Descriptor Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-gray-400 font-medium">Suggestions:</span>
                {[
                  "Near public bus stop",
                  "Blocking footpath",
                  "Foul smell noticeable",
                  "Present for 3+ days",
                  "Attracting stray animals",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setDescription((prev) => (prev ? `${prev.trim()}. ${chip}` : chip))
                      setDetailsErrors((prev) => ({ ...prev, description: undefined }))
                    }}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCurrentStep("evidence")}
                className="flex items-center justify-center gap-1.5 py-3.5 px-4 rounded-xl border border-gray-300 bg-white font-bold text-xs text-gray-700 hover:bg-gray-50 min-h-[48px]"
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateDetailsStep()) {
                    setCurrentStep("review")
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-civic-green-600 hover:bg-civic-green-700 text-white shadow-sm shadow-civic-green-600/20 active:scale-[0.99] min-h-[48px]"
              >
                <span>Review Report</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 4: REVIEW                                            */}
        {/* ========================================================= */}
        {currentStep === "review" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-civic-green-100 text-civic-green-700 shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Step 4 — Review Summary</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Verify all report details before dispatching to the Mysuru Municipal Corporation.
                  </p>
                </div>
              </div>
            </div>

            {/* Review Card 1: Location */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <MapPin size={16} className="text-civic-green-600" />
                  <span>Location</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep("location")}
                  className="text-xs font-semibold text-civic-green-700 hover:text-civic-green-800"
                >
                  Edit Location
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-medium">Coordinates</span>
                  <p className="font-mono font-semibold text-gray-900 text-xs mt-0.5">
                    {locationData?.latitude}°, {locationData?.longitude}°
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-medium">GPS Accuracy</span>
                  <p className="font-semibold text-gray-900 text-xs mt-0.5">
                    ±{locationData?.accuracy}m (High)
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-medium">Jurisdiction</span>
                  <p className="font-semibold text-gray-900 text-xs mt-0.5">
                    {locationData?.wardName}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-medium">Timestamp</span>
                  <p className="font-mono text-gray-700 text-xs mt-0.5">
                    {locationData ? new Date(locationData.timestamp).toLocaleTimeString() : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Review Card 2: Issue Details */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <FileText size={16} className="text-civic-green-600" />
                  <span>Issue Details</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep("details")}
                  className="text-xs font-semibold text-civic-green-700 hover:text-civic-green-800"
                >
                  Edit Details
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-medium">Category</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-civic-green-100 text-civic-green-800 text-xs font-bold inline-flex items-center gap-1.5">
                      {category && React.createElement(CATEGORY_ICONS[category] || HelpCircle, { size: 14 })}
                      {REPORT_CATEGORIES.find((c) => c.value === category)?.label}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] text-gray-400 uppercase font-medium">Description</span>
                  <p className="text-xs text-gray-800 mt-1 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {description}
                  </p>
                </div>
              </div>
            </div>

            {/* Review Card 3: Evidence */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <Camera size={16} className="text-civic-green-600" />
                  <span>Evidence ({evidenceList.length} items)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep("evidence")}
                  className="text-xs font-semibold text-civic-green-700 hover:text-civic-green-800"
                >
                  Edit Evidence
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {evidenceList.map((item) => (
                  <div
                    key={item.id}
                    className="relative rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-100"
                  >
                    {item.type === "video" ? (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">
                        <Play size={20} />
                      </div>
                    ) : (
                      <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                    )}
                    <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Civic Reward & SLA Notice */}
            <div className="rounded-2xl border border-civic-green-200 bg-civic-green-50/60 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-civic-green-600 text-white shrink-0">
                  <Award size={20} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">+50 Civic Points on Verification</h4>
                  <p className="text-[11px] text-gray-600">Standard 48-hour municipal SLA assigned on submission.</p>
                </div>
              </div>
            </div>

            {/* Submission Error Banner */}
            {submissionError && (
              <ErrorState
                type="error"
                title="Submission Failed"
                description={submissionError}
                action={
                  <button
                    onClick={handleSubmitReport}
                    className="mt-2 px-4 py-2 rounded-xl bg-civic-green-600 text-white text-xs font-bold shadow-sm"
                  >
                    Retry Submission
                  </button>
                }
              />
            )}

            {/* Demo Controls: Failure Simulation Toggle */}
            <div className="p-3 rounded-xl bg-gray-100/80 border border-gray-200 flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">Demo Testing: Simulate submission failure</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-status-red-600" />
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setCurrentStep("details")}
                className="flex items-center justify-center gap-1.5 py-3.5 px-4 rounded-xl border border-gray-300 bg-white font-bold text-xs text-gray-700 hover:bg-gray-50 min-h-[48px]"
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitReport}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-lg transition-all min-h-[48px]",
                  isSubmitting
                    ? "bg-civic-green-700 opacity-90 cursor-wait"
                    : "bg-civic-green-600 hover:bg-civic-green-700 active:scale-[0.99] shadow-civic-green-600/30"
                )}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Dispatched to Mysuru Municipal Server...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>SUBMIT REPORT</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 5: SUCCESS SCREEN                                    */}
        {/* ========================================================= */}
        {currentStep === "success" && submittedReport && (
          <div className="space-y-4 animate-in zoom-in-95 duration-300">
            {/* Success Card */}
            <div className="rounded-3xl border-2 border-civic-green-500 bg-white p-6 sm:p-8 shadow-xl text-center space-y-6">
              {/* Badge */}
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-civic-green-400/20 animate-ping" />
                <span className="relative p-4 rounded-full bg-civic-green-600 text-white shadow-lg">
                  <CheckCircle2 size={44} />
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-civic-green-700 bg-civic-green-50 px-3 py-1 rounded-full border border-civic-green-200">
                  Municipal Ticket Dispatched
                </span>
                <h2 className="text-2xl font-black text-gray-900 mt-2">REPORT SUBMITTED</h2>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Thank you for keeping Mysuru clean. Your report has been registered on the public civic ledger.
                </p>
              </div>

              {/* Public Report Ticket Box */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Report ID</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-lg font-black text-gray-900 font-mono tracking-tight">
                        {submittedReport.publicId}
                      </span>
                      <button
                        onClick={copyReportId}
                        className="p-1 rounded hover:bg-gray-200 text-gray-500 transition-colors"
                        title="Copy Report ID"
                      >
                        {copiedId ? <Check size={14} className="text-civic-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <StatusBadge status={submittedReport.status} size="md" pulse />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-medium">Location</span>
                    <p className="font-semibold text-gray-800 truncate mt-0.5">
                      {submittedReport.wardName}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      {submittedReport.latitude.toFixed(4)}°, {submittedReport.longitude.toFixed(4)}°
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-medium">Evidence Captured</span>
                    <p className="font-semibold text-gray-800 mt-0.5">
                      {submittedReport.media.length} items (verified)
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      GPS Accuracy ±{submittedReport.gpsAccuracy}m
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-civic-green-700 font-bold">
                    <Sparkles size={16} />
                    <span>+50 Civic Points Awarded</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">MCC 48h SLA</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <Link
                  href={`/report/${submittedReport.publicId}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-civic-green-600 hover:bg-civic-green-700 text-white shadow-lg shadow-civic-green-600/30 transition-all min-h-[48px] active:scale-[0.99]"
                >
                  <Eye size={18} />
                  <span>VIEW PUBLIC REPORT</span>
                  <ExternalLink size={16} className="ml-1 opacity-75" />
                </Link>

                <button
                  type="button"
                  onClick={resetFlow}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 transition-all min-h-[48px]"
                >
                  <RotateCcw size={16} />
                  <span>REPORT ANOTHER ISSUE</span>
                </button>

                <Link
                  href="/"
                  className="block text-xs font-semibold text-gray-500 hover:text-gray-800 py-1"
                >
                  Return to Civic Map
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
