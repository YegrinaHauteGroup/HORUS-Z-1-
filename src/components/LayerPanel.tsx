'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Satellite, Activity, Sun, AlertTriangle, Camera, Flame, Target,
  CloudLightning, Radiation, Tv, Anchor, Ship, Newspaper,
  Network, Share2, Radio
} from 'lucide-react';
import { Search, MapPin, StickyNote } from 'lucide-react';

interface LayerPanelProps {
  data: any;
  activeLayers: any;
  setActiveLayers: React.Dispatch<React.SetStateAction<any>>;
  isMobile?: boolean;
  onSearch?: () => void;
  onPinMode?: () => void;
  onMemoMode?: () => void;
}

const LAYER_GROUPS = [
  {
    label: 'SDK',
    fullLabel: 'HORUS SDK',
    color: '#1565C0',
    layers: [
      { key: 'sdk_sea', label: 'Maritime Lines', icon: Anchor, color: '#4FC3F7', dataKey: 'sdk_entities' },
      { key: 'sdk_ransomware', label: 'Ransomware Feed', icon: AlertTriangle, color: '#FF3D3D', dataKey: 'sdk_entities' },
    ],
  },
  {
    label: 'AVIATION',
    fullLabel: 'AVIATION',
    color: '#00E5FF',
    layers: [
      { key: 'flights', label: 'Commercial', icon: Plane, color: '#00E5FF', dataKey: 'commercial_flights' },
      { key: 'private', label: 'Private', icon: Plane, color: '#00E676', dataKey: 'private_flights' },
      { key: 'jets', label: 'Private Jets', icon: Plane, color: '#FF69B4', dataKey: 'private_jets' },
      { key: 'military', label: 'Military', icon: Shield, color: '#FF3D3D', dataKey: 'military_flights' },
    ],
  },
  {
    label: 'MARITIME',
    fullLabel: 'MARITIME & SPACE',
    color: '#00BCD4',
    layers: [
      { key: 'maritime', label: 'Maritime / Naval', icon: Ship, color: '#00BCD4', dataKey: 'maritime_ships,maritime_ports,maritime_chokepoints' },
      { key: 'cables', label: 'Submarine Cables', icon: Share2, color: '#4FC3F7', dataKey: 'submarine_cables' },
      { key: 'satellites', label: 'Satellites', icon: Satellite, color: '#D4AF37', dataKey: 'satellites' },
    ],
  },
  {
    label: 'SURVEIL',
    fullLabel: 'SURVEILLANCE',
    color: '#39FF14',
    layers: [
      { key: 'cctv', label: 'CCTV Cameras', icon: Camera, color: '#39FF14', dataKey: 'cameras' },
      { key: 'live_news', label: 'Live News Feeds', icon: Tv, color: '#FF4081', dataKey: 'live_feeds' },
    ],
  },
  {
    label: 'HAZARD',
    fullLabel: 'NATURAL HAZARDS',
    color: '#FF9500',
    layers: [
      { key: 'earthquakes', label: 'Earthquakes (24h)', icon: Activity, color: '#FF9500', dataKey: 'earthquakes' },
      { key: 'fires', label: 'Active Fires', icon: Flame, color: '#FF6B00', dataKey: 'fires' },
      { key: 'weather', label: 'Severe Weather', icon: CloudLightning, color: '#E040FB', dataKey: 'weather_events' },
    ],
  },
  {
    label: 'THREAT',
    fullLabel: 'THREATS & INFRA',
    color: '#FF3D3D',
    layers: [
      { key: 'infrastructure', label: 'Nuclear Facilities', icon: Radiation, color: '#76FF03', dataKey: 'infrastructure' },
      { key: 'global_incidents', label: 'Global Incidents', icon: AlertTriangle, color: '#FF3D3D', dataKey: 'gdelt' },
      { key: 'gps_jamming', label: 'GPS Jamming', icon: Radio, color: '#FF4444', dataKey: 'gps_jamming' },
    ],
  },
  {
    label: 'NETWORK',
    fullLabel: 'NETWORK INTEL',
    color: '#00E5FF',
    layers: [
      { key: 'internet_outages', label: 'Internet Outages', icon: Network, color: '#00E5FF', dataKey: 'ioda_outages' },
      { key: 'malware', label: 'Live Malware', icon: AlertTriangle, color: '#FF1744', dataKey: 'malware_threats' },
    ],
  },
  {
    label: 'DISPLAY',
    fullLabel: 'DISPLAY',
    color: '#448AFF',
    layers: [
      { key: 'day_night', label: 'Day / Night Cycle', icon: Sun, color: '#448AFF', dataKey: '' },
    ],
  },
];

const ALL_LAYERS = LAYER_GROUPS.flatMap(g => g.layers);

