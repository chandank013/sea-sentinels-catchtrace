import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, AlertCircle, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [manualId, setManualId] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    let isMounted = true;
    const scannerId = 'qr-camera-box';

    // Delay to let modal DOM render
    const timer = setTimeout(() => {
      if (!isMounted) return;
      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      html5QrCode
        .start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            // Check if it's full URL or raw batch ID
            let batchId = decodedText.trim();
            if (batchId.includes('/trace/')) {
              batchId = batchId.split('/trace/')[1].split('?')[0].split('#')[0];
            }
            toast.success(`Scanned: ${batchId}`);
            stopScanner();
            onScanSuccess(batchId);
            onClose();
          },
          (errorMessage) => {
            // QR parse frame error (silent during search)
          }
        )
        .then(() => {
          setIsScanning(true);
          setCameraError(null);
        })
        .catch((err) => {
          console.warn('Camera start error:', err);
          setCameraError('Camera access unavailable or permission denied. Please enter Batch ID manually.');
          setIsScanning(false);
        });
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = () => {
    if (scannerRef.current && isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current.clear();
        })
        .catch(() => {})
        .finally(() => {
          setIsScanning(false);
        });
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualId.trim()) {
      toast.error('Please enter a valid Batch ID');
      return;
    }
    stopScanner();
    onScanSuccess(manualId.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-ct max-w-lg w-full overflow-hidden shadow-hover border border-borderLight flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-borderLight flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ocean-50 text-ocean-600 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">Scan Batch QR Code</h3>
              <p className="text-xs text-textSecondary">Align QR code within the frame to scan</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-lg text-textSecondary hover:text-navy-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Camera Viewport */}
          <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-square flex items-center justify-center border-2 border-ocean-500/50 shadow-inner">
            <div id="qr-camera-box" className="w-full h-full"></div>

            {/* Viewfinder Overlay Graphic */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8">
              <div className="w-56 h-56 border-2 border-dashed border-ocean-400/90 rounded-2xl relative">
                {/* Corner Accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-ocean-400 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-ocean-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-ocean-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-ocean-400 rounded-br-lg"></div>
              </div>
              <span className="text-xs font-semibold text-white/90 bg-black/60 px-3 py-1 rounded-full mt-4 backdrop-blur-xs">
                Scanning for QR code...
              </span>
            </div>

            {/* Error Message if camera failed */}
            {cameraError && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-400" />
                <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
                <span className="text-[11px] text-ocean-400">Use manual entry below to proceed</span>
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
                  <span>Select</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick Demo Batch Selectors for fast hackathon judging */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[11px] text-textSecondary font-medium mb-1.5">Try demo batches:</p>
              <div className="flex flex-wrap gap-1.5">
                {['FB-20261028-0001', 'FB-20261028-0002', 'FB-20261028-0015', 'FB-20261028-0011'].map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      stopScanner();
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
