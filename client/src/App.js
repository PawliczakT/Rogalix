import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import Navbar from './components/Navbar';
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
import RogalAnalytics from './components/Rogals/RogalAnalytics';
import api from './api';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            await checkLoginStatus();
            setIsLoading(false);
        };

        const checkLoginStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsLoggedIn(false);
                    return;
                }

                console.log('Checking login status with token:', token);
                await api.get('/users/me');
                setIsLoggedIn(true);
            } catch (err) {
                console.error('Login status check failed:', err);
                localStorage.removeItem('token');
                delete api.defaults.headers.common['Authorization'];
                setIsLoggedIn(false);
            }
        };

        initializeAuth();

        // Nasłuchuj zmian w localStorage
        const handleStorageChange = () => {
            const token = localStorage.getItem('token');
            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setIsLoggedIn(true);
            } else {
                delete api.defaults.headers.common['Authorization'];
                setIsLoggedIn(false);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    if (isLoading) {
        return <div>Loading...</div>; // lub jakiś komponent ładowania
    }

    return (
        <Router>
            <Navbar isLoggedIn={isLoggedIn}/>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/rogals" element={<RogalListPage/>}/>
                <Route
                    path="/login"
                    element={isLoggedIn ? <Navigate to="/rogals"/> : <Login setIsLoggedIn={setIsLoggedIn}/>}
                />
                <Route
                    path="/register"
                    element={isLoggedIn ? <Navigate to="/rogals"/> : <Register/>}
                />
                <Route path="/rogals/:id" element={<RogalDetails/>}/>
                <Route
                    path="/rogals/edit/:id"
                    element={isLoggedIn ? <EditRogal/> : <Navigate to="/login"/>}
                />
                <Route path="/top10" element={<Top10Rogals/>}/>
                <Route path="/top10quality" element={<Top10QualityRogals/>}/>
                <Route
                    path="/add-rogal"
                    element={isLoggedIn ? <AddRogal/> : <Navigate to="/login" state={{from: "/add-rogal"}}/>}
                />
                <Route
                    path="/user-ratings-matrix"
                    element={isLoggedIn ? <UserRogalsMatrix/> :
                        <Navigate to="/login" state={{from: "/user-ratings-matrix"}}/>}
                />
                <Route
                    path="/gustometr"
                    element={isLoggedIn ? <Gustometr/> : <Navigate to="/login" state={{from: "/gustometr"}}/>}
                />
                <Route
                    path="/account"
                    element={isLoggedIn ? <UserAccount/> : <Navigate to="/login" state={{from: "/account"}}/>}
                />
                <Route
                    path="/my-ratings"
                    element={isLoggedIn ? <UserRatings/> : <Navigate to="/login" state={{from: "/my-ratings"}}/>}
                />
                <Route
                    path="/rogal-analytics"
                    element={isLoggedIn ? <RogalAnalytics/> :
                        <Navigate to="/login" state={{from: "/rogal-analytics"}}/>}
                />
            </Routes>
        </Router>
    );
};

export default App;
