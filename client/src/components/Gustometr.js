import React, { useEffect, useState } from 'react';
import api from '../api';
import { Container, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const Gustometr = () => {
    const [matrix, setMatrix] = useState({});
    const [users, setUsers] = useState([]);
    const [minValue, setMinValue] = useState(null);
    const [maxValue, setMaxValue] = useState(null);

    useEffect(() => {
        const fetchMatrix = async () => {
            try {
                const res = await api.get('/gustometr');
                const data = res.data;
                setMatrix(data);
                setUsers(Object.keys(data));

                // Find min and max values in the matrix
                let min = Infinity;
                let max = -Infinity;

                Object.values(data).forEach(row => {
                    Object.values(row).forEach(value => {
                        if (value !== null && value !== undefined) {
                            if (value < min) min = value;
                            if (value > max) max = value;
                        }
                    });
                });

                setMinValue(min);
                setMaxValue(max);
            } catch (err) {
                console.error(err);
            }
        };

        fetchMatrix().then(r => console.log('Fetched gustometr matrix'), e => console.error('Failed to fetch gustometr matrix:', e));
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
                                        {matrix[user1][user2] !== undefined ? (
                                            <span
                                                style={{
                                                    color:
                                                        matrix[user1][user2] === maxValue
                                                            ? 'green'
                                                            : matrix[user1][user2] === minValue
                                                                ? 'red'
                                                                : 'inherit',
                                                }}
                                            >
                                                {matrix[user1][user2]}
                                            </span>
                                        ) : (
                                            '-'
                                        )}
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
