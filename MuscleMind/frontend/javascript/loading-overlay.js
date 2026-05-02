// Loader elrejtése
function hideGlobalLoader() {
    const loader = document.getElementById("loading-overlay");

    if (!loader) return;

    loader.classList.remove("active");
}

// Loader megjelenítése
function showGlobalLoader() {
    const loader = document.getElementById("loading-overlay");

    if (!loader) return;

    loader.classList.add("active");
}

// Teljes oldalbetöltés után elrejtés
window.addEventListener("load", () => {
    hideGlobalLoader();
});

// Vissza/előre lépésnél elrejtés
window.addEventListener("pageshow", () => {
    hideGlobalLoader();
});

// Mobilon/tabváltás után extra biztosíték
window.addEventListener("focus", () => {
    hideGlobalLoader();
});

// HTML betöltése után linkek kezelése
document.addEventListener('DOMContentLoaded', () => {
    hideGlobalLoader();

    // Valódi linkek kiválasztása
    const allLinks = document.querySelectorAll('a[href]:not([href=""]):not([href^="#"])');

    allLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            const targetUrl = link.href;
            const target = link.getAttribute("target");
            const download = link.hasAttribute("download");

            // Kivételek: ugyanaz az oldal, új tab, letöltés
            if (
                !targetUrl ||
                targetUrl === window.location.href ||
                target === "_blank" ||
                download
            ) {
                return;
            }

            // Alap navigáció megállítása
            e.preventDefault();

            // Loader mutatása oldalváltás előtt
            showGlobalLoader();

            // Rövid késleltetés után átirányítás
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 400);
        });
    });
});