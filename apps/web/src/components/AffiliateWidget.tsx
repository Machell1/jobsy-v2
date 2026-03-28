'use client';

interface PartnerCard {
  name: string;
  description: string;
  href: string;
  category: string;
}

const PLACEHOLDER_PARTNERS: PartnerCard[] = [
  {
    name: 'HomeDepot Jamaica',
    description: 'Tools, hardware & building supplies for every job',
    href: '#',
    category: 'Hardware',
  },
  {
    name: 'Courts Jamaica',
    description: 'Appliances & home furnishings with easy payment plans',
    href: '#',
    category: 'Appliances',
  },
  {
    name: 'Digicel Business',
    description: 'Business SIM plans for service providers on the move',
    href: '#',
    category: 'Telecom',
  },
];

interface AffiliateWidgetProps {
  category?: string;
}

export function AffiliateWidget({ category }: AffiliateWidgetProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-5">
      <p className="mb-1 text-[10px] uppercase tracking-widest text-gray-400">Partner Recommendations</p>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Need supplies or services?</h3>
      <div className="space-y-3">
        {PLACEHOLDER_PARTNERS.map((partner) => (
          <a
            key={partner.name}
            href={partner.href}
            className="flex items-start gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 hover:bg-gray-100 transition-colors group"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--primary-light)] text-[10px] font-bold text-[var(--primary)] uppercase">
              {partner.category.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 group-hover:text-[var(--primary)] transition-colors">{partner.name}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{partner.description}</p>
            </div>
          </a>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-gray-400 text-center">Affiliate links — Jobsy may earn a commission</p>
    </div>
  );
}
