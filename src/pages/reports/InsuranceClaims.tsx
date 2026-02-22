import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  ChevronDown,
  PlusCircle,
  MoreVertical,
  CircleDashed,
  FileCheck2,
  WalletCards,
  UserRound,
  ShieldPlus,
  FileText,
  Link2,
  X,
} from 'lucide-react';
import Pagination from '../../components/ui/Pagination.tsx';

type ClaimStatus = 'Pending' | 'Approved' | 'Paid' | 'Rejected' | 'For Verification';

type InsuranceClaim = {
  claimId: string;
  patientName: string;
  insuranceProvider: string;
  policyNo: string;
  amount: number;
  status: ClaimStatus;
  dateFiled: string;
};

const claims: InsuranceClaim[] = [
  { claimId: 'CLM-0012', patientName: 'Jhon Carlo T. Millan', insuranceProvider: 'PhilHealth', policyNo: 'PH-45892173', amount: 8500, status: 'Pending', dateFiled: '2026-03-14' },
  { claimId: 'CLM-0013', patientName: 'Marc Anthony Petulan', insuranceProvider: 'Maxicare', policyNo: 'MX-77451209', amount: 15200, status: 'Approved', dateFiled: '2025-02-10' },
  { claimId: 'CLM-0014', patientName: 'John Lloyd Marigza', insuranceProvider: 'Intellicare', policyNo: 'IC-33459021', amount: 6800, status: 'Paid', dateFiled: '2024-12-02' },
  { claimId: 'CLM-0015', patientName: 'Lois Jay Rimorin', insuranceProvider: 'PhilCare', policyNo: 'PC-1123908', amount: 12450, status: 'Rejected', dateFiled: '2026-01-08' },
  { claimId: 'CLM-0016', patientName: 'Arrianerose Flores', insuranceProvider: 'PhilHealth', policyNo: 'PH-99342017', amount: 9300, status: 'Approved', dateFiled: '2026-07-30' },
  { claimId: 'CLM-0017', patientName: 'John Daryl Paquibulan', insuranceProvider: 'Maxicare', policyNo: 'MX-55012984', amount: 4750, status: 'Pending', dateFiled: '2026-03-14' },
  { claimId: 'CLM-0018', patientName: 'Dominic Sarcia', insuranceProvider: 'Intellicare', policyNo: 'IC-77431255', amount: 18900, status: 'For Verification', dateFiled: '2026-03-14' },
  { claimId: 'CLM-0019', patientName: 'Karl Angelo Vergara', insuranceProvider: 'PhilHealth', policyNo: 'PH-12048763', amount: 7600, status: 'Approved', dateFiled: '2026-03-14' },
  { claimId: 'CLM-0020', patientName: 'Maria Santos', insuranceProvider: 'Maxicare', policyNo: 'MX-65617924', amount: 5950, status: 'Paid', dateFiled: '2026-03-14' },
];

const cardData = [
  {
    title: 'Pending Claims',
    value: '12 claims',
    note: 'Claims awaiting review or verification',
    valueClass: 'text-amber-500',
    chipClass: 'bg-amber-500',
    icon: CircleDashed,
  },
  {
    title: 'Approved - Awaiting Payment',
    value: '5',
    note: 'Approved claims pending payment collection',
    valueClass: 'text-green-500',
    chipClass: 'bg-green-500',
    icon: FileCheck2,
  },
  {
    title: 'Total Collected',
    value: '\u20b1124,500',
    note: 'Payments recorded from insurance claims this month',
    valueClass: 'text-blue-600',
    chipClass: 'bg-blue-600',
    icon: WalletCards,
  },
];

function statusPill(status: ClaimStatus) {
  switch (status) {
    case 'Pending':
      return 'bg-amber-200 text-amber-600';
    case 'Approved':
      return 'bg-green-200 text-green-600';
    case 'Paid':
      return 'bg-blue-200 text-blue-600';
    case 'Rejected':
      return 'bg-red-200 text-red-600';
    case 'For Verification':
      return 'bg-blue-200 text-blue-600';
    default:
      return 'bg-gray-200 text-gray-700';
  }
}

