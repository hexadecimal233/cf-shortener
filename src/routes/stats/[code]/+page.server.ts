import { error } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"
import { getLink } from "$lib/server/db"

export const load: PageServerLoad = async ({ params, url, platform }) => {
  const { code } = params
  const key = url.searchParams.get("key")

  const data = await getLink(code, platform, true)
  if (!data) {
    throw error(404, "link not found")
  }

  // 校验 Key
  if (key !== data.key) {
    throw error(403, "wrong key")
  }

  return {
    code,
    linkData: data,
    origin: url.origin,
  }
}
