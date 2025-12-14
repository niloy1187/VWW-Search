
import React, { useEffect, useRef, useState } from 'react';
import { Hotel } from '../types';

interface MapViewProps {
  hotels: Hotel[];
}

export const MapView: React.FC<MapViewProps> = ({ hotels }) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [libReady, setLibReady] = useState(false);

  useEffect(() => {
      const checkL = setInterval(() => {
          // @ts-ignore
          if (window.L) {
              setLibReady(true);
              clearInterval(checkL);
          }
      }, 100);
      return () => clearInterval(checkL);
  }, []);

  useEffect(() => {
    if (!libReady || !mapContainerRef.current) return;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

    const defaultCenter = hotels.length > 0 && hotels[0].coordinates ? [hotels[0].coordinates.lat, hotels[0].coordinates.lng] : [20.5937, 78.9629];
    // @ts-ignore
    const L = window.L;
    if (!L) return;

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView(defaultCenter, hotels.length > 0 ? 12 : 5);
    mapRef.current = map;
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 20 }).addTo(map);

    const customIcon = L.divIcon({ 
        className: 'custom-map-icon', 
        html: `<div style="background-color: #ccff00; width: 16px; height: 16px; border-radius: 50%; box-shadow: 0 0 20px 5px rgba(204, 255, 0, 0.5); border: 2px solid #050505;"></div>`, 
        iconSize: [16, 16], 
        iconAnchor: [8, 8] 
    });
    
    const bounds = L.latLngBounds([]);
    hotels.forEach(hotel => {
      if (hotel.coordinates) {
        const popupContent = `
          <div style="font-family: 'Petrona', sans-serif; color: #fff; min-width: 220px; padding: 4px;">
            <h3 style="font-family: 'Hedvig Letters Serif', serif; font-weight: bold; font-size: 16px; margin: 0 0 8px 0; padding-bottom: 6px; border-bottom: 1px solid #333;">${hotel.name}</h3>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 8px;">
              <span style="font-size: 11px; color: #999; font-weight: bold; text-transform: uppercase;">Best Price</span>
              <span style="font-size: 20px; color: #ccff00; font-weight: bold;">${hotel.bookingOptions?.[0]?.price || 'N/A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 4px;">
              <span style="font-size: 11px; color: #999; font-weight: bold; text-transform: uppercase;">VFM Score</span>
              <span style="font-size: 14px; color: #fff; font-weight: bold;">${hotel.vfmScore}/10</span>
            </div>
          </div>
        `;
        L.marker([hotel.coordinates.lat, hotel.coordinates.lng], { icon: customIcon })
         .addTo(map)
         .bindPopup(popupContent);
        bounds.extend([hotel.coordinates.lat, hotel.coordinates.lng]);
      }
    });

    if (hotels.length > 0) map.fitBounds(bounds, { padding: [50, 50] });
  }, [hotels, libReady]);

  return <div className="w-full h-full relative group"><div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-10 bg-[#121212]" /></div>;
};