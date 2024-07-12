import express from 'express';
import Rogal from '../models/Rogal.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const rogals = await Rogal.find().populate('ratings.user');

        const userRatings = {};

        rogals.forEach(rogal => {
            rogal.ratings.forEach(rating => {
                if (rating.user && rating.user._id) { // Add this check
                    if (!userRatings[rating.user._id]) {
                        userRatings[rating.user._id] = {};
                    }
                    userRatings[rating.user._id][rogal._id] = rating.rating;
                }
            });
        });

        const userIds = Object.keys(userRatings);

        const users = await User.find({ _id: { $in: userIds } }, 'name');
        const userMap = {};
        users.forEach(user => {
            userMap[user._id] = user.name;
        });

        const tasteMatrix = {};

        userIds.forEach(user1 => {
            tasteMatrix[userMap[user1]] = {};
            userIds.forEach(user2 => {
                if (user1 !== user2) {
                    let score = 0;

                    Object.keys(userRatings[user1]).forEach(rogalId => {
                        if (userRatings[user2][rogalId] !== undefined) {
                            const rating1 = userRatings[user1][rogalId];
                            const rating2 = userRatings[user2][rogalId];
                            const diff = Math.abs(rating1 - rating2);

                            if (diff === 0) {
                                score += 10;
                            } else if (diff <= 1) {
                                score += 5;
                            } else if (diff <= 2) {
                                score += 2.5;
                            } else if (diff >= 3) {
                                score -= 2.5;
                            }
                        }
                    });

                    tasteMatrix[userMap[user1]][userMap[user2]] = score;
                }
            });
        });

        res.json(tasteMatrix);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
