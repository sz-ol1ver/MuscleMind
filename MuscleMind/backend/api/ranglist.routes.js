const express = require('express')
const router = express.Router()
const db = require('../sql/database.js')
const loginMw = require('../middleware/login.middleware.js')
const requestIp = require('request-ip')

// GET /api/ranglist/leaderboard
router.get('/leaderboard', loginMw.requireAuthApi, async (req, res) => {
    try {
        const leaderboard = await db.getLeaderboard(req.session.user.id)
        res.status(200).json(leaderboard)
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: 'Sikertelen lekérés!' })
    }
})

// GET /api/ranglist/friends
router.get('/friends', loginMw.requireAuthApi, async (req, res) => {
    try {
        const friends = await db.getFriends(req.session.user.id)
        res.status(200).json(friends)
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: 'Sikertelen lekérés!' })
    }
})

// GET /api/ranglist/pending
router.get('/pending', loginMw.requireAuthApi, async (req, res) => {
    try {
        const pending = await db.getPendingRequests(req.session.user.id)
        res.status(200).json(pending)
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: 'Sikertelen lekérés!' })
    }
})

// GET /api/ranglist/search?q=...
router.get('/search', loginMw.requireAuthApi, async (req, res) => {
    try {
        const query = req.query.q
        if (!query) return res.status(400).json({ message: 'Hiányzó keresési feltétel!' })
        const users = await db.searchUsers(query, req.session.user.id)
        res.status(200).json(users)
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: 'Sikertelen keresés!' })
    }
})

// POST /api/ranglist/send
router.post('/send', loginMw.requireAuthApi, async (req, res) => {
    try {
        const { targetId } = req.body
        if (!targetId) return res.status(400).json({ message: 'Hiányzó cél azonosító!' })
        
        const existing = await db.checkExistingFriendship(req.session.user.id, targetId)
        if (existing) {
            return res.status(400).json({ message: 'Már létezik kapcsolat vagy jelölés!' })
        }

        await db.sendFriendRequest(req.session.user.id, targetId)
        res.status(200).json({ message: 'Jelölés elküldve!' })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: 'Sikertelen művelet!' })
    }
})

// POST /api/ranglist/accept
router.post('/accept', loginMw.requireAuthApi, async (req, res) => {
    try {
        const { friendshipId } = req.body
        if (!friendshipId) return res.status(400).json({ message: 'Hiányzó azonosító!' })
        
        const affected = await db.acceptFriendRequest(friendshipId, req.session.user.id)
        if (affected === 0) return res.status(400).json({ message: 'Sikertelen elfogadás!' })

        res.status(200).json({ message: 'Jelölés elfogadva!' })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: 'Sikertelen művelet!' })
    }
})

// POST /api/ranglist/reject
router.post('/reject', loginMw.requireAuthApi, async (req, res) => {
    try {
        const { friendshipId } = req.body
        if (!friendshipId) return res.status(400).json({ message: 'Hiányzó azonosító!' })
        
        const affected = await db.rejectFriendRequest(friendshipId, req.session.user.id)
        if (affected === 0) return res.status(400).json({ message: 'Sikertelen elutasítás!' })

        res.status(200).json({ message: 'Jelölés elutasítva!' })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: 'Sikertelen művelet!' })
    }
})

// POST /api/ranglist/remove
router.post('/remove', loginMw.requireAuthApi, async (req, res) => {
    try {
        const { friendshipId } = req.body
        if (!friendshipId) return res.status(400).json({ message: 'Hiányzó azonosító!' })
        
        const affected = await db.removeFriend(friendshipId, req.session.user.id)
        if (affected === 0) return res.status(400).json({ message: 'Sikertelen törlés!' })

        res.status(200).json({ message: 'Barát eltávolítva!' })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: 'Sikertelen művelet!' })
    }
})

module.exports = router
