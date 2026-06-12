import Sortable from "sortablejs"
import Alpine from "alpinejs"

let instance = null

export function refreshDnD() {
  if (instance) {
    instance.destroy()
    instance = null
  }

  Alpine.nextTick(() => {
    const grids = document.querySelectorAll(".links-grid")
    let el = null
    for (const g of grids) {
      if (g.offsetParent !== null) { el = g; break }
    }
    if (!el) return

    instance = new Sortable(el, {
      animation: 200,
      easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      delay: 200,
      delayOnTouchOnly: true,
      touchStartThreshold: 5,
      draggable: "[draggable='true']",
      ghostClass: "sortable-ghost",
      dragClass: "sortable-dragging",
      onEnd() {
        const ids = [...el.querySelectorAll("[draggable='true']")].map(
          (a) => a.dataset.linkId
        )
        document.body.dispatchEvent(
          new CustomEvent("links-reordered", { detail: { linkIds: ids } })
        )
      },
    })
  })
}
