import { Html } from "@elysiajs/html";
import { env } from "cloudflare:workers";
import { template } from "../template";
import Elysia from "elysia";

export const index = new Elysia().get("/", () =>
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
        <label for="expire_at">expire at (optional)</label>
        <input
          type="datetime-local"
          name="expire_at"
          class="nes-input"
          placeholder="leave empty to never expire"
        />
      </div>

      <div class="nes-field">
        <label for="burn_after_views">burn after views (optional)</label>
        <input
          type="number"
          name="burn_after_views"
          class="nes-input"
          placeholder="leave empty to never burn"
        />
      </div>

      <div class="nes-field">
        <label for="creation_password">creation password</label>
        <input
          type="password"
          name="creation_password"
          class="nes-input"
          placeholder="if you set one"
        />
      </div>

      <button type="submit" class="nes-btn is-primary w-full">
        let the magic happen!
      </button>
    </form>
  )
);
