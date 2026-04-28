import { getFetch } from './api.js';

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


  // Muscle tracker + napi edzés adatok
  // Itt tartjuk a tracker állapotát
  const trackerState = {
    side: 'front',
    todayWorkout: null,
    loaded: false,
    processedOverlayCache: {},
    processedBaseCache: {}
  }

  const trackerElements = {
    button: document.getElementById('front-back'),
    stage: document.getElementById('muscle-stage'),
    baseImage: document.getElementById('muscle-base-image'),
    highlightLayer: document.getElementById('muscle-highlight-layer'),
    status: document.getElementById('muscle-status')
  }

  // Izomcsoport -> oldal + overlay PNG fájl párosítás
  const muscleImageMap = {
    mell: [{ side: 'front', file: 'mell.png' }],
    hát: [{ side: 'back', file: 'hat.png' }],
    váll: [{ side: 'front', file: 'váll.png' }],
    bicepsz: [{ side: 'front', file: 'bicepsz.png' }],
    tricepsz: [{ side: 'back', file: 'tricepsz.png' }],
    alkar: [{ side: 'front', file: 'alkar.png' }],
    has: [{ side: 'front', file: 'has.png' }],
    ferde_has: [{ side: 'front', file: 'has.png' }],
    alsó_hát: [{ side: 'back', file: 'hat.png' }],
    comb_első: [{ side: 'front', file: 'comb.png' }],
    comb_hátsó: [{ side: 'back', file: 'hatsocomb.png' }],
    farizom: [],
    vádli: [{ side: 'back', file: 'vadli.png' }],
    cardio: [],
    teljes_test: [
      { side: 'front', file: 'mell.png' },
      { side: 'front', file: 'váll.png' },
      { side: 'front', file: 'bicepsz.png' },
      { side: 'front', file: 'alkar.png' },
      { side: 'front', file: 'has.png' },
      { side: 'front', file: 'comb.png' },
      { side: 'back', file: 'hat.png' },
      { side: 'back', file: 'tricepsz.png' },
      { side: 'back', file: 'vadli.png' }
    ]
  }

  // Ha nincs részletes muscle_group lista, dayName alapján fallback csoportok
  const dayNameFallbackMap = [
    { key: 'push', muscles: ['mell', 'váll', 'tricepsz'] },
    { key: 'pull', muscles: ['hát', 'bicepsz'] },
    { key: 'leg', muscles: ['comb_első', 'comb_hátsó', 'vádli', 'has'] },
    { key: 'láb', muscles: ['comb_első', 'comb_hátsó', 'vádli', 'has'] }
  ]

  function getTodayDateString() {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return now.getFullYear() + '-' + month + '-' + day
  }

  // Kikeressük a calendar tömbből a mai naphoz tartozó edzést
  function findTodayWorkout(calendarRows) {
    const todayString = getTodayDateString()

    for (let i = 0; i < calendarRows.length; i++) {
      if (calendarRows[i].date === todayString) {
        return calendarRows[i]
      }
    }

    return null
  }

  // Tracker státusz üzenet frissítése
  function setTrackerStatus(message) {
    trackerElements.status.textContent = message
  }

  // Előző highlight rétegek törlése új render előtt
  function clearTrackerHighlights() {
    if (!trackerElements.highlightLayer) {
      return
    }

    trackerElements.highlightLayer.innerHTML = ''
  }

  // Tömb egyedivé tétele
  function uniqueArray(items) {
    const set = new Set(items)
    return Array.from(set)
  }

  // PPL napnévből visszaadja a hozzá tartozó izomcsoportokat
  function getFallbackMusclesFromDayName(dayName) {
    const lowerName = (dayName || '').toLowerCase()

    for (let i = 0; i < dayNameFallbackMap.length; i++) {
      if (lowerName.includes(dayNameFallbackMap[i].key)) {
        return dayNameFallbackMap[i].muscles
      }
    }

    return []
  }

  // Mai edzésből összegyűjtjük az érintett izomcsoportokat
  // Először dayName fallback, utána exercise.muscle_group
  function collectTodayMuscleGroups(todayWorkout) {
    const pplFallback = getFallbackMusclesFromDayName(todayWorkout?.dayName)

    if (pplFallback.length > 0) {
      return pplFallback
    }

    const groups = []

    if (todayWorkout && Array.isArray(todayWorkout.exercises)) {
      for (let i = 0; i < todayWorkout.exercises.length; i++) {
        const exercise = todayWorkout.exercises[i]

        if (exercise.muscle_group) {
          groups.push(exercise.muscle_group)
        }
      }
    }

    return uniqueArray(groups)
  }

  // Az aktuális oldalra (front/back) kiszedi a szükséges overlay fájlokat
  function getOverlayFilesForSide(muscleGroups, side) {
    const files = new Set()

    for (let i = 0; i < muscleGroups.length; i++) {
      const currentGroup = muscleGroups[i]
      const imageRows = muscleImageMap[currentGroup] || []

      for (let j = 0; j < imageRows.length; j++) {
        if (imageRows[j].side === side) {
          files.add(imageRows[j].file)
        }
      }
    }

    return Array.from(files)
  }

  // Base kép frissítése az aktuális oldal szerint
  function updateBaseImageBySide() {
    return getProcessedBaseSource(trackerState.side).then((processedSource) => {
      trackerElements.baseImage.src = processedSource
    })
  }

  // Általános képloader Promise-szal hogy awaitelhető legyen
  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = source
    })
  }

  // Base SVG-t PNG alfa maszkkal kivágjuk, hogy ne maradjon szürke háttér
  async function getProcessedBaseSource(side) {
    const cacheKey = side === 'front' ? 'front' : 'back'

    // Ha már kész cache-ből megy
    if (trackerState.processedBaseCache[cacheKey]) {
      return trackerState.processedBaseCache[cacheKey]
    }

    const svgPath = side === 'front'
      ? '../images/muscle-tracker/alapelol.svg'
      : '../images/muscle-tracker/alaphatul.svg'

    const maskPath = side === 'front'
      ? '../images/muscle-tracker/alapelol.png'
      : '../images/muscle-tracker/alaphatul.png'

    // SVG forrás + hozzá tartozó PNG maszk betöltése
    const svgImage = await loadImage(svgPath)
    const maskImage = await loadImage(maskPath)

    const width = maskImage.naturalWidth || svgImage.naturalWidth
    const height = maskImage.naturalHeight || svgImage.naturalHeight

    // SVG kirajzolása canvasra
    const svgCanvas = document.createElement('canvas')
    const svgContext = svgCanvas.getContext('2d', { willReadFrequently: true })
    svgCanvas.width = width
    svgCanvas.height = height
    svgContext.drawImage(svgImage, 0, 0, width, height)

    // Maszk kirajzolása külön canvasra
    const maskCanvas = document.createElement('canvas')
    const maskContext = maskCanvas.getContext('2d', { willReadFrequently: true })
    maskCanvas.width = width
    maskCanvas.height = height
    maskContext.drawImage(maskImage, 0, 0, width, height)

    const svgImageData = svgContext.getImageData(0, 0, width, height)
    const maskImageData = maskContext.getImageData(0, 0, width, height)
    const svgPixels = svgImageData.data
    const maskPixels = maskImageData.data

    // Ahol a maszk átlátszó, ott az SVG pixel is legyen átlátszó
    for (let i = 0; i < svgPixels.length; i += 4) {
      const maskAlpha = maskPixels[i + 3]

      if (maskAlpha < 10) {
        svgPixels[i + 3] = 0
      }
    }

    // Visszaírjuk és cache-eljük a kész base képet
    svgContext.putImageData(svgImageData, 0, 0)
    const processedSource = svgCanvas.toDataURL('image/png')
    trackerState.processedBaseCache[cacheKey] = processedSource
    return processedSource
  }

  // Eldönti hogy egy pixel a sárga highlight tartományba esik-e
  // Kombinált RGB + HSV ellenőrzés: így a finomabb sárga átmenetek is bent maradnak
  function isYellowHighlightPixel(r, g, b, a) {
    if (a < 10) {
      return false
    }

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    const v = max / 255
    const s = max === 0 ? 0 : delta / max

    let h = 0
    if (delta !== 0) {
      if (max === r) {
        h = ((g - b) / delta) % 6
      } else if (max === g) {
        h = (b - r) / delta + 2
      } else {
        h = (r - g) / delta + 4
      }
      h = h * 60
      if (h < 0) {
        h += 360
      }
    }

    const isYellowHue = h >= 36 && h <= 66
    const isWarmRgb = r >= 125 && g >= 100 && b <= 165 && r > b + 22 && g > b + 16
    const hasEnoughColor = s >= 0.12 && v >= 0.32

    return isYellowHue && isWarmRgb && hasEnoughColor
  }

  async function getProcessedOverlaySource(fileName, side) {
    const cacheKey = side + ':' + fileName

    // Overlay cache használat
    if (trackerState.processedOverlayCache[cacheKey]) {
      return trackerState.processedOverlayCache[cacheKey]
    }

    const sourcePath = '../images/muscle-tracker/' + fileName
    const image = await loadImage(sourcePath)

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d', { willReadFrequently: true })

    const width = image.naturalWidth
    const height = image.naturalHeight

    canvas.width = width
    canvas.height = height

    context.drawImage(image, 0, 0)

    const imageData = context.getImageData(0, 0, width, height)
    const pixels = imageData.data

    // Nem sárga pixelek átlátszók
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      const a = pixels[i + 3]

      if (!isYellowHighlightPixel(r, g, b, a)) {
        pixels[i + 3] = 0
      }
    }

    // Mentés/cachelés data URL-ként
    context.putImageData(imageData, 0, 0)
    const processedSource = canvas.toDataURL('image/png')
    trackerState.processedOverlayCache[cacheKey] = processedSource

    return processedSource
  }

  // Egy overlay réteg hozzáadása a highlight layerhez
  async function renderOverlayLayer(fileName, side) {
    if (!trackerElements.highlightLayer) {
      return
    }

    // Célzott illesztési finomhangolás csak azokra a rétegekre
    const overlayAlignmentFixes = {
      'front:alkar.png': {
        translateXPercent: 0,
        translateYPercent: -0.5,
        scaleX: 0.97,
        scaleY: 0.985
      },
      'back:hat.png': {
        translateXPercent: 0,
        translateYPercent: -1.2,
        scaleX: 1,
        scaleY: 1
      }
    }

    const processedSource = await getProcessedOverlaySource(fileName, side)
    const layer = document.createElement('img')
    layer.classList.add('muscle-layer', 'muscle-overlay-layer')

    const alignKey = side + ':' + fileName
    const alignFix = overlayAlignmentFixes[alignKey]
    if (alignFix) {
      layer.style.transformOrigin = 'center center'
      layer.style.transform =
        'translate(' + alignFix.translateXPercent + '%, ' + alignFix.translateYPercent + '%) ' +
        'scale(' + alignFix.scaleX + ', ' + alignFix.scaleY + ')'
    }

    layer.src = processedSource
    layer.alt = 'Kiemelt izomréteg'
    trackerElements.highlightLayer.appendChild(layer)
  }

  // Teljes tracker render (base + highlight + státusz)
  async function renderMuscleTracker(todayWorkout) {
    // Előbb base kép, utána highlightok
    await updateBaseImageBySide()
    clearTrackerHighlights()

    // Ha mára nincs edzés
    if (!todayWorkout) {
      setTrackerStatus('Mára nincs betervezett edzésed.')
      return
    }

    // Pihenőnap kezelése
    if (todayWorkout.isRestDay === 1 || todayWorkout.isRestDay === true) {
      setTrackerStatus('Ma pihenőnapod van: ' + (todayWorkout.dayName || 'Pihenőnap'))
      return
    }

    const todayMuscleGroups = collectTodayMuscleGroups(todayWorkout)
    const overlayFiles = getOverlayFilesForSide(todayMuscleGroups, trackerState.side)

    // Ezen az oldalon nincs érintett izom
    if (overlayFiles.length === 0) {
      setTrackerStatus('A mai edzéshez ezen az oldalon nincs kiemelt izomcsoport.')
      return
    }

    // Összes overlay kirajzolása
    for (let i = 0; i < overlayFiles.length; i++) {
      await renderOverlayLayer(overlayFiles[i], trackerState.side)
    }

    setTrackerStatus('Mai fókusz: ' + (todayWorkout.dayName || 'Edzésnap'))
  }

  // Mai edzés lekérése backendről
  async function loadTodayWorkout() {
    if (trackerState.loaded) {
      return trackerState.todayWorkout
    }

    const data = await getFetch('/api/workout/calendar')
    trackerState.todayWorkout = findTodayWorkout(data.calendar || [])
    trackerState.loaded = true
    return trackerState.todayWorkout
  }

  // Front/back váltó gomb logika
  trackerElements.button.addEventListener('click', async () => {
    trackerState.side = trackerState.side === 'front' ? 'back' : 'front'
    await renderMuscleTracker(trackerState.todayWorkout)
  })

  // Edzés Emlékeztető logika
  let myModal = new bootstrap.Modal(document.getElementById('workoutReminderModal'))
  
  async function loadWorkoutReminder() {
      try {
          const data = await getFetch('http://127.0.0.1:3000/api/workout/calendar')

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

    const initializeMuscleTracker = async () => {
      try {
        const todayWorkout = await loadTodayWorkout()
        await renderMuscleTracker(todayWorkout)
      } catch (error) {
        console.error('Hiba a mai izomkövetés betöltésekor:', error)
        setTrackerStatus('Nem sikerült betölteni a mai izomkövetést.')
      }

      if (sessionStorage.getItem('showWorkoutReminder') === 'true') {
        sessionStorage.removeItem('showWorkoutReminder')
        loadWorkoutReminder()
      }
    }

    initializeMuscleTracker()

});