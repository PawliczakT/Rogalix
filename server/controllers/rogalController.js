import Rogal from '../models/Rogal.js';

// Add a new rogal
const addRogal = async (req, res) => {
    const { name, description, price, weight } = req.body;
    try {
        const existingRogal = await Rogal.findOne({ name });
        if (existingRogal) {
            return res.status(400).json({ msg: 'Rogal with this name already exists' });
        }

        const newRogal = new Rogal({
            name,
            description,
            price,
            weight,
            user: req.user.id,
            image: req.file ? req.file.path : null,
        });

        const rogal = await newRogal.save();
        res.json(rogal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get all rogals
const getAllRogals = async (req, res) => {
    try {
        const rogals = await Rogal.find().populate('user', ['name']);
        res.json(rogals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get rogal statistics
const getRogalStatistics = async (req, res) => {
    try {
        const rogals = await Rogal.find();
        const stats = rogals.reduce((acc, rogal) => {
            const totalRating = rogal.ratings.reduce((sum, rating) => sum + rating.rating, 0);
            const avgRating = rogal.ratings.length ? totalRating / rogal.ratings.length : 0;
            acc.totalRogals += 1;
            acc.totalRatings += rogal.ratings.length;
            acc.averageRating += avgRating;

            if (rogal.ratings.length > 0) {
                if (avgRating > acc.highestRating) {
                    acc.highestRating = avgRating;
                    acc.bestRogal = rogal.name;
                }
                if (avgRating < acc.lowestRating || acc.lowestRating === 0) {
                    acc.lowestRating = avgRating;
                    acc.worstRogal = rogal.name;
                }
            }

            return acc;
        }, {
            totalRogals: 0,
            totalRatings: 0,
            averageRating: 0,
            highestRating: 0,
            lowestRating: 0,
            bestRogal: null,
            worstRogal: null
        });

        stats.averageRating = stats.totalRatings ? (stats.averageRating / stats.totalRogals) : 0;
        res.json(stats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get top 10 rogals by average rating
const getTop10Rogals = async (req, res) => {
    try {
        const rogals = await Rogal.find();
        const top10Rogals = rogals.map((rogal) => {
            const totalRatings = rogal.ratings.length;
            const averageRating = totalRatings > 0 ? rogal.ratings.reduce((acc, rating) => acc + rating.rating, 0) / totalRatings : 0;
            const pricePerKg = rogal.price && rogal.weight ? (rogal.price / rogal.weight) * 1000 : 0;
            const qualityToPriceRatio = averageRating > 0 && rogal.price > 0 ? (averageRating / rogal.price) * 100 : 0;
            return {
                ...rogal._doc,
                averageRating,
                pricePerKg,
                qualityToPriceRatio
            };
        }).sort((a, b) => b.averageRating - a.averageRating).slice(0, 10);

        res.json(top10Rogals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get top 10 rogals by quality to price ratio
const getTop10QualityRogals = async (req, res) => {
    try {
        const rogals = await Rogal.find();
        const top10QualityRogals = rogals.map((rogal) => {
            const totalRatings = rogal.ratings.length;
            const averageRating = totalRatings > 0 ? rogal.ratings.reduce((acc, rating) => acc + rating.rating, 0) / totalRatings : 0;
            const pricePerKg = rogal.price && rogal.weight ? (rogal.price / rogal.weight) * 1000 : 0;
            const qualityToPriceRatio = averageRating > 0 && rogal.price > 0 ? (averageRating / rogal.price) * 100 : 0;
            return {
                ...rogal._doc,
                averageRating,
                pricePerKg,
                qualityToPriceRatio
            };
        }).sort((a, b) => b.qualityToPriceRatio - a.qualityToPriceRatio).slice(0, 10);

        res.json(top10QualityRogals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

export default { addRogal, getAllRogals, getRogalStatistics, getTop10Rogals, getTop10QualityRogals };
