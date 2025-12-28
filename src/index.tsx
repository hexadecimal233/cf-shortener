import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { Elysia, t } from "elysia";
import { html, Html } from "@elysiajs/html";
import { env } from "cloudflare:workers";

// 访问码对应的原始对象
interface LinkData {
  url: string; // 原始跳转链接
  key: string; // 统计访问码
  hits: number; // 访问数
  referrers: Record<string, number>; // Referrer统计
  created_at: string; // 创建日期
}

const template = (title: string, content: JSX.Element) => (
  <html lang="en">
    <head>
      <title>{title}</title>
      <style>
        {`
.container {
    width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
}`}
      </style>
    </head>
    <body>
      <div class="container">{content}</div>
    </body>
  </html>
);

export default new Elysia({
  adapter: CloudflareAdapter,
})
  .use(html())

  // --- 1. 首页  ---
  .get("/", () =>
    template(
      "URL Shortener",
      <>
        <h1>URL Shortener</h1>
        <form method="POST" action="/create">
          <p>原始链接:</p>
          <br />
          <input type="url" name="url" required />
          <br />
          <br />
          <p>自定义别名 (可选):</p>
          <br />
          <input type="text" name="slug" />
          <br />
          <br />
          <button type="submit">生成短链接</button>
        </form>
      </>
    )
  )

  // --- 2. 创建短链接 ---
  .post(
    "/create",
    async ({ request, body, status }) => {
      const { url, slug } = body;

      // 如果没有自定义别名，生成 6 位随机字符
      const code =
        slug && slug.trim().length > 0
          ? slug.trim()
          : Math.random().toString(36).substring(2, 8);

      // 检查是否已存在 (避免覆盖)
      const exists = await env.LINKS.get(code);
      if (exists) {
        status(400, "name already exist");
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
      return template(
        "生成成功",
        <>
          <h1>生成成功</h1>
          <p>您的短链接是:</p>
          <p>
            <code safe>{`https://${request.referrer}/${code}`}</code>
          </p>
          <p>
            <a href={`/stats/${code}?key=${newLink.key}`}>
              查看统计数据 （请妥善保管此链接！之后就再也看不到了！）
            </a>
          </p>
          <p>
            <a href="/">返回首页</a>
          </p>
        </>
      );
    },
    {
      body: t.Object({
        url: t.String({ format: "uri" }),
        slug: t.Optional(t.String()),
      }),
    }
  )

  // --- 3. 统计页面 ---
  .get(
    "/stats/:code",
    async ({ request, params: { code }, query: { key }, status }) => {
      const dataStr = await env.LINKS.get(code);

      if (!dataStr) return status(404);

      const data = JSON.parse(dataStr) as LinkData;

      if (key !== data.key) return status(403);

      const finalUrl = `https://${request.referrer}/${code}`;

      // 渲染 Referrer 表格行

      return template(
        "统计报告",
        <>
          <h2>
            统计报告:
            <span style="color: red;" safe>
              {code}
            </span>
          </h2>
          <ul>
            <li>
              <b>目标 URL:</b>
              <a href={finalUrl} safe>
                {finalUrl}
              </a>
            </li>
            <li>
              <b>总点击量:</b> {data.hits}
            </li>
            <li>
              <b>创建时间:</b> {data.created_at}
            </li>
          </ul>
          <hr />
          <h3>来源统计</h3>
          <table
            border={1}
            cellpadding="5"
            style="width: 500px; borderCollapse: collapse;"
          >
            <thead>
              <tr style="backgroundColor: #CCCCCC;">
                <th>来源地址</th>
                <th>次数</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.referrers)
                .sort(([, a], [, b]) => b - a)
                .map(([ref, count]) => (
                  <tr>
                    <td>
                      <code>{ref}</code>
                    </td>
                    <td style="text-align: center;">{count}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <br />
          <a href="/">[ 返回首页 ]</a>
        </>
      );
    }
  )

  // --- 4. 跳转逻辑  ---
  .get("/:code", async ({ params: { code }, request, status, redirect }) => {
    const dataStr = await env.LINKS.get(code);

    if (!dataStr) {
      return status(404);
    }

    const data: LinkData = JSON.parse(dataStr);

    data.hits++;

    // 获取 Referrer
    const referrer = request.headers.get("referer") || "No Referrer";
    // 简单的域名提取正则，或者直接存完整 URL
    const simpleRef = referrer.startsWith("http")
      ? new URL(referrer).hostname
      : referrer;

    data.referrers[simpleRef] = (data.referrers[simpleRef] || 0) + 1;

    await env.LINKS.put(code, JSON.stringify(data));

    // 执行重定向
    return redirect(data.url, 302);
  })

  .compile(); // 支持 Cloudflare运行
