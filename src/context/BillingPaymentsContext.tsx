import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { billingRecords as initialBillingRecords, paymentQueue as initialPaymentQueue } from '../data/mockData';

export type BillStatus = 'Pending' | 'Paid' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Processing';

export type BillRecord = {
  id: string;
  patient: string;
  date: string;
  total: string;
  status: BillStatus;
};

export type PaymentQueueRecord = {
  id: string;
  patient: string;
  amount: number;
  method: string;
  date: string;
  status: PaymentStatus;
};

type NewBillInput = {
  id: string;
  patient: string;
  date: string;
  total: string;
  status: BillStatus;
};

type BillingPaymentsContextValue = {
  billingRecords: BillRecord[];
  paymentQueue: PaymentQueueRecord[];
  addBill: (bill: NewBillInput) => void;
};

const BillingPaymentsContext = createContext<BillingPaymentsContextValue | undefined>(undefined);

function parseAmount(total: string) {
  const parsed = Number(total.replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toPaymentStatus(status: BillStatus): PaymentStatus {
  return status === 'Paid' ? 'Paid' : 'Pending';
}

function statusCode(status: BillStatus) {
  if (status === 'Paid') return 'PD';
  if (status === 'Cancelled') return 'CN';
  return 'PN';
}

function isFrancoJallorina(name: string) {
  return name.trim().toLowerCase() === 'franco jallorina';
}

function buildNormalizedBillingRecords(records: BillRecord[]) {
  const statusCounters: Record<BillStatus, number> = {
    Pending: 0,
    Paid: 0,
    Cancelled: 0,
  };
  const idMap = new Map<string, string>();

  const normalizedRecords = records.map((record) => {
    statusCounters[record.status] += 1;
    const sequence = String(statusCounters[record.status]).padStart(4, '0');
    const code = statusCode(record.status);
    const normalizedId = `B-${code}-${sequence}`;
    idMap.set(record.id, normalizedId);
    return { ...record, id: normalizedId };
  });

  return { normalizedRecords, idMap };
}

export function BillingPaymentsProvider({ children }: { children: ReactNode }) {
  const preparedInitialData = useMemo(() => {
    const sourceBilling = (initialBillingRecords as BillRecord[])
      .map((record) => ({ ...record }))
      .filter((record) => !isFrancoJallorina(record.patient));
    const { normalizedRecords, idMap } = buildNormalizedBillingRecords(sourceBilling);

    const sourcePaymentQueue = (initialPaymentQueue as PaymentQueueRecord[])
      .map((record) => ({ ...record }))
      .filter((record) => !isFrancoJallorina(record.patient))
      .map((record) => ({ ...record, id: idMap.get(record.id) ?? record.id }));

    return {
      billingRecords: normalizedRecords,
      paymentQueue: sourcePaymentQueue,
    };
  }, []);

  const [billingRecords, setBillingRecords] = useState<BillRecord[]>(
    () => preparedInitialData.billingRecords,
  );
  const [paymentQueue, setPaymentQueue] = useState<PaymentQueueRecord[]>(
    () => preparedInitialData.paymentQueue,
  );

  function addBill(bill: NewBillInput) {
    if (isFrancoJallorina(bill.patient)) {
      return;
    }

    setBillingRecords((prev) => [bill, ...prev.filter((row) => row.id !== bill.id)]);
    setPaymentQueue((prev) => [
      {
        id: bill.id,
        patient: bill.patient,
        amount: parseAmount(bill.total),
        method: '-',
        date: bill.date,
        status: toPaymentStatus(bill.status),
      },
      ...prev.filter((row) => row.id !== bill.id),
    ]);
  }

  const value = useMemo(
    () => ({
      billingRecords,
      paymentQueue,
      addBill,
    }),
    [billingRecords, paymentQueue],
  );

  return <BillingPaymentsContext.Provider value={value}>{children}</BillingPaymentsContext.Provider>;
}

export function useBillingPayments() {
  const context = useContext(BillingPaymentsContext);
  if (!context) {
    throw new Error('useBillingPayments must be used within BillingPaymentsProvider');
  }
  return context;
}
