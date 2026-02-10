import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm"
import { createSelectSchema } from "drizzle-arktype"
import { type } from "arktype"

export const links = sqliteTable("links", {
  alias: text("alias").notNull().unique(),
  url: text("url").notNull(),
  key: text("key") // The admin password
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  expireAt: text("expire_at"),
  burnAfterViews: integer("burn_after_views").default(0),

  views: integer("views").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export const aLink = createSelectSchema(links).and(
  type({
    referrers: type.Record("string", "number"),
  }),
)

export type Link = typeof aLink.infer

export const referrers = sqliteTable(
  "referrers",
  {
    alias: text("alias")
      .notNull()
      .references(() => links.alias, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    count: integer("count").notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.alias, t.domain] })],
)

export const linksRelations = relations(links, ({ many }) => ({
  referrers: many(referrers),
}))

export const referrersRelations = relations(referrers, ({ one }) => ({
  alias: one(links, {
    fields: [referrers.alias],
    references: [links.key],
  }),
}))
