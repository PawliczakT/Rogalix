import mongoose from 'mongoose';
const { Schema } = mongoose;

const RatingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    rating: { type: Number, required: true, min: 1, max: 6 },
    date: { type: Date, default: Date.now }
});

const RogalSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    weight: { type: Number, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    ratings: [RatingSchema],
    image: { type: String },
    date: { type: Date, default: Date.now },
    approved: { type: Boolean, default: false }
});

RogalSchema.virtual('averageRating').get(function() {
    if (this.ratings.length === 0) return 0;
    const total = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    return total / this.ratings.length;
});

RogalSchema.set('toJSON', { virtuals: true });
RogalSchema.set('toObject', { virtuals: true });

const Rogal = mongoose.model('rogals', RogalSchema);
export default Rogal;
