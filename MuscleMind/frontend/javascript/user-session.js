document.addEventListener('DOMContentLoaded', async () => {
    const usernameEl = document.getElementById('username')
    try {
        const response = await fetch('/api/auth/username')
        if (!response.ok) {
            return
        }
        const data = await response.json()
        if (data && data.username) {
            usernameEl.textContent = data.username
        }
    } catch (error) {
        console.error('Nem sikerült lekérni a felhasználónevet:', error)
    }
})
