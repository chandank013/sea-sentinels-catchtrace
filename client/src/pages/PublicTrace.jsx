import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/navigation/PublicNavbar';
import Footer from '../components/navigation/Footer';
import Timeline from '../components/timeline/Timeline';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Calendar,
  MapPin,
  Scale,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import QRScannerModal from '../components/qr/QRScannerModal';
import toast from 'react-hot-toast';

export default function PublicTrace() {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadTrace() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getPublicTrace(id);
        if (isMounted) setTraceData(data);
      } catch (err) {
        if (isMounted) setError(err.message || 'Batch not found');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTrace();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-page">
        <PublicNavbar isTracePage={true} />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-textSecondary">Verifying cryptographic origin from ocean to plate...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !traceData) {
    return (
      <div className="min-h-screen flex flex-col bg-page">
        <PublicNavbar isTracePage={true} isVerified={false} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 border border-borderLight shadow-card text-center max-w-md w-full">
            <AlertTriangle className="w-14 h-14 text-amber-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-navy-900">{t('publicTrace.batchNotFound')}</h2>
            <p className="text-xs text-textSecondary mt-2 mb-6 leading-relaxed">
              {t('publicTrace.batchNotFoundSub')}
            </p>
            <button
              onClick={() => setScannerOpen(true)}
              className="w-full py-3 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <QrCode className="w-4 h-4" />
              <span>{t('publicTrace.scanAnother')}</span>
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const landedDate = traceData.landed_at
    ? new Date(traceData.landed_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '28 Oct 2026';

  return (
    <div className="min-h-screen flex flex-col bg-page">
      {/* Public Verified Header */}
      <PublicNavbar isTracePage={true} isVerified={traceData.isVerified} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
        
        {/* Product Hero Card matching mockup #7 */}
        <div className="bg-white rounded-3xl border border-borderLight shadow-card overflow-hidden">
          
          {/* Header Banner Image */}
          <div className="relative h-48 sm:h-56 bg-slate-900 overflow-hidden">
            <img
              src={traceData.image || 'https://images.unsplash.com/photo-1534943441045-1215b22bdf5f?w=1000&auto=format&fit=crop&q=80'}
              alt={traceData.species}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/40 to-transparent"></div>

            {/* Top Verified Badge */}
            <div className="absolute top-4 left-4">
              {traceData.isVerified ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('nav.verifiedAuthentic')}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t('nav.unverifiedRecord')}</span>
                </div>
              )}
            </div>

            {/* Bottom Info on Hero */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="font-mono text-xs font-bold bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                {t('batches.batchId')}: {traceData.batch_id}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
                {t(`species.${traceData.species}`, traceData.species)}
              </h1>
            </div>
          </div>

          {/* Product Overview Attributes */}
          <div className="p-4 sm:p-6 bg-slate-50/70 border-b border-borderLight grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
            <div>
              <span className="text-textSecondary uppercase font-semibold text-[10px] block">{t('batches.species')}</span>
              <span className="text-sm font-bold text-navy-900 mt-0.5 block">{t(`species.${traceData.species}`, traceData.species)}</span>
            </div>

            <div>
              <span className="text-textSecondary uppercase font-semibold text-[10px] block">{t('batches.landingCentre')}</span>
              <span className="text-sm font-bold text-navy-900 mt-0.5 block">{t(`harbours.${traceData.landing_centre}`, traceData.landing_centre)}</span>
            </div>

            <div>
              <span className="text-textSecondary uppercase font-semibold text-[10px] block">{t('batches.landedAt')}</span>
              <span className="text-sm font-bold text-navy-900 mt-0.5 block">{landedDate}</span>
            </div>

            <div>
              <span className="text-textSecondary uppercase font-semibold text-[10px] block">{t('batches.initialWeight')}</span>
              <span className="text-sm font-bold text-navy-900 mt-0.5 block">{traceData.initial_weight_kg} kg</span>
            </div>
          </div>

        </div>

        {/* Consumer Transparency Summary */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-borderLight shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ocean-50 text-ocean-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-navy-900">{t('publicTrace.verifiedOrigin')}</h4>
              <p className="text-xs text-textSecondary">
                {traceData.events.length} {t('batchDetails.eventsLogged')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setScannerOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-borderLight text-xs font-bold text-navy-900 hover:bg-slate-50 transition-colors self-stretch sm:self-auto"
          >
            <QrCode className="w-4 h-4 text-ocean-600" />
            <span>{t('publicTrace.scanAnother')}</span>
          </button>
        </div>

        {/* Public Timeline matching mockup #7 */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-borderLight shadow-card">
          <div className="pb-4 mb-6 border-b border-borderLight">
            <h3 className="text-base font-bold text-navy-900">{t('publicTrace.timelineTitle')}</h3>
            <p className="text-xs text-textSecondary mt-0.5">
              {t('publicTrace.timelineSub')}
            </p>
          </div>

          <Timeline events={traceData.events} isPublic={true} />
        </div>

      </main>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={(scannedId) => {
          navigate(`/trace/${scannedId}`);
        }}
      />

      <Footer />
    </div>
  );
}
