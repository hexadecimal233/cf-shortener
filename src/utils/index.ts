import { goto } from "$app/navigation"
import type { CreateLink } from "$lib/schema"

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

export async function updateLink(alias: string, key: string, value: CreateLink) {
  const response = await fetch(`/${alias}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || "Update failed")
  }

  return true
}
