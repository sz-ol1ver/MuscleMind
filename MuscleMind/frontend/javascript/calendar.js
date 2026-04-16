import { getWorkout } from './api.js'

document.addEventListener('DOMContentLoaded', async () => {
    let calendarDataMap = {} // naptar adatok letarolasa
    let hasActivePlan = false

    try {
        const response = await getWorkout('/api/workout/plans/active')
        if (response.active) {
            hasActivePlan = true
        } else {
            hasActivePlan = false
        }

        if (hasActivePlan) {
            const calRes = await getWorkout('/api/workout/calendar')
            // naptar adatok lekerese
            if (calRes.calendar) {
                // adatok feldolgozasa
                calRes.calendar.forEach((item) => {
                    calendarDataMap[item.date] = item
                })
            }
        }
    } catch (err) {
        console.error('Nem sikerült lekérni a naptár adatokat:', err)
    }

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

        currentMonthYear.innerHTML = year + ' ' + monthNames[month]

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
            const dayDiv = document.createElement('div')
            dayDiv.classList.add('calendar-day')

            let monthStr = month + 1
            if (monthStr < 10) {
                monthStr = '0' + monthStr
            }

            let dayStr = day
            if (dayStr < 10) {
                dayStr = '0' + dayStr
            }

            const dateKey = year + '-' + monthStr + '-' + dayStr

            let currentDayPlan = null

            const dateNumberDiv = document.createElement('div')
            dateNumberDiv.classList.add('date-number')
            dateNumberDiv.textContent = day
            dayDiv.appendChild(dateNumberDiv)

            if (hasActivePlan && calendarDataMap[dateKey]) {
                currentDayPlan = calendarDataMap[dateKey]

                let displayName = currentDayPlan.dayName
                if (!displayName) {
                    if (currentDayPlan.isRestDay) {
                        displayName = 'Pihenőnap'
                    } else {
                        displayName = 'Edzés'
                    }
                }

                const workoutDiv = document.createElement('div')
                workoutDiv.classList.add('workout-name', 'mt-2', 'p-1', 'rounded')
                workoutDiv.style.fontSize = '14px'
                workoutDiv.style.textAlign = 'center'

                if (currentDayPlan.isRestDay) {
                    workoutDiv.style.backgroundColor = 'rgba(255, 193, 7, 0.2)'
                    workoutDiv.style.color = '#ffc107'
                } else {
                    workoutDiv.style.backgroundColor = 'rgba(40, 167, 69, 0.2)'
                    workoutDiv.style.color = '#28a745'
                }


                // ez a tag ilyen felkover szoveget csinal
                const boldName = document.createElement('b')
                boldName.textContent = displayName
                workoutDiv.appendChild(boldName)

                dayDiv.appendChild(workoutDiv)
            }

            // highlightoljuk a mai napot
            if (day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
                dayDiv.classList.add("today-highlight")
            }

            // erre nyilik a modal
            dayDiv.addEventListener("click", () => {
                openDayModal(year, month, day, currentDayPlan)
            })

            calendarDays.appendChild(dayDiv)
        }
    }

    const openDayModal = (year, month, day, currentDayPlan) => {
        // cim frissites
        modalDateDisplay.innerHTML = `Dátum: ${year}. ${monthNames[month]} ${day}.`

        workoutList.innerHTML = ""

        const workoutDetailsContainer = document.getElementById('workout-details-container')

        if (currentDayPlan) {
            const exerciseHeader = workoutDetailsContainer.querySelector('h6')
            if (exerciseHeader) {
                // nev atadasa
                exerciseHeader.textContent = currentDayPlan.dayName

                if (currentDayPlan.isRestDay) {
                    exerciseHeader.className = 'text-warning fw-bold mb-3 ms-1'
                } else {
                    exerciseHeader.className = 'text-success fw-bold mb-3 ms-1'
                }
            }

            // pihenonap ellenorzes
            if (currentDayPlan.isRestDay) {
                const li = document.createElement('li')
                li.classList.add('list-group-item', 'bg-dark', 'text-white', 'border-secondary')
                li.textContent = 'Nincs betervezett gyakorlat (Pihenőnap)'
                workoutList.appendChild(li)
            } else if (currentDayPlan.exercises && currentDayPlan.exercises.length > 0) {
                // gyakorlatok rendezese
                let exerciseList = []
                for (let i = 0; i < currentDayPlan.exercises.length; i++) {
                    exerciseList.push(currentDayPlan.exercises[i])
                }

                // gyakorlatok sorba rakasa order alapjan
                for (let i = 0; i < exerciseList.length; i++) {
                    for (let j = 0; j < exerciseList.length - 1 - i; j++) {
                        if (exerciseList[j].order > exerciseList[j + 1].order) {
                            let temp = exerciseList[j]
                            exerciseList[j] = exerciseList[j + 1]
                            exerciseList[j + 1] = temp
                        }
                    }
                }

                for (let i = 0; i < exerciseList.length; i++) {
                    let ex = exerciseList[i]
                    const li = document.createElement('li')
                    li.classList.add('list-group-item', 'bg-dark', 'text-white', 'border-secondary', 'd-flex', 'align-items-center', 'gap-2')

                    const badgeSpan = document.createElement('span')
                    badgeSpan.classList.add('badge', 'bg-secondary', 'rounded-pill')
                    badgeSpan.textContent = ex.order + '.'

                    const nameSpan = document.createElement('span')
                    nameSpan.textContent = ex.name

                    li.appendChild(badgeSpan)
                    li.appendChild(nameSpan)

                    workoutList.appendChild(li)
                }
            } else {
                const li = document.createElement('li')
                li.classList.add('list-group-item', 'bg-dark', 'text-white', 'border-secondary')
                li.textContent = 'Ehhez a naphoz nincsenek gyakorlatok hozzadvda.'
                workoutList.appendChild(li)
            }
        } else {
            const exerciseHeader = workoutDetailsContainer.querySelector('h6')
            if (exerciseHeader) {
                exerciseHeader.textContent = 'Nincs aktív edzésterv'
            }

            const li = document.createElement('li')
            li.classList.add('list-group-item', 'bg-dark', 'text-white', 'border-secondary')
            li.textContent = 'Válassz ki vagy hozz létre egy edzéstervet az Edzésterv menüpontban.'
            workoutList.appendChild(li)
        }

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