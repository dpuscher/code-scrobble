import ScrobbledPageClient from "../../../../components/scrobbled/ScrobbledPageClient";

export default async function ScrobbledPage({ params }: { params: Promise<{ barcode: string }> }) {
  const { barcode } = await params;
  return <ScrobbledPageClient barcode={barcode} />;
}
