import React, {useEffect, useState} from 'react';
import axios from 'axios';

const GitInfo = () => {
    const [gitInfo, setGitInfo] = useState({branch: '', commit: ''});

    useEffect(() => {
        const fetchGitInfo = async () => {
            try {
                const response = await axios.get('/api/git-info');
                setGitInfo(response.data);
            } catch (error) {
                console.error('Error fetching git info:', error);
            }
        };

        fetchGitInfo();
    }, []);

    return (
        <div>
            <p>Branch: {gitInfo.branch}</p>
            <p>Commit: {gitInfo.commit}</p>
        </div>
    );
};

export default GitInfo;
