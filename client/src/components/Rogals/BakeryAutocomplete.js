import React from 'react';
import usePlacesAutocomplete, {getGeocode, getLatLng} from 'use-places-autocomplete';
import Downshift from 'downshift';
import TextField from '@mui/material/TextField';

const BakeryAutocomplete = ({onSelect}) => {

    const {
        ready,
        value,
        suggestions: {status, data},
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({debounce: 300});

    const handleInput = (e) => {
        setValue(e.target.value);
    };

    const handleSelect = async (address) => {
        setValue(address, false);
        clearSuggestions();
        try {
            const results = await getGeocode({address});
            const {lat, lng} = await getLatLng(results[0]);
            onSelect({address, lat, lng});
        } catch (error) {
            onSelect({address, lat: null, lng: null});
        }
    };

    return (
        <Downshift
            inputValue={value}
            onInputValueChange={setValue}
            onSelect={handleSelect}
            itemToString={item => (item ? item.description || item : '')}
        >
            {({getInputProps, getItemProps, getMenuProps, isOpen, highlightedIndex, selectedItem}) => (
                <div style={{position: 'relative'}}>
                    <TextField
                        label="Adres piekarni"
                        value={value}
                        onChange={handleInput}
                        placeholder="Wpisz adres piekarni..."
                        fullWidth
                        required
                        {...getInputProps()}
                    />
                    <div {...getMenuProps()} style={{position: 'absolute', zIndex: 10, width: '100%'}}>
                        {isOpen && status === 'OK' && (
                            <div style={{
                                background: 'white',
                                border: '1px solid #ccc',
                                maxHeight: 220,
                                overflowY: 'auto'
                            }}>
                                {data.length === 0 ? (
                                    <div style={{padding: 8}}>Brak wyników</div>
                                ) : (
                                    data.map((item, index) => (
                                        <div
                                            key={item.place_id}
                                            {...getItemProps({item: item.description, index})}
                                            style={{
                                                backgroundColor: highlightedIndex === index ? '#f0f0f0' : 'white',
                                                fontWeight: selectedItem === item.description ? 700 : 400,
                                                padding: 8,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {item.description}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Downshift>
    );
};

export default BakeryAutocomplete;
