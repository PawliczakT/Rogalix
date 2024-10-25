import Rogal from '../models/Rogal.js';

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
            price: parseFloat(price.replace(',', '.')), // Parse price as float
            weight: parseFloat(weight.replace(',', '.')), // Parse weight as float
            user: req.user.id,
            image: req.file ? req.file.location : null,
        });

        const rogal = await newRogal.save();
        console.log('New Rogal added:', rogal); // Log the new rogal
        res.json(rogal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getAllRogals = async (req, res) => {
    try {
        const rogals = await Rogal.find().populate('user', ['name']);
        res.json(rogals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getRogalStatistics = async (req, res) => {
    try {
        const rogals = await Rogal.find();
        const stats = rogals.reduce(
            (acc, rogal) => {
                const totalRating = rogal.ratings.reduce((sum, rating) => sum + rating.rating, 0);
                const avgRating = rogal.ratings.length ? totalRating / rogal.ratings.length : 0;

                acc.totalRogals += 1;
                acc.totalRatings += rogal.ratings.length;
                acc.totalRatingSum += totalRating;
                acc.totalPrice += parseFloat(rogal.price) || 0; // Ensure price is parsed as a float
                acc.totalWeight += parseFloat(rogal.weight) || 0; // Ensure weight is parsed as a float

                if (avgRating > acc.highestRating) {
                    acc.highestRating = avgRating;
                    acc.bestRogal = rogal.name;
                }
                if (avgRating < acc.lowestRating || acc.lowestRating === 0) {
                    acc.lowestRating = avgRating;
                    acc.worstRogal = rogal.name;
                }

                return acc;
            },
            {
                totalRogals: 0,
                totalRatings: 0,
                totalRatingSum: 0,
                highestRating: 0,
                lowestRating: 0,
                bestRogal: null,
                worstRogal: null,
                totalPrice: 0,
                totalWeight: 0,
            }
        );

        stats.averageRating = stats.totalRatings ? stats.totalRatingSum / stats.totalRatings : 0;
        stats.averagePrice = stats.totalRogals ? stats.totalPrice / stats.totalRogals : 0;
        stats.averageWeight = stats.totalRogals ? stats.totalWeight / stats.totalRogals : 0;

        res.json(stats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

const getTop10Rogals = async (req, res) => {
    try {
        const rogals = await Rogal.find();
        const rogalsWithAnalytics = await Promise.all(rogals.map(async (rogal) => {
            const totalRatings = rogal.ratings.length;
            const averageRating = totalRatings > 0 ?
                rogal.ratings.reduce((acc, rating) => acc + rating.rating, 0) / totalRatings : 0;

            const metrics = await rogalAnalytics.generateQualityMetrics({
                name: rogal.name,
                price: rogal.price,
                weight: rogal.weight,
                ratings: rogal.ratings,
                averageRating
            });

            return {
                ...rogal._doc,
                averageRating,
                pricePerKg: (rogal.price / rogal.weight) * 1000,
                metrics
            };
        }));

        const top10Rogals = rogalsWithAnalytics
            .sort((a, b) => b.metrics.normalizedQualityScore - a.metrics.normalizedQualityScore)
            .slice(0, 10);

        res.json(top10Rogals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

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

const analyzeRogalTrends = async (req, res) => {
    try {
        const rogals = await Rogal.find()
            .populate('user', ['name'])
            .populate('ratings.user', ['name']);

        const rogalsWithMetrics = await Promise.all(rogals.map(async (rogal) => {
            const metrics = await rogalAnalytics.generateQualityMetrics({
                name: rogal.name,
                price: rogal.price,
                weight: rogal.weight,
                ratings: rogal.ratings,
                averageRating: rogal.averageRating,
                pricePerKg: (rogal.price / rogal.weight) * 1000
            });

            return {
                ...rogal.toObject(),
                metrics
            };
        }));

        const analysis = await rogalAnalytics.analyzeRogalTrends(rogalsWithMetrics);

        res.json({
            rogals: rogalsWithMetrics,
            analysis
        });
    } catch (err) {
        console.error('Error analyzing rogal trends:', err);
        res.status(500).json({ error: err.message });
    }
};

const analyzeUserPreferences = async (req, res) => {
    try {
        const rogals = await Rogal.find()
            .populate('ratings.user', ['name']);

        const allRatings = rogals.reduce((acc, rogal) => {
            return acc.concat(rogal.ratings.map(rating => ({
                ...rating.toObject(),
                rogalName: rogal.name,
                rogalPrice: rogal.price,
                rogalWeight: rogal.weight
            })));
        }, []);

        const analysis = await rogalAnalytics.analyzeUserPreferences(allRatings);

        res.json({
            ratings: allRatings,
            analysis
        });
    } catch (err) {
        console.error('Error analyzing user preferences:', err);
        res.status(500).json({ error: err.message });
    }
};

export default { addRogal, getAllRogals, getRogalStatistics, getTop10Rogals, getTop10QualityRogals };
