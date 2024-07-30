import React, { useEffect, useState } from 'react';
import api from '../api';

const Footer = () => {
    const [gitInfo, setGitInfo] = useState({ branch: '', commit: '' });

    useEffect(() => {
        const fetchGitInfo = async () => {
            try {
                const res = await api.get(`${process.env.REACT_APP_API_URL}/git-info`);
                setGitInfo(res.data);
            } catch (err) {
                console.error('Failed to fetch git info:', err);
            }
        };

        fetchGitInfo();
    }, []);

    return (
        <div style={footerStyle}>
            <p style={textStyle}>Branch: {gitInfo.branch}</p>
            <p style={textStyle}>Commit: {gitInfo.commit}</p>
        </div>
    );
};

const footerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'right',
    padding: '10px',
    borderTop: '1px solid #e7e7e7',
    left: '10',
    bottom: '0',
    width: '100%',
    textAlign: 'center',
};

const textStyle = {
    margin: '5px 0',
    fontSize: '12px', // Zmniejsz rozmiar czcionki
    color: '#333',
};

export default Footer;
