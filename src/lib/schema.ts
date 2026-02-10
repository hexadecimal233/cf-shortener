import { configure, type } from "arktype"

configure({ onUndeclaredKey: "delete" })

export const aCreateLink = type({
  url: "string.url",
  alias: type("string > 0")
    .matching(/^[a-zA-Z0-9-]+$/)
    .default(() => Math.random().toString(36).substring(2, 8)),
  "expireAt?": "string.date",
  "burnAfterViews?": "number.integer >= 0",
  "creationPassword?": "string",
})

export type CreateLink = typeof aCreateLink.infer

export const deleteLinkSchema = type({
  key: "string",
})

export type DeleteLinkSchema = typeof deleteLinkSchema.infer

export const aEditLink = type({
  key: "string",
  value: aCreateLink,
})
