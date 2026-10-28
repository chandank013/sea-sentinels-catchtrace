import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/navigation/PublicNavbar';
import Footer from '../components/navigation/Footer';
import { useLanguage } from '../context/LanguageContext';
import {
  QrCode,
  ShieldCheck,
  Search,
  ArrowRight,
  Anchor,
  ShoppingBag,
  Cpu,
  Truck,
  Store,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import QRScannerModal from '../components/qr/QRScannerModal';
import toast from 'react-hot-toast';

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [lookupId, setLookupId] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleLookup = (e) => {
    e.preventDefault();
    if (!lookupId.trim()) {
      toast.error('Please enter a valid Batch ID');
      return;
    }
    navigate(`/trace/${lookupId.trim()}`);
  };

  const supplyChainSteps = [
    {
      id: 'landing',
      title: t('home.step1'),
      desc: t('home.step1Desc'),
      icon: Anchor,
      role: 'Fisher',
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      id: 'purchase',
      title: t('home.step2'),
      desc: t('home.step2Desc'),
      icon: ShoppingBag,
      role: 'Trader',
      bg: 'bg-sky-50 text-sky-600 border-sky-200',
    },
    {
      id: 'processing',
      title: t('home.step3'),
      desc: t('home.step3Desc'),
      icon: Cpu,
      role: 'Processor',
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      id: 'transport',
      title: t('home.step4'),
      desc: t('home.step4Desc'),
      icon: Truck,
      role: 'Transporter',
      bg: 'bg-teal-50 text-teal-600 border-teal-200',
    },
    {
      id: 'sale',
      title: t('home.step5'),
      desc: t('home.step5Desc'),
      icon: Store,
      role: 'Seller',
      bg: 'bg-amber-50 text-amber-600 border-amber-200',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <PublicNavbar />

      {/* Hero Section matching mockup #1 */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-borderLight/60 bg-gradient-to-b from-white via-ocean-50/30 to-page">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline, Subtitle & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-900 leading-[1.15] tracking-tight">
                {t('home.heroTitle1')}<br />
                <span className="text-ocean-600">{t('home.heroTitle2')}</span> {t('home.heroTitle3')}
              </h1>

              <p className="text-base sm:text-lg text-textSecondary leading-relaxed max-w-xl">
                {t('home.heroSubtitle')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setScannerOpen(true)}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-ocean-600 hover:bg-ocean-700 shadow-md hover:shadow-hover transition-all transform hover:-translate-y-0.5"
                >
                  <QrCode className="w-5 h-5" />
                  <span>{t('home.scanCta')}</span>
                </button>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-navy-900 bg-white hover:bg-slate-50 border border-borderLight shadow-sm transition-all"
                >
                  <span>{t('home.exploreCta')}</span>
                  <ArrowRight className="w-4 h-4 text-ocean-600" />
                </a>
              </div>

              {/* Fast Batch Lookup Input */}
              <div className="pt-4 max-w-md">
                <form onSubmit={handleLookup} className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-borderLight shadow-sm">
                  <div className="pl-3 text-textSecondary">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={lookupId}
                    onChange={(e) => setLookupId(e.target.value.toUpperCase())}
                    placeholder={t('home.lookupPlaceholder')}
                    className="flex-1 bg-transparent px-2 py-2 text-xs font-mono uppercase focus:outline-none text-navy-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    {t('actions.trace')}
                  </button>
                </form>
                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-textSecondary">
                  <span>{t('home.trySample')}</span>
                  <button
                    type="button"
                    onClick={() => navigate('/trace/FB-20261028-0001')}
                    className="font-mono text-ocean-600 hover:underline font-semibold"
                  >
                    FB-20261028-0001
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Coastal Harbour & Seafood Image Container matching reference */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 aspect-[4/3] group">
                <img
                  src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1000&auto=format&fit=crop&q=80"
                  alt="Mangaluru Fishing Harbour and Boats"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Soft blue gradient overlay matching mockup */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-navy-900/20 to-transparent"></div>

                {/* Floating Status Pill */}
                <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-white/60 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-navy-900">{t('home.verifiedBanner')}</h4>
                      <p className="text-[11px] text-textSecondary">{t('home.verifiedSub')}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                    {t('home.intactBadge')}
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Indicators (4 Cards) matching reference mockup */}
      <section className="py-12 bg-white border-b border-borderLight/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-2xl bg-page border border-borderLight hover:border-ocean-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-ocean-100 text-ocean-700 flex items-center justify-center mb-3 font-bold">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">{t('home.trust1Title')}</h3>
              <p className="text-xs text-textSecondary mt-1 leading-relaxed">{t('home.trust1Desc')}</p>
            </div>

            <div className="p-5 rounded-2xl bg-page border border-borderLight hover:border-ocean-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">{t('home.trust2Title')}</h3>
              <p className="text-xs text-textSecondary mt-1 leading-relaxed">{t('home.trust2Desc')}</p>
            </div>

            <div className="p-5 rounded-2xl bg-page border border-borderLight hover:border-ocean-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-3 font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">{t('home.trust3Title')}</h3>
              <p className="text-xs text-textSecondary mt-1 leading-relaxed">{t('home.trust3Desc')}</p>
            </div>

            <div className="p-5 rounded-2xl bg-page border border-borderLight hover:border-ocean-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 font-bold">
                <Anchor className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">{t('home.trust4Title')}</h3>
              <p className="text-xs text-textSecondary mt-1 leading-relaxed">{t('home.trust4Desc')}</p>
            </div>

          </div>
        </div>
      </section>

      {/* Horizontal Supply Chain Visual Journey (Landing -> Purchase -> Processing -> Transport -> Sale) */}
      <section id="process" className="py-16 md:py-20 bg-page">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-ocean-600 bg-ocean-50 px-3 py-1 rounded-full border border-ocean-100">
              {t('home.processBadge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mt-3">
              {t('home.processTitle')}
            </h2>
            <p className="text-sm text-textSecondary mt-2">
              {t('home.processSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {supplyChainSteps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.id}
                  className="bg-white rounded-2xl p-6 border border-borderLight shadow-subtle hover:shadow-card transition-all text-left flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${step.bg}`}>
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                      {t('home.stage')} 0{index + 1} · {t(`roles.${step.role.toLowerCase()}`, step.role)}
                    </span>
                    <h3 className="text-lg font-bold text-navy-900 mt-1">{step.title}</h3>
                    <p className="text-xs text-textSecondary mt-2 leading-relaxed">{step.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-ocean-700 font-semibold">
                    <span>{t('home.cryptoBlock')} #{index + 1}</span>
                    <span>✓</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section id="how-it-works" className="py-16 bg-white border-y border-borderLight/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-900">{t('home.howItWorksTitle')}</h2>
          <p className="text-sm text-textSecondary mt-2 max-w-xl mx-auto">
            {t('home.howItWorksSub')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="w-8 h-8 rounded-full bg-ocean-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="text-lg font-bold text-navy-900">{t('home.hwStep1Title')}</h3>
              <p className="text-xs text-textSecondary mt-2 leading-relaxed">
                {t('home.hwStep1Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="w-8 h-8 rounded-full bg-ocean-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="text-lg font-bold text-navy-900">{t('home.hwStep2Title')}</h3>
              <p className="text-xs text-textSecondary mt-2 leading-relaxed">
                {t('home.hwStep2Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="w-8 h-8 rounded-full bg-ocean-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="text-lg font-bold text-navy-900">{t('home.hwStep3Title')}</h3>
              <p className="text-xs text-textSecondary mt-2 leading-relaxed">
                {t('home.hwStep3Desc')}
              </p>
            </div>

          </div>
        </div>
      </section>

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
