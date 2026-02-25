"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Check } from "lucide-react";

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export interface SafePoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
}

interface SafePointsMapProps {
  cityCenter: [number, number];
  initialPoints: SafePoint[];
  onPointsChange: (points: SafePoint[]) => void;
}

function MapEvents({ onAddPoint }: { onAddPoint: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onAddPoint(e.latlng);
    },
  });
  return null;
}

export default function SafePointsMap({ cityCenter, initialPoints, onPointsChange }: SafePointsMapProps) {
  const [points, setPoints] = useState<SafePoint[]>(initialPoints);
  const [editingPointId, setEditingPointId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    setPoints(initialPoints);
  }, [initialPoints]);

  const handleAddPoint = (latlng: L.LatLng) => {
    const newId = Math.random().toString(36).substring(7);
    const newPoint: SafePoint = {
      id: newId,
      lat: latlng.lat,
      lng: latlng.lng,
      name: `Novo Ponto Seguro`,
    };
    const updatedPoints = [...points, newPoint];
    setPoints(updatedPoints);
    onPointsChange(updatedPoints);
    
    // Automatically enter edit mode for the new point
    setEditingPointId(newId);
    setEditName(newPoint.name);
  };

  const handleRemovePoint = (id: string) => {
    const updatedPoints = points.filter(p => p.id !== id);
    setPoints(updatedPoints);
    onPointsChange(updatedPoints);
    if (editingPointId === id) {
      setEditingPointId(null);
    }
  };

  const handleSaveName = (id: string) => {
    const updatedPoints = points.map(p => 
      p.id === id ? { ...p, name: editName || "Ponto Seguro" } : p
    );
    setPoints(updatedPoints);
    onPointsChange(updatedPoints);
    setEditingPointId(null);
  };

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-slate-200 relative z-0">
      <MapContainer center={cityCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onAddPoint={handleAddPoint} />
        
        {points.map((point) => (
          <Marker 
            key={point.id} 
            position={[point.lat, point.lng]} 
            icon={icon}
            eventHandlers={{
              popupopen: () => {
                if (editingPointId !== point.id) {
                  setEditingPointId(null);
                }
              }
            }}
          >
            <Popup>
              <div className="space-y-3 min-w-[200px]">
                {editingPointId === point.id ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Nome do Ponto Seguro</label>
                    <div className="flex gap-2">
                      <Input 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Ex: Shopping Center"
                        className="h-8 text-xs"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName(point.id);
                        }}
                      />
                      <Button 
                        size="icon" 
                        className="h-8 w-8 shrink-0 bg-green-600 hover:bg-green-700"
                        onClick={() => handleSaveName(point.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="group cursor-pointer"
                    onClick={() => {
                      setEditingPointId(point.id);
                      setEditName(point.name);
                    }}
                  >
                    <p className="font-black text-sm text-slate-800 group-hover:text-primary transition-colors border-b border-dashed border-transparent group-hover:border-primary inline-block">
                      {point.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Clique no nome para editar</p>
                  </div>
                )}
                
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-mono text-slate-500 bg-slate-50 p-1.5 rounded-md">
                    {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
                  </p>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleRemovePoint(point.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Remover Ponto
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
