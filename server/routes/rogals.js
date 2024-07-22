import express from 'express';
import multer from 'multer';
import {check, validationResult} from 'express-validator';
import {auth} from '../middlewares/auth.js';
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

export default router;
