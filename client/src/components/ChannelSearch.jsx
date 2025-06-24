import React, { useState, useEffect, useRef } from 'react';
import { useChatContext } from 'stream-chat-react';
import { ResultsDropdown } from './'
import { SearchIcon } from '../assets';

const ChannelSearch = ({ setToggleContainer }) => {
    const { client, setActiveChannel } = useChatContext();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [teamChannels, setTeamChannels] = useState([]);
    const [directChannels, setDirectChannels] = useState([]);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if(!query) {
            setTeamChannels([]);
            setDirectChannels([]);
        }
    }, [query]);

    const getChannels = async (text) => {
        if (!text.trim()) {
            setTeamChannels([]);
            setDirectChannels([]);
            return;
        }

        try {
            const channelResponse = client.queryChannels({
                type: 'team', 
                name: { $autocomplete: text }, 
                members: { $in: [client.userID]}
            });

            const userResponse = client.queryUsers({
                id: { $ne: client.userID },
                name: { $autocomplete: text }
            })

            const [channels, { users }] = await Promise.all([channelResponse, userResponse]);

            // Only set if there's a *visible* match
            const filteredChannels = channels.filter((c) =>
                c.data?.name?.toLowerCase().includes(text.toLowerCase())
            );

            const filteredUsers = users.filter((u) =>
                u.name?.toLowerCase().includes(text.toLowerCase())
            );

            setTeamChannels(filteredChannels);
            setDirectChannels(filteredUsers);
            setLoading(false);
        } catch (error) {
            setQuery('')
            console.error('Search failed:', error);
            setTeamChannels([]);
            setDirectChannels([]);
            setLoading(false);
        }
    }

    const onSearch = (event) => {
        event.preventDefault();

        const text = event.target.value;
        setQuery(text);
        setLoading(true);
        getChannels(text);
    }

    const setChannel = (channel) => {
        setQuery('');
        setActiveChannel(channel);
    }

    return (
        <div className="channel-search__container">
            <div className="channel-search__input__wrapper">
                <div className="channel-serach__input__icon">
                    <SearchIcon />
                </div>
                <input 
                    className="channel-search__input__text" 
                    placeholder="Search" 
                    type="text" 
                    value={query}  
                    onChange={onSearch}
                />
            </div>
            { query && (
                <ResultsDropdown 
                    teamChannels={teamChannels}
                    directChannels={directChannels}
                    loading={loading}
                    setChannel={setChannel}
                    setQuery={setQuery}
                    setToggleContainer={setToggleContainer}
                />
            )}
        </div>
    )
}

export default ChannelSearch