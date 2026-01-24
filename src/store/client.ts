import { persisted } from "svelte-persisted-store"

interface Link {
  /** URL alias */
  alias: string
  /** Original URL */
  url: string
  /** Access Key */
  key: string
}

export const links = persisted("preferences", {
  links: [] as Link[],
})
