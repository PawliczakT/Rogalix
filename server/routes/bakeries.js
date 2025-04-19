import express from 'express';
import Rogal from '../models/Rogal.js';

const router = express.Router();

// @route   GET api/bakeries
// @desc    Get all unique bakeries with coordinates
// @access  Public
router.get('/', async (req, res) => {
    try {
        const year = req.query.year ? Number(req.query.year) : null;
        let rogals;
        if (year) {
            // Filtrowanie po roku z pola 'date'
            rogals = await Rogal.find({
                approved: true,
                $expr: {
                    $eq: [{ $year: "$date" }, year]
                }
            });
        } else {
            rogals = await Rogal.find({ approved: true });
        }
        console.log('QUERY year:', year);
        console.log('ROGALS:', rogals);
        rogals.forEach(rogal => { console.log('ROGAL:', rogal); });
        // Wyciągamy unikalne piekarnie z koordynatami
        const bakeriesMap = {};
        rogals.forEach(rogal => {
            if (
                rogal.bakery &&
                typeof rogal.bakery.address === 'string' &&
                typeof rogal.bakery.lat === 'number' &&
                typeof rogal.bakery.lng === 'number'
            ) {
                // Use address as unique key
                bakeriesMap[rogal.bakery.address] = {
                    address: rogal.bakery.address,
                    lat: rogal.bakery.lat,
                    lng: rogal.bakery.lng
                };
            }
        });
        const bakeries = Object.values(bakeriesMap);
        res.json(bakeries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

export default router;
