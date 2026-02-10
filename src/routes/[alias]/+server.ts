import { error, json, redirect, text } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { deleteLinkSchema, aEditLink } from "$lib/schema"
import { getLink, updateLinkStats, deleteLink, updateLink } from "$lib/server/db"
import { ArkErrors } from "@ark/schema"

// 处理 GET /:alias
export const GET: RequestHandler = async ({ params, request, platform }) => {
  const { alias } = params

  // 使用 D1 数据库获取链接
  const data = await getLink(alias, platform, false)
  if (!data) {
    return error(404, "link not found")
  }

  // 异步更新统计数据
  const referrerHeader = request.headers.get("referer")
  const referrer = referrerHeader ? new URL(referrerHeader).hostname : "No Referrer"
  updateLinkStats(data.alias, referrer, platform)

  // 执行 302 重定向
  return redirect(302, data.url)
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

  // 使用 D1 数据库获取链接
  const data = await getLink(alias, platform, true)
  if (!data) {
    return error(404, "link not found")
  }

  if (key !== data.key) {
    return error(403, "wrong key")
  }

  // 使用 D1 数据库删除链接
  await deleteLink(alias, platform)
  return text("link deleted")
}

// 处理 PATCH /:alias - 管理操作
export const PATCH: RequestHandler = async ({ params, request, platform }) => {
  const { alias } = params
  const body = await request.json()

  // 使用 arktype 验证请求体
  const edit = aEditLink(body)
  if (edit instanceof ArkErrors) {
    return json({ error: edit.summary }, { status: 400 })
  }

  // 使用 D1 数据库获取链接
  const data = await getLink(alias, platform, true)
  if (!data) {
    return error(404, "link not found")
  }

  // 验证 Key
  if (edit.key !== data.key) {
    return error(403, "wrong key")
  }

  await updateLink(alias, edit, platform)

  return text("success")
}
