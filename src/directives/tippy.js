import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

export default {
  mounted(el, binding) {
    tippy(el, {
      content: binding.value,
      placement: 'top',
      animation: 'shift-away',
      theme: 'light-border'
    })
  },
  updated(el, binding) {
    el._tippy?.setContent(binding.value)
  },
  unmounted(el) {
    el._tippy?.destroy()
  }
}
