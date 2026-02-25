import { useQuery } from "@tanstack/react-query";

async function fetchSession() {
  const res = await fetch("/api/session", { credentials: "include" });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    retry: false,
  });
}
