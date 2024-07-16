import dotenv from 'dotenv';
dotenv.config();

export const mongoURI = process.env.MONGO_URI;
export const secretOrKey = process.env.SECRET_OR_KEY;
export const emailUser = process.env.EMAIL_USER;
export const emailPassword = process.env.EMAIL_PASSWORD;
export const REACT_APP_API_URL=process.env.REACT_APP_API_URL;
export const googleClientID = process.env.GOOGLE_CLIENT_ID;
export const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
export const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL;
