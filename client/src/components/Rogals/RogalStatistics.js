// import React, { useEffect, useState } from 'react';
// import api from '../../api';
//
// const RogalStatistics = () => {
//     const [statistics, setStatistics] = useState({});
//
//     useEffect(() => {
//         const fetchStatistics = async () => {
//             try {
//                 const res = await api.get('/rogals/statistics');
//                 setStatistics(res.data);
//             } catch (err) {
//                 console.error(err.response.data);
//             }
//         };
//
//         fetchStatistics();
//     }, []);
//
//     return (
//         <div>
//             <h1>Rogalowe Statystyki</h1>
//             <p>Wszystkie rogale: {statistics.totalRogals}</p>
//             <p>Wszystkie oceny: {statistics.totalRatings}</p>
//             <p>Średnia ocena: {statistics.averageRating}</p>
//         </div>
//     );
// };
//
// export default RogalStatistics;
