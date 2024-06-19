import React, { useState } from 'react';
import AddRogalModal from '../components/Rogals/AddRogalModal';

const AddRogalPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(true);

    const closeModal = () => {
        setIsModalOpen(false);
        window.location.href = '/rogals'; // Redirect to the list of rogals after closing the modal
    };

    return (
        <div>
            <h1>Dodaj rogala</h1>
            <AddRogalModal isOpen={isModalOpen} onRequestClose={closeModal} />
        </div>
    );
};

export default AddRogalPage;
