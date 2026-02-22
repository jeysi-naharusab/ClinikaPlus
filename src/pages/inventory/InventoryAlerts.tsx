import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, X, Pencil, Pill } from 'lucide-react';
import Pagination from '../../components/ui/Pagination.tsx';
import { inventoryItems } from '../../data/mockData';

type Severity = 'critical' | 'warning';

type InventoryAlert = {
  id: string;
  name: string;
  category: string;
  lowStock: number;
  expiry: string;
  suggestedRestock: number;
  unit: string;
  severity: Severity;
};

const ALERTS_PAGE_SIZE = 6;
type InventoryRow = (typeof inventoryItems)[number];

const severityColors = {
  critical: 'border-red-300 bg-red-50',
  warning: 'border-amber-300 bg-amber-50',
};

export default function InventoryAlerts() {
  const [severityFilter, setSeverityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<InventoryRow | null>(null);

  const alerts = useMemo<InventoryAlert[]>(() => {
    return inventoryItems
      .filter((item) => item.stock < item.reorder || item.status === 'Critical')
      .map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        lowStock: item.stock,
        expiry: item.expiry,
        suggestedRestock: Math.max(item.reorder - item.stock, item.reorder),
        unit: item.unit,
        severity: item.stock <= 0 || item.status === 'Critical' ? 'critical' : 'warning',
      }));
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      return (
        (severityFilter === '' || alert.severity === severityFilter) &&
        (categoryFilter === '' || alert.category.toLowerCase().includes(categoryFilter.toLowerCase()))
      );
    });
  }, [severityFilter, categoryFilter, alerts]);

  const criticalAlerts = useMemo(() => alerts.filter((alert) => alert.severity === 'critical'), [alerts]);
  const warningAlerts = useMemo(() => alerts.filter((alert) => alert.severity === 'warning'), [alerts]);

  const alertCategoryOptions = useMemo(() => {
    const categories = Array.from(new Set(alerts.map((alert) => alert.category)));
    categories.sort((a, b) => a.localeCompare(b));
    return categories;
  }, [alerts]);

  const topCriticalCategories = useMemo(() => {
    const counts = criticalAlerts.reduce<Record<string, number>>((acc, alert) => {
      acc[alert.category] = (acc[alert.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([category]) => category);
  }, [criticalAlerts]);

  const topWarningCategories = useMemo(() => {
    const counts = warningAlerts.reduce<Record<string, number>>((acc, alert) => {
      acc[alert.category] = (acc[alert.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  }, [warningAlerts]);

  const mostAffectedCategory = useMemo(() => {
    if (alerts.length === 0) return 'None';
    const counts = alerts.reduce<Record<string, number>>((acc, alert) => {
      acc[alert.category] = (acc[alert.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [alerts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [severityFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / ALERTS_PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedAlerts = filteredAlerts.slice((currentPage - 1) * ALERTS_PAGE_SIZE, currentPage * ALERTS_PAGE_SIZE);

  function getMedicationMeta(item: InventoryRow) {
    return {
      batch: item.batch,
      category: item.category,
      supplier: 'PharmaPlus',
      suggestedRestock: `${item.reorder} ${item.unit}`,
      lastUpdated: 'Feb 08, 2026',
    };
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold tracking-tight text-gray-800">Inventory | Inventory Alerts</h1>

      <section className="rounded-2xl bg-gray-300/80 p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-100 p-4">
            <div className="flex items-start justify-between">
              <p className="text-lg text-gray-500 font-semibold">Critical Medications</p>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
                <AlertTriangle className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-4xl font-bold text-red-500">{criticalAlerts.length} Medications</p>
            <p className="mt-1 text-base font-semibold text-gray-800">Needs Immediate Restock</p>
            <p className="mt-3 text-sm text-gray-600">
              Categories: {topCriticalCategories.length > 0 ? topCriticalCategories.join(', ') : 'None'}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-100 p-4">
            <div className="flex items-start justify-between">
              <p className="text-lg text-gray-500 font-semibold">High-Risk Medications</p>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">
                <AlertTriangle className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-4xl font-bold text-amber-500">{warningAlerts.length} Medications</p>
            <p className="mt-1 text-base font-semibold text-gray-800">Expiring Soon / Low Stock</p>
            <p className="mt-3 text-sm text-gray-600">
              Categories: {topWarningCategories.length > 0 ? topWarningCategories.join(', ') : 'None'}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-100 p-4">
            <div className="flex items-start justify-between">
              <p className="text-lg text-gray-500 font-semibold">Most Affected Category</p>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                <AlertTriangle className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-4xl font-bold text-blue-600">{mostAffectedCategory}</p>
            <p className="mt-2 text-base font-semibold text-gray-800">Critical &amp; High Risks: {alerts.length}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-gray-100 p-4 md:p-5">
          <div className="mb-5 flex flex-wrap items-center justify-end gap-2">
            <div className="relative">
              <select
                className="appearance-none h-10 pl-3 pr-8 border border-gray-300 rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="">Severity</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                className="appearance-none h-10 pl-3 pr-8 border border-gray-300 rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Category</option>
                {alertCategoryOptions.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pagedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 ${severityColors[alert.severity as keyof typeof severityColors] || 'border-gray-300 bg-gray-50'}`}
              >
                <p className={`text-sm font-semibold ${alert.severity === 'critical' ? 'text-red-500' : 'text-amber-600'}`}>
                  {alert.name} - {alert.category}
                </p>
                <div className="mt-2 text-sm text-gray-800 leading-6">
                  <p>Stock: {alert.lowStock} {alert.unit}</p>
                  <p>Expiry: {alert.expiry}</p>
                  <p>Suggested Restock: {alert.suggestedRestock} {alert.unit}</p>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <button
                    className="text-blue-600 hover:text-blue-700"
                    onClick={() => {
                      const matchedItem = inventoryItems.find((item) => item.id === alert.id);
                      if (matchedItem) setSelectedItem(matchedItem);
                    }}
                  >
                    View
                  </button>
                  <button className="text-blue-600 hover:text-blue-700">Create Restock Request</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <p className="text-sm text-gray-600">Showing {pagedAlerts.length} out of {filteredAlerts.length}</p>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </section>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-[1px]" onClick={() => setSelectedItem(null)}>
          <div className="w-full max-w-[460px] rounded-2xl border border-gray-300 bg-gray-100 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between border-b border-gray-300 pb-3">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-blue-600">
                <Pill size={18} />
                Medication Details
              </h2>
              <div className="flex items-center gap-1.5">
                <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-gray-600 hover:text-gray-700">
                  <Pencil size={14} />
                </button>
                <button type="button" onClick={() => setSelectedItem(null)} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-gray-600 hover:text-gray-700">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-2.5 font-semibold text-gray-700">
              <p>Medication Name: <span className="font-bold text-gray-800">{selectedItem.name}</span></p>
              <p>Batch: <span className="font-bold text-gray-800">{getMedicationMeta(selectedItem).batch}</span></p>
              <div className="my-2 border-b border-gray-300" />
              <p>Category: <span className="font-bold text-gray-800">{getMedicationMeta(selectedItem).category}</span></p>
              <p>Stock: <span className="font-bold text-gray-800">{selectedItem.stock} {selectedItem.unit}</span></p>
              <p>Threshold: <span className="font-bold text-gray-800">{selectedItem.reorder} {selectedItem.unit}</span></p>
              <p>Expiry: <span className="font-bold text-gray-800">{selectedItem.expiry}</span></p>
              <p className="flex items-center gap-2">
                Status:
                <span
                  className={`inline-flex min-w-[64px] justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
                    selectedItem.status === 'Critical'
                      ? 'bg-red-100 text-red-500'
                      : selectedItem.status === 'Low'
                        ? 'bg-amber-100 text-amber-500'
                        : 'bg-green-100 text-green-500'
                  }`}
                >
                  {selectedItem.status === 'Adequate' ? 'OK' : selectedItem.status}
                </span>
              </p>
              <p>Supplier: <span className="font-bold text-gray-800">{getMedicationMeta(selectedItem).supplier}</span></p>
              <p>Suggested Restock: <span className="font-bold text-gray-800">{getMedicationMeta(selectedItem).suggestedRestock}</span></p>
              <p>Last Updated: <span className="font-bold text-gray-800">{getMedicationMeta(selectedItem).lastUpdated}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
