import React, { useEffect, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { YearProvider } from './context/YearContext';
import { NotificationProvider } from './context/NotificationContext';
import LoadingSpinner from './components/LoadingSpinner';
import Home from './components/Home';
import RogalListPage from './components/Rogals/RogalListPage';
import RogalStatistics from './components/Statistics/RogalStatistics';
import RogalRecommendations from './components/Recommendations/RogalRecommendations';
import AddRogal from './components/Rogals/AddRogal';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import RogalDetails from './components/Rogals/RogalDetails';
import EditRogal from './components/Rogals/EditRogal';
import Top10Rogals from './components/Rogals/Top10Rogals';
import Top10QualityRogals from './components/Rogals/Top10QualityRogals';
import UserRogalsMatrix from './components/UserRogalsMatrix';
import Gustometr from './components/Gustometr';
import UserAccount from './components/UserAccount';
import UserRatings from './components/UserRatings';
import api from './api';
import GoogleAuth from './pages/GoogleAuth';
import BakeryDetails from './components/Bakery/BakeryDetails';

const GOOGLE_LIBRARIES = ['marker', 'places'];

const App = () => {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries: GOOGLE_LIBRARIES,
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoggedIn(false);
                setIsAuthChecked(true);
                return;
            }
            try {
                await api.get('/users/me');
                setIsLoggedIn(true);
            } catch (err) {
                setIsLoggedIn(false);
            }
            setIsAuthChecked(true);
        };
        checkLoginStatus();
    }, []);

    if (!isAuthChecked) return <LoadingSpinner />;

    return (
        <YearProvider>
            <NotificationProvider>
                <Router>
                    <Navbar isLoggedIn={isLoggedIn} />
                    <Routes>
                        <Route path="/" element={<Home isLoaded={isLoaded} />} />
                        <Route path="/rogals" element={<RogalListPage isLoaded={isLoaded} />} />
                        <Route path="/statistics" element={<RogalStatistics isLoaded={isLoaded} />} />
                        <Route path="/recommendations" element={<RogalRecommendations isLoaded={isLoaded} />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/rogals/:id" element={<RogalDetails isLoaded={isLoaded} />} />
                        <Route path="/rogals/edit/:id" element={<EditRogal isLoaded={isLoaded} />} />
                        <Route path="/top10" element={<Top10Rogals isLoaded={isLoaded} />} />
                        <Route path="/top10quality" element={<Top10QualityRogals isLoaded={isLoaded} />} />
                        <Route path="/add-rogal" element={isLoggedIn ? <AddRogal isLoaded={isLoaded} /> : <Navigate to="/login" />} />
                        <Route path="/user-ratings-matrix" element={isLoggedIn ? <UserRogalsMatrix isLoaded={isLoaded} /> : <Navigate to="/login" />} />
                        <Route path="/gustometr" element={isLoggedIn ? <Gustometr isLoaded={isLoaded} /> : <Navigate to="/login" />} />
                        <Route path="/account" element={isLoggedIn ? <UserAccount isLoaded={isLoaded} /> : <Navigate to="/login" />} />
                        <Route path="/my-ratings" element={isLoggedIn ? <UserRatings isLoaded={isLoaded} /> : <Navigate to="/login" />} />
                        <Route path="/google-auth" element={<GoogleAuth />} />
                        <Route path="/bakery/:bakeryName" element={<BakeryDetails isLoaded={isLoaded} />} />
                    </Routes>
                </Router>
            </NotificationProvider>
        </YearProvider>
    );
};

export default App;
