document.addEventListener('DOMContentLoaded', ()=>{
    //Loading overlay------------------------------------
    const loader = document.getElementById("loading-overlay");
  
    const allLinks = document.querySelectorAll('a[href]:not([href=""]):not([href^="#"])');

    allLinks.forEach(link => {
        link.addEventListener("click", (e) => {
        const targetUrl = link.href;

        if (!targetUrl || targetUrl === window.location.href) return;

        e.preventDefault();
      
        loader.classList.add("active");

        setTimeout(() => {
            window.location.href = targetUrl;
        }, 700); 
        });
    });
})