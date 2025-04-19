import React, { useRef, useCallback } from 'react';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox';
import '@reach/combobox/styles.css';
import TextField from '@mui/material/TextField';

const GOOGLE_LIBRARIES = ['places'];

// Stała GOOGLE_LIBRARIES zadeklarowana globalnie do współdzielenia między komponentami

const BakeryAutocomplete = ({ onSelect }) => {
  // Upewnij się, że Google Maps Places API jest załadowane
  // Użyj useJsApiLoader jeśli nie masz globalnego ładowania skryptu

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({ debounce: 300 });

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      onSelect({ address, lat, lng });
    } catch (error) {
      onSelect({ address, lat: null, lng: null });
    }
  };

  return (
    <Combobox onSelect={handleSelect} aria-label="Wyszukaj piekarnię">
      <ComboboxInput
        as={TextField}
        label="Adres piekarni"
        value={value}
        onChange={handleInput}
        // disabled={!ready}
        placeholder="Wpisz adres piekarni..."
        fullWidth
        required
      />
      <ComboboxPopover>
        {status === 'OK' && (
          <ComboboxList>
            {data.map(({ place_id, description }) => (
              <ComboboxOption key={place_id} value={description} />
            ))}
          </ComboboxList>
        )}
      </ComboboxPopover>
    </Combobox>
  );
};

export default BakeryAutocomplete;
