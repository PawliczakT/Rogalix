import React from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu">
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Rogalix
                </Typography>
                <Button color="inherit" component={Link} to="/">Statystyki</Button>
                <Button color="inherit" component={Link} to="/rogals">Lista Rogali</Button>
                <Button color="inherit" component={Link} to="/top10">Top 10 - jakość</Button>
                <Button color="inherit" component={Link} to="/top10quality">Top 10 jakość / cena</Button>
                {token && <Button color="inherit" component={Link} to="/add-rogal">Dodaj rogala</Button>}
                <Button color="inherit" component={Link} to="/user-ratings-matrix">Kto jak oceniał</Button>
                <Button color="inherit" component={Link} to="/gustometr">Gustometr</Button>
                {!token ? (
                    <>
                        <Button color="inherit" component={Link} to="/login">Zaloguj</Button>
                        <Button color="inherit" component={Link} to="/register">Zarejestruj</Button>
                    </>
                ) : (
                    <>
                        <Button color="inherit" component={Link} to="/account">Moje Konto</Button>
                        <Button color="inherit" onClick={handleLogout}>Wyloguj</Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
