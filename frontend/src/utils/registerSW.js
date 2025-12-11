import { Workbox } from 'workbox-window'

export function registerSW() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js')
    wb.addEventListener('waiting', () => {
      console.log("New version available. Refreshing...")
      wb.messageSkipWaiting()
      window.location.reload()
    })
    wb.register()
  }
}
