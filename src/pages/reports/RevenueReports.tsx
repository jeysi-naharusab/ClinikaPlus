import { ArrowLeftRight, CircleDollarSign, Coins, HandCoins } from 'lucide-react';

type RevenueCard = {
  title: string;
  value: string;
  chipClass: string;
  valueClass: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const cards: RevenueCard[] = [
  {
    title: 'Total Revenue',
    value: '\u20b1255,00',
    chipClass: 'bg-green-500',
    valueClass: 'text-gray-800',
    icon: CircleDollarSign,
  },
  {
    title: 'Total Transaction',
    value: '210',
    chipClass: 'bg-blue-600',
    valueClass: 'text-gray-800',
    icon: ArrowLeftRight,
  },
  {
    title: 'Outstanding',
    value: '\u20b135,000',
    chipClass: 'bg-amber-500',
    valueClass: 'text-gray-800',
    icon: HandCoins,
  },
  {
    title: 'Average Payment',
    value: '\u20b11,214',
    chipClass: 'bg-blue-500',
    valueClass: 'text-gray-800',
    icon: Coins,
  },
];

export default function RevenueReports() {
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold tracking-tight text-gray-800">Reports & Insurance | Revenue Reports</h1>

      <section className="rounded-2xl bg-gray-300/80 p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-bold text-gray-800">Overview</h2>
          <button type="button" className="h-10 w-28 rounded-xl border border-gray-400 bg-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="rounded-2xl border border-gray-200 bg-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <p className="text-3.5 font-semibold text-gray-500">{card.title}</p>
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-white ${card.chipClass}`}>
                    <Icon size={14} />
                  </span>
                </div>
                <p className={`mt-8 text-5xl font-bold ${card.valueClass}`}>{card.value}</p>
              </article>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="h-[260px] rounded-2xl bg-gray-100" />
          <div className="h-[260px] rounded-2xl bg-gray-100" />
          <div className="h-[260px] rounded-2xl bg-gray-100" />
          <div className="h-[260px] rounded-2xl bg-gray-100" />
        </div>
      </section>
    </div>
  );
}
