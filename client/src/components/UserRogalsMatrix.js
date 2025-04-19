import React, { useEffect, useState } from 'react';
import { useYear } from '../context/YearContext';
import { Link } from 'react-router-dom';
import api from '../api';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';

const UserRogalsMatrix = () => {
    const { year: selectedYear } = useYear();
    const [matrix, setMatrix] = useState([]);

    useEffect(() => {
        const fetchUserRatings = async () => {
            try {
                const res = await api.get('/rogals/user-ratings', { params: { year: selectedYear } });
                console.log("Fetched user ratings:", res.data); // Log fetched data
                setMatrix(res.data);
            } catch (err) {
                console.error(err.response.data);
            }
        };

        fetchUserRatings();
    }, [selectedYear]);

    // Extract unique users
    const users = Array.from(new Set(matrix.flatMap(rogal => rogal.ratings.map(rating => rating.user))));

    return (
        <Container>
            <p></p>
            <Typography variant="h4" component="h1" gutterBottom>
                User-Ratings-Matrix
            </Typography>
            <p></p>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Table sx={{ minWidth: 650 }} aria-label="user rogal matrix">
                    <TableHead>
                        <TableRow>
                            <TableCell>Rogal/Użytkownik</TableCell>
                            {users.map((user, index) => (
                                <TableCell key={index} align="right">{user}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {matrix.map((rogal, rogalIndex) => (
                            <TableRow key={rogalIndex}>
                                <TableCell component="th" scope="row">
                                    <Link to={`/rogals/${rogal.rogalId}`}>{rogal.rogal}</Link> {/* Use rogal.rogalId */}
                                </TableCell>
                                {users.map((user, userIndex) => {
                                    const rating = rogal.ratings.find(rating => rating.user === user);
                                    return (
                                        <TableCell key={userIndex} align="right">
                                            {rating ? rating.rating : '-'}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Container>
    );
};

export default UserRogalsMatrix;
