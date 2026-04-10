document.addEventListener('DOMContentLoaded', () => {
    
    const currentDate = new Date()
    let currentMonth = currentDate.getMonth()
    let currentYear = currentDate.getFullYear()
    
    const monthNames = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"]


    // elozo kovi meg felso ev honap
    const calendarDays = document.getElementById("calendar-days")
    const currentMonthYear = document.getElementById("currentMonthYear")
    const prevMonthBtn = document.getElementById("prevMonthBtn")
    const nextMonthBtn = document.getElementById("nextMonthBtn")
    
    // modal elemek
    const dayDetailsModal = new bootstrap.Modal(document.getElementById('dayDetailsModal'))
    const modalDateDisplay = document.getElementById('modal-date-display')
    const workoutList = document.getElementById('workout-list')
    const noWorkoutMsg = document.getElementById('no-workout-msg')
    

    // naptar generalasa
    const renderCalendar = (month, year) => {
        calendarDays.innerHTML = ""
        
        currentMonthYear.innerHTML = year + monthNames[month]
        
        // honap elso napja
        const firstDay = new Date(year, month, 1).getDay()
        // honap teljes hossza
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        
        // 0-6 hetfotol vasarnapig
        let firstDayIndex
        if (firstDay === 0) {
            firstDayIndex = 6
        } else {
            firstDayIndex = firstDay - 1
        }

        // ures dobozok az elso napigf
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyDiv = document.createElement("div")
            emptyDiv.classList.add("calendar-day", "empty-day")
            calendarDays.appendChild(emptyDiv)
        }

        // napok kitoltese
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement("div")
            dayDiv.classList.add("calendar-day")
            
            // ev honap nap formatum
            const dateKey = `${year}-${month + 1}-${day}`

            dayDiv.innerHTML = `<div class="date-number">${day}</div>`

            // highlightoljuk a mai napot
            if (day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
                dayDiv.classList.add("today-highlight")
            }

            // erre nyilik a modal
            dayDiv.addEventListener("click", () => {
                openDayModal(dateKey, year, month, day)
            })

            calendarDays.appendChild(dayDiv)
        }
    }

    const openDayModal = (dateKey, year, month, day) => {
        // cim frissites
        modalDateDisplay.innerHTML = `Dátum: ${year}. ${monthNames[month]} ${day}.`
        
        workoutList.innerHTML = ""
        
        
        // igy kell megnyitni a modalt
        dayDetailsModal.show()
    }

    // elozo, kovi gombok
    prevMonthBtn.addEventListener("click", () => {
        currentMonth--
        if (currentMonth < 0) {
            currentMonth = 11
            currentYear--
        }
        renderCalendar(currentMonth, currentYear)
    })

    nextMonthBtn.addEventListener("click", () => {
        currentMonth++
        if (currentMonth > 11) {
            currentMonth = 0
            currentYear++
        }
        renderCalendar(currentMonth, currentYear)
    })

    // alap generalas
    renderCalendar(currentMonth, currentYear)

    // majd emlekezteto 
    const setReminderBtn = document.getElementById('setReminderBtn')
    setReminderBtn.addEventListener('click', () => {
        alert("asd")
    })
})