import { Html } from "@elysiajs/html";
import { errorTemplate, linkTemplate, template } from "../template";
import Elysia, { t } from "elysia";
import { getLinkFromAlias } from "../utils";

export const stats = new Elysia().get(
  "/stats/:code",
  async ({ request, params: { code }, query: { key }, set }) => {
    const data = await getLinkFromAlias(code);

    if (!data) {
      set.status = 404;
      return errorTemplate("link not found");
    }

    if (key !== data.key) {
      set.status = 403;
      return errorTemplate("wrong key");
    }

    const finalUrl = `${new URL(request.url).origin}/${code}`;

    return template(
      "stats",
      <>
        <div class="lists">
          <ul class="nes-list is-disc">
            <li>
              short link:
              {linkTemplate(finalUrl)}
            </li>
            <li>
              target url:
              {linkTemplate(data.url)}
            </li>
            <li>total views: {data.views}</li>
            <li id="create_time" data-created-at={data.created_at}></li>
            <li id="expire_at" data-expire-at={data.expire_at || ""}></li>
            <li>burn after views: {data.burn_after_views || "never"}</li>
          </ul>
        </div>

        <div>
          <h4>referrer stats</h4>
          <div class="nes-table-responsive">
            <table class="nes-table is-bordered">
              <thead>
                <tr>
                  <th>referrer</th>
                  <th>views</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.referrers)
                  .sort(([, a], [, b]) => b - a)
                  .map(([ref, count]) => (
                    <tr>
                      <td safe> {ref}</td>
                      <td>{count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <section class="action-buttons">
          <button type="button" onclick="deleteLink()" class="nes-btn is-error">
            delete link
          </button>
          <a href="/" class="nes-btn">
            back to home
          </a>
        </section>

        <script>
          {`async function deleteLink() {
  await fetch(${JSON.stringify(`/${code}`)}, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: ${JSON.stringify(data.key)} })
  });
	alert("link deleted");
  window.location.href = "/";
}

document.getElementById("create_time").textContent = "created at: " + new Date(document.getElementById("create_time").dataset.createdAt).toLocaleString();
const expireAt = document.getElementById("expire_at").dataset.expireAt;
document.getElementById("expire_at").textContent = "expire at: " + (expireAt ? new Date(expireAt).toLocaleString() : "never");
`}
        </script>
      </>
    );
  },
  {
    params: t.Object({
      code: t.String(),
    }),
  }
);
