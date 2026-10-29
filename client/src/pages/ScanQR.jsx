import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import PublicNavbar from '../components/navigation/PublicNavbar';
import Footer from '../components/navigation/Footer';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  Upload,
  Search,
  ArrowRight,
  AlertCircle,
  History,
  RefreshCw,
  QrCode,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ScanQR() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [manualId, setManualId] = useState('');
  const [activeMode, setActiveMode] = useState('camera'); // 'camera' | 'upload'
  const [isScanning, setIsScanning] = useState(false);
  const [isDecodingFile, setIsDecodingFile] = useState(false);
  const [scanError, setScanError] = useState(null);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const isMountedRef = useRef(true);

  // Recent scans state stored in localStorage
  const [recentScans, setRecentScans] = useState(() => {
    try {
      const stored = localStorage.getItem('catchtrace_recent_scans');
      return stored ? JSON.parse(stored) : ['FB-20261028-0001', 'FB-20261028-0015', 'FB-20261028-0011'];
    } catch {
      return ['FB-20261028-0001'];
    }
  });

  const saveRecentScan = (id) => {
    setRecentScans((prev) => {
      const updated = [id, ...prev.filter((item) => item !== id)].slice(0, 6);
      localStorage.setItem('catchtrace_recent_scans', JSON.stringify(updated));
      return updated;
    });
  };

  // Helper to safely check if scanner instance is running
  const isScannerRunning = (scanner) => {
    if (!scanner) return false;
    try {
      return scanner.isScanning || (typeof scanner.getState === 'function' && scanner.getState() === 2);
    } catch {
      return false;
    }
  };

  // Safely stop and clear scanner
  const safeStopScanner = async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        if (isScannerRunning(scanner)) {
          await scanner.stop();
        }
      } catch (err) {
        console.warn('Safe stop error:', err);
      }
      try {
        scanner.clear();
      } catch (err) {
        console.warn('Safe clear error:', err);
      }
    }
    if (isMountedRef.current) {
      setIsScanning(false);
    }
  };

  // Shared decode and navigation handler
  const handleDecodedSuccess = async (decodedText) => {
    if (!decodedText) return;
    let batchId = decodedText.trim();
    if (batchId.includes('/trace/')) {
      batchId = batchId.split('/trace/')[1].split('?')[0].split('#')[0];
    } else if (batchId.includes('/batches/')) {
      batchId = batchId.split('/batches/')[1].split('?')[0].split('#')[0];
    } else if (batchId.includes('/')) {
      const parts = batchId.split('?')[0].split('#')[0].split('/');
      batchId = parts[parts.length - 1];
    }
    batchId = batchId.replace(/\/+$/, '').trim().toUpperCase();

    if (!batchId) {
      setScanError('QR code was read but did not contain a valid Batch ID.');
      return;
    }

    await safeStopScanner();
    saveRecentScan(batchId);
    toast.success(`Scanned: ${batchId}`);

    if (isAuthenticated) {
      navigate(`/batches/${batchId}`);
    } else {
      navigate(`/trace/${batchId}`);
    }
  };

  // Start Camera scanning
  const startCamera = async () => {
    setScanError(null);
    setActiveMode('camera');

    await safeStopScanner();

    const scannerId = 'page-qr-reader';
    const el = document.getElementById(scannerId);
    if (!el) {
      setScanError('Scanner container not ready.');
      return;
    }
    el.innerHTML = '';

    // Verify browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = 'Camera access is not supported by your browser or connection. Please use "Upload QR Image" or enter the Batch ID manually.';
      setScanError(err);
      toast.error(err);
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleDecodedSuccess(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );

      if (isMountedRef.current) {
        setIsScanning(true);
        setScanError(null);
      }
    } catch (err) {
      console.warn('Camera failed to start:', err);
      let message = 'Camera access unavailable or permissions not granted in this browser session. Please enter the Batch ID manually.';
      if (err?.name === 'NotAllowedError' || (typeof err === 'string' && err.includes('Permission')) || err?.message?.includes('Permission')) {
        message = 'Camera permission was denied. Please allow camera access in your browser settings or use "Upload QR Image".';
      } else if (err?.name === 'NotFoundError' || (typeof err === 'string' && err.includes('NotFound')) || err?.message?.includes('device')) {
        message = 'No camera found on this device. Please use "Upload QR Image" or enter the Batch ID manually.';
      }
      if (isMountedRef.current) {
        setScanError(message);
        setIsScanning(false);
      }
      toast.error(message);
    }
  };

  // Upload and decode QR file
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be selected again
    e.target.value = '';

    setScanError(null);
    setActiveMode('upload');

    // Crucial: Stop live camera first to avoid conflicts
    await safeStopScanner();

    const scannerId = 'page-qr-reader';
    const el = document.getElementById(scannerId);
    if (!el) {
      setScanError('Scanner container not ready.');
      return;
    }
    el.innerHTML = '';

    setIsDecodingFile(true);

    try {
      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      const decodedText = await html5QrCode.scanFile(file, true);
      handleDecodedSuccess(decodedText);
    } catch (err) {
      console.warn('File decode failed:', err);
      const errMsg = 'Could not read a QR code from this image. Try another photo or enter the batch ID manually.';
      if (isMountedRef.current) {
        setScanError(errMsg);
      }
      toast.error(errMsg);
    } finally {
      if (isMountedRef.current) {
        setIsDecodingFile(false);
      }
    }
  };

  // Mount effect: start camera on mount and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    startCamera();

    return () => {
      isMountedRef.current = false;
      safeStopScanner();
    };
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualId.trim()) {
      toast.error('Please enter a valid Batch ID');
      return;
    }
    const id = manualId.trim().toUpperCase();
    saveRecentScan(id);
    if (isAuthenticated) {
      navigate(`/batches/${id}`);
    } else {
      navigate(`/trace/${id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-page">
      {isAuthenticated ? <Navbar /> : <PublicNavbar />}

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
        
        <PageHeader
          title={t('scan.title', 'Scan Fish Batch QR')}
          subtitle={t('scan.subtitle', 'Scan any CatchTrace QR tag to inspect complete verified origin and cold chain logs.')}
        />

        {/* Scanner Card */}
        <div className="bg-white rounded-ct p-4 sm:p-6 md:p-8 border border-borderLight shadow-card space-y-6">
          
          {/* Two Clear Options: [ Scan with Camera ] [ Upload QR Image ] */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
            <button
              type="button"
              onClick={startCamera}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeMode === 'camera' && isScanning
                  ? 'bg-ocean-600 text-white shadow-md'
                  : activeMode === 'camera'
                  ? 'bg-ocean-50 text-ocean-700 border-2 border-ocean-500 font-bold'
                  : 'bg-white text-navy-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{isScanning ? 'Camera Active' : 'Scan with Camera'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                safeStopScanner();
                setActiveMode('upload');
                setScanError(null);
                fileInputRef.current?.click();
              }}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeMode === 'upload'
                  ? 'bg-ocean-600 text-white shadow-md'
                  : 'bg-white text-navy-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload QR Image</span>
            </button>

            {/* Hidden file input without capture attribute */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Viewport Area */}
          <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-square max-w-sm mx-auto flex items-center justify-center border-4 border-ocean-600/40 shadow-inner">
            <div id="page-qr-reader" className="w-full h-full flex items-center justify-center"></div>

            {/* Camera Viewfinder Target */}
            {activeMode === 'camera' && isScanning && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 z-10">
                <div className="w-44 h-44 sm:w-56 sm:h-56 border-2 border-dashed border-ocean-400 rounded-2xl relative animate-pulse-glow">
                  <div className="absolute -top-1.5 -left-1.5 w-7 h-7 border-t-4 border-l-4 border-ocean-400 rounded-tl-lg"></div>
                  <div className="absolute -top-1.5 -right-1.5 w-7 h-7 border-t-4 border-r-4 border-ocean-400 rounded-tr-lg"></div>
                  <div className="absolute -bottom-1.5 -left-1.5 w-7 h-7 border-b-4 border-l-4 border-ocean-400 rounded-bl-lg"></div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 border-b-4 border-r-4 border-ocean-400 rounded-br-lg"></div>
                </div>
                <span className="text-xs font-semibold text-white bg-navy-900/80 px-3.5 py-1.5 rounded-full mt-4 backdrop-blur-xs">
                  {t('scan.aimCamera', 'Align QR code within the frame to scan automatically')}
                </span>
              </div>
            )}

            {/* File Decoding Progress */}
            {isDecodingFile && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 z-20">
                <RefreshCw className="w-10 h-10 text-ocean-400 animate-spin" />
                <p className="text-sm font-bold">Decoding QR image...</p>
                <span className="text-xs text-slate-300">Scanning uploaded file for batch data</span>
              </div>
            )}

            {/* Upload Mode Placeholder when no file selected yet */}
            {activeMode === 'upload' && !isDecodingFile && !scanError && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 cursor-pointer hover:bg-slate-900 transition-colors z-10"
              >
                <div className="w-14 h-14 rounded-2xl bg-ocean-500/20 text-ocean-400 flex items-center justify-center border border-ocean-500/40 shadow-xs">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Select QR Code Image</h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs">
                    Choose a photo, screenshot, or downloaded image containing a QR code
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  Browse Files
                </button>
              </div>
            )}

            {/* Error Message (Camera access or File decode failure) */}
            {scanError && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 z-30">
                <AlertCircle className="w-12 h-12 text-amber-400 shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-amber-300">
                    {activeMode === 'camera' ? 'Camera Notice' : 'Image Scan Notice'}
                  </h4>
                  <p className="text-xs text-slate-200 max-w-xs leading-relaxed">{scanError}</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {activeMode === 'camera' ? (
                    <>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-2 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Camera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMode('upload');
                          setScanError(null);
                          fileInputRef.current?.click();
                        }}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File Instead</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Another Image</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Manual Input Form */}
          <div className="pt-4 border-t border-borderLight max-w-md mx-auto">
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wide">
                {t('scan.manualTitle', 'Or Enter Batch ID Manually')}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-textSecondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value.toUpperCase())}
                    placeholder={t('scan.manualPlaceholder', 'e.g. FB-20261028-0001')}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-borderLight text-xs font-mono font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>{t('actions.search', 'Search')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Recent Scans List */}
          {recentScans.length > 0 && (
            <div className="pt-4 border-t border-borderLight max-w-md mx-auto">
              <div className="flex items-center gap-1.5 text-xs font-bold text-textSecondary mb-2">
                <History className="w-4 h-4" />
                <span>{t('scan.recentScans', 'Recent Scanned Batches')}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {recentScans.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate(`/batches/${id}`);
                      } else {
                        navigate(`/trace/${id}`);
                      }
                    }}
                    className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-ocean-50 text-navy-900 hover:text-ocean-700 border border-borderLight transition-colors"
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </main>

      <Footer />
    </div>
  );
}
