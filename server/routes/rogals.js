import express from 'express';
import multer from 'multer';
import {check, validationResult} from 'express-validator';
import {adminAuth, auth} from '../middlewares/auth.js';
import Rogal from '../models/Rogal.js';
import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {DetectLabelsCommand, RekognitionClient} from '@aws-sdk/client-rekognition';
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const rekognitionClient = new RekognitionClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Configure Multer to use S3
const upload = multer({
    storage: multer.memoryStorage()
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
        check('weight', 'Weight is required and must be a positive number').isFloat({min: 0}),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Validation errors:", errors.array());
            return res.status(400).json({errors: errors.array()});
        }

        try {
            const {name, description, price, weight} = req.body;

            const existingRogal = await Rogal.findOne({name});
            if (existingRogal) {
                console.error("Rogal already exists:", name);
                return res.status(400).json({msg: 'A rogal with this name already exists'});
            }

            let imageUrl = null;
            if (req.file) {
                console.log("Uploading file to S3:", req.file.originalname);
                const uploadParams = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: `${Date.now().toString()}-${req.file.originalname}`,
                    Body: req.file.buffer,
                    ContentType: req.file.mimetype,
                };

                const uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));
                console.log("S3 upload result:", uploadResult);
                imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

                // Image recognition using Rekognition
                const detectLabelsCommand = new DetectLabelsCommand({
                    Image: {
                        S3Object: {
                            Bucket: process.env.S3_BUCKET_NAME,
                            Name: uploadParams.Key
                        }
                    },
                    MaxLabels: 10
                });

                const detectLabelsResult = await rekognitionClient.send(detectLabelsCommand);
                console.log("Rekognition result:", detectLabelsResult);

                const labels = detectLabelsResult.Labels.map(label => label.Name.toLowerCase());
                if (!labels.includes('bread') && !labels.includes('croissant') && !labels.includes('pastry')) {
                    return res.status(400).json({msg: 'Wygląda na to, że zdjęcie nie przedstawia rogala:('});
                }
            }

            const formattedPrice = parseFloat(price.replace(',', '.')).toFixed(2);

            const newRogal = new Rogal({
                name,
                description,
                price: formattedPrice,
                weight,
                user: req.user.id,
                image: imageUrl,
                approved: false
            });

            const rogal = await newRogal.save();
            console.log("New Rogal added:", rogal);
            res.json(rogal);
        } catch (err) {
            console.error("Server error:", err.message);
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
            return res.status(404).json({msg: 'Rogal not found'});
        }

        rogal.approved = true;
        await rogal.save();

        res.json(rogal);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({msg: 'Rogal not found'});
        }
        res.status(500).send('Server error');
    }
});

// @route   GET api/rogals/my-ratings
// @desc    Get logged-in user's ratings
// @access  Private
router.get('/my-ratings', auth, async (req, res) => {
    try {
        const rogals = await Rogal.find().populate('ratings.user', 'name');

        const userRatings = rogals.map((rogal) => {
            const rating = rogal.ratings.find((r) => r.user && r.user._id.toString() === req.user.id);

            return {
                rogalId: rogal._id,
                rogalName: rogal.name,
                rating: rating ? rating.rating : 'Brak oceny',
            };
        });

        console.log('User Ratings:', userRatings);
        res.json(userRatings);
    } catch (err) {
        console.error(err.message);
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
        const rogals = await Rogal.find({approved: true}).populate('user', ['name']);
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
        const rogals = await Rogal.find({approved: true}).populate('user', ['name']);
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
            return res.status(404).json({msg: 'Rogal not found'});
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
            return res.status(404).json({msg: 'Rogal not found'});
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
            return res.status(404).json({msg: 'Rogal not found'});
        }

        await rogal.deleteOne();

        res.json({msg: 'Rogal removed'});
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({msg: 'Rogal not found'});
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
        console.log("Uploading file to S3:", req.file.originalname);

        // Image recognition using Rekognition
        const detectLabelsCommand = new DetectLabelsCommand({
            Image: {
                Bytes: req.file.buffer,
            },
            MaxLabels: 10,
            MinConfidence: 75,
        });

        try {
            const detectLabelsResult = await rekognitionClient.send(detectLabelsCommand);
            console.log("Rekognition result:", detectLabelsResult);

            const labels = detectLabelsResult.Labels.map(label => label.Name.toLowerCase());
            if (!labels.includes('bread') && !labels.includes('croissant') && !labels.includes('pastry')) {
                return res.status(400).json({ msg: 'Zdjęcie nie przedstawia rogala' });
            }
        } catch (error) {
            console.error('AI verification error:', error);
            return res.status(500).json({ msg: 'AI verification failed', error: error.message });
        }

        const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${Date.now().toString()}-${req.file.originalname}`,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };

        try {
            const uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));
            console.log("S3 upload result:", uploadResult);
            rogalFields.image = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
        } catch (uploadError) {
            console.error("S3 upload error:", uploadError);
            return res.status(500).json({ msg: 'Error uploading image to S3', error: uploadError.message });
        }
    }

    try {
        let rogal = await Rogal.findById(req.params.id);

        if (!rogal) {
            return res.status(404).json({ msg: 'Rogal not found' });
        }

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
