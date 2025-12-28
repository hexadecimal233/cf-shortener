import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { Elysia, t } from "elysia";
import { html, Html } from "@elysiajs/html";
import { env } from "cloudflare:workers";

// TODO: make status better!

// 访问码对应的原始对象
interface LinkData {
  url: string; // 原始跳转链接
  key: string; // 统计访问码
  hits: number; // 访问数
  referrers: Record<string, number>; // Referrer统计
  created_at: string; // 创建日期
}
// 页面模板
const template = (title: string, content: JSX.Element) => (
  <html lang="en">
    <head>
      <title>{title}</title>
      <link
        href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Silkscreen:wght@400&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://unpkg.com/nes.css@2.3.0/css/nes.min.css"
        rel="stylesheet"
      />
      <style>
        {`body {
 	font-family: "Silkscreen", sans-serif;
 	font-weight: 400;
 	font-style: normal;
	background: #e7e7e7;
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	margin: 0 auto;
}

.container {
	background: white;
	padding: 2.5rem 2.5rem 1rem 2.5rem;
	box-shadow: 10px 10px 0px rgba(0, 0, 0, 0.2);
	width: 100%;
	max-width: 800px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
}

.code-text {
	background-color: #f5f5f5;
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	font-family: monospace;
	word-break: break-all;
}

.w-full {
	width: 100%;
}

.contents {
    display: contents;
}

.flex {
	display: flex;
	flex-direction: column;
}

.gap-4 {
	gap: 1rem;
}

.items-center {
	align-items: center;
}

.justify-center {
	justify-content: center;
}

.action-buttons {
	margin-top: 1.5rem;
	display: flex;
	justify-content: center;
	gap: 1rem;
}`}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="nes-container space-y-4 with-title w-full">
          <p class="title">{title}</p>
          <div class="flex gap-4">{content}</div>
        </div>
        <div class="flex items-center">
          <div>
            this site is running
            <span class="nes-text is-success">warp : [box]</span>
          </div>
          <a href="https://github.com/hexadecimal233/warp-box">GitHub</a>
        </div>
      </div>
    </body>
  </html>
);

const errorTemplate = (error: string, backInsteadOfHome?: boolean) =>
  template(
    "oops!",
    <>
      <p>{error}</p>
      <button
        type="button"
        onclick={
          backInsteadOfHome
            ? "history.back(); return false;"
            : "window.location.href = '/'; return false;"
        }
        class="nes-btn"
      >
        {backInsteadOfHome ? "go back" : "go home"}
      </button>
    </>
  );

const linkTemplate = (url: string) => (
  <a href={url}>
    <code class="code-text" safe>
      {url}
    </code>
  </a>
);

// 服务端验证函数
async function verifyTurnstile(token: string) {
  const formData = new FormData();
  formData.append("secret", env.TURNSTILE_SECRET_KEY);
  formData.append("response", token);

  const result = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      body: formData,
      method: "POST",
    }
  );

  const outcome: any = await result.json();
  return outcome.success;
}

