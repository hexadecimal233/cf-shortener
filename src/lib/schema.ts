import { configure, type } from "arktype"

configure({ onUndeclaredKey: "delete" })

export const linkSchema = type({
  url: "string.url",
  alias: type("string > 0")
    .matching(/^[a-zA-Z0-9-]+$/)
    .default(() => Math.random().toString(36).substring(2, 8)),
  "expire_at?": "string.date",
  "burn_after_views?": "number.integer >= 0",
  "creation_password?": "string",
  key: type.string.default(() => crypto.randomUUID()),
  created_at: type.string.default(() => new Date().toISOString()),
  views: type.number.default(0),
  referrers: type.Record("string", "number").default(() => ({})),
})

export type LinkSchema = typeof linkSchema.infer

// DELETE 请求的 schema
export const deleteLinkSchema = type({
  key: "string",
})

export type DeleteLinkSchema = typeof deleteLinkSchema.infer

// PATCH 请求的 schema
export const patchLinkSchema = type({
  key: "string",
  action: '"update" | "reset_views" | "clear_stats"',
  value: "unknown?",
})

export type PatchLinkSchema = typeof patchLinkSchema.infer
