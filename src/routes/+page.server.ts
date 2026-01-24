import { fail } from "@sveltejs/kit"
import type { Actions } from "./$types"

export const actions = {
  default: async ({ request, platform }) => {
    const formData = await request.formData()
    const body = Object.fromEntries(formData)

    // 1. check password
    if ((body.creation_password || "") !== platform?.env.PASSWORD) {
      return fail(403, { error: "the password is wrong...", retry: true })
    }

    // 2. process alias
    let alias = body.alias?.toString().trim()
    if (!alias) {
      alias = Math.random().toString(36).substring(2, 8)
    }

    // 3. validate alias
    if (!/^[a-zA-Z0-9-]+$/.test(alias)) {
      return fail(400, { error: "invalid alias format", retry: true })
    }

    // 4. check if alias already exists
    const exists = await platform?.env.LINKS.get(alias)
    if (exists) {
      return fail(400, { error: "link already exists", retry: true })
    }

    // 5. prepare data to store
    const newLinkData = {
      url: body.url,
      key: crypto.randomUUID(), // generate management key
      created_at: new Date().toISOString(),
      views: 0,
      referrers: {},
      expire_at: body.expire_at || null,
      burn_after_views: body.burn_after_views ? parseInt(body.burn_after_views.toString()) : null,
    }

    // 6. store link data in KV
    await platform?.env.LINKS.put(alias, JSON.stringify(newLinkData))

    const origin = new URL(request.url).origin

    // 返回给页面的数据
    return {
      success: true,
      alias,
      key: newLinkData.key,
      finalUrl: `${origin}/${alias}`,
    }
  },
} satisfies Actions
