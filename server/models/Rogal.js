import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define the Rating Schema
const RatingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    date: { type: Date, default: Date.now }
});

// Define the Rogal Schema
const RogalSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    weight: { type: Number, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    ratings: [RatingSchema],
    image: { type: String },
    date: { type: Date, default: Date.now }
});

// Virtual for average rating
RogalSchema.virtual('averageRating').get(function() {
    if (this.ratings.length === 0) return 0;
    const total = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return total / this.ratings.length;
});

// Ensure virtual fields are serialized.
RogalSchema.set('toJSON', { virtuals: true });
RogalSchema.set('toObject', { virtuals: true });

// Export the Rogal model
const Rogal = mongoose.model('rogals', RogalSchema);
export default Rogal;
