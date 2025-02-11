import { useState } from 'react';
import { LoadScript } from '@react-google-maps/api';
const GoogleMap = (await import('@react-google-maps/api')).GoogleMap;
const Marker = (await import('@react-google-maps/api')).Marker;

const API_KEY = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY;

const locationGroups = [
    {
        name: 'Hauptsitz',
        locations: [
            {
                name: 'Olang',
                position: { lat: 46.74186179521426, lng: 12.019626462091589 }
            }
        ]
    },
    {
        name: 'Krankenhäuser',
        locations: [
            {
                name: 'Zentrum ALS Ulm',
                position: { lat: 48.402011920528075, lng: 10.001382988517443 }
            },
            {
                name: 'Charité - Universitätsmedizin Berlin',
                position: { lat: 52.52679215849246, lng: 13.376573939161005 }
            }
        ]
    }
];;

export function GoogleMapsMap() {
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

    const handleGroupChange = (e: { target: { options: any; }; }) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(options[i].value);
            }
        }
        setSelectedGroups(selected);
    };

    return (
        <div className="map-container">
            <select
                multiple
                onChange={handleGroupChange}
                className="group-select"
                style={{
                    width: '100%',
                    margin: '1rem 0',
                    padding: '0.5rem',
                    border: '1px solid #ccc'
                }}
            >
                {locationGroups.map((group) => (
                    <option key={group.name} value={group.name}>
                        {group.name}
                    </option>
                ))}
            </select>

            <div style={{ height: '500px', width: '100%' }}>
                <GoogleMap
                    mapContainerStyle={{ height: '100%', width: '100%' }}
                    center={{ lat: 51.1657, lng: 10.4515 }} // Zentrum von Deutschland
                    zoom={6}
                >
                    {selectedGroups.map((groupName) => {
                        const group = locationGroups.find((g) => g.name === groupName);
                        if (!group) return;
                        return group.locations.map((location, index) => (
                            <Marker
                                key={`${groupName}-${index}`}
                                position={location.position}
                                title={location.name}
                            />
                        ));
                    })}
                </GoogleMap>
            </div>
        </div>
    );
};

export default function () {
    return (
        <LoadScript googleMapsApiKey={API_KEY}>
            <GoogleMapsMap />
        </LoadScript>
    )
}