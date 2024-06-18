import React from 'react';
import AddRogal from '../components/Rogals/AddRogal';
import RogalList from '../components/Rogals/RogalList';
import RogalStatistics from '../components/Rogals/RogalStatistics';

const Rogals = () => {
    return (
        <div>
            <RogalList />
            <RogalStatistics />
            <AddRogal />
        </div>
    );
};

export default Rogals;
