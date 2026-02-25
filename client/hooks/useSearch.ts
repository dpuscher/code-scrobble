import { useQuery } from "@tanstack/react-query";

async function fetchSearch(query: string) {
  const res = await fetch(`/api/search/${encodeURIComponent(query)}`, { credentials: "include" });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export function useSearch(query: string, enabled: boolean) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => fetchSearch(query),
    enabled: enabled && !!query,
  });
}
