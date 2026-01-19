import { error, redirect, text } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

// 处理 GET /:alias
export const GET: RequestHandler = async ({ params, request, platform }) => {
  const { alias } = params

  const dataStr = await platform?.env.LINKS.get(alias)
  if (!dataStr) {
    return error(404, "link not found")
  }

  const data = JSON.parse(dataStr)

  // 1. 检查是否过期
  if (data.expire_at && new Date(data.expire_at) < new Date()) {
    await platform?.env.LINKS.delete(alias)
    return error(404, "link not found")
  }

  // 2. 检查是否达到阅后即焚限制
  if (data.burn_after_views && data.views >= data.burn_after_views) {
    await platform?.env.LINKS.delete(alias)
    return error(404, "link not found")
  }

  // 3. 更新统计数据
  data.views++
  const referrer = request.headers.get("referer") || "No Referrer"
  data.referrers[referrer] = (data.referrers[referrer] || 0) + 1

  // 4. 写回 KV
  await platform?.env.LINKS.put(alias, JSON.stringify(data))

  // 5. 执行 302 重定向
  return redirect(302, data.url)
}

// 处理 DELETE /:alias
export const DELETE: RequestHandler = async ({ params, request, platform }) => {
  const { alias } = params
  const { key } = await request.json()

  const dataStr = await platform?.env.LINKS.get(alias)
  if (!dataStr) {
    return error(404, "link not found")
  }

  const data = JSON.parse(dataStr)

  if (key !== data.key) {
    return error(403, "wrong key")
  }

  await platform?.env.LINKS.delete(alias)
  return text("link deleted")
}
