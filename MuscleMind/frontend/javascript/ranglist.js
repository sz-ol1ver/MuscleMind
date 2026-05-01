import { getFetch, postRequest } from './api.js'

document.addEventListener('DOMContentLoaded', () => {
    initTabs()
    loadLeaderboard()
    loadFriendsData()

    // kereses esemenykezelo
    const searchBtn = document.getElementById('btn-user-search')
    const searchInput = document.getElementById('user-search-input')
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim()
            if (query.length > 0) {
                searchUsers(query)
            }
        })

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim()
                if (query.length > 0) {
                    searchUsers(query)
                }
            }
        })
    }
})

// tab valtas kezelese
function initTabs() {
    const tabLeaderboard = document.getElementById('tab-leaderboard')
    const tabFriends = document.getElementById('tab-friends')
    const leaderboardContent = document.getElementById('leaderboard-content')
    const friendsContent = document.getElementById('friends-content')

    tabLeaderboard.addEventListener('click', () => {
        tabLeaderboard.classList.add('active-tab')
        tabFriends.classList.remove('active-tab')
        leaderboardContent.classList.remove('d-none')
        friendsContent.classList.add('d-none')
    })

    tabFriends.addEventListener('click', () => {
        tabFriends.classList.add('active-tab')
        tabLeaderboard.classList.remove('active-tab')
        friendsContent.classList.remove('d-none')
        leaderboardContent.classList.add('d-none')
    })
}

// ranglista betoltese
async function loadLeaderboard() {
    try {
        const data = await getFetch('/api/ranglist/leaderboard')
        const listContainer = document.getElementById('leaderboard-list')
        listContainer.innerHTML = ''

        if (data && data.length > 0) {
            // podium (top 3)
            const first = data[0]
            const second = data[1] || null
            const third = data[2] || null

            updatePodium('first-place', first)
            if (second) {
                updatePodium('second-place', second)
            }
            if (third) {
                updatePodium('third-place', third)
            }

            // többiek (4+)
            for (let i = 3; i < data.length; i++) {
                const user = data[i]
                const item = createLeaderboardItem(i + 1, user.username, user.xp)
                listContainer.appendChild(item)
            }
        }
    } catch (error) {
        console.error('Hiba a ranglista betöltésekor:', error)
    }
}

function updatePodium(id, user) {
    const el = document.getElementById(id)
    if (!el) {
        return
    }
    el.querySelector('.name').textContent = user.username
    el.querySelector('.points').textContent = user.xp + ' XP'
}

function createLeaderboardItem(rank, name, xp) {
    const div = document.createElement('div')
    div.className = 'leaderboard-item'
    
    const rankSpan = document.createElement('span')
    rankSpan.className = 'rank'
    rankSpan.textContent = rank + '.'
    
    const nameSpan = document.createElement('span')
    nameSpan.className = 'item-name'
    nameSpan.textContent = name
    
    const pointsSpan = document.createElement('span')
    pointsSpan.className = 'item-points'
    pointsSpan.textContent = xp + ' XP'
    
    div.appendChild(rankSpan)
    div.appendChild(nameSpan)
    div.appendChild(pointsSpan)
    
    return div
}

// baratlista adatok betoltese
async function loadFriendsData() {
    loadFriends()
    loadPendingRequests()
}

async function loadFriends() {
    try {
        const data = await getFetch('/api/ranglist/friends')
        const container = document.getElementById('friends-list')
        container.innerHTML = ''

        if (!data || data.length === 0) {
            const p = document.createElement('p')
            p.className = 'text-muted text-center py-4'
            p.textContent = 'Még nincsenek barátaid. Keress valakit!'
            container.appendChild(p)
            return
        }

        data.forEach(friend => {
            const card = document.createElement('div')
            card.className = 'user-card'
            
            const infoDiv = document.createElement('div')
            infoDiv.className = 'user-info'
            
            const nameDiv = document.createElement('div')
            nameDiv.className = 'user-name'
            nameDiv.textContent = friend.friend_username
            
            infoDiv.appendChild(nameDiv)
            card.appendChild(infoDiv)

            const actionsDiv = document.createElement('div')
            actionsDiv.className = 'user-actions'
            
            const removeBtn = document.createElement('button')
            removeBtn.className = 'btn-reject'
            removeBtn.textContent = 'Törlés'
            removeBtn.onclick = () => removeFriendAction(friend.friendship_id)
            
            actionsDiv.appendChild(removeBtn)
            card.appendChild(actionsDiv)
            
            container.appendChild(card)
        })
    } catch (error) {
        console.error('Hiba a barátok betöltésekor:', error)
    }
}

