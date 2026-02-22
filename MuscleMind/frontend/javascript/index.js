document.addEventListener("DOMContentLoaded", () => {


  //Világos/Sötét mód gomb------------------------------------
  document.getElementById("theme-switch").addEventListener("change", (a) => {
    if (a.target.checked){
        
        console.log("Világos mód");

        // BODY 
        document.body.style.backgroundColor = "#e2e8f0";
        document.body.style.color = "#1e293b"; 

        // Felső sor 
        document.getElementById("upper-row").style.backgroundColor = "#cfb8d8a6";
        document.getElementById("upper-row").style.borderBottom =
         "2px groove #7c3aed";

      // Cím színek 
      document.getElementById("main-page-title").style.color = "#612eb9";

      // Logo animációhoz ID csere
      document.getElementById("shifting-text1").id =
        "shifting-textForLightTheme1";
      document.getElementById("shifting-text2").id =
        "shifting-textForLightTheme2";

    

      // Oldalsó navbar 
      document.getElementById("side-nav").style.backgroundColor = "#cfb8d8a6";
      document.getElementById('profile-bubble').style.backgroundColor = "#f1f5f9";
      document.getElementById('profile-bubble').style.color = "grey";


      document.getElementById('middle-part').style.border = "0"

      // Statisztika box 
      document.getElementById("stats").style.backgroundColor = "#f1f5f9";
      document.getElementById("stats").style.border =
        "1px solid #94a3b8";

      // Ranglista + Naptár 
      document.getElementById("ranglist").style.backgroundColor = "#f1f5f9";
      document.getElementById("calendar").style.backgroundColor = "#f1f5f9";

      document.getElementById("ranglist").style.border =
        "1px solid #94a3b8";
      document.getElementById("calendar").style.border =
        "1px solid #94a3b8";

      // Izom tracker 
      document.getElementById("muscle-tracker").style.backgroundColor =
        "#f1f5f9";
      document.getElementById("muscle-tracker").style.border =
        "1px solid #94a3b8";


    }

    else {
      console.log("Sötét mód");

      document.getElementById('profile-bubble').style.backgroundColor = "rgba(255, 255, 255, 0.144)";
      document.getElementById('profile-bubble').style.color = "wheat";

      document.getElementById("side-nav").style.backgroundColor = "#0f0f17";
      document.getElementById("side-nav").style.border = "1px solid rgba(255,255,255,.10)"

      document.documentElement.style.backgroundColor = "#0b0b10";
      document.body.style.backgroundColor = "#0b0b10";
      document.body.style.color = "#f5f5ff";

      document.getElementById("shifting-textForLightTheme1").id =
        "shifting-text1";
      document.getElementById("shifting-textForLightTheme2").id =
        "shifting-text2";

      document.getElementById("upper-row").style.backgroundColor = "#0f0f17";
      document.getElementById("upper-row").style.borderBottom =
        "1px groove #7c3aed";

      document.getElementById("main-page-title").style.color = "#ffffff";
      document.getElementById("stat-title").style.color = "#ffffff";


      document.getElementById("stats").style.backgroundColor = "#0f0f17";
      document.getElementById("ranglist").style.backgroundColor = "#0f0f17";
      document.getElementById("calendar").style.backgroundColor = "#0f0f17";
      document.getElementById("muscle-tracker").style.backgroundColor =
        "#0f0f17";

      document.getElementById("stats").style.border =
        "2px solid rgba(255,255,255,.10)";

      document.getElementById("stats").style.backgroundColor =
        "#6c6c862a";

      document.getElementById("ranglist").style.border =
        "2px solid rgba(255,255,255,.10)";

      document.getElementById("ranglist").style.backgroundColor =
        "#6c6c862a";

      document.getElementById("calendar").style.border =
        "2px solid rgba(255,255,255,.10)";
      
      document.getElementById("calendar").style.backgroundColor =
        "#6c6c862a";
        
      document.getElementById("muscle-tracker").style.border =
        "2px solid rgba(255,255,255,.10)";

      document.getElementsByClassName("offcanvas").style.backgroundColor = "#0f0f17";
      document.getElementsByClassName("nav-item").style.borderColor = "#612eb9";

      document.getElementsByClassName("button-sample").style.backgroundColor =
        "#2c203b";
    }
  });


  //Muscle Tracker oldal változtatás(elől/hátul)
  // let muscles = [
  //   'vall',
  //   'mell',
  //   'alkar',
  //   'bicepsz',
  //   'comb',
  //   'has',
  //   'hat',
  //   'tricepsz',
  //   'vadli'

  // ]

  // let pics = [
  //   '../images/muscle-tracker/alapelol.png',
  //   '../images/muscle-tracker/mell.png',
  //   '../images/muscle-tracker/alkar.png',
  //   '../images/muscle-tracker/bicepsz.png',
  //   '../images/muscle-tracker/comb.png',
  //   '../images/muscle-tracker/has.png',
  //   '../images/muscle-tracker/hat.png',
  //   '../images/muscle-tracker/tricepsz.png',
  //   '../images/muscle-tracker/vadli.png',

  // ]

  const img = document.getElementById('muscle-picture')
  let oldal = 'elol'
  
  document.getElementById('front-back').addEventListener('click', ()=>{
    if(oldal == 'elol'){
      console.log('Ember: hátul')
      img.src = "../images/muscle-tracker/alaphatul.png"
      oldal = 'hatul'
    }
    else if(oldal == 'hatul'){
      console.log('Ember: elől')
      img.src = "../images/muscle-tracker/alapelol.png"
      oldal = 'elol'
    }
  })

  //Muscle Tracker izmok
  // let select = document.getElementById('muscles')
  // select.addEventListener('change', ()=>{
  //   if(select.value)
  // })


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
});