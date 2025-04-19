import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import YearSelector from './YearSelector';
import RogalIcon from '../assets/rogal.png';
import Box from '@mui/material/Box';

const Navbar = () => {
    const token = localStorage.getItem('token');
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuHover, setMenuHover] = useState(false);
    const open = Boolean(anchorEl);
    const closeTimeout = React.useRef(null);

    const handleMenu = (event) => {
        if (closeTimeout.current) clearTimeout(closeTimeout.current);
        setAnchorEl(event.currentTarget);
    };
    // Zamykaj menu tylko po opuszczeniu menu z opóźnieniem
    const handleMenuLeave = () => {
        closeTimeout.current = setTimeout(() => {
            setAnchorEl(null);
        }, 200); // 200ms na przejście myszką
    };
    const handleMenuEnter = () => {
        if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };


    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu"
    onMouseEnter={handleMenu}
>
                    <MenuIcon />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        onMouseEnter: handleMenuEnter,
                        onMouseLeave: handleMenuLeave
                    }}
                >
                    <MenuItem component={Link} to="/statistics" onClick={handleClose}>Statystyki</MenuItem>
                    <MenuItem component={Link} to="/rogals" onClick={handleClose}>Lista Rogali</MenuItem>
                    <MenuItem component={Link} to="/top10" onClick={handleClose}>Top 10 - jakość</MenuItem>
                    <MenuItem component={Link} to="/top10quality" onClick={handleClose}>Top 10 jakość / cena</MenuItem>
                    <MenuItem component={Link} to="/recommendations" onClick={handleClose}>Rekomendacje</MenuItem>
                    <Divider />
                    {token && <MenuItem component={Link} to="/add-rogal" onClick={handleClose}>Dodaj rogala</MenuItem>}
                    {token && <MenuItem component={Link} to="/user-ratings-matrix" onClick={handleClose}>Kto jak oceniał</MenuItem>}
                    {token && <MenuItem component={Link} to="/gustometr" onClick={handleClose}>Gustometr</MenuItem>}
                    {token && <MenuItem component={Link} to="/account" onClick={handleClose}>Moje Konto</MenuItem>}
                    {token && <MenuItem component={Link} to="/my-ratings" onClick={handleClose}>Moje Oceny</MenuItem>}
                    {!token && <MenuItem component={Link} to="/login" onClick={handleClose}>Zaloguj</MenuItem>}
                    {!token && <MenuItem component={Link} to="/register" onClick={handleClose}>Zarejestruj</MenuItem>}
                    {token && <MenuItem onClick={() => { handleClose(); handleLogout(); }}>Wyloguj</MenuItem>}
                </Menu>
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, ml: 2 }}>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                        <img src={RogalIcon} alt="Rogal" style={{ height: 36, marginRight: 10 }} />
                        <Typography variant="h6" component="span" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                            Rogalix
                        </Typography>
                    </Link>
                </Box>
                <YearSelector />
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
