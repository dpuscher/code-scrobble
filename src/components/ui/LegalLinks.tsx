import Link from 'next/link';

const LegalLinks = () => (
  <div className="absolute right-[calc(15px+env(safe-area-inset-right))] bottom-[calc(5px+env(safe-area-inset-bottom))] flex text-xs/[1.15]">
    <Link href="/privacy" className="p-2.5 underline opacity-70 transition-opacity hover:opacity-100">Privacy</Link>
    <Link href="/legal" className="p-2.5 underline opacity-70 transition-opacity hover:opacity-100">Legal</Link>
  </div>
);

export default LegalLinks;