async function loadPendingRequests() {
    try {
        const data = await getFetch('/api/ranglist/pending')
        const container = document.getElementById('pending-requests')
        container.innerHTML = ''

        if (!data || data.length === 0) {
            const p = document.createElement('p')
            p.className = 'text-muted text-center py-2'
            p.textContent = 'Nincs függőben lévő jelölés.'
            container.appendChild(p)
            return
        }

        data.forEach(req => {
            const card = document.createElement('div')
            card.className = 'user-card'
            
            const infoDiv = document.createElement('div')
            infoDiv.className = 'user-info'
            
            const nameDiv = document.createElement('div')
            nameDiv.className = 'user-name'
            nameDiv.textContent = req.requester_username
            
            infoDiv.appendChild(nameDiv)
            card.appendChild(infoDiv)
            
            const actionsDiv = document.createElement('div')
            actionsDiv.className = 'user-actions'
            
            const acceptBtn = document.createElement('button')
            acceptBtn.className = 'btn-accept'
            acceptBtn.textContent = '✔'
            acceptBtn.onclick = () => respondRequest(req.friendship_id, 'accept')
            
            const rejectBtn = document.createElement('button')
            rejectBtn.className = 'btn-reject'
            rejectBtn.textContent = '✖'
            rejectBtn.onclick = () => respondRequest(req.friendship_id, 'reject')
            
            actionsDiv.appendChild(acceptBtn)
            actionsDiv.appendChild(rejectBtn)
            card.appendChild(actionsDiv)
            
            container.appendChild(card)
        })
    } catch (error) {
        console.error('Hiba a jelölések betöltésekor:', error)
    }
}

// kereses funkcio
async function searchUsers(query) {
    try {
        const data = await getFetch(`/api/ranglist/search?q=${query}`)
        const container = document.getElementById('search-results')
        container.innerHTML = ''

        if (!data || data.length === 0) {
            const p = document.createElement('p')
            p.className = 'text-muted text-center'
            p.textContent = 'Nincs találat.'
            container.appendChild(p)
            return
        }

        data.forEach(user => {
            const card = document.createElement('div')
            card.className = 'user-card'
            
            const infoDiv = document.createElement('div')
            infoDiv.className = 'user-info'
            
            const nameDiv = document.createElement('div')
            nameDiv.className = 'user-name'
            nameDiv.textContent = user.username
            
            infoDiv.appendChild(nameDiv)
            card.appendChild(infoDiv)
            
            const actionsDiv = document.createElement('div')
            actionsDiv.className = 'user-actions'
            
            const sendBtn = document.createElement('button')
            sendBtn.className = 'btn button-sample btn-sm'
            sendBtn.textContent = 'Jelölés'
            sendBtn.onclick = () => sendFriendRequest(user.id)
            
            actionsDiv.appendChild(sendBtn)
            card.appendChild(actionsDiv)
            
            container.appendChild(card)
        })
    } catch (error) {
        console.error('Hiba a kereséskor:', error)
    }
}

// akciok
async function sendFriendRequest(targetId) {
    try {
        const res = await postRequest('/api/ranglist/send', { targetId })
        alert(res.message)
        // frissitjuk a keresest vagy kiuritjuk
        document.getElementById('search-results').innerHTML = ''
        document.getElementById('user-search-input').value = ''
    } catch (error) {
        alert(error.message)
    }
}

async function respondRequest(friendshipId, action) {
    try {
        let url = ''
        if (action === 'accept') {
            url = '/api/ranglist/accept'
        } else {
            url = '/api/ranglist/reject'
        }
        const res = await postRequest(url, { friendshipId })
        loadFriendsData() // ujratoltes
    } catch (error) {
        alert(error.message)
    }
}

async function removeFriendAction(friendshipId) {
    if (confirm('Biztosan törölni akarod ezt a barátot?')) {
        try {
            await postRequest('/api/ranglist/remove', { friendshipId })
            loadFriendsData()
        } catch (error) {
            alert(error.message)
        }
    }
}
