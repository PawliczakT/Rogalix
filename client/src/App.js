import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RogalListPage from './pages/RogalListPage';
import AddRogalPage from './pages/AddRogalPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import RogalDetails from './components/Rogals/RogalDetails';
import EditRogal from './components/Rogals/EditRogal';
import Top10Rogals from './components/Rogals/Top10Rogals';
import Top10QualityRogals from './components/Rogals/Top10QualityRogals';
import UserRogalsMatrix from './components/UserRogalsMatrix';

const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/rogals" element={<RogalListPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/rogals/:id" element={<RogalDetails />} />
                <Route path="/rogals/edit/:id" element={<EditRogal />} />
                <Route path="/top10" element={<Top10Rogals />} />
                <Route path="/top10quality" element={<Top10QualityRogals />} />
                <Route path="/add-rogal" element={<AddRogalPage />} />
                <Route path="/user-ratings-matrix" element={<UserRogalsMatrix />} />
            </Routes>
        </Router>
    );
};

export default App;
