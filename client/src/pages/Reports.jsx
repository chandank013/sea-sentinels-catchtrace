import React, { useState, useEffect } from 'react';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import PageHeader from '../components/common/PageHeader';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  Download,
  Calendar,
  FileBarChart,
  Boxes,
  Scale,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reports() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [batches, setBatches] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [sum, bList, aList] = await Promise.all([
          api.getDashboardSummary(),
          api.getBatches(),
          api.getAlerts(),
        ]);
        setSummary(sum);
        setBatches(bList);
        setAlerts(aList);
      } catch (err) {
        toast.error('Failed to load reports data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleExportCsv = async () => {
    try {
      await api.exportCsv();
      toast.success('Traceability CSV Report downloaded!');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
        
        <PageHeader
          title={t('reports.title')}
          subtitle={t('reports.subtitle')}
        >
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ocean-600 hover:bg-ocean-700 text-white font-bold text-xs transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>{t('reports.exportMaster')}</span>
          </button>
        </PageHeader>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white rounded-ct p-4 sm:p-6 border border-borderLight shadow-subtle">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-textSecondary uppercase">{t('reports.totalBatches')}</span>
              <Boxes className="w-5 h-5 text-ocean-600" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900">{batches.length}</h3>
            <span className="text-xs text-textSecondary mt-1 block">{t('reports.regionKarnataka')}</span>
          </div>

          <div className="bg-white rounded-ct p-4 sm:p-6 border border-borderLight shadow-subtle">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-textSecondary uppercase">{t('reports.totalBiomass')}</span>
              <Scale className="w-5 h-5 text-sky-600" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
              {summary?.supplyChainStats?.totalWeightTrackedKg || '12,450 kg'}
            </h3>
            <span className="text-xs text-textSecondary mt-1 block">{t('reports.digitalScales')}</span>
          </div>

          <div className="bg-white rounded-ct p-4 sm:p-6 border border-borderLight shadow-subtle">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-textSecondary uppercase">{t('reports.avgTransit')}</span>
              <Clock className="w-5 h-5 text-tealbrand-500" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900">2.4 days</h3>
            <span className="text-xs text-textSecondary mt-1 block">{t('reports.landingToRetail')}</span>
          </div>

          <div className="bg-white rounded-ct p-4 sm:p-6 border border-borderLight shadow-subtle">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-textSecondary uppercase">{t('reports.totalAuditFlags')}</span>
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-navy-900">{alerts.length}</h3>
            <span className="text-xs text-emerald-700 font-semibold mt-1 block">
              {alerts.filter((a) => a.resolved).length} {t('reports.resolvedByOfficer')}
            </span>
          </div>
        </div>

        {/* Species Breakdown Table */}
        <div className="bg-white rounded-ct p-4 sm:p-6 border border-borderLight shadow-subtle">
          <h3 className="text-base font-bold text-navy-900 mb-1">{t('reports.speciesBreakdown')}</h3>
          <p className="text-xs text-textSecondary mb-4">{t('reports.speciesBreakdownSub')}</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-borderLight text-textSecondary font-bold uppercase tracking-wider">
                  <th className="p-3">Species</th>
                  <th className="p-3">Total Landed (kg)</th>
                  <th className="p-3">Avg Landing Price (₹/kg)</th>
                  <th className="p-3">Retail Price (₹/kg)</th>
                  <th className="p-3">Top Harbour</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight/60">
                {[
                  { name: 'Mackerel (Indian)', weight: '3,850 kg', landing: '₹140 - ₹160', retail: '₹260 - ₹290', harbour: 'Mangaluru Harbour' },
                  { name: 'Oil Sardine', weight: '4,620 kg', landing: '₹75 - ₹95', retail: '₹160 - ₹190', harbour: 'Malpe Harbour' },
                  { name: 'Silver Pomfret', weight: '1,450 kg', landing: '₹420 - ₹480', retail: '₹750 - ₹850', harbour: 'Mangaluru Harbour' },
                  { name: 'Yellowfin Tuna', weight: '1,890 kg', landing: '₹280 - ₹340', retail: '₹550 - ₹620', harbour: 'Karwar Harbour' },
                  { name: 'Tiger Prawns', weight: '980 kg', landing: '₹450 - ₹550', retail: '₹800 - ₹950', harbour: 'Malpe Harbour' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="p-3 font-bold text-navy-900">{row.name}</td>
                    <td className="p-3 font-mono font-semibold text-ocean-700">{row.weight}</td>
                    <td className="p-3 text-textPrimary">{row.landing}</td>
                    <td className="p-3 text-textPrimary">{row.retail}</td>
                    <td className="p-3 text-textSecondary">{row.harbour}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
