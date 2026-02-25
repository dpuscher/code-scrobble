import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchAutoScrobbles() {
  const res = await fetch("/api/user/autoscrobbles", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch auto-scrobbles");
  return res.json();
}

async function deleteAutoScrobble(id: string) {
  const res = await fetch("/api/user/autoscrobbles", {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Failed to delete auto-scrobble");
  return res.json();
}

export function useAutoScrobbles() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["autoScrobbles"],
    queryFn: fetchAutoScrobbles,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAutoScrobble,
    onMutate: async id => {
      await queryClient.cancelQueries({ queryKey: ["autoScrobbles"] });
      const previous = queryClient.getQueryData(["autoScrobbles"]);
      queryClient.setQueryData(["autoScrobbles"], (old: any[]) => (old ?? []).filter(item => item.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["autoScrobbles"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["autoScrobbles"] });
    },
  });

  return { ...query, deleteMutation };
}
