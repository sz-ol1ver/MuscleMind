import { getWorkout, postRequest, patchPlan } from './api.js'

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

        // naptar adatok lekerese, completed edzesek miatt mindig kell
        const calRes = await getWorkout('/api/workout/calendar')
        if (calRes.calendar) {
            calRes.calendar.forEach((item) => {
                calendarDataMap[item.date] = item
            })
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

            // adat megjelenites ha nincs is aktiv terv (mentett logok)
            if (calendarDataMap[dateKey]) {
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

                    const spacer = document.createElement('div')
                    spacer.classList.add('flex-grow-1')

                    const toggleBtn = document.createElement('button')
                    toggleBtn.classList.add('btn', 'btn-sm', 'btn-outline-light')
                    toggleBtn.textContent = 'Részletek'

                    const topWrapper = document.createElement('div')
                    topWrapper.classList.add('d-flex', 'align-items-center', 'gap-2', 'w-100')
                    topWrapper.appendChild(badgeSpan)
                    topWrapper.appendChild(nameSpan)
                    topWrapper.appendChild(spacer)
                    topWrapper.appendChild(toggleBtn)

                    const detailsDiv = document.createElement('div')
                    detailsDiv.classList.add('w-100', 'mt-3', 'd-none')
                    detailsDiv.style.backgroundColor = '#2c3034'
                    detailsDiv.style.padding = '10px'
                    detailsDiv.style.borderRadius = '5px'

                    const setsContainer = document.createElement('div')
                    setsContainer.classList.add('d-flex', 'flex-column', 'gap-2')

                    const bottomControls = document.createElement('div')
                    bottomControls.classList.add('d-flex', 'align-items-center', 'justify-content-between', 'mt-2')

                    const addSetBtn = document.createElement('button')
                    addSetBtn.classList.add('btn', 'btn-sm', 'btn-success')
                    addSetBtn.textContent = '+ Sorozat hozzáadása'

                    bottomControls.appendChild(addSetBtn)

                    detailsDiv.appendChild(setsContainer)
                    detailsDiv.appendChild(bottomControls)

                    li.classList.add('flex-column', 'align-items-start')
                    li.appendChild(topWrapper)
                    li.appendChild(detailsDiv)

                    let isLoaded = false
                    let setCounter = 1

                    // ha mar lezart az edzes, letiltunk mindent
                    const isCompleted = currentDayPlan.status === 'completed'

                    if (isCompleted) {
                        addSetBtn.classList.add('d-none')
                    }

                    const saveSetsForExercise = async () => {
                        if (!ex.calendar_exercise_id) {
                            alert('Nem lehet menteni, hiányzik a gyakorlat azonosítója.')
                            return
                        }
                        const rows = setsContainer.querySelectorAll('.set-row')
                        const setsData = []
                        for (let i = 0; i < rows.length; i++) {
                            let row = rows[i]
                            const checkbox = row.querySelector('.row-save-checkbox')
                            if (checkbox && checkbox.checked) {
                                const repVal = row.querySelectorAll('input[type="number"]')[0].value
                                const weightVal = row.querySelectorAll('input[type="number"]')[1].value
                                
                                let parsedRep = 0
                                if (repVal) {
                                    parsedRep = parseInt(repVal)
                                }

                                let parsedWeight = 0
                                if (weightVal) {
                                    parsedWeight = parseFloat(weightVal)
                                }

                                setsData.push({
                                    set_number: parseInt(row.dataset.setNum),
                                    reps_done: parsedRep,
                                    weight_done: parsedWeight
                                })
                            }
                        }

                        try {
                            const data = await postRequest('/api/workout/calendar/sets', {
                                calendarExerciseId: ex.calendar_exercise_id,
                                sets: setsData
                            })
                        } catch (error) {
                            console.error(error)
                            alert(error.message || 'Sikertelen mentés!')
                        }
                    }

                    const createSetRow = (reps = '', weight = '', setNum = setCounter, isSaved = false) => {
                        const row = document.createElement('div')
                        row.classList.add('d-flex', 'gap-2', 'align-items-center', 'set-row')
                        row.dataset.setNum = setNum

                        const rowCheckbox = document.createElement('input')
                        rowCheckbox.type = 'checkbox'
                        rowCheckbox.classList.add('form-check-input', 'row-save-checkbox', 'mt-0')
                        if (isSaved) {
                            rowCheckbox.checked = true
                        }

                        const labelSpan = document.createElement('span')
                        labelSpan.textContent = setNum + '.'

                        const repInput = document.createElement('input')
                        repInput.type = 'number'
                        repInput.classList.add('form-control', 'form-control-sm')
                        repInput.placeholder = 'Ismétlés'
                        repInput.value = reps

                        const weightInput = document.createElement('input')
                        weightInput.type = 'number'
                        weightInput.classList.add('form-control', 'form-control-sm')
                        weightInput.placeholder = 'Súly (kg)'
                        weightInput.value = weight

                        const delBtn = document.createElement('button')
                        delBtn.classList.add('btn', 'btn-sm', 'btn-danger')
                        delBtn.textContent = 'X'
                        
                        if (isCompleted) {
                            repInput.disabled = true
                            weightInput.disabled = true
                            rowCheckbox.disabled = true
                            delBtn.classList.add('d-none')
                        }

                        rowCheckbox.addEventListener('change', () => {
                            if (rowCheckbox.checked) {
                                const repVal = repInput.value
                                const weightVal = weightInput.value
                                if (repVal === '' || weightVal === '') {
                                    alert('Üresen próbáltál menteni. Amatőr hiba.')
                                    rowCheckbox.checked = false
                                    return
                                }
                            }
                            saveSetsForExercise()
                        })

                        delBtn.addEventListener('click', () => {
                            row.remove()
                            // ujraindexeles
                            const rows = setsContainer.querySelectorAll('.set-row')
                            setCounter = 1
                            for (let i = 0; i < rows.length; i++) {
                                let r = rows[i]
                                r.dataset.setNum = setCounter
                                r.querySelector('span').textContent = setCounter + '.'
                                setCounter++
                            }
                            
                            if (!isCompleted) {
                                saveSetsForExercise()
                            }
                        })
                        
                        repInput.addEventListener('input', () => {
                            if (rowCheckbox.checked && !isCompleted) {
                                rowCheckbox.checked = false
                                saveSetsForExercise()
                            }
                        })
                        weightInput.addEventListener('input', () => {
                            if (rowCheckbox.checked && !isCompleted) {
                                rowCheckbox.checked = false
                                saveSetsForExercise()
                            }
                        })

                        row.appendChild(rowCheckbox)
                        row.appendChild(labelSpan)
                        row.appendChild(repInput)
                        row.appendChild(weightInput)
                        row.appendChild(delBtn)

                        setsContainer.appendChild(row)
                        setCounter++
                    }

                    toggleBtn.addEventListener('click', async () => {
                        if (detailsDiv.classList.contains('d-none')) {
                            detailsDiv.classList.remove('d-none')
                            toggleBtn.textContent = 'Összecsukás'
                            
                            if (!isLoaded && ex.calendar_exercise_id) {
                                try {
                                    const res = await getWorkout(`/api/workout/calendar/sets/${ex.calendar_exercise_id}`)
                                    if (res.sets && res.sets.length > 0) {
                                        for (let i = 0; i < res.sets.length; i++) {
                                            const s = res.sets[i]
                                            createSetRow(s.reps_done, s.weight_done, s.set_number, true)
                                        }
                                    } else {
                                        if (!isCompleted) {
                                            createSetRow()
                                        }
                                    }
                                } catch (e) {
                                    console.error(e)
                                    if (!isCompleted) {
                                        createSetRow()
                                    }
                                }
                                isLoaded = true
                            } else if (!isLoaded) {
                                if (!isCompleted) {
                                    createSetRow()
                                }
                                isLoaded = true
                            }
                        } else {
                            detailsDiv.classList.add('d-none')
                            toggleBtn.textContent = 'Részletek'
                        }
                    })

                    addSetBtn.addEventListener('click', () => {
                        createSetRow()
                    })

                    workoutList.appendChild(li)
                }

                // edzes befejezese ha meg pending
                if (currentDayPlan.status === 'pending') {
                    const finishDiv = document.createElement('div')
                    finishDiv.classList.add('d-flex', 'justify-content-end', 'mt-3')

                    const finishBtn = document.createElement('button')
                    finishBtn.classList.add('btn', 'btn-info', 'w-100', 'fw-bold')
                    finishBtn.textContent = 'Edzés befejezése és lezárása'

                    finishBtn.addEventListener('click', async () => {
                        if(!currentDayPlan.log_id) {
                            alert('Érvénytelen edzésnap!')
                            return
                        }

                        if(confirm('Biztosan le akarod zárni az edzést? Utána nem tudsz módosítani az eredményeken!')){
                            try {
                                const data = await patchPlan(`/api/workout/calendar/finish/${currentDayPlan.log_id}`, {})
                                alert('Edzés sikeresen lezárva!')
                                dayDetailsModal.hide()
                                
                                currentDayPlan.status = 'completed'
                                location.reload() 
                            } catch (err) {
                                console.error(err)
                                alert(err.message || 'Sikertelen lezárás!')
                            }
                        }
                    })

                    finishDiv.appendChild(finishBtn)
                    workoutList.appendChild(finishDiv)
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
                if (hasActivePlan) {
                    exerciseHeader.textContent = 'Nincs betervezett edzés'
                } else {
                    exerciseHeader.textContent = 'Nincs aktív edzésterv'
                }
            }

            const li = document.createElement('li')
            li.classList.add('list-group-item', 'bg-dark', 'text-white', 'border-secondary')
            
            if (hasActivePlan) {
                 li.textContent = 'Erre a napra nincs betervezett aktivitás.'
            } else {
                 li.textContent = 'Válassz ki vagy hozz létre egy edzéstervet az Edzésterv menüpontban.'
            }
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