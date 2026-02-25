import { useQuery } from "@tanstack/react-query";

async function fetchRelease(code: string) {
  const res = await fetch(`/api/barcode/${encodeURIComponent(code)}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch release");
  return res.json();
}

export function useRelease(code: string) {
  return useQuery({
    queryKey: ["release", code],
    queryFn: () => fetchRelease(code),
    enabled: !!code,
  });
}
