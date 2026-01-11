import { Html } from "@elysiajs/html";
import { env } from "cloudflare:workers";
import { errorTemplate } from "../template";
import type { LinkData } from "../utils";
import Elysia, { t } from "elysia";
import { getLinkFromAlias } from "../utils";

export const alias = new Elysia()
  .get(
    "/:alias",
    async ({ params: { alias }, request, set, redirect }) => {
      const data = await getLinkFromAlias(alias);

      if (!data) {
        set.status = 404;
        return errorTemplate("link not found");
      }

      // delete the link if expired
      if (data.expire_at && new Date(data.expire_at) < new Date()) {
        await env.LINKS.delete(alias);
        set.status = 404;
        return errorTemplate("link not found");
      }

      // delete the link if burnt
      if (data.burn_after_views && data.views >= data.burn_after_views) {
        await env.LINKS.delete(alias);
        set.status = 404;
        return errorTemplate("link not found");
      }

      data.views++;

      // get referrer
      const referrer = request.headers.get("referer") || "No Referrer";

      data.referrers[referrer] = (data.referrers[referrer] || 0) + 1;

      await env.LINKS.put(alias, JSON.stringify(data));

      // redirect to the original url
      return redirect(data.url, 302);
    },
    {
      params: t.Object({
        alias: t.String(),
      }),
    }
  )

  .delete(
    "/:alias",
    async ({ params: { alias }, body: { key }, set }) => {
      const dataStr = await env.LINKS.get(alias);

      if (!dataStr) {
        set.status = 404;
        return errorTemplate("link not found");
      }

      const data = JSON.parse(dataStr) as LinkData;

      if (key !== data.key) {
        set.status = 403;
        return errorTemplate("wrong key");
      }

      await env.LINKS.delete(alias);

      set.status = 200;
      return <div>link deleted</div>;
    },
    {
      body: t.Object({
        key: t.String(),
      }),
    }
  );
