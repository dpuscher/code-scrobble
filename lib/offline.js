if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then(() => { console.log('Service worker registered'); })
    .catch((e) => { console.error('Error during worker registration:', e); });
}
