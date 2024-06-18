import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define the User Schema
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('users', UserSchema);
export default User;
