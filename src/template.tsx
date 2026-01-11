import { Html } from "@elysiajs/html";
// 页面模板
export const template = (title: string, content: JSX.Element) => (
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
        {`
body {
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

input {
  font-family: sans-serif;
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
            this site is running{" "}
            <span class="nes-text is-success">warp : [box]</span>
          </div>
          <a href="https://github.com/hexadecimal233/warp-box">GitHub</a>
        </div>
      </div>
    </body>
  </html>
);

export const errorTemplate = (error: string, backInsteadOfHome?: boolean) =>
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

export const linkTemplate = (url: string) => (
  <a href={url}>
    <code class="code-text" safe>
      {url}
    </code>
  </a>
);
