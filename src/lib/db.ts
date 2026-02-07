import type { LinkSchema } from "./schema"

// 获取链接
export async function getLink(
  alias: string,
  platform: App.Platform | undefined,
  safe: boolean,
): Promise<LinkSchema | null> {
  const dataStr = await platform?.env.LINKS.get(alias)
  if (!dataStr) {
    return null
  }

  const data = JSON.parse(dataStr) as LinkSchema

  // 是否安全模式（忽略阅后即焚和时间限制
  if (safe) return data

  if (data.expire_at && new Date(data.expire_at) < new Date()) {
    await platform?.env.LINKS.delete(alias)
    return null
  }

  if (!safe && data.burn_after_views && data.views >= data.burn_after_views) {
    await platform?.env.LINKS.delete(alias)
    return null
  }

  return data
}

// 更新链接
export function updateLinkStats(data: LinkSchema, referrer: string): LinkSchema {
  data.views++
  data.referrers[referrer] = (data.referrers[referrer] || 0) + 1
  return data
}

// 保存链接数据
export async function saveLink(
  alias: string,
  data: LinkSchema,
  platform: App.Platform | undefined,
): Promise<void> {
  await platform?.env.LINKS.put(alias, JSON.stringify(data))
}

// 删除链接
export async function deleteLink(alias: string, platform: App.Platform | undefined): Promise<void> {
  await platform?.env.LINKS.delete(alias)
}
