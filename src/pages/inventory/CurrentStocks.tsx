import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Button from '../../components/ui/Button.tsx';
import Pagination from '../../components/ui/Pagination.tsx';
import { Plus, X, Search, ChevronDown, Boxes, AlertTriangle, PackageX, CheckCircle2, Pencil, Pill } from 'lucide-react';
import { DEFAULT_PAGE_SIZE, inventoryItems } from '../../data/mockData';

type InventoryStatus = 'Adequate' | 'Low' | 'Critical';

type InventoryRow = (typeof inventoryItems)[number];

export default function CurrentStocks() {
  const [items, setItems] = useState<InventoryRow[]>(inventoryItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<typeof items[0] | null>(null);
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterMonth, setFilterMonth] = useState('This Month');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);
  const [isAddedSuccessOpen, setIsAddedSuccessOpen] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    category: 'Diabetes Care',
    batch: '',
    reorder: '',
    expiry: '',
    supplier: '',
    status: 'Adequate' as InventoryStatus,
  });

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All Status' || item.status === filterStatus;
      const matchesCategory = filterCategory === 'All Categories' || item.category === filterCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchTerm, filterStatus, filterCategory, items]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / DEFAULT_PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * DEFAULT_PAGE_SIZE;
  const pagedItems = filteredItems.slice(startIndex, startIndex + DEFAULT_PAGE_SIZE);
  const belowThresholdItems = useMemo(() => items.filter((item) => item.stock < item.reorder), [items]);
  const criticalItemsCount = useMemo(() => items.filter((item) => item.status === 'Critical').length, [items]);
  const outOfStockCount = useMemo(() => items.filter((item) => item.stock <= 0).length, [items]);

  const mostAffectedCategory = useMemo(() => {
    if (belowThresholdItems.length === 0) return 'None';
    const counts = belowThresholdItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [belowThresholdItems]);

  const categoryOptions = useMemo(() => {
    const categories = Array.from(new Set(items.map((item) => item.category)));
    categories.sort((a, b) => a.localeCompare(b));
    return categories;
  }, [items]);

  function handleAddMedicationSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextReorder = Number(newMedication.reorder || 0);
    const nextStock = nextReorder || 1;

    const nextItem: InventoryRow = {
      id: `I-${String(items.length + 1).padStart(3, '0')}`,
      name: newMedication.name || 'New Medication',
      category: newMedication.category || 'General Medicine',
      batch: newMedication.batch || `NEW-${Date.now()}`,
      stock: nextStock,
      unit: 'pcs',
      status: newMedication.status,
      expiry: newMedication.expiry || '2027-01-01',
      reorder: nextReorder,
    };

    setItems((prev) => [nextItem, ...prev]);
    setIsAddMedicationOpen(false);
    setIsAddedSuccessOpen(true);
    setNewMedication({
      name: '',
      category: 'Diabetes Care',
      batch: '',
      reorder: '',
      expiry: '',
      supplier: '',
      status: 'Adequate',
    });
    setCurrentPage(1);
  }

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">Inventory | Current Stocks</h1>
      </div>

      <section className="rounded-2xl bg-gray-300/80 p-5 space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-gray-200 bg-gray-100 p-4">
            <div className="flex items-start justify-between">
              <p className="text-lg font-semibold text-gray-500">Inventory Health</p>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/90 text-white">
                <Boxes className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-3 text-4xl font-bold text-blue-600">{items.length} Products</p>
            <p className="mt-1 text-base font-semibold text-gray-800">Tracked in active inventory</p>
            <p className="mt-2 text-sm text-gray-700">Below Threshold: {belowThresholdItems.length} | Out of Stock: {outOfStockCount}</p>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-gray-100 p-4">
            <div className="flex items-start justify-between">
              <p className="text-lg font-semibold text-gray-500">Critical Items</p>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/90 text-white">
                <AlertTriangle className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-3 text-4xl font-bold text-amber-500">{criticalItemsCount} Medications</p>
            <p className="mt-1 text-base font-semibold text-gray-800">Below reorder threshold</p>
            <p className="mt-2 text-sm text-gray-700">Most Affected: {mostAffectedCategory}</p>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-gray-100 p-4">
            <div className="flex items-start justify-between">
              <p className="text-lg font-semibold text-gray-500">Out of Stock</p>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500/90 text-white">
                <PackageX className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-3 text-4xl font-bold text-red-500">{outOfStockCount} Medications</p>
            <p className="mt-1 text-base font-semibold text-gray-800">Unavailable for dispensing</p>
            <p className="mt-2 text-sm text-gray-700">{outOfStockCount > 0 ? 'Immediate restock required' : 'No stock-out items currently'}</p>
          </article>
        </div>

        <div className="rounded-2xl bg-gray-100 p-4 md:p-5">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-5">
            <div className="flex w-full md:w-auto items-center gap-2">
              <div className="w-full md:w-72 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search Medication"
                  className="w-full h-10 pl-9 pr-4 border border-gray-300 rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                className="inline-flex h-10 items-center gap-2 whitespace-nowrap bg-green-600 pl-3 pr-4 py-1.5 text-sm text-white hover:bg-green-700"
                onClick={() => setIsAddMedicationOpen(true)}
              >
                <Plus size={16} className="shrink-0" />
                Add Medication
              </Button>

              <div className="relative">
                <select
                  className="appearance-none h-10 pl-3 pr-8 border border-gray-300 rounded-lg bg-gray-100 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option>All Categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  className="appearance-none h-10 pl-3 pr-8 border border-gray-300 rounded-lg bg-gray-100 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option>All Status</option>
                  <option>Adequate</option>
                  <option>Low</option>
                  <option>Critical</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  className="appearance-none h-10 pl-3 pr-8 border border-gray-300 rounded-lg bg-gray-100 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                >
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>Last 3 Months</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl">
            <table className="w-full table-fixed text-xs md:text-sm">
              <thead className="bg-gray-200/90 text-gray-700">
                <tr>
                  <th className="w-[7%] px-2 py-1.5 text-left font-semibold">#</th>
                  <th className="w-[18%] px-2 py-1.5 text-left font-semibold">Medication Name</th>
                  <th className="w-[14%] px-2 py-1.5 text-left font-semibold">Category</th>
                  <th className="w-[13%] px-2 py-1.5 text-left font-semibold">Batch</th>
                  <th className="w-[12%] px-2 py-1.5 text-left font-semibold">Stock</th>
                  <th className="w-[12%] px-2 py-1.5 text-left font-semibold">Threshold</th>
                  <th className="w-[12%] px-2 py-1.5 text-left font-semibold">Expiry Date</th>
                  <th className="w-[7%] px-2 py-1.5 text-left font-semibold">Status</th>
                  <th className="w-[5%] px-2 py-1.5 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {pagedItems.map((item, idx) => (
                  <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-200/40">
                    <td className="px-2 py-1.5 font-semibold text-gray-800">#{String(startIndex + idx + 1).padStart(3, '0')}</td>
                    <td className="px-2 py-1.5 text-gray-800 truncate" title={item.name}>{item.name}</td>
                    <td className="px-2 py-1.5 text-gray-700 truncate" title={item.category}>{item.category}</td>
                    <td className="px-2 py-1.5 text-gray-700 truncate" title={item.batch}>{item.batch}</td>
                    <td className="px-2 py-1.5 font-semibold text-gray-800 truncate">{item.stock} {item.unit}</td>
                    <td className="px-2 py-1.5 text-gray-700 truncate">{item.reorder} {item.unit}</td>
                    <td className="px-2 py-1.5 text-gray-800">{item.expiry}</td>
                    <td className="px-2 py-1.5">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'Critical'
                            ? 'bg-red-100 text-red-700'
                            : item.status === 'Low'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      <button onClick={() => setSelectedItem(item)} className="text-blue-600 hover:text-blue-700 font-semibold">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-gray-600">
            <p>
              Showing <span className="rounded-md bg-gray-300 px-2">{pagedItems.length}</span> out of {filteredItems.length}
            </p>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </section>

      {selectedItem && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/20 p-4 pb-6 pt-20 backdrop-blur-[1px]" onClick={() => setSelectedItem(null)}>
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

      {isAddMedicationOpen && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/20 p-4 pb-6 pt-20 backdrop-blur-[1px]" onClick={() => setIsAddMedicationOpen(false)}>
          <form
            className="w-full max-w-[460px] rounded-2xl border border-gray-300 bg-gray-100 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleAddMedicationSubmit}
          >
            <div className="mb-4 flex items-center justify-between border-b border-gray-300 pb-3">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-700">
                <Pill size={16} />
                Add Medication
              </h2>
              <button type="button" onClick={() => setIsAddMedicationOpen(false)} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-300 text-gray-600 hover:text-gray-700">
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="text-sm text-gray-700">
                Medication Name
                <input
                  required
                  className="mt-1 h-9 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication((prev) => ({ ...prev, name: e.target.value }))}
                />
              </label>
              <label className="text-sm text-gray-700">
                Category
                <input
                  className="mt-1 h-9 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm"
                  value={newMedication.category}
                  onChange={(e) => setNewMedication((prev) => ({ ...prev, category: e.target.value }))}
                />
              </label>
              <label className="text-sm text-gray-700">
                Threshold
                <input
                  type="number"
                  required
                  min={0}
                  className="mt-1 h-9 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm"
                  value={newMedication.reorder}
                  onChange={(e) => setNewMedication((prev) => ({ ...prev, reorder: e.target.value }))}
                />
              </label>
              <label className="text-sm text-gray-700">
                Batch
                <input
                  className="mt-1 h-9 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm"
                  value={newMedication.batch}
                  onChange={(e) => setNewMedication((prev) => ({ ...prev, batch: e.target.value }))}
                />
              </label>
              <label className="text-sm text-gray-700">
                Expiry Date
                <input
                  type="date"
                  required
                  className="mt-1 h-9 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm"
                  value={newMedication.expiry}
                  onChange={(e) => setNewMedication((prev) => ({ ...prev, expiry: e.target.value }))}
                />
              </label>
              <label className="text-sm text-gray-700">
                Status
                <select
                  className="mt-1 h-9 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm"
                  value={newMedication.status}
                  onChange={(e) => setNewMedication((prev) => ({ ...prev, status: e.target.value as InventoryStatus }))}
                >
                  <option value="Adequate">Adequate</option>
                  <option value="Low">Low</option>
                  <option value="Critical">Critical</option>
                </select>
              </label>
              <label className="text-sm text-gray-700 md:col-span-2">
                Supplier
                <input
                  className="mt-1 h-9 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm"
                  value={newMedication.supplier}
                  onChange={(e) => setNewMedication((prev) => ({ ...prev, supplier: e.target.value }))}
                />
              </label>
            </div>

            <button type="submit" className="mt-5 h-9 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white">
              Add Medication
            </button>
          </form>
        </div>
      )}

      {isAddedSuccessOpen && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-black/20 p-4 pb-6 pt-20 backdrop-blur-[1px]" onClick={() => setIsAddedSuccessOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-gray-300 bg-gray-100 p-6 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" strokeWidth={2} />
            <h3 className="mt-2 text-4xl font-bold text-gray-800">Added Successfully!</h3>
            <p className="mt-2 text-sm text-gray-600">Medication record has been successfully added.</p>
            <button type="button" onClick={() => setIsAddedSuccessOpen(false)} className="mt-5 h-9 w-28 rounded-lg bg-blue-600 text-sm font-semibold text-white">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
