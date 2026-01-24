<script lang="ts">
import "./layout.css"
import favicon from "$lib/assets/favicon.svg"
import { PUBLIC_TITLE } from "$env/static/public"

let { children } = $props()
</script>

<svelte:head>
  <title>{PUBLIC_TITLE}</title>
  <link
    href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Silkscreen:wght@400&display=swap"
    rel="stylesheet" />
  <link href="https://unpkg.com/nes.css@2.3.0/css/nes.min.css" rel="stylesheet" />
  <link rel="icon" href={favicon} />
</svelte:head>
<div
  class="flex flex-col items-center justify-center h-screen font-[Silkscreen,sans-serif] bg-[#e7e7e7]">
  <div
    class="bg-white p-10 pb-4 shadow-[10px_10px_0px_rgba(0,0,0,0.2)] flex flex-col items-center gap-4 sm:p-6 sm:pb-3">
    <div class="nes-container with-title w-full">
      <p class="title">{PUBLIC_TITLE}</p>
      <div class="flex flex-col gap-4">{@render children()}</div>
    </div>

    <div class="footer flex items-center gap-1 mt-1">
      <div>
        this site is running
        <a href="https://github.com/hexadecimal233/warp-box" class="nes-text" target="_blank"
          >warp : [box]</a
        >
      </div>
    </div>
  </div>
</div>
