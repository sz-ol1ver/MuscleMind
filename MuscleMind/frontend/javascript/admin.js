import {getFetch} from './api.js';

document.addEventListener('DOMContentLoaded', ()=>{
    loadDash();
});

async function loadDash() {
    try {
        const allUser = document.getElementById('stat-allUser');
        const newReg = document.getElementById('stat-todayReg');
        const todayLog = document.getElementById('stat-todayLog');
        const todayTicket = document.getElementById('stat-todayTicket');
        const todayWorkout = document.getElementById('stat-todayWorkout');
        const todayError = document.getElementById('stat-todayError');
        const {dashStats} = await getFetch('http://127.0.0.1:3000/api/admin/dashboard');
        
        allUser.innerHTML = '';
        newReg.innerHTML = '';
        todayLog.innerHTML = '';
        todayTicket.innerHTML = '';
        todayWorkout.innerHTML = '';
        todayError.innerHTML = '';

        allUser.innerHTML = dashStats.allUser;
        newReg.innerHTML = dashStats.todayReg;
        todayLog.innerHTML = dashStats.todayLog;
        todayTicket.innerHTML = dashStats.todayTicket;
        todayWorkout.innerHTML = dashStats.todayWorkout;
        todayError.innerHTML = dashStats.todayError;
    } catch (error) {
        console.error(error.message);
    }
}