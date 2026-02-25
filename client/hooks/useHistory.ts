import { useQuery } from "@tanstack/react-query";

async function fetchHistory() {
  const res = await fetch("/api/user/history", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export function useHistory() {
  return useQuery({
    queryKey: ["history"],
    queryFn: fetchHistory,
  });
}
