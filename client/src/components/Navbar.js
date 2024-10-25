import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RateReviewIcon from '@mui/icons-material/RateReview';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HomeIcon from '@mui/icons-material/Home';
import ListIcon from '@mui/icons-material/List';

const Navbar = () => {
    const [mainMenuAnchor, setMainMenuAnchor] = useState(null);
    const [analyticsMenuAnchor, setAnalyticsMenuAnchor] = useState(null);
    const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
    const token = localStorage.getItem('token');

    const handleMainMenuOpen = (event) => setMainMenuAnchor(event.currentTarget);
    const handleMainMenuClose = () => setMainMenuAnchor(null);

    const handleAnalyticsMenuOpen = (event) => {
        setAnalyticsMenuAnchor(event.currentTarget);
        handleMainMenuClose();
    };
    const handleAnalyticsMenuClose = () => setAnalyticsMenuAnchor(null);

    const handleAccountMenuOpen = (event) => {
        setAccountMenuAnchor(event.currentTarget);
        handleMainMenuClose();
    };
    const handleAccountMenuClose = () => setAccountMenuAnchor(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    const menuItems = [
        { to: "/", icon: <HomeIcon />, text: "Statystyki" },
        { to: "/rogals", icon: <ListIcon />, text: "Lista Rogali" },
        { to: "/top10", icon: <StarIcon />, text: "Top 10 - jakość" },
        { to: "/top10quality", icon: <AttachMoneyIcon />, text: "Top 10 jakość / cena" },
    ];

    const analyticsMenuItems = [
        { to: "/rogal-analytics", icon: <AnalyticsIcon />, text: "Analiza Rogali" },
        { to: "/user-ratings-matrix", icon: <PeopleIcon />, text: "Kto jak oceniał" },
        { to: "/gustometr", icon: <TrendingUpIcon />, text: "Gustometr" },
    ];

    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={handleMainMenuOpen}
                >
                    <MenuIcon />
                </IconButton>

                <Menu
                    anchorEl={mainMenuAnchor}
                    open={Boolean(mainMenuAnchor)}
                    onClose={handleMainMenuClose}
                >
                    {menuItems.map((item) => (
                        <MenuItem
                            key={item.to}
                            component={Link}
                            to={item.to}
                            onClick={handleMainMenuClose}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText>{item.text}</ListItemText>
                        </MenuItem>
                    ))}
                </Menu>

                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Rogalix
                </Typography>

                {token && (
                    <>
                        <Button
                            color="inherit"
                            onClick={handleAnalyticsMenuOpen}
                            startIcon={<AnalyticsIcon />}
                        >
                            Analizy
                        </Button>
                        <Menu
                            anchorEl={analyticsMenuAnchor}
                            open={Boolean(analyticsMenuAnchor)}
                            onClose={handleAnalyticsMenuClose}
                        >
                            {analyticsMenuItems.map((item) => (
                                <MenuItem
                                    key={item.to}
                                    component={Link}
                                    to={item.to}
                                    onClick={handleAnalyticsMenuClose}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText>{item.text}</ListItemText>
                                </MenuItem>
                            ))}
                        </Menu>

                        <Button
                            color="inherit"
                            component={Link}
                            to="/add-rogal"
                            startIcon={<AddIcon />}
                        >
                            Dodaj rogala
                        </Button>
                    </>
                )}

                {!token ? (
                    <>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/login"
                            startIcon={<LoginIcon />}
                        >
                            Zaloguj
                        </Button>
                        <Button
                            color="inherit"
                            component={Link}
                            to="/register"
                            startIcon={<PersonAddIcon />}
                        >
                            Zarejestruj
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            color="inherit"
                            onClick={handleAccountMenuOpen}
                            startIcon={<AccountCircleIcon />}
                        >
                            Konto
                        </Button>
                        <Menu
                            anchorEl={accountMenuAnchor}
                            open={Boolean(accountMenuAnchor)}
                            onClose={handleAccountMenuClose}
                        >
                            <MenuItem
                                component={Link}
                                to="/account"
                                onClick={handleAccountMenuClose}
                            >
                                <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                                <ListItemText>Moje Konto</ListItemText>
                            </MenuItem>
                            <MenuItem
                                component={Link}
                                to="/my-ratings"
                                onClick={handleAccountMenuClose}
                            >
                                <ListItemIcon><RateReviewIcon /></ListItemIcon>
                                <ListItemText>Moje Oceny</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon><LogoutIcon /></ListItemIcon>
                                <ListItemText>Wyloguj</ListItemText>
                            </MenuItem>
                        </Menu>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
