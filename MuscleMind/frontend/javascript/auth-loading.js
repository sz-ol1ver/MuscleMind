window.addEventListener('load', () => {
    const loader = document.getElementById('auth-loading-overlay');

    if (!loader) return;

    setTimeout(() => {
        loader.classList.add('hidden');
    }, 400);
});