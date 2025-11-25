import React, { useEffect, useRef } from 'react';
import { Hotel } from '../types';

interface MapViewProps {
  hotels: Hotel[];
}

export const MapView: React.FC<MapViewProps> = ({ hotels }) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Default center to India or first hotel
    const defaultCenter = hotels.length > 0 && hotels[0].coordinates 
      ? [hotels[0].coordinates.lat, hotels[0].coordinates.lng] 
      : [20.5937, 78.9629]; // India Center

    // @ts-ignore
    const L = window.L;
    if (!L) return;

    const map = L.map(mapContainerRef.current).setView(defaultCenter, hotels.length > 0 ? 12 : 5);
    mapRef.current = map;

    // Dark Matter Tiles for the Tech/Gen Z look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #ccff00; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 0 15px rgba(204, 255, 0, 0.6); border: 2px solid #000;"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const bounds = L.latLngBounds([]);
    hotels.forEach(hotel => {
      if (hotel.coordinates) {
        L.marker([hotel.coordinates.lat, hotel.coordinates.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: 'Inter', sans-serif; color: #fff; min-width: 180px;">
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${hotel.name}</div>
              <div style="color: #ccff00; font-weight: bold; font-size: 16px;">${hotel.bookingOptions?.[0]?.price || 'Check Price'}</div>
              <div style="font-size: 10px; color: #aaa; margin-top: 4px;">${hotel.vfmScore}/10 VFM Score</div>
            </div>
          `);
        
        bounds.extend([hotel.coordinates.lat, hotel.coordinates.lng]);
      }
    });

    if (hotels.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [hotels]);

  return (
    <div className="w-full h-full relative group">
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-10 bg-[#121212]" />
    </div>
  );
};