import { updateProfile } from './api.js';

let originalData = {}
document.addEventListener("DOMContentLoaded", async () => {
    
    // lekeres
    try {
        const response = await fetch('/api/auth/profile')
        
        if (response.ok) {
            const data = await response.json()
            originalData = data
            loadData(data)
        }

    } catch (error) {
        console.log("Valami nem gyó", error)
    }

    //gombok stb
    const editPersonalButton = document.getElementById('editPersonalButton')
    const editPreferencesButton = document.getElementById('editPreferencesButton')
    const savePersonalButton = document.getElementById('savePersonalButton')
    const savePreferencesButton = document.getElementById('savePreferencesButton')
    
    const personalSection = document.getElementById('personal-section')
    const preferencesSection = document.getElementById('preferences-section')

    //adatok betoltese
    function loadData(data) {
        //alap adatok
        if (data.basic) {
            if (data.basic.username) {
                document.getElementById('Nev').value = data.basic.username
            }
            if (data.basic.last_name) {
                document.getElementById('Vezetéknév').value = data.basic.last_name
            }
            if (data.basic.first_name) {
                document.getElementById('Keresztnév').value = data.basic.first_name
            }
            if (data.basic.email) {
                document.getElementById('Email').value = data.basic.email
            }
        }

        //kerdoiv adatok
        if (data.preferences) {
            if (data.preferences.age) {
                document.getElementById('Kor').value = data.preferences.age
            }
            if (data.preferences.height) {
                document.getElementById('Magassag').value = data.preferences.height
            }
            
            //kerdoives gombok
            const savedButtons = [
                data.preferences.goal,
                data.preferences.experience_level,
                data.preferences.training_days, 
                data.preferences.training_location,
                data.preferences.diet_type, 
                data.preferences.meals_per_day
            ]

            const buttons = document.querySelectorAll(".purpose")
            for(let i=0; i<buttons.length; i++) {
                buttons[i].classList.remove("active")
            }

            for (let i = 0; i < buttons.length; i++) {
                for (let j = 0; j < savedButtons.length; j++) {
                    if (buttons[i].value == savedButtons[j]) {
                        buttons[i].classList.add("active")
                    }
                }
            }
        }

        //suly
        if (data.weight) {
            if (data.weight.weight) {
                document.getElementById('Súly').value = data.weight.weight
            }
        }
    }

    //alap adatok szerkesztes-------------------
    editPersonalButton.addEventListener('click', () => {
        const inputs = personalSection.querySelectorAll('input')
        
        if (editPersonalButton.textContent == "Szerkesztés") {

            editPersonalButton.textContent = "Mégse"
            editPersonalButton.style.backgroundColor = "red"
            
            for (let i = 0; i < inputs.length; i++) {
                if (inputs[i].getAttribute('type') != 'button' && inputs[i].getAttribute('type') != 'file') {
                     inputs[i].disabled = false

                     if (inputs[i].type == "text" || inputs[i].type == "email" || inputs[i].type == "password") {
                         inputs[i].value = ""
                     }
                }
            }
        } else {
            //mégse szerkesztett
            editPersonalButton.textContent = "Szerkesztés"
            restorePersonalData()
        }
    })

    //kerdoives adatok szerkesztes-------------------
    editPreferencesButton.addEventListener('click', () => {
        const inputs = preferencesSection.querySelectorAll('input')
        const buttons = preferencesSection.querySelectorAll('.purpose')

        if (editPreferencesButton.textContent == "Szerkesztés") {

            editPreferencesButton.textContent = "Mégse"
            editPreferencesButton.style.backgroundColor = "red"
            
            //input meg gombok feloldva es uresek
            for (let i = 0; i < inputs.length; i++) {
                if (inputs[i].type != 'button') {
                     inputs[i].disabled = false

                     if (inputs[i].type == "number" || inputs[i].type == "text") {
                         inputs[i].value = ""
                     }
                } else if(inputs[i].name) {
                     inputs[i].disabled = false
                }
            }

            for(let i = 0; i < buttons.length; i++) {
                buttons[i].classList.remove("active")
            }
            
        } else {
            //megse szerkesztett
            editPreferencesButton.textContent = "Szerkesztés"
            restorePreferencesData()
        }
    })


    //Mentes---------------------
    async function handleSave() {
        //alapadatok hogy ne kelljen mindenhol lekerni a valuet + a kerdoives amiknel number az input
        let usernameVal = document.getElementById('Nev').value
        let firstNameVal = document.getElementById('Keresztnév').value
        let lastNameVal = document.getElementById('Vezetéknév').value
        let emailVal = document.getElementById('Email').value
        let passwordVal = document.getElementById('Jelszo').value
        
        let ageVal = document.getElementById('Kor').value
        let heightVal = document.getElementById('Magassag').value
        let weightVal = document.getElementById('Súly').value

        //ha ures (nem volt valtozas) akkor vissza eredeti adatra
        if (usernameVal == "") {
            if (originalData.basic && originalData.basic.username) {
                usernameVal = originalData.basic.username
            }
        }
        if (firstNameVal == "") {
            if (originalData.basic && originalData.basic.first_name) {
                firstNameVal = originalData.basic.first_name
            }
        }
        if (lastNameVal == "") {
            if (originalData.basic && originalData.basic.last_name) {
                lastNameVal = originalData.basic.last_name
            }
        }
        if (emailVal == "") {
            if (originalData.basic && originalData.basic.email) {
                emailVal = originalData.basic.email
            }
        }

        if (ageVal == "") {
            if (originalData.preferences && originalData.preferences.age) {
                ageVal = originalData.preferences.age
            }
        }
        if (heightVal == "") {
            if (originalData.preferences && originalData.preferences.height) {
                heightVal = originalData.preferences.height
            }
        }
        if (weightVal == "") {
            if (originalData.weight && originalData.weight.weight) {
                weightVal = originalData.weight.weight
            }
        }

        //kerdoives gombok
        let goalVal = getSelectedValue('goal')
        if (!goalVal) {
             if (originalData.preferences && originalData.preferences.goal) {
                 goalVal = originalData.preferences.goal
             }
        }
        
        let levelVal = getSelectedValue('level')
        if (!levelVal) {
            if (originalData.preferences && originalData.preferences.experience_level) {
                levelVal = originalData.preferences.experience_level
            }
        }

        let daysVal = getSelectedValue('days')
        if (!daysVal) {
            if (originalData.preferences && originalData.preferences.training_days) {
                daysVal = originalData.preferences.training_days
            }
        }

        let locationVal = getSelectedValue('location')
        if (!locationVal) {
            if (originalData.preferences && originalData.preferences.training_location) {
                locationVal = originalData.preferences.training_location
            }
        }

        let dietVal = getSelectedValue('diet')
        if (!dietVal) {
            if (originalData.preferences && originalData.preferences.diet_type) {
                dietVal = originalData.preferences.diet_type
            }
        }

        let mealsVal = getSelectedValue('meals')
        if (!mealsVal) {
            if (originalData.preferences && originalData.preferences.meals_per_day) {
                mealsVal = originalData.preferences.meals_per_day
            }
        }


        let newData = {
            username: usernameVal,
            first_name: firstNameVal,
            last_name: lastNameVal,
            email: emailVal,
            password: passwordVal,
            
            age: ageVal,
            height: heightVal,
            weight: weightVal,

            goal: goalVal,
            experience_level: levelVal,
            training_days: daysVal,
            training_location: locationVal,
            diet_type: dietVal,
            meals_per_day: mealsVal,
        }
        
        const allInputs = document.querySelectorAll('input')
        let inEditMode = false
        let hasNewInput = false

        for(let i=0; i<allInputs.length; i++) {
            if(!allInputs[i].disabled && allInputs[i].type != 'button' && allInputs[i].type != 'file' && allInputs[i].type != 'checkbox') {
                inEditMode = true
                if(allInputs[i].value != "") {
                    hasNewInput = true
                }
            }
        }
        
        //gombok ellenorzese
        const activeButtons = document.querySelectorAll('.purpose.active')
        if(activeButtons.length > 0) {
            if(!activeButtons[0].disabled) {
                hasNewInput = true
            }
        }

        if(!inEditMode) {
             return 
        }

        if(!hasNewInput) {
            alert("Nem adtál meg új adatokat!")
            if(editPersonalButton.textContent == "Mégse"){
                editPersonalButton.click()
            }
            if(editPreferencesButton.textContent == "Mégse"){
                editPreferencesButton.click()
            }
            return
        }

        //uj adatok kuldese
        try {
            const data = await updateProfile('/api/auth/profile/update', newData)
            if(data) {
                alert("Sikeres mentés!")
                location.reload() //refreshelodik az oldal
            }
        } catch(error) {
            console.log(error)
            alert("Hiba mentés közben.")
        }
    }

    if (savePersonalButton) {
        savePersonalButton.addEventListener('click', handleSave)
    }
    if (savePreferencesButton) {
        savePreferencesButton.addEventListener('click', handleSave)
    }



    function getSelectedValue(name) {
        const btns = document.getElementsByName(name)
        for(let i=0; i<btns.length; i++) {
            if(btns[i].classList.contains('active')) {
                return btns[i].value
            }
        }
        return null
    }


    //ha nemvolt valtozas akkor vissza eredeti adatra (szemelyes adatok)
    function restorePersonalData() {
        if (!originalData.basic) {
            return
        }
        const inputs = personalSection.querySelectorAll('input')
        
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].id != 'savePersonalButton') {
                inputs[i].disabled = true
            }
        }

        if (originalData.basic.username) {
            document.getElementById('Nev').value = originalData.basic.username
        }
        if (originalData.basic.last_name) {
            document.getElementById('Vezetéknév').value = originalData.basic.last_name
        }
        if (originalData.basic.first_name) {
            document.getElementById('Keresztnév').value = originalData.basic.first_name
        }
        if (originalData.basic.email) {
            document.getElementById('Email').value = originalData.basic.email
        }
        if (originalData.preferences) {
             document.getElementById('Kor').value = originalData.preferences.age
        }
    }


    //ha nemvolt valtozas akkor vissza eredeti adatra (kerdoives adatok)
    function restorePreferencesData() {
        const inputs = preferencesSection.querySelectorAll('input')
        
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i].id != 'savePreferencesButton') {
                inputs[i].disabled = true
            }
        }

        if(originalData.preferences) {
             document.getElementById('Magassag').value = originalData.preferences.height
        }
        if(originalData.weight) {
             document.getElementById('Súly').value = originalData.weight.weight
        }

        const savedButtons = []
        if(originalData.preferences) {
            savedButtons.push(originalData.preferences.goal)
            savedButtons.push(originalData.preferences.experience_level)
            savedButtons.push(originalData.preferences.training_days)
            savedButtons.push(originalData.preferences.training_location)
            savedButtons.push(originalData.preferences.diet_type)
            savedButtons.push(originalData.preferences.meals_per_day)
        }

        const buttons = preferencesSection.querySelectorAll(".purpose")
        for(let i=0; i<buttons.length; i++) {
            buttons[i].classList.remove("active")
            for(let j=0; j<savedButtons.length; j++) {
                if(buttons[i].value == savedButtons[j]) {
                    buttons[i].classList.add("active")
                }
            }
        }
    }
// ----------------------------------------------------------------------
    const purposeButtons = document.querySelectorAll(".purpose")

    for (let i = 0; i < purposeButtons.length; i++) {
        purposeButtons[i].addEventListener("click", function(event) {
            if(this.disabled) {
                return 
            }

            const clickedButton = event.currentTarget
            const groupName = clickedButton.name 

            const groupButtons = document.getElementsByName(groupName)

            for (let j = 0; j < groupButtons.length; j++) {
                groupButtons[j].classList.remove("active")
            }

            clickedButton.classList.add("active")
        })
    }
})