function claimActions(status: ClaimStatus) {
  if (status === 'Pending') return ['View', 'Approve', 'Reject'];
  if (status === 'Approved') return ['View', 'Collect Payment'];
  if (status === 'Paid') return ['View', 'Receipt'];
  if (status === 'Rejected') return ['View', 'Archive'];
  return ['View', 'Edit', 'Approve', 'Reject'];
}

function toPeso(amount: number) {
  return `\u20b1${amount.toLocaleString()}`;
}

export default function InsuranceClaims() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredClaims = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    return claims.filter((claim) => {
      return (
        !normalized ||
        claim.claimId.toLowerCase().includes(normalized) ||
        claim.patientName.toLowerCase().includes(normalized) ||
        claim.policyNo.toLowerCase().includes(normalized) ||
        claim.insuranceProvider.toLowerCase().includes(normalized)
      );
    });
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredClaims.length / 5));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visibleClaims = filteredClaims.slice((currentPage - 1) * 5, currentPage * 5);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold tracking-tight text-gray-800">Reports & Insurance | Insurance Claims</h1>

      <section className="rounded-2xl bg-gray-300/80 p-5 space-y-5">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {cardData.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-2xl border border-gray-200 bg-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <p className="text-lg font-semibold text-gray-500">{card.title}</p>
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-white ${card.chipClass}`}>
                    <Icon size={15} />
                  </span>
                </div>
                <p className={`mt-3 text-5xl font-bold ${card.valueClass}`}>{card.value}</p>
                <p className="mt-2 text-sm leading-snug font-semibold text-gray-800">{card.note}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl bg-gray-100 p-4 md:p-5">
          <div className="mb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="relative w-full lg:max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              <input
                placeholder="Search by Claim ID, Patient Name, Policy No."
                className="w-full h-10 rounded-lg border border-gray-300 bg-gray-100 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="h-10 rounded-lg bg-green-500 px-3.5 text-sm font-semibold text-white flex items-center gap-1.5"
              >
                <PlusCircle size={16} />
                Create New Claim
              </button>

              <button
                type="button"
                className="h-10 rounded-lg border border-gray-300 bg-gray-100 px-3.5 text-sm font-medium text-gray-600 flex items-center gap-1.5"
              >
                <ChevronDown size={16} />
                All Categories
              </button>

              <button
                type="button"
                className="h-10 rounded-lg border border-gray-300 bg-gray-100 px-3.5 text-sm font-medium text-gray-600 flex items-center gap-1.5"
              >
                <ChevronDown size={16} />
                All Status
              </button>

              <button
                type="button"
                className="h-10 rounded-lg border border-gray-300 bg-gray-100 px-3.5 text-sm font-medium text-gray-600 flex items-center gap-1.5"
              >
                <ChevronDown size={16} />
                This Month
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-200/90 text-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Claim ID</th>
                  <th className="px-3 py-2 text-left font-semibold">Patient Name</th>
                  <th className="px-3 py-2 text-left font-semibold">Insurance Provider</th>
                  <th className="px-3 py-2 text-left font-semibold">Policy No.</th>
                  <th className="px-3 py-2 text-left font-semibold">Amount</th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                  <th className="px-3 py-2 text-left font-semibold">Date Filed</th>
                  <th className="px-3 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleClaims.map((claim) => (
                  <tr key={claim.claimId} className="border-t border-gray-200 hover:bg-gray-200/40 text-gray-800">
                    <td className="px-3 py-2 font-semibold">{claim.claimId}</td>
                    <td className="px-3 py-2 font-semibold">{claim.patientName}</td>
                    <td className="px-3 py-2 font-semibold">{claim.insuranceProvider}</td>
                    <td className="px-3 py-2 font-semibold">{claim.policyNo}</td>
                    <td className="px-3 py-2 font-semibold">{toPeso(claim.amount)}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex min-w-[92px] justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusPill(claim.status)}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-semibold">{claim.dateFiled}</td>
                    <td className="px-3 py-2 relative">
                      <button
                        type="button"
                        className="h-7 w-7 rounded-md text-gray-600 hover:bg-gray-200 inline-flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId((prev) => (prev === claim.claimId ? null : claim.claimId));
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenuId === claim.claimId && (
                        <div
                          className="absolute right-3 top-8 z-20 min-w-[118px] overflow-hidden rounded-md border border-gray-300 bg-white shadow-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {claimActions(claim.status).map((action, idx) => (
                            <button
                              key={action}
                              type="button"
                              className={`w-full px-3 py-1.5 text-right text-xs ${
                                idx === 0 ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              onClick={() => setOpenMenuId(null)}
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 text-sm text-gray-600">
            <p>
              Showing <span className="rounded-md bg-gray-300 px-2">{visibleClaims.length}</span> out of {filteredClaims.length}
            </p>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </section>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-gray-100 shadow-xl border border-gray-300 p-5">
            <div className="flex items-center justify-between border-b border-gray-300 pb-3">
              <h2 className="text-2xl font-semibold text-gray-600">Create Insurance Claim</h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="h-7 w-7 rounded-full bg-gray-300 text-gray-600 inline-flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                    <UserRound size={16} />
                    Patient Information
                  </h3>
                  <div className="space-y-2.5">
                    <label className="block text-xs font-medium text-gray-700">Patient Name</label>
                    <input className="h-8 w-full rounded border border-gray-300 bg-transparent px-2 text-sm" />
                    <label className="block text-xs font-medium text-gray-700">Contact Number</label>
                    <input className="h-8 w-full rounded border border-gray-300 bg-transparent px-2 text-sm" />
                    <label className="block text-xs font-medium text-gray-700">Email Address</label>
                    <input className="h-8 w-full rounded border border-gray-300 bg-transparent px-2 text-sm" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                    <ShieldPlus size={16} />
                    Insurance Details
                  </h3>
                  <div className="space-y-2.5">
                    <label className="block text-xs font-medium text-gray-700">Insurance Provider</label>
                    <input className="h-8 w-full rounded border border-gray-300 bg-transparent px-2 text-sm" />
                    <label className="block text-xs font-medium text-gray-700">Policy Number</label>
                    <input className="h-8 w-full rounded border border-gray-300 bg-transparent px-2 text-sm" />
                    <label className="block text-xs font-medium text-gray-700">Coverage Type</label>
                    <input className="h-8 w-full rounded border border-gray-300 bg-transparent px-2 text-sm" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                    <FileText size={16} />
                    Claim Details
                  </h3>
                  <div className="space-y-2.5">
                    <label className="block text-xs font-medium text-gray-700">Diagnosis</label>
                    <input className="h-8 w-full rounded border border-gray-300 bg-transparent px-2 text-sm" />
                    <label className="block text-xs font-medium text-gray-700">Treatment Provided</label>
                    <input className="h-8 w-full rounded border border-gray-300 bg-transparent px-2 text-sm" />
                    <label className="block text-xs font-medium text-gray-700">Claim Amount</label>
                    <input className="h-8 w-full rounded border border-gray-300 bg-transparent px-2 text-sm" />
                    <label className="block text-xs font-medium text-gray-700">Date of Service</label>
                    <input className="h-8 w-full rounded border border-gray-300 bg-transparent px-2 text-sm" />
                    <label className="block text-xs font-medium text-gray-700">Upload Supporting Documents</label>
                    <div className="flex items-center gap-2">
                      <Link2 size={16} className="text-gray-500" />
                      <input className="h-8 w-full rounded border border-gray-300 bg-transparent px-2 text-sm" />
                    </div>
                  </div>
                </div>

                <button type="button" className="h-9 w-full rounded-lg bg-blue-600 text-white text-sm font-semibold">
                  Submit Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
