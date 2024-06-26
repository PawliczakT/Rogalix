import express from 'express';
import multer from 'multer';
import { check, validationResult } from 'express-validator';
import { auth, adminAuth } from '../middlewares/auth.js';
import Rogal from '../models/Rogal.js';
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

// @route   POST api/rogals
// @desc    Add a new rogal
// @access  Private
router.post(
    '/',
    [auth, upload.single('image')],
    [
        check('name', 'Name is required').not().isEmpty(),
        check('price', 'Price is required and must be a valid number').custom(value => {
            const parsedValue = parseFloat(value.replace(',', '.'));
            if (isNaN(parsedValue) || parsedValue <= 0) {
                throw new Error('Price must be a positive number');
            }
            return true;
        }),
        check('weight', 'Weight is required and must be a positive number').isFloat({ min: 0 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, description, price, weight } = req.body;

            // Check if a rogal with the same name already exists
            const existingRogal = await Rogal.findOne({ name });
            if (existingRogal) {
                return res.status(400).json({ msg: 'A rogal with this name already exists' });
            }

            const formattedPrice = parseFloat(price.replace(',', '.')).toFixed(2);

            const newRogal = new Rogal({
                name,
                description,
                price: formattedPrice,
                weight,
                user: req.user.id,
                image: req.file ? req.file.path : null,
                approved: false
            });

            const rogal = await newRogal.save();
            res.json(rogal);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   GET api/rogals/admin
// @desc    Get all rogals for admin
// @access  Private/Admin
router.get('/admin', [auth, adminAuth], async (req, res) => {
    try {
        const rogals = await Rogal.find().populate('user', ['name']);
        const rogalsWithAdditionalInfo = rogals.map(rogal => {
            const averageRating = rogal.ratings.length ? (rogal.ratings.reduce((sum, rating) => sum + rating.rating, 0) / rogal.ratings.length) : 0;
            const pricePerKg = (rogal.price / rogal.weight) * 1000;
            const qualityToPriceRatio = pricePerKg > 0 ? (averageRating / pricePerKg) * 100 : 0;

            return {
                ...rogal.toObject(),
                averageRating: Number(averageRating), // Ensure averageRating is a number
                qualityToPriceRatio,
                pricePerKg
            };
        });

        res.json(rogalsWithAdditionalInfo);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/rogals/approve/:id
// @desc    Approve a rogal
// @access  Private/Admin
router.put('/approve/:id', [auth, adminAuth], async (req, res) => {
    try {
        const rogal = await Rogal.findById(req.params.id);

        if (!rogal) {
            return res.status(404).json({ msg: 'Rogal not found' });
        }

        rogal.approved = true;
        await rogal.save();

        res.json(rogal);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Rogal not found' });
        }
        res.status(500).send('Server error');
    }
});

router.get('/user-ratings', async (req, res) => {
    try {
        const rogals = await Rogal.find().populate('ratings.user', 'name');
        rogals.forEach(rogal => {
            console.log("Rogal:", rogal.name, "ID:", rogal._id.toString());
            rogal.ratings.forEach(rating => {
                console.log("Rating by user:", rating.user ? rating.user.name : "Unknown User", "Rating:", rating.rating);
            });
        });

        const userRatings = rogals.map(rogal => ({
            rogal: rogal.name,
            rogalId: rogal._id.toString(), // Ensure the rogalId is a string
            ratings: rogal.ratings.map(rating => ({
                user: rating.user ? rating.user.name : "Unknown User", // Handle potential null user
                rating: rating.rating
            }))
        }));

        res.json(userRatings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/rogals/top10
// @desc    Get top 10 approved rogals by average rating
// @access  Public
router.get('/top10', async (req, res) => {
    try {
        const rogals = await Rogal.find({ approved: true }).populate('user', ['name']);
        const rogalsWithRatings = rogals.map(rogal => {
            const totalRating = rogal.ratings.reduce((sum, rating) => sum + rating.rating, 0);
            const averageRating = rogal.ratings.length ? totalRating / rogal.ratings.length : 0;
            const pricePerKg = (rogal.price / rogal.weight) * 1000;
            const qualityToPriceRatio = pricePerKg > 0 ? (averageRating / pricePerKg) * 100 : 0;

            return {
                ...rogal.toObject(),
                averageRating,
                pricePerKg,
                qualityToPriceRatio
            };
        });

        rogalsWithRatings.sort((a, b) => b.averageRating - a.averageRating);

        const top10Rogals = rogalsWithRatings.slice(0, 10);

        res.json(top10Rogals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/rogals/top10quality
// @desc    Get top 10 approved rogals by quality to price ratio
// @access  Public
router.get('/top10quality', async (req, res) => {
    try {
        const rogals = await Rogal.find({ approved: true }).populate('user', ['name']);
        const rogalsWithQualityToPriceRatio = rogals.map(rogal => {
            const averageRating = rogal.ratings.length ? (rogal.ratings.reduce((sum, rating) => sum + rating.rating, 0) / rogal.ratings.length) : 0;
            const pricePerKg = (rogal.price / rogal.weight) * 1000;
            const qualityToPriceRatio = pricePerKg > 0 ? (averageRating / pricePerKg) * 100 : 0;

            return {
                ...rogal.toObject(),
                averageRating: Number(averageRating),
                qualityToPriceRatio,
                pricePerKg
            };
        });

        rogalsWithQualityToPriceRatio.sort((a, b) => b.qualityToPriceRatio - a.qualityToPriceRatio);

        const top10QualityRogals = rogalsWithQualityToPriceRatio.slice(0, 10);

        res.json(top10QualityRogals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/rogals/statistics
// @desc    Get rogal statistics
// @access  Public
router.get('/statistics', async (req, res) => {
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
});

// @route   GET api/rogals
// @desc    Get all approved rogals
// @access  Public
router.get('/', async (req, res) => {
    try {
        const rogals = await Rogal.find({ approved: true }).populate('user', ['name']);
        const rogalsWithAdditionalInfo = rogals.map(rogal => {
            const averageRating = rogal.ratings.length ? (rogal.ratings.reduce((sum, rating) => sum + rating.rating, 0) / rogal.ratings.length) : 0;
            const pricePerKg = (rogal.price / rogal.weight) * 1000;
            const qualityToPriceRatio = pricePerKg > 0 ? (averageRating / pricePerKg) * 100 : 0;

            return {
                ...rogal.toObject(),
                averageRating: Number(averageRating), // Ensure averageRating is a number
                qualityToPriceRatio,
                pricePerKg
            };
        });

        res.json(rogalsWithAdditionalInfo);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/rogals/:id
// @desc    Get rogal by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const rogal = await Rogal.findById(req.params.id).populate('user', ['name']);

        if (!rogal) {
            return res.status(404).json({ msg: 'Rogal not found' });
        }

        const averageRating = rogal.ratings.length ? (rogal.ratings.reduce((sum, rating) => sum + rating.rating, 0) / rogal.ratings.length) : 0;
        const pricePerKg = (rogal.price / rogal.weight) * 1000;
        const qualityToPriceRatio = pricePerKg > 0 ? (averageRating / pricePerKg) * 100 : 0;

        res.json({
            ...rogal.toObject(),
            averageRating: Number(averageRating), // Ensure averageRating is a number
            qualityToPriceRatio,
            pricePerKg
        });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Rogal not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/rogals/:id
// @desc    Delete a rogal
// @access  Private/Admin
router.delete('/:id', [auth, adminAuth], async (req, res) => {
    try {
        const rogal = await Rogal.findById(req.params.id);

        if (!rogal) {
            return res.status(404).json({ msg: 'Rogal not found' });
        }

        await rogal.deleteOne();

        res.json({ msg: 'Rogal removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Rogal not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   PUT api/rogals/rating/:id
// @desc    Update rating
// @access  Private
router.put('/rating/:id', auth, async (req, res) => {
    const { rating, comment } = req.body;

    try {
        let rogal = await Rogal.findById(req.params.id);

        if (!rogal) {
            return res.status(404).json({ msg: 'Rogal not found' });
        }

        const userRating = rogal.ratings.find(r => r.user.toString() === req.user.id);

        if (userRating) {
            // Update existing rating
            userRating.rating = rating;
            userRating.comment = comment;
        } else {
            // Add new rating
            rogal.ratings.unshift({ user: req.user.id, rating, comment });
        }

        await rogal.save();

        res.json(rogal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/rogals/:id
// @desc    Update rogal
// @access  Private/Admin
router.put('/:id', [auth, adminAuth], upload.single('image'), async (req, res) => {
    const { name, description, price, weight } = req.body;

    const rogalFields = {
        name,
        description,
        price,
        weight,
    };

    if (req.file) {
        rogalFields.image = req.file.path;
    }

    try {
        let rogal = await Rogal.findById(req.params.id);

        if (!rogal) {
            return res.status(404).json({ msg: 'Rogal not found' });
        }

        // Check if the new name already exists
        if (name !== rogal.name) {
            const existingRogal = await Rogal.findOne({ name });
            if (existingRogal) {
                return res.status(400).json({ msg: 'A rogal with this name already exists' });
            }
        }

        rogal = await Rogal.findByIdAndUpdate(
            req.params.id,
            { $set: rogalFields },
            { new: true }
        );

        res.json(rogal);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Rogal not found' });
        }
        res.status(500).send('Server error');
    }
});

export default router;
