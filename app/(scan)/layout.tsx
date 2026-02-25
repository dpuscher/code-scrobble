import ScanProviders from "../../client/ScanProviders";

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return <ScanProviders>{children}</ScanProviders>;
}
