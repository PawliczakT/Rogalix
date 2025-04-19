import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { YearProvider } from './context/YearContext';
import Home from './components/Home';
import RogalListPage from './components/Rogals/RogalListPage';
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

const App = () => {
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

    if (!isAuthChecked) return null; // Możesz tu dodać spinner

    return (
        <YearProvider>
            <Router>
                <Navbar isLoggedIn={isLoggedIn} />
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/rogals" element={<RogalListPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/rogals/:id" element={<RogalDetails />} />
                <Route path="/rogals/edit/:id" element={<EditRogal />} />
                <Route path="/top10" element={<Top10Rogals />} />
                <Route path="/top10quality" element={<Top10QualityRogals />} />
                <Route path="/add-rogal" element={isLoggedIn ? <AddRogal /> : <Navigate to="/login" />} />
                <Route path="/user-ratings-matrix" element={isLoggedIn ? <UserRogalsMatrix /> : <Navigate to="/login" />} />
                <Route path="/gustometr" element={isLoggedIn ? <Gustometr /> : <Navigate to="/login" />} />
                <Route path="/account" element={isLoggedIn ? <UserAccount /> : <Navigate to="/login" />} />
                <Route path="/my-ratings" element={isLoggedIn ? <UserRatings /> : <Navigate to="/login" />} />
                <Route path="/google-auth" element={<GoogleAuth />} />
                <Route path="/bakery/:bakeryName" element={<BakeryDetails />} />
            </Routes>
            </Router>
        </YearProvider>
    );
};

export default App;
