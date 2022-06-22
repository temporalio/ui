import { writable } from "svelte/store";

export const copyToClipboard = (content: string, timeout: number = 2000) => {
  const copied = writable(false)

  const copy = async (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(content)
      copied.set(true)
      setTimeout(() => {
        copied.set(false)
      }, timeout)
    } catch (error) {
      console.error(error)
    }
  }

  return { copy, copied }
}