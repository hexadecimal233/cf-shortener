import { eq, and, getTableColumns, sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import type { CreateLink } from "$lib/schema"
import type { Link } from "./schema"
import { links, referrers } from "./schema"

// 获取链接
export async function getLink(
  alias: string,
  platform: App.Platform | undefined,
  safe: boolean,
): Promise<Link | null> {
  if (!platform?.env.DB) {
    return null
  }

  const db = drizzle(platform.env.DB)

  const data = await db
    .select({
      ...getTableColumns(links),
      referrers: sql<Record<string, number>>`(
      SELECT json_group_object(${referrers.domain}, ${referrers.count})
      FROM ${referrers}
      WHERE referrers.alias = ${links.alias}
    )`.mapWith((s) => JSON.parse(s)),
    })
    .from(links)
    .where(eq(links.alias, alias))
    .get()

  if (!data) return null

  // 是否安全模式（忽略阅后即焚和时间限制）
  if (safe) return data

  // 检查过期时间
  if (data.expireAt && new Date(data.expireAt) < new Date()) {
    await deleteLink(alias, platform)
    return null
  }

  // 检查阅后即焚
  if (!safe && data.burnAfterViews && data.views >= data.burnAfterViews) {
    await deleteLink(alias, platform)
    return null
  }

  return data
}

// 更新链接统计
export async function updateLinkStats(
  alias: string,
  referrer: string,
  platform: App.Platform | undefined,
): Promise<void> {
  if (!platform?.env.DB) {
    return
  }

  const db = drizzle(platform.env.DB)

  // 获取链接
  const result = await db.select().from(links).where(eq(links.alias, alias)).limit(1)
  if (result.length === 0) {
    return
  }

  const link = result[0]

  // 更新 views
  await db
    .update(links)
    .set({ views: link.views + 1 })
    .where(eq(links.alias, alias))

  // 更新 referrers
  const existingReferrer = await db
    .select()
    .from(referrers)
    .where(and(eq(referrers.alias, link.alias), eq(referrers.domain, referrer)))
    .limit(1)

  if (existingReferrer.length > 0) {
    await db
      .update(referrers)
      .set({ count: existingReferrer[0].count + 1 })
      .where(and(eq(referrers.alias, link.alias), eq(referrers.domain, referrer)))
  } else {
    await db.insert(referrers).values({
      alias: link.alias,
      domain: referrer,
      count: 1,
    })
  }
}

// 保存链接数据
export async function saveLink(
  alias: string,
  data: CreateLink,
  platform: App.Platform | undefined,
): Promise<null | Link> {
  if (!platform?.env.DB) {
    return null
  }

  const db = drizzle(platform.env.DB)

  const result = await db
    .insert(links)
    .values({
      alias,
      url: data.url,
      expireAt: data.expireAt,
      burnAfterViews: data.burnAfterViews,
      views: 0,
      createdAt: new Date().toISOString(),
    })
    .returning()

  return { ...result[0]!, referrers: {} }
}

// 删除链接
export async function deleteLink(alias: string, platform: App.Platform | undefined): Promise<void> {
  if (!platform?.env.DB) {
    return
  }

  const db = drizzle(platform.env.DB)

  await db.delete(links).where(eq(links.alias, alias))
}

// 更新链接
export async function updateLink(
  alias: string,
  updates: Partial<Link>,
  platform: App.Platform | undefined,
): Promise<void> {
  if (!platform?.env.DB) {
    return
  }

  const db = drizzle(platform.env.DB)

  await db.update(links).set(updates).where(eq(links.alias, alias))
}

// 清除统计（引用来源）
export async function clearReferrers(
  alias: string,
  platform: App.Platform | undefined,
): Promise<void> {
  if (!platform?.env.DB) {
    return
  }

  const db = drizzle(platform.env.DB)

  // 获取链接的key
  const result = await db.select().from(links).where(eq(links.alias, alias)).limit(1)
  if (result.length === 0) {
    return
  }

  const link = result[0]

  // 删除所有 referrers
  await db.delete(referrers).where(eq(referrers.alias, link.key))
}
