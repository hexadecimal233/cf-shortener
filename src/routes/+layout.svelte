<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
  let { children, data } = $props();
  
  // 标题逻辑：优先使用页面 load 函数返回的 title，否则使用默认值
  let title = $derived(data?.title || "warp : [box]");
</script>

<svelte:head>
  <title>{title}</title>
  <link
    href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Silkscreen:wght@400&display=swap"
    rel="stylesheet"
  />
  <link
    href="https://unpkg.com/nes.css@2.3.0/css/nes.min.css"
    rel="stylesheet"
  />
  <link rel="icon" href={favicon} />
</svelte:head>
<div class="flex flex-col items-center justify-center h-screen font-[Silkscreen,sans-serif] bg-[#e7e7e7]">
<div class="container">
  <div class="nes-container with-title w-full">
    <p class="title">{title}</p>
    <div class="flex flex-col gap-4">
      {@render children()}
    </div>
  </div>

  <div class="footer flex items-center">
    <div>
      this site is running
      <a href="https://github.com/hexadecimal233/warp-box" class="nes-text" target="_blank">warp : [box]</a>
    </div>
  </div>
</div>
</div>