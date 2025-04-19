import React, {useEffect, useState} from 'react';
import {useYear} from '../context/YearContext';
import api from '../api';
import {FormControl, InputLabel, MenuItem, Select} from '@mui/material';

const YearSelector = () => {
    const {year, setYear} = useYear();
    const [availableYears, setAvailableYears] = useState([]);

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const res = await api.get('/rogals/years');
                console.log('Dostępne lata:', res.data);
                setAvailableYears(res.data);
                if (!year && res.data.length > 0) {
                    setYear(res.data[0]);
                }
            } catch (err) {
                setAvailableYears([]);
            }
        };
        fetchYears();
        // eslint-disable-next-line
    }, []);

    return (
        <FormControl variant="standard" size="small" sx={{minWidth: 90, ml: 2}}>
            <InputLabel id="year-select-label">Rok</InputLabel>
            <Select
                labelId="year-select-label"
                id="year-select"
                value={availableYears.includes(year) ? year : ''}
                onChange={e => setYear(Number(e.target.value))}
                label="Rok"
            >
                {availableYears.map(y => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default YearSelector;
