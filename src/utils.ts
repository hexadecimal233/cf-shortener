import { env } from "cloudflare:workers";
import z from "zod";

export const zLinkDataCreate = z.object({
  url: z.string(), // Original Link
  expire_at: z.iso.date().optional(), // Expire date
  burn_after_views: z.coerce.number().optional(), // Burn after N views
});

export const zLinkData = zLinkDataCreate.extend({
  key: z.string().default(() => crypto.randomUUID()), // Generated UUID code for status
  views: z.number().default(0), // Views count
  referrers: z.record(z.string(), z.number()).default({}), // Referrer map
  created_at: z.iso.date().default(() => new Date().toISOString()), // Creation date
});

export type LinkData = z.infer<typeof zLinkData>;

export async function getLinkFromAlias(alias: string) {
  const link = await env.LINKS.get(alias);
  if (!link) {
    return null;
  }

  return JSON.parse(link) as LinkData;
}
