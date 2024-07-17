import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import RogalListPage from './components/Rogals/RogalListPage';
import AddRogal from './components/Rogals/AddRogal'; // Update the import statement
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import RogalDetails from './components/Rogals/RogalDetails';
import EditRogal from './components/Rogals/EditRogal';
import Top10Rogals from './components/Rogals/Top10Rogals';
import Top10QualityRogals from './components/Rogals/Top10QualityRogals';
import UserRogalsMatrix from './components/UserRogalsMatrix';
import Gustometr from './components/Gustometr';
import UserAccount from './components/UserAccount'; // Import the new UserAccount component

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
                <Route path="/add-rogal" element={<AddRogal />} /> {/* Update the route */}
                <Route path="/user-ratings-matrix" element={<UserRogalsMatrix />} />
                <Route path="/gustometr" element={<Gustometr />} />
                <Route path="/account" element={<UserAccount />} /> {/* Add the new route */}
            </Routes>
        </Router>
    );
};

export default App;
