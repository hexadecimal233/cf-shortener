import { goto } from "$app/navigation"

export async function deleteLink(alias: string, key: string) {
  if (!confirm("Are you sure?")) return

  const response = await fetch(`/${alias}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  })

  if (response.ok) {
    alert("link deleted")
    goto("/")
  } else {
    alert("Failed to delete")
  }
}

export type LinkAction = "update" | "reset_views" | "clear_stats"

export interface UpdateData {
  url?: string
  expire_at?: string | null
  burn_after_views?: number | null
}

export async function updateLink(
  alias: string,
  key: string,
  action: LinkAction,
  value?: string | number | null | UpdateData,
) {
  const response = await fetch(`/${alias}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, action, value }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || "Update failed")
  }

  return true
}
