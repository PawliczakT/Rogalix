import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const EditRogal = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        weight: '',
        image: null,
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRogal = async () => {
            try {
                const res = await api.get(`/rogals/${id}`);
                const { name, description, price, weight } = res.data;
                setFormData({ name, description, price, weight, image: null });
            } catch (err) {
                console.error(err.response.data);
            }
        };

        fetchRogal();
    }, [id]);

    const { name, description, price, weight, image } = formData;

    const onChange = (e) => {
        if (e.target.name === 'image') {
            setFormData({ ...formData, image: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const rogalData = new FormData();
        rogalData.append('name', name);
        rogalData.append('description', description);
        rogalData.append('price', price);
        rogalData.append('weight', weight);
        if (image) {
            rogalData.append('image', image);
        }

        try {
            await api.put(`/rogals/${id}`, rogalData);
            navigate('/rogals');
        } catch (err) {
            setError(err.response.data.msg);
        }
    };

    return (
        <form onSubmit={onSubmit}>
            <h1>Edytuj rogala</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <input type="text" name="name" value={name} onChange={onChange} placeholder="Nazwa" required />
            </div>
            <div>
                <input type="number" name="price" value={price} onChange={onChange} placeholder="Cena" required />
            </div>
            <div>
                <input type="number" name="weight" value={weight} onChange={onChange} placeholder="Waga" required />
            </div>
            <div>
                <input type="file" name="image" onChange={onChange} />
            </div>
            <button type="submit">Zapisz zmiany</button>
        </form>
    );
};

export default EditRogal;
