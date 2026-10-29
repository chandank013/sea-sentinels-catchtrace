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
  const { t, lang } = useLanguage();
  const isKn = lang === 'kn';
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

      {/* Hero Section — Full-Desktop Viewport Below Navbar */}
      <section className="relative overflow-hidden w-full min-h-[calc(100vh-72px)] flex items-center border-b border-borderLight/60 bg-gradient-to-r from-white via-white via-40% to-[#E8F4FC]">
        
        {/* Desktop Large Harbor Image Layer (63% width, 110% height, top: -5%) */}
        <img
          src="/images/catchtrace-hero.png"
          alt="Coastal Fishing Harbour and Ocean Catch"
          className="hidden lg:block hero-image select-none z-0"
          loading="eager"
        />

        {/* Foreground Content Container */}
        <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 relative z-10 py-8 lg:py-12">
          <div className={`w-full max-w-xl ${isKn ? 'lg:max-w-[620px] xl:max-w-[700px] 2xl:max-w-[780px] space-y-5' : 'lg:max-w-[560px] xl:max-w-[650px] 2xl:max-w-[720px] space-y-5'} text-left`}>
            
            {/* Headline: Clean 3 lines with prominent vertical gap */}
            <h1 className={`font-extrabold text-navy-900 tracking-tight flex flex-col gap-2 sm:gap-3 lg:gap-3.5 ${
              isKn
                ? 'text-2xl sm:text-3xl lg:text-[34px] xl:text-[40px] 2xl:text-[44px] leading-[1.35]'
                : 'text-3xl sm:text-4xl lg:text-[44px] xl:text-[52px] 2xl:text-[58px] leading-[1.18]'
            }`}>
              <span className="block">{t('home.heroTitle1', 'Trace Every Fish.')}</span>
              <span className="block text-ocean-600">{t('home.heroTitle2', 'Build a Transparent')}</span>
              <span className="block">{t('home.heroTitle3', 'and Trusted Supply Chain.')}</span>
            </h1>

            {/* Subtitle / Description */}
            <p className={`text-textSecondary leading-relaxed max-w-xl ${isKn ? 'text-sm sm:text-base lg:text-[16px] pt-0.5' : 'text-base sm:text-lg lg:text-[18px]'}`}>
              {t('home.heroSubtitle', 'One batch. One timeline. From landing to sale. Safe seafood for a healthier tomorrow.')}
            </p>

            {/* Action Buttons: on the same row on desktop */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1">
              <button
                onClick={() => setScannerOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-ocean-600 hover:bg-ocean-700 shadow-md hover:shadow-hover transition-all transform hover:-translate-y-0.5 w-full sm:w-auto"
              >
                <QrCode className="w-5 h-5 shrink-0" />
                <span>{t('home.scanCta', 'Scan a QR Code')}</span>
              </button>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-navy-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all w-full sm:w-auto"
              >
                <span>{t('home.exploreCta', 'Explore How It Works')}</span>
                <ArrowRight className="w-4 h-4 text-ocean-600 shrink-0" />
              </a>
            </div>

            {/* Fast Batch Lookup Search Form: max-w ~600-650px */}
            <div className="pt-2 w-full max-w-[620px]">
              <form
                onSubmit={handleLookup}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-ocean-500/20 focus-within:border-ocean-500 transition-all"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <div className="pl-2 text-textSecondary shrink-0">
                    <Search className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={lookupId}
                    onChange={(e) => setLookupId(e.target.value.toUpperCase())}
                    placeholder={t('home.lookupPlaceholder', 'Enter Batch ID (e.g. FB-20261028-0001)')}
                    className="flex-1 min-w-0 bg-transparent px-2 py-1.5 text-xs sm:text-sm font-mono uppercase focus:outline-none text-navy-900 font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shadow-xs w-full sm:w-auto"
                >
                  {t('actions.trace', 'Trace Batch')}
                </button>
              </form>
              <div className="mt-2.5 flex items-center gap-2 text-xs text-textSecondary">
                <span>{t('home.trySample', 'Try sample batch:')}</span>
                <button
                  type="button"
                  onClick={() => navigate('/trace/FB-20261028-0001')}
                  className="font-mono text-ocean-600 hover:underline font-semibold"
                >
                  FB-20261028-0001
                </button>
              </div>
            </div>

            {/* Mobile / Tablet Image Display (Stacked Below Content) */}
            <div className="block lg:hidden pt-4 relative w-full">
              <div className="relative w-full max-w-lg mx-auto">
                <img
                  src="/images/catchtrace-hero.png"
                  alt="Coastal Fishing Harbour and Ocean Catch"
                  className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-sm"
                  style={{ aspectRatio: '1024/426' }}
                  loading="eager"
                />
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
