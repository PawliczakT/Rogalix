import dotenv from 'dotenv';
dotenv.config();

export const mongoURI = process.env.MONGO_URI;
export const secretOrKey = process.env.SECRET_OR_KEY;
export const emailUser = process.env.EMAIL_USER;
export const emailPassword = process.env.EMAIL_PASSWORD;
export const REACT_APP_API_URL=process.env.REACT_APP_API_URL;
decodeURI(process.env.REACT_APP_API_URL)
