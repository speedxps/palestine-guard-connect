import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Patrol {
  id: string;
  name: string;
  area: string;
  location_lat: number;
  location_lng: number;
  location_address: string;
  status: string;
  patrol_members: Array<{
    officer_name: string;
    officer_phone: string;
    role: string;
  }>;
}

interface MapComponentProps {
  patrols: Patrol[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  patrols, 
  center = [31.5326, 35.0998], // Hebron coordinates
  zoom = 12,
  height = "400px"
}) => {
  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {patrols.map((patrol) => (
          patrol.location_lat && patrol.location_lng && (
            <Marker 
              key={patrol.id}
              position={[patrol.location_lat, patrol.location_lng]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-sm mb-2">{patrol.name}</h3>
                  <p className="text-xs text-gray-600 mb-1">المنطقة: {patrol.area}</p>
                  <p className="text-xs text-gray-600 mb-2">العنوان: {patrol.location_address}</p>
                  <div className="text-xs">
                    <strong>الأعضاء:</strong>
                    {patrol.patrol_members.map((member, index) => (
                      <div key={index} className="mt-1">
                        • {member.officer_name} ({member.role})
                        {member.officer_phone && (
                          <div className="text-gray-500">📞 {member.officer_phone}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;