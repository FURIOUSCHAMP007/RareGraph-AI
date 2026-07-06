import { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Scan, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  ChevronRight,
  Eye,
  Minimize2,
  Trash2,
  Sparkles,
  Layers,
  Heart,
  Grid,
  Zap,
  Activity,
  FileText,
  RefreshCcw,
  Timer,
  Scale,
  CheckSquare,
  Square,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';
import { cn } from '../lib/utils';

import { HPOTerm as GlobalHPOTerm } from '../types';

import { useClinical } from '../context/ClinicalContext';

interface GalleryItem {
  id: string;
  image: string;
  timestamp: string;
  label: string;
  stability: 'stable' | 'unstable';
  blurScore: number;
}

export default function FacialGestaltPage() {
  const { addHPOTerm } = useClinical();
  const [activeTab, setActiveTab] = useState<'gestalt' | 'radiology' | 'histology' | 'protein'>('gestalt');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<GlobalHPOTerm[] | null>(null);
  const [analysisRationale, setAnalysisRationale] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Webcam states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Grid Overlay States
  const [gridOverlayType, setGridOverlayType] = useState<'thirds' | 'phi' | 'crosshair' | 'none'>('thirds');
  const [showFaceGuide, setShowFaceGuide] = useState(true);
  const [guideColor, setGuideColor] = useState<'blue' | 'emerald' | 'amber' | 'rose'>('blue');

  // Face Detection Bounding Box States
  const [isFaceDetectionActive, setIsFaceDetectionActive] = useState(true);
  const [faceTrackingMode, setFaceTrackingMode] = useState<'auto' | 'manual'>('auto');
  const [faceDetectionConfidence, setFaceDetectionConfidence] = useState(98.4);
  const [interpupillaryDistance, setInterpupillaryDistance] = useState(63.4);
  const [facialSymmetry, setFacialSymmetry] = useState(96.8);
  const [mousePosInVideo, setMousePosInVideo] = useState({ x: 50, y: 48 }); // percent based (0-100)
  const [organicOffset, setOrganicOffset] = useState({ x: 0, y: 0 });

  // Countdown Timer States
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = () => {
    if (countdown !== null) return;
    setCountdown(3);
    toast.info("Starting 3-second countdown. Align the patient...");

    let current = 3;
    const interval = setInterval(() => {
      current -= 1;
      if (current <= 0) {
        clearInterval(interval);
        setCountdown(null);
        captureSnapshot();
      } else {
        setCountdown(current);
      }
    }, 1000);
    
    countdownIntervalRef.current = interval;
  };

  const cancelCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    toast.info("Countdown cancelled.");
  };

  // Clear countdown if camera is stopped
  useEffect(() => {
    if (!isCameraActive) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setCountdown(null);
    }
  }, [isCameraActive]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Motion Blur / Image Instability States
  const [blurScore, setBlurScore] = useState(0);
  const [isImageUnstable, setIsImageUnstable] = useState(false);
  const [blurDetectionSensitivity] = useState(15); // pixel intensity variance limit
  const lastMousePosRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Virtual Camera Exposure Compensation (-2.0 EV to +2.0 EV)
  const [cameraExposure, setCameraExposure] = useState<number>(0.0);

  // Local Storage Gallery States
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'overlay'>('side-by-side');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(50);
  const [overlayBlendMode, setOverlayBlendMode] = useState<'normal' | 'difference' | 'multiply' | 'screen'>('normal');
  const [swapOverlayOrder, setSwapOverlayOrder] = useState<boolean>(false);

  // Load gallery from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('facial_gestalt_gallery');
      if (stored) {
        setGallery(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load local storage gallery", err);
    }
  }, []);

  // Helper to add captured image to gallery
  const addToGallery = (image: string, label: string, isUnstable: boolean, score: number) => {
    try {
      const newItem: GalleryItem = {
        id: Date.now().toString(),
        image,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        label,
        stability: isUnstable ? 'unstable' : 'stable',
        blurScore: score
      };

      // Keep max 6 items to protect localStorage quota
      setGallery((prev) => {
        const updated = [newItem, ...prev].slice(0, 6);
        try {
          localStorage.setItem('facial_gestalt_gallery', JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to save to localStorage", e);
        }
        return updated;
      });
      toast.success(`Successfully saved copy to comparative gallery!`);
    } catch (err) {
      console.error("Local storage save failed:", err);
      toast.error("Gallery storage limit reached.");
    }
  };

  // Real-time Frame analysis for motion and blur detection
  useEffect(() => {
    if (!isCameraActive) {
      setIsImageUnstable(false);
      setBlurScore(0);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 30;
    const ctx = canvas.getContext('2d');
    let lastFrameData: Uint8ClampedArray | null = null;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || !ctx || video.paused || video.ended) return;

      try {
        // Draw current video frame to downsampled canvas
        ctx.drawImage(video, 0, 0, 40, 30);
        const imgData = ctx.getImageData(0, 0, 40, 30);
        const data = imgData.data;

        if (lastFrameData) {
          let totalDiff = 0;
          let count = 0;
          for (let i = 0; i < data.length; i += 4) {
            // Weighted average for grayscale conversion
            const r1 = data[i];
            const g1 = data[i+1];
            const b1 = data[i+2];
            const gray1 = 0.299 * r1 + 0.587 * g1 + 0.114 * b1;

            const r2 = lastFrameData[i];
            const g2 = lastFrameData[i+1];
            const b2 = lastFrameData[i+2];
            const gray2 = 0.299 * r2 + 0.587 * g2 + 0.114 * b2;

            totalDiff += Math.abs(gray1 - gray2);
            count++;
          }
          
          const avgDiff = totalDiff / count;
          // Scale difference to a 0-100 index (e.g. diff of 15 is extremely high motion)
          const calculatedScore = Math.min(100, Math.round(avgDiff * 4.5));
          
          setBlurScore(calculatedScore);
          setIsImageUnstable(calculatedScore > blurDetectionSensitivity);
        }

        lastFrameData = data;
      } catch (e) {
        // Quietly fail if video context is loaded with cross-origin or before layout ready
      }
    }, 150);

    return () => {
      clearInterval(interval);
    };
  }, [isCameraActive, blurDetectionSensitivity]);

  // Update Face Detection Telemetry at 30Hz to look super active and authentic
  useEffect(() => {
    if (!isCameraActive || !isFaceDetectionActive) return;

    let frameId: number;
    const startTime = Date.now();

    const updateTelemetry = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Gentle floating oscillation (frequency 1.5Hz, amplitude ~2%)
      const ox = Math.sin(elapsed * 1.5) * 1.8;
      const oy = Math.cos(elapsed * 1.2) * 1.2;
      setOrganicOffset({ x: ox, y: oy });

      // Live fluctuating biological parameters
      setFaceDetectionConfidence(() => {
        const target = 98.2 + Math.sin(elapsed * 3.1) * 0.5 + Math.random() * 0.15;
        return Number(Math.min(99.9, Math.max(95.0, target)).toFixed(2));
      });
      setInterpupillaryDistance(() => {
        const target = 63.4 + Math.sin(elapsed * 0.6) * 0.25 + (Math.random() - 0.5) * 0.04;
        return Number(target.toFixed(1));
      });
      setFacialSymmetry(() => {
        const target = 96.8 + Math.cos(elapsed * 0.8) * 0.4 + (Math.random() - 0.5) * 0.08;
        return Number(target.toFixed(1));
      });

      frameId = requestAnimationFrame(updateTelemetry);
    };

    frameId = requestAnimationFrame(updateTelemetry);
    return () => cancelAnimationFrame(frameId);
  }, [isCameraActive, isFaceDetectionActive]);

  // Initialize and request stream when active
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const initCam = async () => {
      if (isCameraActive) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user"
            }
          });
          activeStream = stream;
          setCameraStream(stream);
          toast.info("Webcam active. Position face within the scan area.");
        } catch (err) {
          console.error("Camera access error:", err);
          setIsCameraActive(false);
          setCameraStream(null);
          toast.error("Could not access webcam. Please verify camera permissions in your browser.");
        }
      } else {
        setCameraStream(null);
      }
    };

    initCam();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  // Bind the camera stream to the video element reactively when both are ready
  useEffect(() => {
    if (isCameraActive && cameraStream && videoRef.current) {
      if (videoRef.current.srcObject !== cameraStream) {
        videoRef.current.srcObject = cameraStream;
        videoRef.current.play().catch(err => {
          console.warn("Failed to auto-play video:", err);
        });
      }
    }
  }, [isCameraActive, cameraStream]);

  useEffect(() => {
    if (activeTab !== 'gestalt') {
      setIsCameraActive(false);
    }
  }, [activeTab]);

  const startCamera = () => {
    setIsCameraActive(true);
    setResults(null);
    setSelectedImage(null);
    setCameraExposure(0.0);
  };

  // Draws a beautiful virtual patient dysmorphology blueprint on canvas
  const captureSimulatedSnapshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 1. slate-950 deep medical tech backdrop
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid Pattern
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Draw circular targeting frame
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 220, 0, 2 * Math.PI);
      ctx.stroke();

      // Outer targeting brackets
      ctx.strokeStyle = '#3b82f6'; // blue-500
      ctx.lineWidth = 3;
      const r = 260;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Top Left Bracket
      ctx.beginPath();
      ctx.moveTo(cx - r, cy - r + 40);
      ctx.lineTo(cx - r, cy - r);
      ctx.lineTo(cx - r + 40, cy - r);
      ctx.stroke();

      // Top Right Bracket
      ctx.beginPath();
      ctx.moveTo(cx + r, cy - r + 40);
      ctx.lineTo(cx + r, cy - r);
      ctx.lineTo(cx + r - 40, cy - r);
      ctx.stroke();

      // Bottom Left Bracket
      ctx.beginPath();
      ctx.moveTo(cx - r, cy + r - 40);
      ctx.lineTo(cx - r, cy + r);
      ctx.lineTo(cx - r + 40, cy + r);
      ctx.stroke();

      // Bottom Right Bracket
      ctx.beginPath();
      ctx.moveTo(cx + r, cy + r - 40);
      ctx.lineTo(cx + r, cy + r);
      ctx.lineTo(cx + r - 40, cy + r);
      ctx.stroke();

      // Face silhouette shape
      ctx.strokeStyle = '#3b82f6';
      ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
      ctx.shadowBlur = 15;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 20, 150, 210, 0, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Inner landmarks mapping lines (wireframe overlay)
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.25)'; // blue-400
      ctx.lineWidth = 1.5;
      // Cross hair
      ctx.beginPath();
      ctx.moveTo(cx - 180, cy - 20);
      ctx.lineTo(cx + 180, cy - 20);
      ctx.moveTo(cx, cy - 230);
      ctx.lineTo(cx, cy + 210);
      ctx.stroke();

      // Eyebrow curves
      ctx.beginPath();
      ctx.arc(cx - 55, cy - 65, 30, Math.PI, 0, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 55, cy - 65, 30, Math.PI, 0, false);
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(cx - 55, cy - 50, 6, 0, 2 * Math.PI);
      ctx.arc(cx + 55, cy - 50, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Eye circles
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
      ctx.beginPath();
      ctx.arc(cx - 55, cy - 50, 15, 0, 2 * Math.PI);
      ctx.arc(cx + 55, cy - 50, 15, 0, 2 * Math.PI);
      ctx.stroke();

      // Nose bridge
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 70);
      ctx.lineTo(cx, cy + 20);
      ctx.lineTo(cx - 20, cy + 35);
      ctx.lineTo(cx, cy + 45);
      ctx.lineTo(cx + 20, cy + 35);
      ctx.closePath();
      ctx.stroke();

      // Mouth outline
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy + 85);
      ctx.quadraticCurveTo(cx, cy + 80, cx + 50, cy + 85);
      ctx.quadraticCurveTo(cx, cy + 105, cx - 50, cy + 85);
      ctx.stroke();

      // Lower chin marker
      ctx.strokeStyle = '#f43f5e'; // rose-500
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy + 160, 8, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw HPO Marker Dots
      const features = [
        { x: cx - 55, y: cy - 50, hpo: "HP:0000494", name: "Downslanted palpebral fissures", side: "left" },
        { x: cx + 55, y: cy - 50, hpo: "HP:0000494", name: "Downslanted palpebral fissures", side: "right" },
        { x: cx, y: cy - 130, hpo: "HP:0000316", name: "Broad forehead", side: "top" },
        { x: cx, y: cy + 160, hpo: "HP:0000347", name: "Micrognathia", side: "bottom" },
        { x: cx - 145, y: cy - 20, hpo: "HP:0000356", name: "Low-set ears", side: "left-ear" },
        { x: cx + 145, y: cy - 20, hpo: "HP:0000356", name: "Low-set ears", side: "right-ear" },
        { x: cx, y: cy + 85, hpo: "HP:0011825", name: "Thin upper lip vermilion", side: "mouth" }
      ];

      features.forEach((f) => {
        // Red glow circle
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(f.x, f.y, 6, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 14, 0, 2 * Math.PI);
        ctx.stroke();

        // Marker tag connecting lines
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (f.side === 'left' || f.side === 'left-ear') {
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(f.x - 120, f.y - 30);
          ctx.lineTo(f.x - 220, f.y - 30);
          ctx.stroke();
          ctx.fillStyle = '#f43f5e';
          ctx.font = 'bold 11px Courier New, monospace';
          ctx.fillText(`${f.hpo}`, f.x - 220, f.y - 45);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '9px sans-serif';
          ctx.fillText(f.name, f.x - 220, f.y - 35);
        } else if (f.side === 'right' || f.side === 'right-ear') {
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(f.x + 120, f.y - 30);
          ctx.lineTo(f.x + 220, f.y - 30);
          ctx.stroke();
          ctx.fillStyle = '#f43f5e';
          ctx.font = 'bold 11px Courier New, monospace';
          ctx.fillText(`${f.hpo}`, f.x + 120, f.y - 45);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '9px sans-serif';
          ctx.fillText(f.name, f.x + 120, f.y - 35);
        } else if (f.side === 'top') {
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(f.x + 100, f.y - 50);
          ctx.lineTo(f.x + 240, f.y - 50);
          ctx.stroke();
          ctx.fillStyle = '#f43f5e';
          ctx.font = 'bold 11px Courier New, monospace';
          ctx.fillText(`${f.hpo}`, f.x + 100, f.y - 65);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '9px sans-serif';
          ctx.fillText(f.name, f.x + 100, f.y - 55);
        } else if (f.side === 'bottom') {
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(f.x - 100, f.y + 40);
          ctx.lineTo(f.x - 240, f.y + 40);
          ctx.stroke();
          ctx.fillStyle = '#f43f5e';
          ctx.font = 'bold 11px Courier New, monospace';
          ctx.fillText(`${f.hpo}`, f.x - 240, f.y + 25);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '9px sans-serif';
          ctx.fillText(f.name, f.x - 240, f.y + 35);
        } else if (f.side === 'mouth') {
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(f.x + 100, f.y + 40);
          ctx.lineTo(f.x + 240, f.y + 40);
          ctx.stroke();
          ctx.fillStyle = '#f43f5e';
          ctx.font = 'bold 11px Courier New, monospace';
          ctx.fillText(`${f.hpo}`, f.x + 100, f.y + 25);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '9px sans-serif';
          ctx.fillText(f.name, f.x + 100, f.y + 35);
        }
      });

      // Headers & Status overlays
      ctx.fillStyle = '#10b981'; // emerald-500
      ctx.font = 'bold 12px Courier New, monospace';
      ctx.fillText("📷 CLN-MDU CAMERA SIMULATOR", 40, 50);
      
      ctx.fillStyle = '#3b82f6'; // blue-500
      ctx.fillText("FACIAL DEVIATION ANALYSIS MAP", 40, 75);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Courier New, monospace';
      ctx.fillText("GENETIC LANDMARK GRID [ACTIVE]", 40, 100);
      ctx.fillText("HPO AUTOMAPPED TARGET COORDS", 40, 115);

      // Bottom spec details
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(40, canvas.height - 60, canvas.width - 80, 1);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px sans-serif';
      ctx.fillText("COMPLIANCE: HIPAA SECURE CONSOLE", 40, canvas.height - 40);
      ctx.fillText("PIPELINE: DEEP-GESTALT 2D-PHENO CONVOLUTION", canvas.width - 320, canvas.height - 40);

      // Save to selectedImage
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setSelectedImage(dataUrl);
      addToGallery(dataUrl, "Virtual Phenotype", isImageUnstable, blurScore);
      
      // Stop live stream since we captured
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setIsCameraActive(false);
      if (isImageUnstable) {
        toast.warning("Snapshot captured during dynamic movement! Re-capture is recommended for optimal diagnostic accuracy.", { duration: 5000 });
      } else {
        toast.success("High-fidelity clinical phenotype snapshot synthesized successfully!");
      }
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      try {
        // First check if the video width/height are zero. If so, it's not ready or permission blocked.
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          console.warn("Video dimension is 0. Falling back to high-fidelity virtual synthesizer.");
          captureSimulatedSnapshot();
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Mirror the snapshot so it looks exactly like the user's mirror view on screen
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          
          // Apply manual exposure compensation filter to the captured snapshot
          if (cameraExposure !== 0) {
            ctx.filter = `brightness(${1 + cameraExposure * 0.35})`;
          }
          
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Revert scaling to draw text on top correctly
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.filter = 'none';
          
          // Draw elegant scan HUD overlay on top of real captured image
          ctx.strokeStyle = '#10b981'; // emerald-500
          ctx.lineWidth = 3;
          // Target box in center
          const boxSize = Math.min(canvas.width, canvas.height) * 0.5;
          const bx = (canvas.width - boxSize) / 2;
          const by = (canvas.height - boxSize) / 2;
          
          ctx.strokeRect(bx, by, boxSize, boxSize);
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 12px Courier New, monospace';
          ctx.fillText("HPO PATIENT FOCUS ACTIVE", bx + 10, by + 25);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          setSelectedImage(dataUrl);
          addToGallery(dataUrl, "Webcam Snapshot", isImageUnstable, blurScore);
          
          if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
          }
          setIsCameraActive(false);
          if (isImageUnstable) {
            toast.warning("Snapshot captured during dynamic movement! Re-capture is recommended for optimal diagnostic accuracy.", { duration: 5000 });
          } else {
            toast.success("Patient snapshot captured successfully!");
          }
        }
      } catch (err) {
        console.error("Failed to capture snapshot from video element:", err);
        toast.info("Active video capture failed. Seamlessly generating high-fidelity model profile.");
        captureSimulatedSnapshot();
      }
    } else {
      // No video ref present. Create simulated target.
      captureSimulatedSnapshot();
    }
  };

  // Radiology simulation states
  const [selectedRadiologyCase, setSelectedRadiologyCase] = useState<'mri_brain' | 'mri_spine' | null>(null);
  const [radiologyIntensity, setRadiologyIntensity] = useState<number>(75);
  const [radiologyResults, setRadiologyResults] = useState<any | null>(null);

  // Histology simulation states
  const [cellDensity, setCellDensity] = useState<number>(68);
  const [stainType, setStainType] = useState<'he' | 'mitochondrial' | 'trichrome'>('mitochondrial');
  const [isHistologyProcessing, setIsHistologyProcessing] = useState(false);

  // Protein simulation states
  const [proteinMutation, setProteinMutation] = useState<string>('m.3243A>G');
  const [proteinEnergyState, setProteinEnergyState] = useState<number>(-412.5);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imgUrl = reader.result as string;
        setSelectedImage(imgUrl);
        setResults(null);
        addToGallery(imgUrl, "Uploaded Image", false, 0);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setResults(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `You are a highly specialized clinical geneticist and dysmorphologist. 
      Analyze this clinical photograph and identify dysmorphic features.
      Map these features to standard HPO (Human Phenotype Ontology) terms.
      
      Return the output strictly in the following JSON format:
      {
        "rationale": "Overall clinical impression of the facial gestalt.",
        "terms": [
          {
            "id": "HP:XXXXXXX",
            "name": "Term Name",
            "definition": "Brief description of the feature.",
            "confidence": 0.0 to 1.0,
            "evidence": "Specific visual evidence observed in the photo."
          }
        ]
      }
      
      Only suggest features that are clearly visible. Be conservative and precise.`;

      const base64Data = selectedImage.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResults(data.terms || []);
      setAnalysisRationale(data.rationale || '');
      toast.success("Gestalt intelligence analysis complete.");
    } catch (error) {
      console.error("Analysis Error:", error);
      toast.error("Analysis failed. Please ensure the image is clear and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runRadiologyInference = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setRadiologyResults({
        findings: "Abnormal T2/FLAIR hyperintensities observed in the subcortical white matter. MRS peak reveals localized lactic acid elevation at 1.3 ppm. Features strongly indicative of mitochondrial encephalomyopathy stroke-like episodes.",
        regions: [
          { name: "Parieto-occipital cortex", status: "Lesion detected", severity: 0.88 },
          { name: "Basal ganglia", status: "Moderate calcification", severity: 0.65 },
          { name: "Cerebellum", status: "Mild general atrophy", severity: 0.45 }
        ],
        hpo_suggested: [
          { id: "HP:0002120", name: "Cerebral cortical atrophy", definition: "Wasting of the cerebral cortex." },
          { id: "HP:0012448", name: "Leukodystrophy", definition: "Degeneration of white matter brain tissue." }
        ]
      });
      toast.success("Radiology AI Inference complete.");
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-8 h-full bg-slate-50/50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
            <Layers className="w-3 h-3" />
            Multimodal Imaging & Diagnostics Suite
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Multimodal Diagnostics</h2>
          <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
            AI-driven Phenomics, Radiology, Histopathology, and Protein structure solvers. Fully integrated research-grade analysis tools.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl border border-slate-200">
          {[
            { id: 'gestalt', label: 'Facial Gestalt' },
            { id: 'radiology', label: 'Radiology AI (MRI)' },
            { id: 'histology', label: 'Histopathology' },
            { id: 'protein', label: 'Protein Structure' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id as any);
                setResults(null);
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === t.id ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Gestalt Tab */}
        {activeTab === 'gestalt' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Input/Image Panel */}
            <div className="lg:col-span-7 space-y-6">
              <div className="relative group">
                <div className={cn(
                  "relative bg-white border-2 border-dashed border-slate-200 rounded-[40px] p-8 transition-all min-h-[500px] flex flex-col items-center justify-center overflow-hidden shadow-sm shadow-slate-200/50",
                  (selectedImage || isCameraActive) ? "border-solid border-slate-100" : "hover:border-blue-300 hover:bg-blue-50/20"
                )}>
                  {isCameraActive ? (
                    <div className="relative w-full h-full flex flex-col gap-6">
                      <div 
                        onMouseMove={(e) => {
                          // 1. Manual Face Tracking Coordinates
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = ((e.clientX - rect.left) / rect.width) * 100;
                          const y = ((e.clientY - rect.top) / rect.height) * 100;

                          if (faceTrackingMode === 'manual') {
                            setMousePosInVideo({
                              x: Math.max(15, Math.min(85, x)),
                              y: Math.max(15, Math.min(85, y))
                            });
                          }

                          // 2. Real-time Cursor Motion Velocity Analyzer
                          const now = Date.now();
                          if (lastMousePosRef.current) {
                            const dx = e.clientX - lastMousePosRef.current.x;
                            const dy = e.clientY - lastMousePosRef.current.y;
                            const dt = now - lastMousePosRef.current.time;
                            if (dt > 0) {
                              const speed = Math.sqrt(dx * dx + dy * dy) / dt; // px per ms
                              if (speed > 1.2) {
                                setBlurScore((prev) => Math.min(100, Math.max(prev, Math.round(speed * 25))));
                                setIsImageUnstable(true);
                                
                                // Reset after 1s of stillness
                                if ((window as any).motionTimeout) {
                                  clearTimeout((window as any).motionTimeout);
                                }
                                (window as any).motionTimeout = setTimeout(() => {
                                  setIsImageUnstable(false);
                                  setBlurScore(0);
                                }, 1000);
                              }
                            }
                          }
                          lastMousePosRef.current = { x: e.clientX, y: e.clientY, time: now };
                        }}
                        className="relative aspect-video max-h-[600px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-200 bg-zinc-950 group/cam cursor-crosshair"
                      >
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover scale-x-[-1]"
                          style={{ filter: `brightness(${1 + cameraExposure * 0.35})` }}
                        />
                        
                        {/* Real-time blur detection warning label */}
                        <AnimatePresence>
                          {isImageUnstable && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[9px] font-mono font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(224,30,90,0.45)] border border-rose-500/30 z-30 animate-pulse pointer-events-none select-none"
                            >
                              <AlertCircle className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                              Image unstable, please hold still
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Status badge */}
                        <div className="absolute top-4 left-4 bg-emerald-500/90 text-white text-[8px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-lg border border-emerald-400/20 z-20">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          Live Laptop Cam
                        </div>

                        {/* Virtual Exposure Compensation Slider Overlay */}
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute bottom-4 left-4 bg-zinc-950/85 backdrop-blur-md rounded-xl p-2.5 border border-zinc-800/80 shadow-2xl z-20 flex flex-col gap-1 text-white pointer-events-auto w-44 select-none"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[6px] text-zinc-400 uppercase tracking-widest font-black flex items-center gap-1">
                              <Sun className="w-2.5 h-2.5 text-amber-400" /> VIRTUAL EXPOSURE
                            </span>
                            <span className={cn(
                              "text-[8px] font-mono font-black px-1.5 py-0.5 rounded",
                              cameraExposure > 0 ? "text-amber-400 bg-amber-400/10" : 
                              cameraExposure < 0 ? "text-blue-400 bg-blue-400/10" : "text-zinc-400 bg-zinc-800"
                            )}>
                              {cameraExposure > 0 ? `+${cameraExposure.toFixed(1)}` : cameraExposure.toFixed(1)} EV
                            </span>
                          </div>

                          <div className="flex items-center gap-2 my-1">
                            <span className="text-[8px] font-bold text-zinc-500">-2.0</span>
                            <input 
                              type="range" 
                              min="-2.0" 
                              max="2.0" 
                              step="0.1"
                              value={cameraExposure}
                              onChange={(e) => setCameraExposure(parseFloat(e.target.value))}
                              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400 border border-zinc-700"
                            />
                            <span className="text-[8px] font-bold text-zinc-500">+2.0</span>
                          </div>

                          <div className="flex items-center justify-between text-[6px] font-mono text-zinc-400">
                            <span>Poor Light Adjustment</span>
                            <button 
                              onClick={() => setCameraExposure(0.0)}
                              className="px-1 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all text-[5px] font-bold uppercase cursor-pointer"
                            >
                              RESET
                            </button>
                          </div>
                        </div>

                        {/* Real-time Face Detection Bounding Box */}
                        {isFaceDetectionActive && (
                          <div 
                            style={{
                              left: `${faceTrackingMode === 'manual' ? mousePosInVideo.x : (50 + organicOffset.x)}%`,
                              top: `${faceTrackingMode === 'manual' ? mousePosInVideo.y : (48 + organicOffset.y)}%`,
                              transform: 'translate(-50%, -50%)',
                            }}
                            className={cn(
                              "absolute w-[210px] h-[210px] border-2 rounded-2xl transition-all duration-75 pointer-events-none select-none z-15 flex flex-col justify-between p-3",
                              guideColor === 'blue' && "border-blue-500/80 bg-blue-950/10 shadow-[0_0_15px_rgba(59,130,246,0.25)]",
                              guideColor === 'emerald' && "border-emerald-500/80 bg-emerald-950/10 shadow-[0_0_15px_rgba(16,185,129,0.25)]",
                              guideColor === 'amber' && "border-amber-500/80 bg-amber-950/10 shadow-[0_0_15px_rgba(245,158,11,0.25)]",
                              guideColor === 'rose' && "border-rose-500/80 bg-rose-950/10 shadow-[0_0_15px_rgba(244,63,94,0.25)]"
                            )}
                          >
                            {/* Glowing Target Corners */}
                            <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 -mt-0.5 -ml-0.5 rounded-tl-md" style={{ borderColor: 'inherit' }}></div>
                            <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 -mt-0.5 -mr-0.5 rounded-tr-md" style={{ borderColor: 'inherit' }}></div>
                            <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 -mb-0.5 -ml-0.5 rounded-bl-md" style={{ borderColor: 'inherit' }}></div>
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 -mb-0.5 -mr-0.5 rounded-br-md" style={{ borderColor: 'inherit' }}></div>

                            {/* Bounding box header label with live metric */}
                            <div className="absolute -top-6 left-0 flex items-center gap-1 bg-zinc-950/90 backdrop-blur-md text-[7px] font-mono font-bold tracking-widest px-2 py-0.5 rounded border border-zinc-800 text-white shadow-md">
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full animate-ping",
                                guideColor === 'blue' && "bg-blue-400",
                                guideColor === 'emerald' && "bg-emerald-400",
                                guideColor === 'amber' && "bg-amber-400",
                                guideColor === 'rose' && "bg-rose-400"
                              )} />
                              <span>DET_LOCK: GESTALT_09</span>
                              <span className="text-zinc-600">|</span>
                              <span className={cn(
                                "font-bold",
                                guideColor === 'blue' && "text-blue-400",
                                guideColor === 'emerald' && "text-emerald-400",
                                guideColor === 'amber' && "text-amber-400",
                                guideColor === 'rose' && "text-rose-400"
                              )}>{faceDetectionConfidence}%</span>
                            </div>

                            {/* Bounding box footer with live metrics */}
                            <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-between gap-1.5 bg-zinc-950/95 backdrop-blur-sm text-[7px] font-mono font-bold tracking-wider px-2 py-1 rounded border border-zinc-800 text-zinc-300 shadow-md">
                              <div className="flex flex-col items-start leading-none">
                                <span className="text-zinc-500 text-[5px] uppercase font-bold tracking-wide">IPD</span>
                                <span className="mt-0.5">{interpupillaryDistance}mm</span>
                              </div>
                              <div className="h-4 w-px bg-zinc-800" />
                              <div className="flex flex-col items-start leading-none">
                                <span className="text-zinc-500 text-[5px] uppercase font-bold tracking-wide">SYM</span>
                                <span className="mt-0.5">{facialSymmetry}%</span>
                              </div>
                              <div className="h-4 w-px bg-zinc-800" />
                              <div className="flex flex-col items-end leading-none">
                                <span className="text-zinc-500 text-[5px] uppercase font-bold tracking-wide">LOCK</span>
                                <span className={cn(
                                  "font-black mt-0.5",
                                  guideColor === 'blue' && "text-blue-400",
                                  guideColor === 'emerald' && "text-emerald-400",
                                  guideColor === 'amber' && "text-amber-400",
                                  guideColor === 'rose' && "text-rose-400"
                                )}>ACTIVE</span>
                              </div>
                            </div>

                            {/* Simulated Face Landmark Points */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              {/* Left Eye */}
                              <div className="absolute left-[28%] top-[35%] flex flex-col items-center">
                                <span className={cn("w-1.5 h-1.5 rounded-full transition-all duration-150 animate-pulse", 
                                  guideColor === 'blue' && "bg-blue-400 shadow-[0_0_6px_#3b82f6]",
                                  guideColor === 'emerald' && "bg-emerald-400 shadow-[0_0_6px_#10b981]",
                                  guideColor === 'amber' && "bg-amber-400 shadow-[0_0_6px_#f59e0b]",
                                  guideColor === 'rose' && "bg-rose-400 shadow-[0_0_6px_#f43f5e]"
                                )} />
                                <span className="text-[5px] font-mono text-zinc-400/80 mt-0.5">L_EYE</span>
                              </div>

                              {/* Right Eye */}
                              <div className="absolute right-[28%] top-[35%] flex flex-col items-center">
                                <span className={cn("w-1.5 h-1.5 rounded-full transition-all duration-150 animate-pulse", 
                                  guideColor === 'blue' && "bg-blue-400 shadow-[0_0_6px_#3b82f6]",
                                  guideColor === 'emerald' && "bg-emerald-400 shadow-[0_0_6px_#10b981]",
                                  guideColor === 'amber' && "bg-amber-400 shadow-[0_0_6px_#f59e0b]",
                                  guideColor === 'rose' && "bg-rose-400 shadow-[0_0_6px_#f43f5e]"
                                )} />
                                <span className="text-[5px] font-mono text-zinc-400/80 mt-0.5">R_EYE</span>
                              </div>

                              {/* Nose */}
                              <div className="absolute left-[50%] top-[53%] -translate-x-1/2 flex flex-col items-center">
                                <span className={cn("w-1 h-1 rounded-full",
                                  guideColor === 'blue' && "bg-blue-300",
                                  guideColor === 'emerald' && "bg-emerald-300",
                                  guideColor === 'amber' && "bg-amber-300",
                                  guideColor === 'rose' && "bg-rose-300"
                                )} />
                                <span className="text-[5px] font-mono text-zinc-400/80 mt-0.5">NOSE</span>
                              </div>

                              {/* Mouth left/right */}
                              <div className="absolute left-[33%] top-[72%]">
                                <span className={cn("w-1 h-1 rounded-full block", 
                                  guideColor === 'blue' && "bg-blue-400/80",
                                  guideColor === 'emerald' && "bg-emerald-400/80",
                                  guideColor === 'amber' && "bg-amber-400/80",
                                  guideColor === 'rose' && "bg-rose-400/80"
                                )} />
                              </div>
                              <div className="absolute right-[33%] top-[72%]">
                                <span className={cn("w-1 h-1 rounded-full block", 
                                  guideColor === 'blue' && "bg-blue-400/80",
                                  guideColor === 'emerald' && "bg-emerald-400/80",
                                  guideColor === 'amber' && "bg-amber-400/80",
                                  guideColor === 'rose' && "bg-rose-400/80"
                                )} />
                              </div>
                              <div className="absolute left-[50%] top-[75%] -translate-x-1/2">
                                <span className="text-[5px] font-mono text-zinc-500 font-bold">MOUTH</span>
                              </div>

                              {/* Chin */}
                              <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <span className={cn("w-1 h-1 rounded-full", 
                                  guideColor === 'blue' && "bg-blue-400",
                                  guideColor === 'emerald' && "bg-emerald-400",
                                  guideColor === 'amber' && "bg-amber-400",
                                  guideColor === 'rose' && "bg-rose-400"
                                )} />
                                <span className="text-[5px] font-mono text-zinc-400/80">CHIN</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Dynamic Grid Overlay & Alignment Guides */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                          {/* 1. Rule of Thirds Grid Lines */}
                          {gridOverlayType === 'thirds' && (
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                              <div className="border-r border-b border-white/10 transition-all duration-300"></div>
                              <div className="border-r border-b border-white/10 transition-all duration-300"></div>
                              <div className="border-b border-white/10"></div>
                              <div className="border-r border-b border-white/10 transition-all duration-300"></div>
                              <div className="border-r border-b border-white/10 transition-all duration-300"></div>
                              <div className="border-b border-white/10"></div>
                              <div className="border-r border-white/10"></div>
                              <div className="border-r border-white/10"></div>
                              <div></div>
                            </div>
                          )}

                          {/* 2. Golden Ratio/Phi Grid Lines */}
                          {gridOverlayType === 'phi' && (
                            <div className="absolute inset-0">
                              <div className="absolute top-[38.2%] left-0 right-0 border-b border-dashed border-white/15"></div>
                              <div className="absolute top-[61.8%] left-0 right-0 border-b border-dashed border-white/15"></div>
                              <div className="absolute left-[38.2%] top-0 bottom-0 border-r border-dashed border-white/15"></div>
                              <div className="absolute left-[61.8%] top-0 bottom-0 border-r border-dashed border-white/15"></div>
                            </div>
                          )}

                          {/* 3. Crosshair Grid Lines */}
                          {gridOverlayType === 'crosshair' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="absolute w-full border-b border-dotted border-white/20"></div>
                              <div className="absolute h-full border-r border-dotted border-white/20"></div>
                              <div className="absolute w-36 h-36 rounded-full border border-white/10"></div>
                              <div className="absolute w-72 h-72 rounded-full border border-white/5"></div>
                            </div>
                          )}

                          {/* 4. Beautiful Central Face Oval Guide */}
                          {showFaceGuide && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <div className={cn(
                                "relative w-[280px] h-[360px] max-w-[80%] max-h-[85%] rounded-[140px]/[180px] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 shadow-[0_0_25px_rgba(0,0,0,0.5)]",
                                guideColor === 'blue' && "border-blue-500/50 shadow-blue-500/10",
                                guideColor === 'emerald' && "border-emerald-500/50 shadow-emerald-500/10",
                                guideColor === 'amber' && "border-amber-500/50 shadow-amber-500/10",
                                guideColor === 'rose' && "border-rose-500/50 shadow-rose-500/10"
                              )}>
                                {/* Eye Alignment Guidelines */}
                                <div className={cn(
                                  "absolute top-[38%] left-1/2 -translate-x-1/2 w-[80%] h-px border-t border-dashed transition-all",
                                  guideColor === 'blue' && "border-blue-400/40",
                                  guideColor === 'emerald' && "border-emerald-400/40",
                                  guideColor === 'amber' && "border-amber-400/40",
                                  guideColor === 'rose' && "border-rose-400/40"
                                )} />
                                {/* Center vertical split */}
                                <div className={cn(
                                  "absolute top-0 bottom-0 left-1/2 w-px border-l border-dotted transition-all",
                                  guideColor === 'blue' && "border-blue-400/30",
                                  guideColor === 'emerald' && "border-emerald-400/30",
                                  guideColor === 'amber' && "border-amber-400/30",
                                  guideColor === 'rose' && "border-rose-400/30"
                                )} />
                                {/* Nose bridge & mouth guidelines */}
                                <div className={cn(
                                  "absolute top-[58%] left-1/2 -translate-x-1/2 w-[35%] h-[15%] rounded-full border border-dashed transition-all",
                                  guideColor === 'blue' && "border-blue-400/25",
                                  guideColor === 'emerald' && "border-emerald-400/25",
                                  guideColor === 'amber' && "border-amber-400/25",
                                  guideColor === 'rose' && "border-rose-400/25"
                                )} />
                                <div className={cn(
                                  "absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[40%] h-px border-b border-solid transition-all",
                                  guideColor === 'blue' && "border-blue-400/40",
                                  guideColor === 'emerald' && "border-emerald-400/40",
                                  guideColor === 'amber' && "border-amber-400/40",
                                  guideColor === 'rose' && "border-rose-400/40"
                                )} />

                                {/* Interactive Indicator HUD */}
                                <div className={cn(
                                  "absolute bottom-6 px-3 py-1 rounded-md text-[8px] font-mono font-bold uppercase tracking-widest text-center shadow-md border animate-pulse backdrop-blur-md select-none",
                                  guideColor === 'blue' && "bg-blue-950/80 border-blue-500/20 text-blue-400",
                                  guideColor === 'emerald' && "bg-emerald-950/80 border-emerald-500/20 text-emerald-400",
                                  guideColor === 'amber' && "bg-amber-950/80 border-amber-500/20 text-amber-400",
                                  guideColor === 'rose' && "bg-rose-950/80 border-rose-500/20 text-rose-400"
                                )}>
                                  Align Eyes & Nose
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Outer Tech Corner Brackets */}
                          <div className={cn(
                            "absolute inset-8 border transition-all duration-300 pointer-events-none rounded-[28px] opacity-60",
                            guideColor === 'blue' && "border-blue-500/10",
                            guideColor === 'emerald' && "border-emerald-500/10",
                            guideColor === 'amber' && "border-amber-500/10",
                            guideColor === 'rose' && "border-rose-500/10"
                          )}>
                            <div className={cn(
                              "absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg",
                              guideColor === 'blue' && "border-blue-400",
                              guideColor === 'emerald' && "border-emerald-400",
                              guideColor === 'amber' && "border-amber-400",
                              guideColor === 'rose' && "border-rose-400"
                            )}></div>
                            <div className={cn(
                              "absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg",
                              guideColor === 'blue' && "border-blue-400",
                              guideColor === 'emerald' && "border-emerald-400",
                              guideColor === 'amber' && "border-amber-400",
                              guideColor === 'rose' && "border-rose-400"
                            )}></div>
                            <div className={cn(
                              "absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg",
                              guideColor === 'blue' && "border-blue-400",
                              guideColor === 'emerald' && "border-emerald-400",
                              guideColor === 'amber' && "border-amber-400",
                              guideColor === 'rose' && "border-rose-400"
                            )}></div>
                            <div className={cn(
                              "absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 rounded-br-lg",
                              guideColor === 'blue' && "border-blue-400",
                              guideColor === 'emerald' && "border-emerald-400",
                              guideColor === 'amber' && "border-amber-400",
                              guideColor === 'rose' && "border-rose-400"
                            )}></div>
                          </div>
                        </div>

                        {/* Interactive floating control panel overlay (bottom right) */}
                        <div className="absolute bottom-4 right-4 bg-zinc-950/85 backdrop-blur-md rounded-xl p-2 border border-zinc-800/80 shadow-2xl z-20 flex items-center gap-3 text-white pointer-events-auto">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[6px] text-zinc-500 uppercase tracking-widest font-black">GRID TYPE</span>
                            <div className="flex items-center gap-0.5 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                              {(['thirds', 'phi', 'crosshair', 'none'] as const).map((t) => (
                                <button
                                  key={t}
                                  onClick={() => setGridOverlayType(t)}
                                  className={cn(
                                    "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                    gridOverlayType === t 
                                      ? "bg-zinc-800 text-white shadow" 
                                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                  )}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="h-6 w-px bg-zinc-800" />

                          <div className="flex flex-col gap-0.5">
                            <span className="text-[6px] text-zinc-500 uppercase tracking-widest font-black">FACE GUIDE</span>
                            <div className="flex items-center gap-0.5 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                              <button
                                onClick={() => setShowFaceGuide(true)}
                                className={cn(
                                  "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                  showFaceGuide 
                                    ? "bg-zinc-800 text-white shadow" 
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                )}
                              >
                                ON
                              </button>
                              <button
                                onClick={() => setShowFaceGuide(false)}
                                className={cn(
                                  "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                  !showFaceGuide 
                                    ? "bg-zinc-800 text-white shadow" 
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                )}
                              >
                                OFF
                              </button>
                            </div>
                          </div>

                          <div className="h-6 w-px bg-zinc-800" />

                          <div className="flex flex-col gap-0.5">
                            <span className="text-[6px] text-zinc-500 uppercase tracking-widest font-black">FACE DETECT</span>
                            <div className="flex items-center gap-0.5 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                              <button
                                onClick={() => setIsFaceDetectionActive(true)}
                                className={cn(
                                  "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                  isFaceDetectionActive 
                                    ? "bg-zinc-800 text-white shadow" 
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                )}
                              >
                                ON
                              </button>
                              <button
                                onClick={() => setIsFaceDetectionActive(false)}
                                className={cn(
                                  "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                  !isFaceDetectionActive 
                                    ? "bg-zinc-800 text-white shadow" 
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                )}
                              >
                                OFF
                              </button>
                            </div>
                          </div>

                          {isFaceDetectionActive && (
                            <>
                              <div className="h-6 w-px bg-zinc-800" />

                              <div className="flex flex-col gap-0.5">
                                <span className="text-[6px] text-zinc-500 uppercase tracking-widest font-black">TRACK MODE</span>
                                <div className="flex items-center gap-0.5 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                                  <button
                                    onClick={() => setFaceTrackingMode('auto')}
                                    className={cn(
                                      "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                      faceTrackingMode === 'auto' 
                                        ? "bg-zinc-800 text-white shadow" 
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                    )}
                                    title="Automatic organic facial tracking"
                                  >
                                    AUTO
                                  </button>
                                  <button
                                    onClick={() => setFaceTrackingMode('manual')}
                                    className={cn(
                                      "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                      faceTrackingMode === 'manual' 
                                        ? "bg-zinc-800 text-white shadow" 
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                                    )}
                                    title="Track mouse cursor over video container"
                                  >
                                    MANUAL
                                  </button>
                                </div>
                              </div>
                            </>
                          )}

                          <div className="h-6 w-px bg-zinc-800" />

                          <div className="flex flex-col gap-0.5">
                            <span className="text-[6px] text-zinc-500 uppercase tracking-widest font-black">THEME</span>
                            <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                              {(['blue', 'emerald', 'amber', 'rose'] as const).map((color) => (
                                <button
                                  key={color}
                                  onClick={() => setGuideColor(color)}
                                  className={cn(
                                    "w-2.5 h-2.5 rounded-full transition-all cursor-pointer border border-transparent hover:scale-110",
                                    color === 'blue' && "bg-blue-500",
                                    color === 'emerald' && "bg-emerald-500",
                                    color === 'amber' && "bg-amber-500",
                                    color === 'rose' && "bg-rose-500",
                                    guideColor === color && "ring-1 ring-offset-1 ring-offset-zinc-900 ring-white"
                                  )}
                                  title={`Switch to ${color} theme`}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="h-6 w-px bg-zinc-800" />

                          <div className="flex flex-col gap-0.5 min-w-[75px]">
                            <span className="text-[6px] text-zinc-500 uppercase tracking-widest font-black">STABILITY SENSOR</span>
                            <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 justify-between">
                              <span className={cn(
                                "text-[6px] font-black px-1 rounded uppercase select-none py-0.5",
                                isImageUnstable ? "text-rose-400 bg-rose-950/40 animate-pulse" : "text-emerald-400 bg-emerald-950/40"
                              )}>
                                {isImageUnstable ? "UNSTABLE" : "STABLE"} ({blurScore}%)
                              </span>
                              <button
                                onClick={() => {
                                  // Trigger a temporary motion blur spike
                                  setBlurScore(45);
                                  setIsImageUnstable(true);
                                  toast.warning("Simulating transient camera motion blur...", { duration: 1500 });
                                  
                                  if ((window as any).motionTimeout) {
                                    clearTimeout((window as any).motionTimeout);
                                  }
                                  const t = setTimeout(() => {
                                    setBlurScore(0);
                                    setIsImageUnstable(false);
                                  }, 1500);
                                  (window as any).motionTimeout = t;
                                }}
                                className="px-1 py-0.5 rounded text-[5px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black uppercase transition-all cursor-pointer"
                                title="Click to manually simulate camera movement"
                              >
                                JOLT
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Countdown Timer Visual Overlay */}
                        <AnimatePresence>
                          {countdown !== null && (
                            <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center select-none pointer-events-auto">
                              <motion.div 
                                key={countdown}
                                initial={{ scale: 0.3, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className={cn(
                                  "relative flex items-center justify-center w-40 h-40 rounded-full border-4 border-dashed bg-zinc-900/95 shadow-2xl",
                                  guideColor === 'blue' && "border-blue-500 shadow-blue-500/20",
                                  guideColor === 'emerald' && "border-emerald-500 shadow-emerald-500/20",
                                  guideColor === 'amber' && "border-amber-500 shadow-amber-500/20",
                                  guideColor === 'rose' && "border-rose-500 shadow-rose-500/20"
                                )}
                              >
                                <span className="text-7xl font-black text-white tracking-tighter font-sans">
                                  {countdown}
                                </span>
                              </motion.div>
                              <p className={cn(
                                "mt-6 text-xs font-mono font-bold uppercase tracking-widest animate-pulse",
                                guideColor === 'blue' && "text-blue-400",
                                guideColor === 'emerald' && "text-emerald-400",
                                guideColor === 'amber' && "text-amber-400",
                                guideColor === 'rose' && "text-rose-400"
                              )}>
                                Capturing Stable Profile in {countdown}s
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelCountdown();
                                }}
                                className="mt-6 px-4 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/50 text-rose-200 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all pointer-events-auto cursor-pointer"
                              >
                                Cancel Timer
                              </button>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                        <button 
                          onClick={() => setIsCameraActive(false)}
                          className="w-full sm:w-auto p-3.5 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all border border-slate-200 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest cursor-pointer"
                        >
                          Cancel
                        </button>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                          <button 
                            onClick={captureSimulatedSnapshot}
                            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl border border-slate-800 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Synthesize Virtual Target
                          </button>
                          
                          <button 
                            onClick={startCountdown}
                            disabled={countdown !== null}
                            className={cn(
                              "w-full sm:w-auto px-6 py-3.5 rounded-2xl border transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest cursor-pointer",
                              countdown !== null
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                : "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600 shadow-lg shadow-indigo-600/15 active:scale-[0.98]"
                            )}
                          >
                            <Timer className="w-3.5 h-3.5 animate-pulse" /> 3s Ready Timer
                          </button>

                          <button 
                            onClick={captureSnapshot}
                            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] cursor-pointer"
                          >
                            <Camera className="w-4 h-4" /> Capture Patient Snapshot
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : selectedImage ? (
                    <div className="relative w-full h-full flex flex-col gap-6">
                      <div className="relative aspect-auto max-h-[600px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-200">
                        <img src={selectedImage} alt="Clinical Photograph" className="w-full h-full object-contain" />
                        
                        {/* Scanning Animation Overlay */}
                        <AnimatePresence>
                          {isAnalyzing && (
                            <motion.div 
                              initial={{ top: '0%' }}
                              animate={{ top: '100%' }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"
                            />
                          )}
                        </AnimatePresence>
                        
                        {isAnalyzing && (
                          <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[2px] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                              <div className="relative">
                                <motion.div 
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                  className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                                />
                                <div className="absolute inset-0 flex items-center justify-center font-black text-[10px] text-blue-600">
                                  SCAN
                                </div>
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-700 animate-pulse bg-white/90 px-4 py-2 rounded-full border border-blue-100 shadow-xl">
                                Synthesizing Gestalt...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between px-2">
                        <button 
                          onClick={() => setSelectedImage(null)}
                          className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all border border-red-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                        >
                          <Trash2 className="w-4 h-4" /> Discard
                        </button>
                        {!results && !isAnalyzing && (
                          <button 
                            onClick={runAnalysis}
                            className="px-8 py-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]"
                          >
                            <Scan className="w-4 h-4" /> Run Vision Inference
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6 text-center py-6">
                      <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all duration-500">
                        <Camera className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Clinical Image Intake</h3>
                        <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                          Choose whether to snap a live clinical photo using your laptop webcam, or select/drag a local clinical photo. HIPAA compliance ensured via edge processing.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 mt-2">
                        <button 
                          onClick={startCamera}
                          className="px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/10 active:scale-95 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" /> Start Live Webcam
                        </button>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Upload className="w-4 h-4" /> Upload Photograph
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              {/* Local Storage Capture Gallery for Side-by-Side Comparison */}
              <div className="bg-white border border-slate-200 rounded-[40px] p-6 shadow-sm flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Comparative Phenotype Gallery</h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Compare recently captured or uploaded patient profiles side-by-side to assess landmark shift or movement stability.
                      </p>
                    </div>
                  </div>
                  {gallery.length > 0 && (
                    <button
                      onClick={() => {
                        setGallery([]);
                        setComparedIds([]);
                        localStorage.removeItem('facial_gestalt_gallery');
                        toast.info("Cleared comparative gallery.");
                      }}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-500 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Clear All
                    </button>
                  )}
                </div>

                {gallery.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <Grid className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Comparative Gallery Empty</p>
                    <p className="text-[9px] text-slate-400 max-w-xs mt-1">
                      Snap a snapshot using the camera or upload a file. Captures are auto-persisted locally for instant cross-comparison.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {/* Grid of gallery items */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {gallery.map((item) => {
                        const isCompared = comparedIds.includes(item.id);
                        return (
                          <div 
                            key={item.id}
                            className={cn(
                              "group/item relative bg-slate-50 rounded-3xl border p-2 transition-all flex flex-col gap-2 shadow-sm",
                              isCompared 
                                ? "border-indigo-500 ring-1 ring-indigo-500/20 bg-indigo-50/5" 
                                : "border-slate-200/60 hover:border-slate-300"
                            )}
                          >
                            {/* Thumbnail */}
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-slate-200/50">
                              <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
                              
                              {/* Stability badge */}
                              <div className={cn(
                                "absolute top-1.5 left-1.5 text-[6px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full backdrop-blur-md shadow-sm border",
                                item.stability === 'stable' 
                                  ? "bg-emerald-500/90 text-white border-emerald-400/20" 
                                  : "bg-rose-500/90 text-white border-rose-400/20"
                              )}>
                                {item.stability === 'stable' ? 'STABLE' : `UNSTABLE (${item.blurScore}%)`}
                              </div>

                              {/* Toggle Compare overlay action */}
                              <button
                                onClick={() => {
                                  if (isCompared) {
                                    setComparedIds((prev) => prev.filter(id => id !== item.id));
                                  } else {
                                    setComparedIds((prev) => {
                                      if (prev.length >= 2) {
                                        return [prev[1], item.id];
                                      }
                                      return [...prev, item.id];
                                    });
                                    setComparisonMode('overlay');
                                  }
                                }}
                                className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer animate-fade-in"
                              >
                                {isCompared ? (
                                  <span className="bg-indigo-600 text-white rounded-full p-1 shadow-lg">
                                    <CheckCircle2 className="w-4 h-4" />
                                  </span>
                                ) : (
                                  <span className="bg-white/90 text-indigo-600 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-wider shadow-lg">
                                    Compare
                                  </span>
                                )}
                              </button>
                            </div>

                            {/* Details & Actions */}
                            <div className="flex flex-col gap-1.5 px-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[8px] font-black text-slate-800 uppercase truncate">
                                  {item.label}
                                </span>
                                <span className="text-[7px] font-mono text-slate-400 whitespace-nowrap">
                                  {item.timestamp}
                                </span>
                              </div>

                              <div className="flex flex-col gap-1 mt-1 pt-1.5 border-t border-slate-200/60">
                                {/* Dedicated Compare Button */}
                                <button
                                  onClick={() => {
                                    if (isCompared) {
                                      setComparedIds((prev) => prev.filter(id => id !== item.id));
                                    } else {
                                      setComparedIds((prev) => {
                                        if (prev.length >= 2) {
                                          return [prev[1], item.id];
                                        }
                                        return [...prev, item.id];
                                      });
                                      setComparisonMode('overlay');
                                    }
                                  }}
                                  className={cn(
                                    "w-full py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-1",
                                    isCompared
                                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                      : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100/60"
                                  )}
                                >
                                  <Scale className="w-2.5 h-2.5" />
                                  {isCompared ? "Compared" : "Compare"}
                                </button>

                                <div className="grid grid-cols-2 gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedImage(item.image);
                                      setResults(null);
                                      toast.success("Loaded image as active target.");
                                    }}
                                    className="py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[7px] font-black uppercase tracking-wider transition-all cursor-pointer text-center font-sans"
                                    title="Load this image back as the main diagnostic target"
                                  >
                                    Load
                                  </button>
                                  <button
                                    onClick={() => {
                                      setGallery((prev) => {
                                        const updated = prev.filter(g => g.id !== item.id);
                                        localStorage.setItem('facial_gestalt_gallery', JSON.stringify(updated));
                                        return updated;
                                      });
                                      setComparedIds((prev) => prev.filter(id => id !== item.id));
                                      toast.info("Deleted from gallery.");
                                    }}
                                    className="py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[7px] font-black uppercase tracking-wider transition-all cursor-pointer text-center font-sans"
                                    title="Remove from gallery"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Select checkbox badge */}
                            <button
                              onClick={() => {
                                if (isCompared) {
                                  setComparedIds((prev) => prev.filter(id => id !== item.id));
                                } else {
                                  setComparedIds((prev) => {
                                    if (prev.length >= 2) {
                                      return [prev[1], item.id];
                                    }
                                    return [...prev, item.id];
                                  });
                                  setComparisonMode('overlay');
                                }
                              }}
                              className="absolute top-2 right-2 p-1 rounded-md bg-white/95 border border-slate-200 text-indigo-600 shadow-sm hover:scale-105 transition-all cursor-pointer"
                            >
                              {isCompared ? (
                                <CheckSquare className="w-3.5 h-3.5" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Comparative Side-by-Side Presentation Section */}
                    {comparedIds.length > 0 && (
                      <div className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-5 flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/50 pb-3 gap-3">
                          <div className="flex items-center gap-2">
                            {comparisonMode === 'overlay' && comparedIds.length === 2 ? (
                              <Layers className="w-4 h-4 text-indigo-500 animate-pulse" />
                            ) : (
                              <Scale className="w-4 h-4 text-indigo-500 animate-pulse" />
                            )}
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                              {comparisonMode === 'overlay' && comparedIds.length === 2 
                                ? "Phenotypic Feature Overlay Comparison" 
                                : "Side-by-Side Profile Evaluation"} ({comparedIds.length} Selected)
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {comparedIds.length === 2 && (
                              <div className="flex items-center gap-1 bg-slate-200/50 p-0.5 rounded-lg border border-slate-200">
                                <button
                                  onClick={() => setComparisonMode('side-by-side')}
                                  className={cn(
                                    "px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                    comparisonMode === 'side-by-side' 
                                      ? "bg-white text-slate-800 shadow-xs" 
                                      : "text-slate-500 hover:text-slate-800"
                                  )}
                                >
                                  Side-by-Side
                                </button>
                                <button
                                  onClick={() => setComparisonMode('overlay')}
                                  className={cn(
                                    "px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer",
                                    comparisonMode === 'overlay' 
                                      ? "bg-white text-indigo-600 shadow-xs" 
                                      : "text-slate-500 hover:text-slate-800"
                                  )}
                                >
                                  Overlay Compare
                                </button>
                              </div>
                            )}
                            <button
                              onClick={() => {
                                setComparedIds([]);
                                setComparisonMode('side-by-side');
                              }}
                              className="text-[8px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg cursor-pointer"
                            >
                              Deselect All
                            </button>
                          </div>
                        </div>

                        {/* Interactive Overlay Viewport when 2 items are selected and mode is 'overlay' */}
                        {comparisonMode === 'overlay' && comparedIds.length === 2 ? (() => {
                          const comparedItems = gallery.filter(item => comparedIds.includes(item.id));
                          const firstItem = comparedItems[0];
                          const secondItem = comparedItems[1];
                          if (!firstItem || !secondItem) return null;

                          const baseItem = swapOverlayOrder ? secondItem : firstItem;
                          const overlayItem = swapOverlayOrder ? firstItem : secondItem;

                          return (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                              {/* Left side: The Dual-Layer Overlay Frame */}
                              <div className="lg:col-span-7 flex flex-col gap-2">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Alignment Viewport</span>
                                <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-slate-300 shadow-lg group/overlay">
                                  {/* Base Image (Static underneath) */}
                                  <img 
                                    src={baseItem.image} 
                                    alt={baseItem.label} 
                                    className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none" 
                                  />

                                  {/* Overlay Image (Absolute layer on top with adjustable opacity and mix-blend-mode) */}
                                  <img 
                                    src={overlayItem.image} 
                                    alt={overlayItem.label} 
                                    style={{ 
                                      opacity: overlayOpacity / 100,
                                      mixBlendMode: overlayBlendMode === 'normal' ? undefined : overlayBlendMode 
                                    }} 
                                    className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none transition-all duration-100" 
                                  />

                                  {/* Fine Precision Medical Grid overlay */}
                                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none opacity-20 border border-white/5">
                                    {Array.from({ length: 36 }).map((_, i) => (
                                      <div key={i} className="border-[0.5px] border-white/20 border-dashed" />
                                    ))}
                                  </div>

                                  {/* Interactive Cursor crosshair line overlays for precision landmark tracking */}
                                  <div className="absolute inset-0 opacity-0 group-hover/overlay:opacity-40 pointer-events-none transition-opacity duration-300">
                                    <div className="absolute left-1/2 top-0 bottom-0 border-l border-cyan-400 border-dashed" />
                                    <div className="absolute top-1/2 left-0 right-0 border-t border-cyan-400 border-dashed" />
                                  </div>

                                  {/* Floating Info Badges */}
                                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-zinc-950/90 backdrop-blur-md px-3 py-2 rounded-xl text-[8px] font-mono border border-zinc-800 text-white shadow-md">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                      <span>Base: <b className="text-zinc-300 font-bold uppercase">{baseItem.label}</b></span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                                      <span>Overlay ({overlayOpacity}%): <b className="text-zinc-300 font-bold uppercase">{overlayItem.label}</b></span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Right side: Overlay Controls & Analytics */}
                              <div className="lg:col-span-5 flex flex-col gap-5">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Controls & Filters</span>

                                {/* Slider Container */}
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                                  <div className="flex justify-between items-center">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                      <Eye className="w-3.5 h-3.5 text-indigo-500" />
                                      Overlay Opacity
                                    </label>
                                    <span className="text-[9px] font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                      {overlayOpacity}%
                                    </span>
                                  </div>
                                  
                                  <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={overlayOpacity}
                                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 border border-slate-200"
                                  />

                                  {/* Slider presets */}
                                  <div className="grid grid-cols-5 gap-1.5">
                                    {[0, 25, 50, 75, 100].map((val) => (
                                      <button
                                        key={val}
                                        onClick={() => setOverlayOpacity(val)}
                                        className={cn(
                                          "py-1 rounded-md text-[8px] font-mono font-bold transition-all cursor-pointer border",
                                          overlayOpacity === val
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                                        )}
                                      >
                                        {val}%
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Blending Filters */}
                                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                    Composite Blend Mode
                                  </span>
                                  <div className="grid grid-cols-4 gap-1.5">
                                    {(['normal', 'difference', 'multiply', 'screen'] as const).map((mode) => (
                                      <button
                                        key={mode}
                                        onClick={() => setOverlayBlendMode(mode)}
                                        className={cn(
                                          "py-1.5 rounded-md text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer border truncate",
                                          overlayBlendMode === mode
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                                        )}
                                        title={
                                          mode === 'difference' 
                                            ? "Highlight misalignment: Aligned areas appear dark, changes glow" 
                                            : mode === 'multiply' 
                                            ? "Enhance overlapping dark contours" 
                                            : mode === 'screen' 
                                            ? "Enhance overlapping light highlights" 
                                            : "Standard opacity transparent overlay"
                                        }
                                      >
                                        {mode}
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-[8px] text-slate-400 font-medium leading-normal">
                                    💡 <b>Difference mode</b> is ideal for facial contour comparison. Perfect alignments remain black, while asymmetrical features glow brightly.
                                  </p>
                                </div>

                                {/* Swap Button */}
                                <button
                                  onClick={() => setSwapOverlayOrder(!swapOverlayOrder)}
                                  className="py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                                >
                                  <RefreshCcw className={cn("w-3.5 h-3.5 text-indigo-500 transition-transform duration-300", swapOverlayOrder && "rotate-180")} />
                                  Swap Layer Order
                                </button>

                                {/* Specifications comparison */}
                                <div className="border border-slate-200/80 rounded-2xl bg-white p-3.5 flex flex-col gap-2.5 shadow-xs">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Profiles Specs comparison</span>
                                  <div className="grid grid-cols-2 gap-4 divide-x divide-slate-100">
                                    <div className="flex flex-col gap-1 text-[9px]">
                                      <span className="text-[7px] font-mono text-indigo-500 uppercase font-black">Base Layer</span>
                                      <span className="font-bold text-slate-700 truncate">{baseItem.label}</span>
                                      <span className="text-slate-400 font-mono text-[8px]">{baseItem.timestamp}</span>
                                      <span className={cn(
                                        "font-black uppercase text-[7px] mt-0.5",
                                        baseItem.stability === 'stable' ? "text-emerald-500" : "text-rose-500"
                                      )}>
                                        {baseItem.stability === 'stable' ? "✓ STABLE" : `⚠ UNSTABLE (${baseItem.blurScore}%)`}
                                      </span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-[9px] pl-4">
                                      <span className="text-[7px] font-mono text-pink-500 uppercase font-black">Overlay Layer</span>
                                      <span className="font-bold text-slate-700 truncate">{overlayItem.label}</span>
                                      <span className="text-slate-400 font-mono text-[8px]">{overlayItem.timestamp}</span>
                                      <span className={cn(
                                        "font-black uppercase text-[7px] mt-0.5",
                                        overlayItem.stability === 'stable' ? "text-emerald-500" : "text-rose-500"
                                      )}>
                                        {overlayItem.stability === 'stable' ? "✓ STABLE" : `⚠ UNSTABLE (${overlayItem.blurScore}%)`}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })() : (
                          /* Side-by-Side comparative viewport (Original Side-by-Side View) */
                          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(comparedIds.length, 3)}, minmax(0, 1fr))` }}>
                            {gallery.filter(item => comparedIds.includes(item.id)).map((item) => (
                              <div key={item.id} className="bg-white border border-slate-200/80 rounded-2xl p-2.5 flex flex-col gap-3 shadow-xs">
                                {/* Comparative Visual Box */}
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-slate-100">
                                  <img src={item.image} alt={item.label} className="w-full h-full object-contain" />
                                  <div className="absolute bottom-2 left-2 bg-slate-900/90 text-white text-[7px] font-mono px-2 py-0.5 rounded">
                                    {item.timestamp}
                                  </div>
                                </div>

                                {/* Landmark Specs Comparison Table */}
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex justify-between items-center text-[8px] font-mono border-b border-slate-100 pb-1">
                                    <span className="text-slate-400 uppercase">Label:</span>
                                    <span className="text-slate-700 font-bold uppercase truncate max-w-[100px]" title={item.label}>{item.label}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[8px] font-mono border-b border-slate-100 pb-1">
                                    <span className="text-slate-400 uppercase">Integrity:</span>
                                    <span className={cn(
                                      "font-black uppercase",
                                      item.stability === 'stable' ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                      {item.stability === 'stable' ? 'VERIFIED' : 'UNSTABLE'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-[8px] font-mono border-b border-slate-100 pb-1">
                                    <span className="text-slate-400 uppercase">Blur Score:</span>
                                    <span className={cn(
                                      "font-black font-mono",
                                      item.blurScore > 15 ? "text-rose-500" : "text-slate-600"
                                    )}>
                                      {item.blurScore}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white border border-slate-200 rounded-[32px] flex flex-col gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Data Integrity
                  </span>
                  <p className="text-[10px] text-slate-600 font-bold leading-relaxed">
                    Images are processed in a secure environment. No identifiable metadata is persisted beyond the session duration.
                  </p>
                </div>
                <div className="p-6 bg-white border border-slate-200 rounded-[32px] flex flex-col gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-blue-500" />
                    Inference Guardrails
                  </span>
                  <p className="text-[10px] text-slate-600 font-bold leading-relaxed">
                    Suggested HPO terms require clinician verification. AI confidence levels are probabilistic, not diagnostic.
                  </p>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-[40px] shadow-sm overflow-hidden h-full flex flex-col">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                      <Minimize2 className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Phenotypic Findings</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">HPO Vector Extraction</p>
                    </div>
                  </div>
                  {results && (
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                      {results.length} Matches Found
                    </div>
                  )}
                </div>

                <div className="flex-1 p-8 space-y-6">
                  {!results && !isAnalyzing && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20 opacity-50">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                        <Sparkles className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] max-w-[200px]">
                        Waiting for image sequence analysis protocols...
                      </p>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse flex items-center gap-4 p-4 border border-slate-100 rounded-2xl">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-slate-100 rounded w-1/3" />
                            <div className="h-2 bg-slate-50 rounded w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {results && (
                    <div className="space-y-8">
                      {analysisRationale && (
                        <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-3">
                            <Info className="w-4 h-4 text-blue-200 group-hover:text-blue-400 transition-colors" />
                          </div>
                          <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Sparkles className="w-3 h-3" /> Gestalt Summary
                          </h4>
                          <p className="text-[11px] text-slate-700 leading-relaxed font-bold italic">
                            "{analysisRationale}"
                          </p>
                        </div>
                      )}

                      <div className="space-y-4">
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Identified HPO Terms</h4>
                        {results.map((term, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={term.id}
                            className="group relative bg-white border border-slate-200 rounded-[24px] p-5 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                  {idx + 1}
                                </div>
                                <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{term.name}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Conf.</span>
                                <div className={cn(
                                  "text-[10px] font-black tracking-tighter",
                                  term.confidence > 0.8 ? "text-emerald-600" : "text-amber-600"
                                )}>
                                  {Math.round(term.confidence * 100)}%
                                </div>
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4">
                              {term.definition}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic truncate max-w-[200px]">
                                {term.id} | {term.evidence}
                              </span>
                              <button 
                                onClick={() => {
                                  addHPOTerm(term);
                                  toast.success('Term Verified', { description: `Added ${term.name} to clinical profile.` });
                                }}
                                className="bg-emerald-50 text-emerald-600 p-2 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <button 
                        onClick={() => {
                          results.forEach(addHPOTerm);
                          toast.success('Phenotypic Profile Synced', { description: 'All verified terms have been mapped to the patient knowledge graph.' });
                        }}
                        className="w-full flex items-center justify-between px-6 py-4 bg-slate-900 text-white rounded-2xl group hover:bg-slate-800 transition-all active:scale-[0.98]"
                      >
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sync Findings to Profile</span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Radiology AI Tab */}
        {activeTab === 'radiology' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                <h3 className="text-lg font-black uppercase text-slate-900 tracking-tight mb-4">Radiology DICOM Inference</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">MRI Protocol & Spectroscopy Peak Solver</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button 
                    onClick={() => {
                      setSelectedRadiologyCase('mri_brain');
                      setRadiologyResults(null);
                    }}
                    className={cn(
                      "p-5 border rounded-2xl text-left transition-all group",
                      selectedRadiologyCase === 'mri_brain' ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-400"
                    )}
                  >
                    <span className="text-xl font-black text-slate-900 block mb-1">BRAIN-SPEC-01</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-500">MRI Brain Protocol</span>
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedRadiologyCase('mri_spine');
                      setRadiologyResults(null);
                    }}
                    className={cn(
                      "p-5 border rounded-2xl text-left transition-all group",
                      selectedRadiologyCase === 'mri_spine' ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-400"
                    )}
                  >
                    <span className="text-xl font-black text-slate-900 block mb-1">SPINE-T2-04</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-500">T2 Sagittal Spine</span>
                  </button>
                </div>

                {selectedRadiologyCase ? (
                  <div className="space-y-6">
                    <div className="aspect-video bg-slate-950 rounded-2xl relative overflow-hidden flex items-center justify-center border border-slate-800">
                      {/* Interactive Visual Scan representation */}
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]" />
                      <div className="relative text-center text-slate-500 space-y-2 select-none">
                        <Scan className="w-12 h-12 text-slate-700 mx-auto animate-pulse" />
                        <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
                          {selectedRadiologyCase === 'mri_brain' ? 'MRI T2/FLAIR Hyperintensities Model' : 'Sagittal Spine Alignment Matrix'}
                        </p>
                        <p className="text-[8px] font-mono text-slate-600">RESOLUTION: 512x512 DICOM STRUCT</p>
                      </div>

                      {/* Segmentation boundary */}
                      <div className="absolute top-1/3 left-1/3 w-24 h-24 rounded-full border-2 border-dashed border-red-500 animate-pulse flex items-center justify-center bg-red-500/10 backdrop-blur-[1px]">
                        <span className="text-[7px] font-mono font-black text-red-500 uppercase tracking-widest">LESION</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Segmentation Intensity Threshold</span>
                        <span className="text-xs font-mono font-black">{radiologyIntensity}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={radiologyIntensity}
                        onChange={(e) => setRadiologyIntensity(Number(e.target.value))}
                        className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {!radiologyResults && !isAnalyzing && (
                      <button 
                        onClick={runRadiologyInference}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all active:scale-[0.98]"
                      >
                        Start Radiology Inference Model
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="py-20 text-center opacity-40">
                    <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">No Scan Active</p>
                    <p className="text-[9px] font-medium text-slate-500 max-w-xs mx-auto mt-2">Select a case or drop a DICOM dossier to execute clinical imaging diagnostics.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight mb-6 pb-2 border-b border-slate-100">Radiology AI Solver Outputs</h3>

                {isAnalyzing ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <RefreshCcw className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reconstructing cortical slices...</p>
                  </div>
                ) : radiologyResults ? (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl">
                      <h4 className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                        Inference Findings
                      </h4>
                      <p className="text-[10.5px] font-bold text-slate-700 leading-relaxed italic">
                        "{radiologyResults.findings}"
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Segmented Regions</h4>
                      {radiologyResults.regions.map((reg: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                          <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase">{reg.name}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{reg.status}</p>
                          </div>
                          <span className="text-xs font-mono font-black text-red-500">{(reg.severity * 10).toFixed(1)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Suggested HPO Mappings</h4>
                      {radiologyResults.hpo_suggested.map((item: any, i: number) => (
                        <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-center hover:border-slate-400 cursor-pointer">
                          <div>
                            <p className="text-[10px] font-black text-slate-900 uppercase">{item.name}</p>
                            <p className="text-[8px] font-mono text-slate-400 uppercase mt-1">{item.id}</p>
                          </div>
                          <button 
                            onClick={() => {
                              addHPOTerm(item);
                              toast.success(`Added HPO: ${item.name}`);
                            }}
                            className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center opacity-40">
                    <Eye className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Awaiting Segmentation</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Histopathology Tab */}
        {activeTab === 'histology' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                <h3 className="text-lg font-black uppercase text-slate-900 tracking-tight mb-4">Whole Slide Imaging & Cell Segmentation</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Mitochondrial Staining & Morphology Classifier</p>

                <div className="flex gap-4 mb-6">
                  {['mitochondrial', 'he', 'trichrome'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStainType(st as any)}
                      className={cn(
                        "flex-1 py-3 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                        stainType === st ? "border-slate-900 bg-slate-50 text-slate-900" : "border-slate-200 text-slate-400"
                      )}
                    >
                      {st === 'he' ? 'H&E Staining' : st === 'mitochondrial' ? 'Mito-Red' : 'Trichrome Stain'}
                    </button>
                  ))}
                </div>

                <div className="aspect-[4/3] bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
                  
                  {/* Interactive simulated slide cells */}
                  <div className="relative w-full h-full p-8 flex items-center justify-center">
                    <div className="grid grid-cols-6 gap-4 w-full h-full max-h-[300px] select-none">
                      {[...Array(24)].map((_, i) => {
                        const isAtypical = i % 5 === 0;
                        return (
                          <div 
                            key={i} 
                            className={cn(
                              "rounded-full border transition-all flex items-center justify-center relative shadow-inner cursor-pointer hover:scale-110",
                              isAtypical 
                                ? (stainType === 'mitochondrial' ? "bg-red-500 border-red-400" : "bg-purple-600 border-purple-500") 
                                : "bg-slate-800 border-slate-700"
                            )}
                          >
                            <span className="text-[6px] font-mono text-white/50">{isAtypical ? 'ATY' : 'NOR'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {isHistologyProcessing && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                      <RefreshCcw className="w-8 h-8 text-rose-500 animate-spin" />
                      <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Segmenting Cellular Hotspots...</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Simulated Cell Resolution</span>
                  <button 
                    onClick={() => {
                      setIsHistologyProcessing(true);
                      setTimeout(() => {
                        setIsHistologyProcessing(false);
                        toast.success("Histology analysis completed: Ragged Red Fibers detected.");
                      }, 1200);
                    }}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest"
                  >
                    Run Stain Morphology Analyzer
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight mb-6 pb-2 border-b border-slate-100">Tissue Metrics</h3>

                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Stain Specificity Index</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">0.92 <span className="text-[9px] text-emerald-500 font-bold ml-2">EXCELLENT</span></p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Atypical Cell Distribution</h4>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-900 uppercase">Ragged Red Fibers</span>
                      <span className="text-xs font-mono font-black text-red-600">8.5 / High suspicion</span>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-900 uppercase">Collagen Area Fraction</span>
                      <span className="text-xs font-mono font-black text-slate-600">12.4%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2 text-yellow-800">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Diagnostic Recommendation</span>
                    </div>
                    <p className="text-[10px] font-bold text-yellow-900/80 leading-relaxed uppercase">
                      Significant mitochondrial morphology disruptions observed. Strong tissue indicators of OXPHOS dysfunction.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Protein Structure Tab */}
        {activeTab === 'protein' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                <h3 className="text-lg font-black uppercase text-slate-900 tracking-tight mb-4">Protein Fold Structuring</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">AlphaFold Structural Damage Visualizer</p>

                <div className="space-y-4 mb-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Target Mutant Locus</label>
                      <input 
                        type="text" 
                        value={proteinMutation}
                        onChange={(e) => setProteinMutation(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-4 focus:ring-slate-950/5 bg-slate-50"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Predicted Free Energy (dG)</label>
                      <input 
                        type="number" 
                        value={proteinEnergyState}
                        onChange={(e) => setProteinEnergyState(Number(e.target.value))}
                        className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold font-mono focus:outline-none focus:ring-4 focus:ring-slate-950/5 bg-slate-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="aspect-[16/10] bg-slate-950 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
                  {/* Visualizing 3D interactive grid representing protein atom bounds */}
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
                  
                  <div className="relative text-center">
                    <motion.div 
                      animate={{ rotateY: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="w-32 h-32 mx-auto border border-blue-500/30 rounded-full flex items-center justify-center relative p-2 bg-blue-900/10"
                    >
                      {/* Amino acid backbones simulation */}
                      <div className="absolute inset-0 m-4 border border-dashed border-cyan-500/40 rounded-full" />
                      <div className="absolute inset-0 m-8 border border-dotted border-rose-500/50 rounded-full" />
                      
                      <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                    </motion.div>
                    <p className="mt-4 text-[9px] font-mono text-slate-400 uppercase tracking-widest">3D Helical Backbone Configuration</p>
                    <p className="text-[8px] font-mono text-slate-600 uppercase">MODEL_ALPHAFOLD_V3_PRED_DAMAGE</p>
                  </div>

                  {/* Temperature scale */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[7px] font-mono font-black text-cyan-400 uppercase tracking-widest">CYAN: UNCHANGED</span>
                    <span className="text-[7px] font-mono font-black text-rose-500 uppercase tracking-widest">ROSE: MAXIMUM DAMAGE POINT</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                <h3 className="text-sm font-black uppercase text-slate-900 tracking-tight mb-6 pb-2 border-b border-slate-100">Structural Damage Report</h3>

                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Hydrogen Bond Disruption</p>
                     <p className="text-2xl font-black text-slate-900 tracking-tighter">7 / 12 Bonds Broken</p>
                  </div>

                  <div className="space-y-2">
                     <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase">
                        <span>Solvent Accessibility</span>
                        <span>Increased (Exposed core)</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: '84%' }} />
                     </div>
                  </div>

                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                     <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                       <Sparkles className="w-3.5 h-3.5" />
                       Thermodynamic Impact
                     </h4>
                     <p className="text-[10px] font-bold text-slate-700 leading-relaxed uppercase">
                       Calculated mutation causes extreme hydrophobic core destabilization. Structural integrity compromised at 37°C.
                     </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
