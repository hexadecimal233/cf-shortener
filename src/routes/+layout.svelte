<script lang="ts">
import "./app.css"
import { env } from '$env/dynamic/public';
import favicon from "$lib/assets/favicon.svg"

let { children } = $props()
</script>

<svelte:head>
  <title>{env.PUBLIC_TITLE}</title>
  <link rel="icon" href={favicon} />
</svelte:head>
<div class="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4">
  <div class="card w-full max-w-lg bg-base-100">
    <div class="card-body gap-6">
      <header class="text-center">
        <h1 class="text-3xl font-bold">{env.PUBLIC_TITLE}</h1>
      </header>

      <main class="space-y-4">{@render children()}</main>

      <footer class="text-center text-sm opacity-50 pt-4 border-t border-base-200">
        <div>
          this site is running
          <a
            href="https://github.com/hexadecimal233/warp-box"
            class="link link-hover"
            target="_blank"
            >warp-box</a
          >
        </div>
      </footer>
    </div>
  </div>
</div>
