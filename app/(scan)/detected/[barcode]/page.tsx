import DetectedPageClient from "../../../../components/detected/DetectedPageClient";

export default async function DetectedPage({ params }: { params: Promise<{ barcode: string }> }) {
  const { barcode } = await params;
  return <DetectedPageClient barcode={barcode} />;
}
