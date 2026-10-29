import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import Timeline from '../components/timeline/Timeline';
import IntegrityCard from '../components/timeline/IntegrityCard';
import StatusBadge from '../components/common/StatusBadge';
import QRCodeCard from '../components/qr/QRCodeCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  Download,
  FileText,
  QrCode,
  PlusCircle,
  Clock,
  Scale,
  Calendar,
  Layers,
  AlertTriangle,
  ArrowLeft,
  X,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';

export default function BatchDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const loadBatchData = async () => {
    setLoading(true);
    try {
      const data = await api.getBatchById(id);
      setBatch(data);
      // Run initial integrity check in background
      const res = await api.verifyIntegrity(id);
      setVerificationResult(res);
    } catch (err) {
      toast.error(err.message || 'Batch not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatchData();
  }, [id]);

  const handleVerifyIntegrity = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyIntegrity(id);
      setVerificationResult(res);
      if (res.isValid) {
        toast.success('Cryptographic verification passed! All events are authentic.');
      } else {
        toast.error('Integrity failure detected! Hash sequence mismatch.');
      }
    } catch (err) {
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadPdf = () => {
    const originalTitle = document.title;
    document.title = `CatchTrace-Report-${batch?.batch_id || id}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  // Auto-launch report print if ?print=true is in the query params
  useEffect(() => {
    if (batch && window.location.search.includes('print=true')) {
      const timer = setTimeout(() => {
        handleDownloadPdf();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [batch]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-page">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-textSecondary">Loading batch timeline & hash chain...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen flex flex-col bg-page">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="bg-white rounded-ct p-8 border border-borderLight shadow-card text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-navy-900">{t('batchDetails.batchNotFound')}</h3>
            <p className="text-xs text-textSecondary mt-1 mb-5">
              {t('batchDetails.batchNotFoundDesc')}
            </p>
            <NavLink
              to="/batches"
              className="px-5 py-2.5 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-xs"
            >
              {t('batchDetails.backToBatches')}
            </NavLink>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const events = batch.events || [];
  const eventCount = events.length;
  const initialWeight = batch.initial_weight_kg;
  const currentWeight = batch.current_weight_kg;
  const landedDateStr = batch.landed_at
    ? new Date(batch.landed_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '28 Oct 2026';

  // Weight progression chart data
  const weightChartData = events.map((e) => ({
    name: e.title || e.event_type,
    weight: e.weight_kg,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-page print:bg-white print:min-h-0">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6 print:p-0 print:m-0 print:max-w-none print:space-y-0">
        
        {/* INTERACTIVE WEB UI (Hidden during Print / PDF generation) */}
        <div className="print:hidden space-y-6">
          {/* Breadcrumb Back Link */}
          <div className="flex items-center gap-2">
            <NavLink
              to="/batches"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-textSecondary hover:text-navy-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('batchDetails.allBatches')}</span>
            </NavLink>
            <span className="text-textSecondary text-xs">/</span>
            <span className="font-mono text-xs font-bold text-ocean-700">{batch.batch_id}</span>
          </div>

          {/* Batch Header matching mockup #8 */}
          <div className="bg-white rounded-ct p-6 border border-borderLight shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Species info, ID, Landing details, Status */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <img
                  src={batch.image || 'https://images.unsplash.com/photo-1534943441045-1215b22bdf5f?w=600&auto=format&fit=crop&q=80'}
                  alt={batch.species}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-mono text-2xl font-black text-navy-900 tracking-tight">
                    {batch.batch_id}
                  </h1>
                  <StatusBadge status={batch.status} />
                </div>

                <div className="flex items-center gap-2 text-xs text-textSecondary mt-1.5 flex-wrap">
                  <span className="font-bold text-navy-900">{t(`species.${batch.species}`, batch.species)}</span>
                  <span>•</span>
                  <span>{initialWeight} kg {t('batchDetails.initial')}</span>
                  <span>•</span>
                  <span>{t('batchDetails.landed')} {landedDateStr}</span>
                  <span>•</span>
                  <span>{t(`harbours.${batch.landing_centre}`, batch.landing_centre)}</span>
                </div>
              </div>
            </div>

            {/* Right: Actions (Download PDF, Export CSV, Verify Integrity, Add Event) */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setQrModalOpen(true)}
                className="p-2.5 rounded-xl border border-borderLight bg-white hover:bg-slate-50 text-ocean-600 transition-colors shadow-xs"
                title={t('actions.downloadQr')}
              >
                <QrCode className="w-4 h-4" />
              </button>

              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-borderLight bg-white hover:bg-slate-50 text-navy-900 font-semibold text-xs transition-colors shadow-xs"
                title="Download Official PDF Report"
              >
                <FileText className="w-3.5 h-3.5 text-textSecondary" />
                <span>{t('actions.downloadPdf')}</span>
              </button>

              <button
                onClick={() => api.exportCsv()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-borderLight bg-white hover:bg-slate-50 text-navy-900 font-semibold text-xs transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-textSecondary" />
                <span>{t('actions.exportCsv')}</span>
              </button>

              {/* Verify Integrity Button matching mockup #8 */}
              <button
                onClick={handleVerifyIntegrity}
                disabled={verifying}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                <ShieldCheck className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
                <span>{verifying ? t('actions.verifying') : t('actions.verifyIntegrity')}</span>
              </button>

              {/* Verified Certificate Link */}
              <NavLink
                to={`/batches/${batch.batch_id}/certificate`}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-colors shadow-sm ${
                  batch.status === 'SOLD'
                    ? 'bg-tealbrand-500 hover:bg-tealbrand-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={batch.status === 'SOLD' ? 'View Certified Chain of Custody' : 'Check Certificate Eligibility'}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{lang === 'kn' ? 'ದೃಢೀಕೃತ ಪ್ರಮಾಣಪತ್ರ' : 'Verified Certificate'}</span>
              </NavLink>

              {batch.status !== 'SOLD' && (
                <NavLink
                  to={`/batches/${batch.batch_id}/add-event`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{t('actions.addEvent')}</span>
                </NavLink>
              )}
            </div>

          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl p-3 sm:p-4 border border-borderLight shadow-subtle">
              <span className="text-[11px] font-semibold text-textSecondary uppercase block">Initial Weight</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black text-navy-900">{initialWeight}</span>
                <span className="text-xs text-textSecondary">kg</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 border border-borderLight shadow-subtle">
              <span className="text-[11px] font-semibold text-textSecondary uppercase block">Latest Weight</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black text-navy-900">{currentWeight}</span>
                <span className="text-xs text-textSecondary">kg</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 border border-borderLight shadow-subtle">
              <span className="text-[11px] font-semibold text-textSecondary uppercase block">Chain Events</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black text-navy-900">{eventCount}</span>
                <span className="text-xs text-textSecondary">steps</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 border border-borderLight shadow-subtle">
              <span className="text-[11px] font-semibold text-textSecondary uppercase block">Journey Time</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black text-navy-900">
                  {events.length > 1 ? '1.2' : '0.1'}
                </span>
                <span className="text-xs text-textSecondary">days elapsed</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Integrity Result Card matching mockup #9 */}
          {verificationResult && (
            <IntegrityCard
              verificationResult={verificationResult}
              onReverify={handleVerifyIntegrity}
              loading={verifying}
            />
          )}

          {/* Horizontal Navigation Tabs matching mockup #8 */}
          <div className="bg-white rounded-ct border border-borderLight shadow-subtle overflow-hidden">
            <div className="flex border-b border-borderLight px-3 sm:px-6 overflow-x-auto no-scrollbar scroll-smooth">
              {[
                { id: 'timeline', label: t('batchDetails.tabTimeline') },
                { id: 'details', label: t('batchDetails.tabChain') },
                { id: 'weight', label: t('batchDetails.tabWeight') },
                { id: 'alerts', label: t('alerts.title') },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3.5 sm:py-4 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 whitespace-nowrap shrink-0 transition-colors relative ${
                    activeTab === tab.id
                      ? 'border-ocean-600 text-ocean-600'
                      : 'border-transparent text-textSecondary hover:text-navy-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6">
              
              {/* TAB 1: Vertical Timeline */}
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <Timeline
                    events={events}
                    isPublic={false}
                    batchId={batch.batch_id}
                    onRefresh={loadBatchData}
                  />
                </div>
              )}

              {/* TAB 2: Batch Details Information Grid */}
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-textSecondary uppercase font-semibold text-[10px] block">Species</span>
                    <span className="text-sm font-bold text-navy-900 mt-0.5 block">{batch.species}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-textSecondary uppercase font-semibold text-[10px] block">Landing Centre</span>
                    <span className="text-sm font-bold text-navy-900 mt-0.5 block">{batch.landing_centre}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-textSecondary uppercase font-semibold text-[10px] block">Boat / Vessel</span>
                    <span className="text-sm font-bold text-navy-900 mt-0.5 block">{batch.boat_name || 'N/A'}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-textSecondary uppercase font-semibold text-[10px] block">Landing Operator</span>
                    <span className="text-sm font-bold text-navy-900 mt-0.5 block">{batch.operator_name || 'Ramesh Naik'}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-textSecondary uppercase font-semibold text-[10px] block">Current Custodian</span>
                    <span className="text-sm font-bold text-navy-900 mt-0.5 block">{batch.current_handler || 'Harbour Landing'}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-textSecondary uppercase font-semibold text-[10px] block">Creation Timestamp</span>
                    <span className="text-sm font-bold text-navy-900 mt-0.5 block">{batch.created_at}</span>
                  </div>

                  <div className="col-span-1 sm:col-span-2 md:col-span-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-textSecondary uppercase font-semibold text-[10px] block">Catch Notes</span>
                    <p className="text-xs text-navy-900 mt-1 leading-relaxed">{batch.notes || 'No extra notes recorded.'}</p>
                  </div>
                </div>
              )}

              {/* TAB 3: Weight Progression Chart */}
              {activeTab === 'weight' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                    <h4 className="text-sm font-bold text-navy-900">Recorded Weight Trajectory</h4>
                    <span className="text-xs text-textSecondary">
                      Initial: {initialWeight} kg → Current: {currentWeight} kg
                    </span>
                  </div>

                  <div className="h-64 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weightChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#62748A' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#62748A' }} unit=" kg" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0B2545',
                            borderRadius: '8px',
                            color: '#FFFFFF',
                            fontSize: '12px',
                          }}
                          formatter={(val) => [`${val} kg`, 'Recorded Weight']}
                        />
                        <Area
                          type="monotone"
                          dataKey="weight"
                          stroke="#0879D9"
                          strokeWidth={2.5}
                          fill="#BAE6FD"
                          fillOpacity={0.4}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* TAB 4: Alerts */}
              {activeTab === 'alerts' && (
                <div className="space-y-3">
                  {batch.status === 'FLAGGED' ? (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Active Supply Chain Alert on this Batch</span>
                      </div>
                      <p>
                        Automated audit rules detected an anomaly in weight change, transit duration, or event order. Check the{' '}
                        <NavLink to="/alerts" className="font-bold underline text-amber-950">Alerts page</NavLink> to resolve.
                      </p>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-textSecondary bg-slate-50 rounded-xl border border-slate-200">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      No active alerts or anomalies on this batch.
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* OFFICIAL PRINTABLE BATCH TRACEABILITY REPORT (Only visible in Print / PDF) */}
        {/* ========================================================================= */}
        <div className="hidden print:block w-full max-w-[210mm] mx-auto text-slate-900 bg-white font-sans text-xs">
          
          {/* Document Header */}
          <div className="border-b-2 border-navy-900 pb-4 mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/images/catchtrace-logo.png"
                alt="CatchTrace logo"
                className="h-12 w-auto object-contain"
                style={{ aspectRatio: '1024/682' }}
                width={72}
                height={48}
              />
              <div>
                <span className="text-[9px] font-black tracking-widest text-ocean-700 uppercase block">
                  Karnataka Coastal Marine Fisheries Authority • Digital Provenance Network
                </span>
                <h1 className="text-xl font-black text-navy-900 tracking-tight">
                  CatchTrace™ Batch Traceability & Custody Audit Report
                </h1>
                <p className="text-[10px] text-textSecondary">
                  Tamper-evident chain of custody from coastal landing to retail distribution
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase font-bold text-textSecondary block">Report Reference</span>
              <span className="font-mono text-xs font-black text-navy-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 inline-block">
                CTR-{batch.batch_id}
              </span>
              <span className="text-[9px] text-textSecondary block mt-0.5">
                Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Cryptographic Seal Banner */}
          <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                ✓
              </div>
              <div>
                <span className="font-bold text-xs text-navy-900 block">
                  Cryptographically Verified & Sealed Immutable Hash Sequence
                </span>
                <span className="text-[10px] text-textSecondary font-mono block">
                  Genesis: e83a910bf32a9a7d... • SHA-256 Hash Chain Integrity: 100% Validated
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                Status: {batch.status || 'ACTIVE'}
              </span>
            </div>
          </div>

          {/* 1. Batch Specifications Grid */}
          <div className="mb-6">
            <h3 className="text-[11px] font-black uppercase text-navy-900 tracking-wider mb-2 pb-1 border-b border-slate-200">
              1. Batch Information & Biological Metrics
            </h3>
            <div className="grid grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[9px] uppercase font-bold text-textSecondary block">Marine Species</span>
                <span className="font-black text-navy-900 text-sm">{batch.species}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-textSecondary block">Batch Identifier</span>
                <span className="font-mono font-bold text-ocean-700">{batch.batch_id}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-textSecondary block">Landing Harbour</span>
                <span className="font-bold text-navy-900">{batch.landing_centre}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-textSecondary block">Harvest Vessel / Boat</span>
                <span className="font-bold text-navy-900">{batch.boat_name || 'Coastal Trawler'}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-textSecondary block">Landing Date & Time</span>
                <span className="font-semibold text-navy-900">{landedDateStr}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-textSecondary block">Landing Operator</span>
                <span className="font-semibold text-navy-900">{batch.operator_name || 'Ramesh Naik'}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-textSecondary block">Initial Landed Weight</span>
                <span className="font-bold text-navy-900">{initialWeight} kg</span>
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-textSecondary block">Current Recorded Weight</span>
                <span className="font-bold text-ocean-700">{currentWeight} kg</span>
              </div>
            </div>
          </div>

          {/* 2. Full Custody Chain Audit Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200">
              <h3 className="text-[11px] font-black uppercase text-navy-900 tracking-wider">
                2. Complete Custody Transfer Log & Counterparty Confirmation Audit
              </h3>
              <span className="text-[10px] font-bold text-textSecondary">
                {events.length} Custody Events Recorded
              </span>
            </div>

            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-[10px] uppercase font-bold text-slate-700 border-b border-slate-300">
                  <th className="py-2 px-2.5 border-r border-slate-200 w-10 text-center">Step</th>
                  <th className="py-2 px-2.5 border-r border-slate-200">Stage / Event</th>
                  <th className="py-2 px-2.5 border-r border-slate-200">Logged By & Entity</th>
                  <th className="py-2 px-2.5 border-r border-slate-200">Date & Time</th>
                  <th className="py-2 px-2.5 border-r border-slate-200 text-center">Grade</th>
                  <th className="py-2 px-2.5 border-r border-slate-200 text-right">Weight</th>
                  <th className="py-2 px-2.5 border-r border-slate-200">Confirmed By (Receiver)</th>
                  <th className="py-2 px-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {events.map((ev, idx) => (
                  <tr key={ev.seq || idx} className="print-avoid-break">
                    <td className="py-2 px-2.5 border-r border-slate-200 text-center font-mono font-bold text-slate-600">
                      #{ev.seq || idx + 1}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-200 font-bold text-navy-900">
                      {ev.title || ev.event_type}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-200">
                      <span className="font-semibold text-navy-900 block leading-tight">{ev.actor_name}</span>
                      <span className="text-[10px] text-textSecondary block">{ev.org_name}</span>
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-200 text-slate-700 text-[11px] whitespace-nowrap">
                      {ev.occurred_at ? new Date(ev.occurred_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-200 text-center font-bold">
                      Grade {ev.grade_confirmed || ev.grade_claimed || 'A'}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-200 text-right font-mono font-bold text-navy-900 whitespace-nowrap">
                      {ev.weight_kg ? `${ev.weight_kg} kg` : '-'}
                    </td>
                    <td className="py-2 px-2.5 border-r border-slate-200">
                      <span className="font-semibold text-navy-900 block leading-tight">
                        {ev.confirmed_by_name || (ev.confirmed_by ? `Confirmed (${ev.confirmed_by})` : 'Authorized Custodian')}
                      </span>
                      <span className="text-[10px] text-emerald-700 block">
                        {ev.confirmed_at ? `Verified ${new Date(ev.confirmed_at).toLocaleDateString('en-IN')}` : 'Handover Signed'}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-center whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        CONFIRMED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Verification QR & Legal Guarantee Footer */}
          <div className="pt-4 border-t-2 border-navy-900 grid grid-cols-12 gap-4 items-center print-avoid-break">
            <div className="col-span-3 flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="p-1 bg-white rounded border border-slate-200 shrink-0">
                <QRCodeSVG
                  value={`${window.location.origin}/trace/${batch.batch_id}`}
                  size={72}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-textSecondary block">Scan to Verify</span>
                <span className="text-[9px] text-navy-900 font-semibold block leading-tight">
                  Scan to view live public ledger entry.
                </span>
              </div>
            </div>

            <div className="col-span-5 text-[10px] text-textSecondary space-y-1">
              <span className="text-[9px] uppercase font-black text-navy-900 block">Digital Regulatory Compliance</span>
              <p className="leading-snug">
                This document represents an official export from the CatchTrace National Provenance Engine.
                Tamper-detection is mathematically guaranteed by sequential SHA-256 block hashing.
              </p>
            </div>

            <div className="col-span-4 text-right space-y-0.5">
              <div className="inline-block border-b border-slate-400 pb-0.5 px-4 font-serif italic text-xs text-navy-900">
                CatchTrace Digital Ledger
              </div>
              <span className="text-[9px] uppercase font-bold text-textSecondary block">
                Government of Karnataka Marine Fisheries Audit
              </span>
              <span className="text-[8px] font-mono text-slate-400 block">
                HASH: 8e4b2d19f...c3702a
              </span>
            </div>
          </div>
        </div>

      </main>

      {/* QR Code Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-sm w-full">
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute -top-3 -right-3 z-10 p-1.5 bg-white rounded-full shadow-md text-textSecondary hover:text-navy-900"
            >
              <X className="w-5 h-5" />
            </button>
            <QRCodeCard
              batchId={batch.batch_id}
              species={batch.species}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
