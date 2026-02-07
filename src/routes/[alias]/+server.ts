import { error, json, redirect, text } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { deleteLinkSchema, patchLinkSchema } from "$lib/schema"
import { getLink, updateLinkStats, saveLink, deleteLink as deleteLinkFromDb } from "$lib/db"
import { ArkErrors } from "@ark/schema"

// 处理 GET /:alias
export const GET: RequestHandler = async ({ params, request, platform }) => {
  const { alias } = params

  // 使用 db.ts 中的函数获取链接
  const data = await getLink(alias, platform, false)
  if (!data) {
    return error(404, "link not found")
  }

  // 更新统计数据
  const referrer = request.headers.get("referer") || "No Referrer"
  const updatedData = updateLinkStats(data, referrer)

  // 写回 KV
  await saveLink(alias, updatedData, platform)

  // 执行 302 重定向
  return redirect(302, updatedData.url)
}

// 处理 DELETE /:alias
export const DELETE: RequestHandler = async ({ params, request, platform }) => {
  const { alias } = params
  const body = await request.json()

  // 使用 arktype 验证请求体
  const result = deleteLinkSchema(body)
  if (result instanceof ArkErrors) {
    return json({ error: result.summary }, { status: 400 })
  }

  const { key } = result

  // 使用 db.ts 中的函数获取链接
  const data = await getLink(alias, platform, true)
  if (!data) {
    return error(404, "link not found")
  }

  if (key !== data.key) {
    return error(403, "wrong key")
  }

  // 使用 db.ts 中的函数删除链接
  await deleteLinkFromDb(alias, platform)
  return text("link deleted")
}

// 处理 PATCH /:alias - 管理操作（更新URL、重置统计等）
export const PATCH: RequestHandler = async ({ params, request, platform }) => {
  const { alias } = params
  const body = await request.json()

  // 使用 arktype 验证请求体
  const result = patchLinkSchema(body)
  if (result instanceof ArkErrors) {
    return json({ error: result.summary }, { status: 400 })
  }

  const { key, action, value } = result

  // 使用 db.ts 中的函数获取链接
  const data = await getLink(alias, platform, true)
  if (!data) {
    return error(404, "link not found")
  }

  // 验证 Key
  if (key !== data.key) {
    return error(403, "wrong key")
  }

  // 执行管理操作
  switch (action) {
    case "update": {
      // 更新链接属性（URL、过期时间、阅后即焚）
      if (!value || typeof value !== "object") {
        return error(400, "invalid update data")
      }
      const updateData = value as { url?: string; expire_at?: string | null; burn_after_views?: number | null }
      if (updateData.url) {
        data.url = updateData.url
      }
      if (updateData.expire_at !== undefined) {
        data.expire_at = updateData.expire_at ? String(updateData.expire_at) : undefined
      }
      if (updateData.burn_after_views !== undefined) {
        data.burn_after_views = updateData.burn_after_views ? parseInt(String(updateData.burn_after_views)) : undefined
      }
      break
    }

    case "reset_views":
      // 重置访问数
      data.views = 0
      break

    case "clear_stats":
      // 清除统计（引用来源）
      data.referrers = {}
      break

    default:
      return error(400, "unknown action")
  }

  // 写回 KV
  await saveLink(alias, data, platform)

  return text("success")
}
