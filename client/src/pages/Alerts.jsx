import React, { useState, useEffect } from 'react';
import Navbar from '../components/navigation/Navbar';
import Footer from '../components/navigation/Footer';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import AlertTable from '../components/alerts/AlertTable';
import ResolveAlertModal from '../components/alerts/ResolveAlertModal';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  AlertTriangle,
  ShieldAlert,
  Scale,
  Clock,
  Layers,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Alerts() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active filter tab
  const [activeTypeTab, setActiveTypeTab] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected alert for resolution modal
  const [selectedAlert, setSelectedAlert] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts({
        type: activeTypeTab,
        status: statusFilter,
      });
      setAlerts(data);
    } catch (err) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [activeTypeTab, statusFilter]);

  const handleResolveAlert = async (alertId, note) => {
    await api.resolveAlert(alertId, note);
    fetchAlerts();
  };

  // Metrics calculation
  const totalOpen = alerts.filter((a) => !a.resolved).length;
  const highSeverity = alerts.filter((a) => a.severity === 'HIGH' && !a.resolved).length;
  const weightLossAlerts = alerts.filter((a) => a.type === 'WEIGHT_LOSS' && !a.resolved).length;
  const integrityAlerts = alerts.filter((a) => a.type === 'INTEGRITY' && !a.resolved).length;

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
        
        <PageHeader
          title={t('alerts.title')}
          subtitle={t('alerts.subtitle')}
        >
          <button
            onClick={() => {
              fetchAlerts();
              toast.success('Alerts refreshed');
            }}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-borderLight text-textSecondary hover:text-navy-900 transition-colors shadow-xs"
            title={t('actions.refresh')}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-ocean-600' : ''}`} />
          </button>
        </PageHeader>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title={t('alerts.totalOpen')}
            value={totalOpen}
            icon={AlertTriangle}
            trend="-1"
            trendLabel="since yesterday"
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
          <StatCard
            title={t('alerts.highSeverity')}
            value={highSeverity}
            icon={ShieldAlert}
            trend="Needs review"
            trendLabel="immediate action"
            iconColor="text-red-600"
            iconBg="bg-red-50"
          />
          <StatCard
            title={t('alerts.weightLoss')}
            value={weightLossAlerts}
            icon={Scale}
            trend=">20% drops"
            trendLabel="harbour audits"
            iconColor="text-ocean-600"
            iconBg="bg-ocean-50"
          />
          <StatCard
            title={t('alerts.integrityFailures')}
            value={integrityAlerts}
            icon={Layers}
            trend="Cryptographic"
            trendLabel="tamper checks"
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
        </div>

        {/* Filter Tabs matching reference mockup #9 */}
        <div className="bg-white rounded-ct p-3 border border-borderLight shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {[
              { type: 'ALL', label: t('alerts.tabAll') },
              { type: 'DUPLICATE', label: 'Duplicate Entries' },
              { type: 'WEIGHT_LOSS', label: t('alerts.tabWeight') },
              { type: 'TIME_GAP', label: t('alerts.tabDelays') },
              { type: 'MISSING_STEP', label: 'Missing Steps' },
              { type: 'INTEGRITY', label: t('alerts.tabIntegrity') },
            ].map((tab) => (
              <button
                key={tab.type}
                onClick={() => setActiveTypeTab(tab.type)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTypeTab === tab.type
                    ? 'bg-navy-900 text-white font-bold shadow-xs'
                    : 'bg-slate-50 text-textSecondary hover:bg-slate-100 hover:text-navy-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-textSecondary">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-borderLight text-xs font-semibold text-navy-900 bg-white cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open Only</option>
              <option value="RESOLVED">Resolved Only</option>
            </select>
          </div>

        </div>

        {/* Alerts Table Component */}
        <AlertTable
          alerts={alerts}
          onSelectAlert={(alt) => setSelectedAlert(alt)}
        />

      </main>

      {/* Resolve Alert Modal */}
      <ResolveAlertModal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        alert={selectedAlert}
        onResolve={handleResolveAlert}
      />

      <Footer />
    </div>
  );
}
