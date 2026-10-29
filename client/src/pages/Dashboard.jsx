import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import SeverityBadge from '../components/common/SeverityBadge';
import PageHeader from '../components/common/PageHeader';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Boxes,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Clock,
  Scale,
  ShieldCheck,
  Truck,
  ArrowRight,
  PlusCircle,
  Anchor,
  ShoppingBag,
  Cpu,
  Store,
  MapPin,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import toast from 'react-hot-toast';

const SPECIES_COLORS = {
  Mackerel: '#0879D9',
  Tuna: '#0EA5E9',
  Pomfret: '#38BDF8',
  Sardine: '#0D9488',
  Prawns: '#123B63',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [summary, setSummary] = useState(null);
  const [recentBatches, setRecentBatches] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);

  const role = user?.role || 'ADMIN';
  const isAdmin = role === 'ADMIN';

  const loadData = async () => {
    setLoading(true);
    try {
      const [sum, batches, alerts] = await Promise.all([
        api.getDashboardSummary(user),
        api.getBatches({ user, scope: isAdmin ? 'all' : 'my' }),
        isAdmin ? api.getAlerts({ resolved: false }) : Promise.resolve([]),
      ]);
      setSummary(sum);
      setRecentBatches(batches.slice(0, 6));
      setRecentAlerts(alerts.slice(0, 5));
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Role Action Button Config
  const getRoleQuickAction = () => {
    if (role === 'FISHER') {
      return {
        to: '/batches/new',
        label: t('dashboard.recordLandingBtn'),
        icon: PlusCircle,
        desc: t('dashboard.quickFisherDesc'),
      };
    }
    if (role === 'TRADER') {
      return {
        to: '/add-event',
        label: t('dashboard.recordPurchaseBtn'),
        icon: ShoppingBag,
        desc: t('dashboard.quickTraderDesc'),
      };
    }
    if (role === 'PROCESSOR') {
      return {
        to: '/add-event',
        label: t('dashboard.recordProcessBtn'),
        icon: Cpu,
        desc: t('dashboard.quickProcDesc'),
      };
    }
    if (role === 'TRANSPORTER') {
      return {
        to: '/add-event',
        label: t('dashboard.recordTransportBtn'),
        icon: Truck,
        desc: t('dashboard.quickTransDesc'),
      };
    }
    if (role === 'SELLER') {
      return {
        to: '/add-event',
        label: t('dashboard.recordSaleBtn'),
        icon: Store,
        desc: t('dashboard.quickSaleDesc'),
      };
    }
    return {
      to: '/batches/new',
      label: t('batches.createNewBatch'),
      icon: PlusCircle,
      desc: t('dashboard.quickFisherDesc'),
    };
  };

  const quickAction = getRoleQuickAction();

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        
        {/* Page Header */}
        <PageHeader
          title={summary?.roleTitle || (isAdmin ? t('dashboard.title') : `${user?.roleLabel} Dashboard`)}
          subtitle={summary?.roleSubtitle || (isAdmin ? t('dashboard.subtitle') : `Operational supply chain activity for ${user?.org}`)}
        >
          {/* Date range filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-borderLight shadow-xs">
            <Calendar className="w-4 h-4 text-ocean-600" />
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                toast.success(`Filter updated: ${e.target.value}`);
              }}
              className="bg-transparent text-xs font-semibold text-navy-900 focus:outline-none cursor-pointer"
            >
              <option value="7days">{t('dashboard.filter7')}</option>
              <option value="30days">{t('dashboard.filter30')}</option>
              <option value="90days">{t('dashboard.filter90')}</option>
              <option value="all">{t('dashboard.filterAll')}</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              loadData();
              toast.success('Dashboard refreshed');
            }}
            disabled={loading}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-borderLight text-textSecondary hover:text-navy-900 transition-colors shadow-xs"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-ocean-600' : ''}`} />
          </button>
        </PageHeader>

        {/* 4 Statistics Cards tailored to current user role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title={summary?.statCard1?.title || t('dashboard.totalBatches')}
            value={summary?.statCard1?.value ?? (summary?.totalBatches || 0)}
            icon={Boxes}
            trend={summary?.statCard1?.trend || '+12%'}
            trendLabel={summary?.statCard1?.label || 'vs last month'}
            iconColor="text-ocean-600"
            iconBg="bg-ocean-50"
          />
          <StatCard
            title={summary?.statCard2?.title || t('dashboard.activeBatches')}
            value={summary?.statCard2?.value ?? (summary?.activeBatches || 0)}
            icon={Activity}
            trend={summary?.statCard2?.trend || '+5%'}
            trendLabel={summary?.statCard2?.label || 'in active transit'}
            iconColor="text-sky-600"
            iconBg="bg-sky-50"
          />
          <StatCard
            title={summary?.statCard3?.title || t('dashboard.completedSold')}
            value={summary?.statCard3?.value ?? (summary?.completedSold || 0)}
            icon={CheckCircle}
            trend={summary?.statCard3?.trend || '+18%'}
            trendLabel={summary?.statCard3?.label || 'delivered & sold'}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <StatCard
            title={summary?.statCard4?.title || t('dashboard.openAlerts')}
            value={summary?.statCard4?.value ?? (summary?.openAlerts || 0)}
            icon={isAdmin ? AlertTriangle : Scale}
            trend={summary?.statCard4?.trend || 'Nominal'}
            trendLabel={summary?.statCard4?.label || 'verified integrity'}
            iconColor={isAdmin ? 'text-amber-600' : 'text-ocean-600'}
            iconBg={isAdmin ? 'bg-amber-50' : 'bg-ocean-50'}
          />
        </div>

        {/* 2-Column Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Left Card: Volume by Species (Recharts Bar Chart) */}
          <div className="lg:col-span-7 bg-white rounded-ct p-4 sm:p-6 border border-borderLight shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-navy-900">
                  {isAdmin
                    ? t('dashboard.volumeBySpecies')
                    : role === 'FISHER'
                    ? t('dashboard.myCatchVolume')
                    : role === 'TRADER'
                    ? t('dashboard.procuredVolume')
                    : role === 'PROCESSOR'
                    ? t('dashboard.processedVolume')
                    : role === 'TRANSPORTER'
                    ? t('dashboard.transportVolume')
                    : t('dashboard.retailVolume')}
                </h3>
                <p className="text-xs text-textSecondary">
                  {isAdmin ? 'Total landed biomass across harbours' : `Breakdown for ${user?.org}`}
                </p>
              </div>
              <span className="text-xs font-semibold text-ocean-700 bg-ocean-50 px-2.5 py-1 rounded-full border border-ocean-100">
                Total: {summary?.supplyChainStats?.totalWeightTrackedKg ?? (summary?.speciesChartData ? `${summary.speciesChartData.reduce((acc, curr) => acc + curr.weight, 0).toLocaleString()} kg` : '0 kg')}
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary?.speciesChartData || []}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#62748A', fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#62748A', fontSize: 12 }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#F1F5F9' }}
                    contentStyle={{
                      backgroundColor: '#0B2545',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(val) => [`${val.toLocaleString()} kg`, 'Weight']}
                  />
                  <Bar dataKey="weight" radius={[6, 6, 0, 0]}>
                    {(summary?.speciesChartData || []).map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={SPECIES_COLORS[entry.name] || '#0879D9'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Card: Role Supply Chain Overview Metrics */}
          <div className="lg:col-span-5 bg-white rounded-ct p-4 sm:p-6 border border-borderLight shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-borderLight">
                <h3 className="text-base font-bold text-navy-900">
                  {isAdmin ? t('dashboard.supplyChainOverview') : `${t(`roles.${role.toLowerCase()}`, user?.roleLabel)} ${t('dashboard.keyPerformance')}`}
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {t('dashboard.liveStream')}
                </span>
              </div>

              {/* Big Metric */}
              <div className="py-5 flex items-center gap-4 border-b border-borderLight/60">
                <div className="w-14 h-14 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center shrink-0">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-textSecondary uppercase tracking-wide">
                    {summary?.supplyChainStats?.stat1Label || t('dashboard.avgLandingToSale')}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-extrabold text-navy-900">
                      {summary?.supplyChainStats?.avgLandingToSaleDays || '2.4'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metric Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-5">
                
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-textSecondary text-[11px] font-semibold mb-1">
                    <Scale className="w-3.5 h-3.5 text-ocean-600" />
                    <span>{summary?.supplyChainStats?.stat2Label || 'Total Weight'}</span>
                  </div>
                  <span className="text-base font-bold text-navy-900">
                    {summary?.supplyChainStats?.totalWeightTrackedKg ?? (isAdmin ? '12,450 kg' : '0 kg')}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-textSecondary text-[11px] font-semibold mb-1">
                    <Truck className="w-3.5 h-3.5 text-tealbrand-500" />
                    <span>{summary?.supplyChainStats?.stat3Label || 'Deliveries'}</span>
                  </div>
                  <span className="text-base font-bold text-navy-900">
                    {summary?.supplyChainStats?.successfulDeliveryRate || '100%'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 col-span-1 sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-textSecondary text-[11px] font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{summary?.supplyChainStats?.stat4Label || t('dashboard.verifiedBatches')}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">
                      {summary?.supplyChainStats?.integrityVerifiedRate || '100%'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: summary?.supplyChainStats?.integrityVerifiedRate || '100%' }}></div>
                  </div>
                </div>

              </div>
            </div>

            <div className="pt-4 border-t border-borderLight/60 mt-4 text-xs text-textSecondary flex items-center justify-between">
              <span>{user?.location || 'Karnataka Coastal Fisheries'}</span>
              <NavLink to="/batches" className="text-ocean-600 font-semibold hover:underline flex items-center gap-1">
                <span>{isAdmin ? t('dashboard.viewAllBatches') : t('dashboard.viewMyBatches')}</span>
                <ArrowRight className="w-3 h-3" />
              </NavLink>
            </div>
          </div>

        </div>

        {/* Bottom Section: Admin gets Recent Alerts & Batches; Handlers get Recent Batches & Operational Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Section 1 */}
          {isAdmin ? (
            /* ADMIN: Recent Alerts Section */
            <div className="lg:col-span-6 bg-white rounded-ct p-4 sm:p-6 border border-borderLight shadow-subtle">
              <div className="flex items-center justify-between pb-3 border-b border-borderLight mb-3">
                <div>
                  <h3 className="text-base font-bold text-navy-900">{t('dashboard.recentAlerts')}</h3>
                  <p className="text-xs text-textSecondary">{lang === 'kn' ? 'ರಾಜ್ಯಮಟ್ಟದ ಸ್ವಯಂಚಾಲಿತ ನಿಯಮ ಉಲ್ಲಂಘನೆಗಳು' : 'State-wide automated rule violations'}</p>
                </div>
                <NavLink
                  to="/alerts"
                  className="text-xs font-bold text-ocean-600 hover:text-ocean-700 hover:underline flex items-center gap-1"
                >
                  <span>{t('dashboard.viewAll')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>

              <div className="divide-y divide-borderLight/60">
                {recentAlerts.map((alt) => (
                  <div key={alt.id} className="py-3 flex items-start justify-between gap-3 text-xs hover:bg-slate-50 transition-colors rounded-lg px-2">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        <SeverityBadge severity={alt.severity} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <NavLink to={`/batches/${alt.batch_id}`} className="font-mono font-bold text-ocean-700 hover:underline">
                            {alt.batch_id}
                          </NavLink>
                          <span className="font-semibold text-navy-900">{alt.typeLabel || alt.type}</span>
                        </div>
                        <p className="text-textSecondary mt-0.5 line-clamp-1">{alt.description}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-textSecondary whitespace-nowrap">{alt.time}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* NON-ADMIN: Operational Guide Card */
            <div className="lg:col-span-6 bg-white rounded-ct p-4 sm:p-6 border border-borderLight shadow-subtle flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-borderLight mb-3">
                  <h3 className="text-base font-bold text-navy-900">
                    {t('dashboard.guidelinesTitle')}
                  </h3>
                  <span className="text-[11px] font-bold text-ocean-700 bg-ocean-50 px-2 py-0.5 rounded">
                    {t('dashboard.protocol')}
                  </span>
                </div>

                <div className="space-y-3 text-xs text-textSecondary">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy-900 block font-semibold">{t('dashboard.guide1Title')}</strong>
                      {t('dashboard.guide1Desc')}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                    <Scale className="w-4 h-4 text-ocean-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy-900 block font-semibold">{t('dashboard.guide2Title')}</strong>
                      {t('dashboard.guide2Desc')}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-navy-900 block font-semibold">{t('dashboard.guide3Title')}</strong>
                      {t('dashboard.guide3Desc')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-borderLight mt-4">
                <NavLink
                  to={quickAction.to}
                  className="w-full py-2.5 rounded-xl bg-ocean-50 hover:bg-ocean-100 text-ocean-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>{quickAction.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NavLink>
              </div>
            </div>
          )}

          {/* Section 2: Recent Batches */}
          <div className="lg:col-span-6 bg-white rounded-ct p-4 sm:p-6 border border-borderLight shadow-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-borderLight mb-3">
              <div>
                <h3 className="text-base font-bold text-navy-900">
                  {isAdmin ? t('dashboard.recentBatches') : `${t('dashboard.myRecentBatches')} (${recentBatches.length})`}
                </h3>
                <p className="text-xs text-textSecondary">
                  {isAdmin ? t('dashboard.recentBatchesSub') : `${t('dashboard.recentBatchesSub')} (${user?.org})`}
                </p>
              </div>
              <NavLink
                to="/batches"
                className="text-xs font-bold text-ocean-600 hover:text-ocean-700 hover:underline flex items-center gap-1"
              >
                <span>{t('dashboard.viewAll')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>

            {recentBatches.length === 0 ? (
              <div className="p-8 text-center text-xs text-textSecondary bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-semibold text-navy-900 mb-1">{t('dashboard.noBatchesYet')} ({user?.name})</p>
                <p className="mb-3">{t('dashboard.noBatchesStart')}</p>
                <NavLink
                  to={quickAction.to}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-ocean-600 text-white font-bold text-xs"
                >
                  {quickAction.label}
                </NavLink>
              </div>
            ) : (
              <div className="divide-y divide-borderLight/60">
                {recentBatches.map((b) => (
                  <div key={b.batch_id} className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition-colors rounded-lg px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-ocean-50 text-ocean-700 flex items-center justify-center font-bold text-xs">
                        {b.species.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <NavLink to={`/batches/${b.batch_id}`} className="font-mono font-bold text-ocean-700 hover:underline">
                            {b.batch_id}
                          </NavLink>
                          <span className="font-bold text-navy-900">{t(`species.${b.species}`, b.species)}</span>
                        </div>
                        <span className="text-[11px] text-textSecondary">
                          {t(`harbours.${b.landing_centre}`, b.landing_centre)} • {b.current_weight_kg || b.initial_weight_kg} kg
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={b.status} />
                      <NavLink
                        to={`/batches/${b.batch_id}`}
                        className="p-1 rounded text-textSecondary hover:text-ocean-600"
                        title="View details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </NavLink>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
