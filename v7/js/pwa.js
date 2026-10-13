if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.info('[v6] Service Worker ativo.'))
      .catch((error) => console.warn('[v6] Registro do Service Worker falhou:', error));
  });
}