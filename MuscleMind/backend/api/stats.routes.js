const express = require('express');
const router = express.Router();
const db = require('../sql/database.js');


router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const globalXp = await db.getGlobalXp(userId);
        const stats = await db.getUserStats(userId);
        const prs = await db.getUserPrs(userId);
        const muscleXp = await db.getUserMuscleXp(userId);

        res.status(200).json({
            global_xp: globalXp,
            stats: stats,
            prs: prs,
            muscle_xp: muscleXp
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hiba a statisztikák lekérésekor', error: error.message });
    }
});

module.exports = router;
