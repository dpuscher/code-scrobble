"use client";

import { useRouter } from "next/navigation";
import QueryRelease from "../query/QueryRelease";
import Scanner from "../scanner/Scanner";
import CircleLayout from "../layout/CircleLayout";

export default function ScanPage() {
  const router = useRouter();

  const codeDetected = ({ codeResult: { code: barcode } }: { codeResult: { code: string } }) => {
    router.push(`/detected/${barcode}`);
  };

  return (
    <CircleLayout header={<QueryRelease />}>
      <Scanner onDetected={codeDetected} />
    </CircleLayout>
  );
}