export default new Elysia({
  adapter: CloudflareAdapter,
})
  .use(html())

  // --- 1. 首页  ---
  .get("/", () =>
    template(
      env.TITLE,
      <form method="POST" action="/create" class="contents">
        <div class="nes-field">
          <label for="url">original url</label>
          <input
            type="url"
            name="url"
            class="nes-input"
            placeholder="https://example.com"
            required
          />
        </div>

        <div class="nes-field">
          <label for="alias">custom alias (optional)</label>
          <input
            type="text"
            name="alias"
            class="nes-input"
            placeholder="leave empty to generate random alias"
          />
        </div>

        <div class="nes-field">
          <label for="password">spell</label>
          <input
            type="password"
            name="password"
            class="nes-input"
            placeholder="if you set one"
          />
        </div>

        <button type="submit" class="nes-btn is-primary w-full">
          let the magic happen!
        </button>
      </form>
    )
  )

  // --- 2. 创建短链接 ---
  .post(
    "/create",
    async ({ request, body, set }) => {
      const { url, alias } = body;

      // 检查密码是否正确 (留空自动跳过)
      if ((body.password || "") !== env.PASSWORD) {
        set.status = 403;
        return errorTemplate("the password is wrong...", true);
      }

      // 如果没有自定义别名，生成 6 位随机字符
      const code =
        alias && alias.trim().length > 0
          ? alias.trim()
          : Math.random().toString(36).substring(2, 8);

      // 检查是否已存在 (避免覆盖)
      const exists = await env.LINKS.get(code);
      if (exists) {
        set.status = 400;
        return errorTemplate("link already exists", true);
      }

      const newLink: LinkData = {
        url: url,
        key: crypto.randomUUID(),
        hits: 0,
        referrers: {},
        created_at: new Date().toISOString(),
      };

      // 存入 KV
      await env.LINKS.put(code, JSON.stringify(newLink));

      const finalUrl = `${new URL(request.url).origin}/${code}`;

      return template(
        "yo the link's all set^^",
        <>
          <p>
            your link is:
            {linkTemplate(finalUrl)}
          </p>
          <div class="nes-container with-title">
            <p class="title">warning</p>
            <p>
              please keep the link secure, cuz it will be gone once you leave
              this page!
            </p>
            <a
              href={`/stats/${code}?key=${newLink.key}`}
              class="nes-btn is-primary"
            >
              see stats
            </a>
          </div>
          <div class="action-buttons">
            <a href="/" class="nes-btn">
              back to home
            </a>
          </div>
        </>
      );
    },
    {
      body: t.Object({
        url: t.String({ format: "uri" }),
        alias: t.Optional(t.String()),
        password: t.Optional(t.String()),
      }),
    }
  )

  // --- 3. 统计页面 ---
  .get(
    "/stats/:code",
    async ({ request, params: { code }, query: { key }, set }) => {
      const dataStr = await env.LINKS.get(code);

      if (!dataStr) {
        set.status = 404;
        return errorTemplate("link not found");
      }

      const data = JSON.parse(dataStr) as LinkData;

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
              <li>total hits: {data.hits}</li>
              <li id="create_time" data-created-at={data.created_at}></li>
            </ul>
          </div>

          <div>
            <h3>referrer stats</h3>
            <div class="nes-table-responsive">
              <table class="nes-table is-bordered">
                <thead>
                  <tr>
                    <th>referrer</th>
                    <th>hits</th>
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
            <button
              type="button"
              onclick="deleteLink()"
              class="nes-btn is-error"
            >
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

document.getElementById("create_time").textContent = "created at: " + new Date(document.getElementById("create_time").dataset.createdAt).toLocaleString();`}
          </script>
        </>
      );
    }
  )

  .guard(
    {
      beforeHandle: async ({ body, query, set }) => {
        // 从 Header, Body 或 Query 中尝试获取 token
        const cfToken =
          (body as any)?.["cf-turnstile-response"] || query?.["cf-token"];

        // 如果没有 Token，返回引导页面
        if (!cfToken) {
          set.headers["Content-Type"] = "text/html";
          return `<!DOCTYPE html>
<html>
<head><title>Verifying...</title></head>
<body>
    <div id="c"></div>
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
    <script>
        window.onload = function() {
            turnstile.render('#c', {
                sitekey: '${env.TURNSTILE_SITE_KEY}',
                callback: function(token) {
                    const url = new URL(window.location.href);
                    url.searchParams.set('cf-token', token);
                    window.location.href = url.href;
                },
            });
        };
    </script>
</body>
</html>`;
        }

        // 如果有 Token，进行服务端二次校验
        const isHuman = await verifyTurnstile(cfToken);
        if (!isHuman) {
          set.status = 403;
          return "Captcha Validation Failed.";
        }

        // 校验通过，不返回任何内容，程序将继续向下执行逻辑
      },
    },
    (app) =>
      // --- 4. 跳转逻辑  ---
      app.get(
        "/:code",
        async ({ params: { code }, request, set, redirect }) => {
          const dataStr = await env.LINKS.get(code);

          if (!dataStr) {
            set.status = 404;
            return errorTemplate("link not found");
          }

          const data: LinkData = JSON.parse(dataStr);

          data.hits++;

          // 获取 Referrer
          const referrer = request.headers.get("referer") || "No Referrer";

          data.referrers[referrer] = (data.referrers[referrer] || 0) + 1;

          await env.LINKS.put(code, JSON.stringify(data));

          // 执行重定向
          return redirect(data.url, 302);
        }
      )
  )

  // --- 5. 删除短链接 ---
  .delete(
    "/:code",
    async ({ params: { code }, body: { key }, set }) => {
      const dataStr = await env.LINKS.get(code);

      if (!dataStr) {
        set.status = 404;
        return errorTemplate("link not found");
      }

      const data = JSON.parse(dataStr) as LinkData;

      if (key !== data.key) {
        set.status = 403;
        return errorTemplate("wrong key");
      }

      await env.LINKS.delete(code);

      set.status = 200;
      return <div>link deleted</div>;
    },
    {
      body: t.Object({
        key: t.String(),
      }),
    }
  )

  .compile(); // 支持 Cloudflare运行
