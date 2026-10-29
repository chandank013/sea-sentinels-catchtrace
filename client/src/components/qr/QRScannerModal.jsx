import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  Upload,
  X,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [manualId, setManualId] = useState('');
  const [activeMode, setActiveMode] = useState('camera'); // 'camera' | 'upload'
  const [isScanning, setIsScanning] = useState(false);
  const [isDecodingFile, setIsDecodingFile] = useState(false);
  const [scanError, setScanError] = useState(null);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const isMountedRef = useRef(true);

  const scannerId = 'qr-camera-box';

  const isScannerRunning = (scanner) => {
    if (!scanner) return false;
    try {
      return scanner.isScanning || (typeof scanner.getState === 'function' && scanner.getState() === 2);
    } catch {
      return false;
    }
  };

  const safeStopScanner = async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        if (isScannerRunning(scanner)) {
          await scanner.stop();
        }
      } catch (err) {
        console.warn('Modal scanner stop error:', err);
      }
      try {
        scanner.clear();
      } catch (err) {
        console.warn('Modal scanner clear error:', err);
      }
    }
    if (isMountedRef.current) {
      setIsScanning(false);
    }
  };

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
    toast.success(`Scanned: ${batchId}`);
    if (onScanSuccess) {
      onScanSuccess(batchId);
    }
    if (onClose) {
      onClose();
    }
  };

  const startCamera = async () => {
    setScanError(null);
    setActiveMode('camera');

    await safeStopScanner();

    const el = document.getElementById(scannerId);
    if (!el) {
      setScanError('Scanner container not ready.');
      return;
    }
    el.innerHTML = '';

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
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleDecodedSuccess(decodedText);
        },
        () => {}
      );

      if (isMountedRef.current) {
        setIsScanning(true);
        setScanError(null);
      }
    } catch (err) {
      console.warn('Modal camera start error:', err);
      let message = 'Camera access unavailable or permission denied. Please enter Batch ID manually.';
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    setScanError(null);
    setActiveMode('upload');

    // Stop camera before processing file
    await safeStopScanner();

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
      console.warn('QR file scan error:', err);
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

  useEffect(() => {
    isMountedRef.current = true;
    if (isOpen) {
      // Small timeout to allow modal animation and DOM mount
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          startCamera();
        }
      }, 150);
      return () => {
        clearTimeout(timer);
        safeStopScanner();
      };
    } else {
      safeStopScanner();
    }

    return () => {
      isMountedRef.current = false;
      safeStopScanner();
    };
  }, [isOpen]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualId.trim()) {
      toast.error('Please enter a valid Batch ID');
      return;
    }
    const id = manualId.trim().toUpperCase();
    safeStopScanner();
    if (onScanSuccess) {
      onScanSuccess(id);
    }
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-ct max-w-lg w-full overflow-hidden shadow-hover border border-borderLight flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-borderLight flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ocean-50 text-ocean-600 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-navy-900">Scan Batch QR Code</h3>
              <p className="text-[11px] sm:text-xs text-textSecondary">Scan with camera or upload a QR image</p>
            </div>
          </div>
          <button
            onClick={() => {
              safeStopScanner();
              onClose();
            }}
            className="p-1.5 rounded-lg text-textSecondary hover:text-navy-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">

          {/* Mode Selector Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={startCamera}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
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
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                activeMode === 'upload'
                  ? 'bg-ocean-600 text-white shadow-md'
                  : 'bg-white text-navy-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload QR Image</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
          
          {/* Camera / Upload Viewport */}
          <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-square flex items-center justify-center border-2 border-ocean-500/50 shadow-inner">
            <div id="qr-camera-box" className="w-full h-full flex items-center justify-center"></div>

            {/* Viewfinder Overlay Graphic (when camera scanning) */}
            {activeMode === 'camera' && isScanning && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 sm:p-8 z-10">
                <div className="w-44 h-44 sm:w-56 sm:h-56 border-2 border-dashed border-ocean-400/90 rounded-2xl relative">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-ocean-400 rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-ocean-400 rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-ocean-400 rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-ocean-400 rounded-br-lg"></div>
                </div>
                <span className="text-xs font-semibold text-white/90 bg-black/60 px-3 py-1 rounded-full mt-4 backdrop-blur-xs">
                  Scanning for QR code...
                </span>
              </div>
            )}

            {/* File Decoding Progress */}
            {isDecodingFile && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 z-20">
                <RefreshCw className="w-10 h-10 text-ocean-400 animate-spin" />
                <p className="text-sm font-bold text-white">Decoding QR image...</p>
                <span className="text-xs text-slate-300">Extracting batch data</span>
              </div>
            )}

            {/* Upload Mode Placeholder when no file selected */}
            {activeMode === 'upload' && !isDecodingFile && !scanError && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 cursor-pointer hover:bg-slate-900 transition-colors z-10"
              >
                <div className="w-12 h-12 rounded-xl bg-ocean-500/20 text-ocean-400 flex items-center justify-center border border-ocean-500/40 shadow-xs">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Select QR Code Image</h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs">
                    Choose a photo, screenshot, or downloaded image
                  </p>
                </div>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-lg bg-ocean-600 hover:bg-ocean-700 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  Browse Files
                </button>
              </div>
            )}

            {/* Error Message if camera failed or image decode failed */}
            {scanError && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 z-30">
                <AlertCircle className="w-10 h-10 text-amber-400 shrink-0" />
                <p className="text-xs text-slate-200 max-w-xs leading-relaxed">{scanError}</p>
                <div className="flex gap-2 pt-1">
                  {activeMode === 'camera' ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3.5 py-1.5 rounded-lg bg-ocean-600 hover:bg-ocean-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Camera</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg bg-ocean-600 hover:bg-ocean-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Another Image</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Manual Input Fallback */}
          <div className="border-t border-borderLight pt-4">
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wide">
                Or Enter Batch ID Manually
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value.toUpperCase())}
                  placeholder="e.g. FB-20261028-0001"
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-borderLight text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>Go</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick Demo Batch Selectors */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[11px] text-textSecondary font-medium mb-1.5">Try demo batches:</p>
              <div className="flex flex-wrap gap-1.5">
                {['FB-20261028-0001', 'FB-20261028-0002', 'FB-20261028-0015', 'FB-20261028-0011'].map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      safeStopScanner();
                      onScanSuccess(id);
                      onClose();
                    }}
                    className="text-[11px] font-mono font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-ocean-100 hover:text-ocean-700 text-slate-700 transition-colors"
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