// SVG component for Shield which was missing in the imports above
function Shield(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function LayerPanel({ data, activeLayers, setActiveLayers, isMobile, onSearch, onPinMode, onMemoMode }: LayerPanelProps) {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);

  const toggle = (key: string) => setActiveLayers((prev: any) => ({ ...prev, [key]: !prev[key] }));
  
  const getCount = (dk: string): number | null => {
    if (!dk) return null;
    let total = 0;
    let found = false;
    for (const k of dk.split(',')) {
      if (data[k] && Array.isArray(data[k])) {
        total += data[k].length;
        found = true;
      }
    }
    return found ? total : null;
  };

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4 py-2">
        {LAYER_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-2">
            <div 
              className="text-[10px] font-bold font-mono tracking-widest border-b border-white/10 pb-1"
              style={{ color: group.color }}
            >
              {group.fullLabel}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {group.layers.map((layer) => {
                const isLayerActive = activeLayers[layer.key];
                const count = getCount(layer.dataKey);
                
                return (
                  
  <button
    key={layer.key}
    onClick={() => {
      if (layer.key === 'sdk_ransomware') {
        alert('Ransomware Feed - Coming Soon');
      } else {
        toggle(layer.key);
      }
    }}
    // 디자인이 변경된 부분입니다 (점 삭제, 직사각형 테두리)
    className={`w-full flex items-center justify-between px-3 py-2 rounded-sm border transition-all duration-200 ${
      isLayerActive 
        ? 'bg-white/10 border-white/30' 
        : 'bg-black/20 border-white/10 hover:border-white/20'
    }`}
  >
    <span className={`text-[10px] font-mono uppercase tracking-wider text-left transition-colors duration-200 ${
      isLayerActive ? 'text-white' : 'text-white/50'
    }`}>
      {layer.label}
    </span>
    {count !== null && (
      <span className="text-[9px] font-mono tabular-nums opacity-60 text-white/50">
        {count.toLocaleString()}
      </span>
    )}
  </button>
);
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 h-full w-[80px] border-r border-white/5 flex flex-col pt-32 pb-8 z-50 pointer-events-auto bg-black/20 backdrop-blur-[2px]">
      
      <div className="flex-1 flex flex-col gap-8 px-2">
        {LAYER_GROUPS.map((group) => {
          const groupActiveCount = group.layers.filter(l => activeLayers[l.key]).length;
          const isActive = groupActiveCount > 0;
          const isHovered = hoveredGroup === group.label;

          return (
            <div 
              key={group.label} 
              className="relative flex justify-center items-center"
              onMouseEnter={() => setHoveredGroup(group.label)}
              onMouseLeave={() => setHoveredGroup(null)}
            >
              {/* The Vertical Label */}
              <div 
                className={`text-[10px] font-mono font-bold cursor-pointer select-none transition-all duration-300 flex items-center justify-center`}
                style={{
                  writingMode: 'horizontal-tb',
                  color: isActive ? group.color : 'rgba(255, 255, 255, 0.4)',
                  textShadow: isActive ? `0 0 10px ${group.color}80` : 'none',
                  letterSpacing: '0.1em',
                  opacity: isActive || isHovered ? 1 : 0.5,
                }}
              >
                
                {group.label}
              </div>

              {/* Slide-out Menu */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -5, filter: 'blur(2px)' }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute left-[70px] top-1/2 -translate-y-1/2 min-w-[240px] bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-2xl z-50 pointer-events-auto"
                    style={{
                      boxShadow: `0 0 30px ${group.color}15, inset 0 0 20px ${group.color}05`
                    }}
                  >
                    <div className="text-[11px] font-bold font-mono mb-3 tracking-widest border-b border-white/10 pb-2" style={{ color: group.color }}>
                      {group.fullLabel}
                    </div>
                    <div className="flex flex-col gap-2">
  {group.layers.map((layer) => {
    const isLayerActive = activeLayers[layer.key];
    const count = getCount(layer.dataKey);
    
    return (
      <button
        key={layer.key}
        onClick={() => {
          if (layer.key === 'sdk_ransomware') {
            alert('Ransomware Feed - Coming Soon');
          } else {
            toggle(layer.key);
          }
        }}
        /* 직사각형 테두리 적용, 점(dot) 제거, 상태에 따른 테두리 색상 변화 */
        className={`w-full flex items-center justify-between px-3 py-2 rounded-md border transition-all duration-200 ${
          isLayerActive 
            ? 'bg-white/5 border-white/30' 
            : 'bg-black/20 border-white/10 hover:border-white/20'
        }`}
      >
        <span className={`text-[10px] font-mono uppercase tracking-wider text-left transition-colors duration-200 ${
          isLayerActive ? 'text-white' : 'text-white/50'
        }`}>
          {layer.label}
        </span>
        {count !== null && (
          <span className="text-[9px] font-mono tabular-nums opacity-60 text-white/50">
            {count.toLocaleString()}
          </span>
        )}
      </button>
    );
  })}
</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div> {/* <-- 이 </div>가 LAYER_GROUPS.map을 감싸는 flex-1 영역을 닫는 태그입니다. */}


    </div>
  );
}

export default memo(LayerPanel);
