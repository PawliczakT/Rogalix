// import React, { useState } from 'react';
// import api from '../../api';
//
// const AddRogal = () => {
//     const [formData, setFormData] = useState({
//         name: '',
//         price: '',
//         weight: '',
//         image: null,
//     });
//     const [error, setError] = useState(null);
//
//     const { name, description, price, weight, image } = formData;
//
//     const onChange = (e) => {
//         if (e.target.name === 'image') {
//             setFormData({ ...formData, image: e.target.files[0] });
//         } else {
//             setFormData({ ...formData, [e.target.name]: e.target.value });
//         }
//     };
//
//     const onSubmit = async (e) => {
//         e.preventDefault();
//         const rogalData = new FormData();
//         rogalData.append('name', name);
//         rogalData.append('price', price);
//         rogalData.append('weight', weight);
//         if (image) {
//             rogalData.append('image', image);
//         }
//
//         try {
//             await api.post('/rogals', rogalData);
//             window.location.href = '/rogals';
//         } catch (err) {
//             setError(err.response.data.msg);
//         }
//     };
//
//     return (
//         <form onSubmit={onSubmit}>
//             <h1>Add Rogal</h1>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             <div>
//                 <input type="text" name="name" value={name} onChange={onChange} placeholder="Nazwa" required />
//             </div>
//             <div>
//                 <input type="number" name="price" value={price} onChange={onChange} placeholder="Cena" required />
//             </div>
//             <div>
//                 <input type="number" name="weight" value={weight} onChange={onChange} placeholder="Waga" required />
//             </div>
//             <div>
//                 <input type="file" name="image" onChange={onChange} />
//             </div>
//             <button type="submit">Dodaj rogala</button>
//         </form>
//     );
// };
//
// export default AddRogal;
