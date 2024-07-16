import mongoose from 'mongoose';

const {Schema} = mongoose;

const UserSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {
        type: String
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    role: {type: String, default: 'user'},
    date: {type: Date, default: Date.now}
});

const User = mongoose.model('users', UserSchema);
export default User;
