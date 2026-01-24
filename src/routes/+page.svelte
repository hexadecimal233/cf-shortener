<script lang="ts">
import { enhance } from "$app/forms"
import type { SubmitFunction } from "./$types"
import { links } from "../store/client"
import { deleteLink } from "../utils/index"

let { form } = $props()

const submitHandler: SubmitFunction = () => {
  return async ({ result, update }) => {
    await update()
    if (result.type === "success" && result.data?.success) {
      const data = result.data
      links.update((state) => ({
        ...state,
        links: [
          ...state.links,
          {
            alias: data.alias,
            url: data.finalUrl,
            key: data.key,
          },
        ],
      }))
    }
  }
}
</script>

{#if form?.success}
  <h2>yo the link's all set^^</h2>

  <p>
    your link is:
    <a href={form.finalUrl} target="_blank" class="nes-text is-primary">{form.finalUrl}</a>
  </p>

  <div class="nes-container with-title">
    <p class="title">warning</p>
    <p>please keep the link secure, cuz it will be gone once you leave this page!</p>
    <a href="/stats/{form.alias}?key={form.key}" class="nes-btn is-primary"> see stats </a>
  </div>

  <div class="action-buttons" style="margin-top: 1rem;">
    <a href="/" class="nes-btn">back to home</a>
  </div>
{:else}
  <form method="POST" use:enhance={submitHandler} class="contents">
    {#if form?.error}
      <p class="nes-text is-error">{form.error}</p>
    {/if}

    <div class="nes-field">
      <label for="url">original url</label>
      <input
        type="url"
        name="url"
        id="url"
        class="nes-input"
        placeholder="https://example.com"
        required />
    </div>

    <div class="nes-field">
      <label for="alias">custom alias (optional)</label>
      <input
        type="text"
        name="alias"
        id="alias"
        class="nes-input"
        placeholder="leave empty to generate random alias" />
    </div>

    <div class="nes-field">
      <label for="expire_at">expire at (optional)</label>
      <input type="datetime-local" name="expire_at" id="expire_at" class="nes-input" />
    </div>

    <div class="nes-field">
      <label for="burn_after_views">burn after views (optional)</label>
      <input
        type="number"
        name="burn_after_views"
        id="burn_after_views"
        class="nes-input"
        placeholder="leave empty to never burn" />
    </div>

    <div class="nes-field">
      <label for="creation_password">creation password</label>
      <input
        type="password"
        name="creation_password"
        id="creation_password"
        class="nes-input"
        placeholder="if you set one" />
    </div>

    <button type="submit" class="nes-btn is-primary w-full">let the magic happen!</button>
  </form>
{/if}

{#if $links.links.length > 0}
  <div class="nes-container with-title" style="margin-top: 2rem; width: 100%;">
    <p class="title">your stash</p>
    <div class="nes-list">
      {#each $links.links as link}
        <div
          class="nes-container is-rounded"
          style="margin-bottom: 1rem; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
          <div
            style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 1rem;">
            <a href="/{link.alias}" target="_blank" class="nes-text is-primary">/{link.alias}</a>
            <br />
            <span class="nes-text is-disabled" style="font-size: 0.8em;">{link.url}</span>
          </div>
          <div style="flex-shrink: 0;">
            <a
              href="/stats/{link.alias}?key={link.key}"
              class="nes-btn is-warning is-small"
              style="margin-right: 0.5rem;"
              title="stats"
              >#</a
            >
            <button
              class="nes-btn is-error is-small"
              onclick={() => deleteLink(link.alias, link.key)}
              title="delete">
              x
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
