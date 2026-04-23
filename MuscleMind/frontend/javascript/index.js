import { getWorkout } from './api.js';

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

  // Edzés Emlékeztető logika
  let myModal = new bootstrap.Modal(document.getElementById('workoutReminderModal'))
  
  async function loadWorkoutReminder() {
      try {
          const data = await getWorkout('http://127.0.0.1:3000/api/workout/calendar')

          const dDate = new Date()
          let monthStr = dDate.getMonth() + 1
          let dayStr = dDate.getDate()

          if (monthStr < 10) {
              monthStr = '0' + monthStr
          }
          if (dayStr < 10) {
              dayStr = '0' + dayStr
          }

          const todayStr = dDate.getFullYear() + '-' + monthStr + '-' + dayStr
          
          let todayWorkout = null
          if (data.calendar) {
              for (let i = 0; i < data.calendar.length; i++) {
                  if (data.calendar[i].date === todayStr) {
                      todayWorkout = data.calendar[i]
                      break
                  }
              }
          }

          const modalBody = document.getElementById("workoutReminderBody")
          modalBody.innerHTML = ''

          if (todayWorkout === null) {
              let p = document.createElement('p')
              p.className = 'text-center mt-3 fs-5'
              p.innerText = 'Nincs betervezett edzésed mára.'
              modalBody.appendChild(p)
          } else if (todayWorkout.isRestDay === 1 || todayWorkout.isRestDay === true) {
              let p = document.createElement('p')
              p.className = 'text-center mt-3 fs-5 text-info'
              
              let elotteSzoveg = document.createElement('span')
              elotteSzoveg.innerText = 'Ma pihenőnap van: '
              
              let b = document.createElement('b')
              b.innerText = todayWorkout.dayName
              
              let utanaSzoveg = document.createElement('span')
              utanaSzoveg.innerText = ' 🤫'
              
              p.appendChild(elotteSzoveg)
              p.appendChild(b)
              p.appendChild(utanaSzoveg)
              
              modalBody.appendChild(p)
          } else {
              let h5 = document.createElement('h5')
              h5.className = 'text-center text-warning fw-bold mb-3'
              h5.innerText = todayWorkout.dayName
              modalBody.appendChild(h5)
              
              if (todayWorkout.exercises && todayWorkout.exercises.length > 0) {
                  let ul = document.createElement('ul')
                  ul.className = 'list-group bg-transparent'
                  
                  for (let i = 0; i < todayWorkout.exercises.length; i++) {
                      const ex = todayWorkout.exercises[i]
                      
                      let li = document.createElement('li')
                      li.className = 'list-group-item bg-transparent text-light border-secondary d-flex justify-content-between'
                      
                      let spanName = document.createElement('span')
                      spanName.innerText = ex.name
                      
                      let spanBadge = document.createElement('span')
                      spanBadge.className = 'badge bg-secondary'
                      spanBadge.innerText = '#' + ex.order
                      
                      li.appendChild(spanName)
                      li.appendChild(spanBadge)
                      
                      ul.appendChild(li)
                  }
                  
                  modalBody.appendChild(ul)
              } else {
                  let p = document.createElement('p')
                  p.className = 'text-center'
                  p.innerText = 'Nincsenek gyakorlatok.'
                  modalBody.appendChild(p)
              }
          }
          myModal.show()

      } catch (error) {
          console.error("Hiba az edzes lekeresekor:", error)
      }
  }

  if (sessionStorage.getItem('showWorkoutReminder') === 'true') {
      sessionStorage.removeItem('showWorkoutReminder')
      loadWorkoutReminder()
  }

});