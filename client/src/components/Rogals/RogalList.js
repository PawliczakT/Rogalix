import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

const RogalList = () => {
    const [rogals, setRogals] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRogals = async () => {
            try {
                const res = await api.get('/rogals');
                setRogals(res.data);
            } catch (err) {
                console.error(err.response.data);
            }
        };

        fetchRogals();
    }, []);

    const deleteRogal = async (id) => {
        try {
            await api.delete(`/rogals/${id}`);
            setRogals(rogals.filter((rogal) => rogal._id !== id));
        } catch (err) {
            console.error(err.response.data);
        }
    };

    return (
        <div>
            <h1>Rogale</h1>
            <ul>
                {rogals.map((rogal) => (
                    <li key={rogal._id}>
                        <h2>
                            <Link to={`/rogals/${rogal._id}`}>{rogal.name}</Link>
                        </h2>
                        <p>{rogal.description}</p>
                        <p>Cena: {rogal.price}</p>
                        <p>Waga: {rogal.weight}</p>
                        <p>Średnia ocena: {rogal.averageRating !== undefined ? rogal.averageRating.toFixed(1) : 'No ratings yet'}</p>
                        <p>Stosunek jakości do ceny: {rogal.qualityToPriceRatio !== undefined ? rogal.qualityToPriceRatio.toFixed(2) : 'N/A'}</p>
                        <p>Cena za 1kg: {rogal.pricePerKg !== undefined ? rogal.pricePerKg.toFixed(2) : 'N/A'}</p>
                        {rogal.image && <img src={`http://localhost:5000/${rogal.image}`} alt={rogal.name} />}
                        <button onClick={() => deleteRogal(rogal._id)}>Usuń</button>
                        <button onClick={() => navigate(`/rogals/edit/${rogal._id}`)}>Edytuj</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RogalList;
