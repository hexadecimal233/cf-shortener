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
