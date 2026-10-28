import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
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
  const { t } = useLanguage();
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
    window.print();
  };

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
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
        
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-borderLight shadow-subtle">
            <span className="text-[11px] font-semibold text-textSecondary uppercase block">Initial Weight</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-navy-900">{initialWeight}</span>
              <span className="text-xs text-textSecondary">kg</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-borderLight shadow-subtle">
            <span className="text-[11px] font-semibold text-textSecondary uppercase block">Latest Weight</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-navy-900">{currentWeight}</span>
              <span className="text-xs text-textSecondary">kg</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-borderLight shadow-subtle">
            <span className="text-[11px] font-semibold text-textSecondary uppercase block">Chain Events</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-navy-900">{eventCount}</span>
              <span className="text-xs text-textSecondary">steps</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-borderLight shadow-subtle">
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
          <div className="flex border-b border-borderLight px-6">
            {[
              { id: 'timeline', label: t('batchDetails.tabTimeline') },
              { id: 'details', label: t('batchDetails.tabChain') },
              { id: 'weight', label: t('batchDetails.tabWeight') },
              { id: 'alerts', label: t('alerts.title') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors relative ${
                  activeTab === tab.id
                    ? 'border-ocean-600 text-ocean-600'
                    : 'border-transparent text-textSecondary hover:text-navy-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            
            {/* TAB 1: Vertical Timeline */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <Timeline events={events} isPublic={false} />
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
                <div className="flex items-center justify-between">
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
