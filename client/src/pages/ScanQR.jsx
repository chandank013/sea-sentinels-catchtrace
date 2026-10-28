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
  Search,
  ArrowRight,
  AlertCircle,
  History,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ScanQR() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [manualId, setManualId] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

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

  useEffect(() => {
    const scannerId = 'page-qr-reader';
    const html5QrCode = new Html5Qrcode(scannerId);
    scannerRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: { width: 260, height: 260 },
      aspectRatio: 1.0,
    };

    html5QrCode
      .start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          let batchId = decodedText.trim();
          if (batchId.includes('/trace/')) {
            batchId = batchId.split('/trace/')[1].split('?')[0].split('#')[0];
          }
          saveRecentScan(batchId);
          toast.success(`Scanned: ${batchId}`);
          html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
          
          if (isAuthenticated) {
            navigate(`/batches/${batchId}`);
          } else {
            navigate(`/trace/${batchId}`);
          }
        },
        () => {}
      )
      .then(() => {
        setIsScanning(true);
        setCameraError(null);
      })
      .catch((err) => {
        console.warn('Camera failed to start:', err);
        setCameraError('Camera access unavailable or permissions not granted in this browser session. Please enter the Batch ID manually.');
        setIsScanning(false);
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch(() => {});
      }
    };
  }, [isAuthenticated, navigate]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualId.trim()) {
      toast.error('Please enter a valid Batch ID');
      return;
    }
    const id = manualId.trim();
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
          title={t('scan.title')}
          subtitle={t('scan.subtitle')}
        />

        {/* Scanner Card matching mockup #6 */}
        <div className="bg-white rounded-ct p-6 sm:p-8 border border-borderLight shadow-card space-y-6">
          
          {/* Camera Viewport Area */}
          <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-square max-w-sm mx-auto flex items-center justify-center border-4 border-ocean-600/40 shadow-inner">
            <div id="page-qr-reader" className="w-full h-full"></div>

            {/* Viewfinder Target graphic */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              <div className="w-56 h-56 border-2 border-dashed border-ocean-400 rounded-2xl relative animate-pulse-glow">
                <div className="absolute -top-1.5 -left-1.5 w-7 h-7 border-t-4 border-l-4 border-ocean-400 rounded-tl-lg"></div>
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 border-t-4 border-r-4 border-ocean-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-1.5 -left-1.5 w-7 h-7 border-b-4 border-l-4 border-ocean-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 border-b-4 border-r-4 border-ocean-400 rounded-br-lg"></div>
              </div>
              <span className="text-xs font-semibold text-white bg-navy-900/80 px-3.5 py-1.5 rounded-full mt-4 backdrop-blur-xs">
                {t('scan.aimCamera')}
              </span>
            </div>

            {/* Camera Error Message */}
            {cameraError && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                <AlertCircle className="w-12 h-12 text-amber-400" />
                <h4 className="font-bold text-sm">{t('scan.cameraError')}</h4>
              </div>
            )}
          </div>

          {/* Manual Input Form matching reference mockup #6 */}
          <div className="pt-4 border-t border-borderLight max-w-md mx-auto">
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <label className="block text-xs font-bold text-navy-900 uppercase tracking-wide">
                {t('scan.manualTitle')}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-textSecondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value.toUpperCase())}
                    placeholder={t('scan.manualPlaceholder')}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-borderLight text-xs font-mono font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-ocean-500 uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>{t('actions.search')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Recent Scans List matching mockup */}
          {recentScans.length > 0 && (
            <div className="pt-4 border-t border-borderLight max-w-md mx-auto">
              <div className="flex items-center gap-1.5 text-xs font-bold text-textSecondary mb-2">
                <History className="w-4 h-4" />
                <span>{t('scan.recentScans')}</span>
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
