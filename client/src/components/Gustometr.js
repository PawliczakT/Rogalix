import React, { useEffect, useState } from 'react';
import api from '../api';
import { Container, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const Gustometr = () => {
    const [matrix, setMatrix] = useState({});
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchMatrix = async () => {
            try {
                const res = await api.get('/gustometr');
                setMatrix(res.data);
                setUsers(Object.keys(res.data));
            } catch (err) {
                console.error(err);
            }
        };

        fetchMatrix();
    }, []);

    return (
        <Container>
            <p></p>
            <Typography variant="h4" component="h1" gutterBottom>
                Gustometr
            </Typography>
            <Box sx={{ mt: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Użytkownik</TableCell>
                            {users.map(user => (
                                <TableCell key={user}>{user}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map(user1 => (
                            <TableRow key={user1}>
                                <TableCell>{user1}</TableCell>
                                {users.map(user2 => (
                                    <TableCell key={user2}>
                                        {matrix[user1][user2] !== undefined ? matrix[user1][user2] : '-'}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </Container>
    );
};

export default Gustometr;
