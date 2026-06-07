'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Satellite, Activity, Sun, AlertTriangle, Camera, Flame, Target,
  CloudLightning, Radiation, Tv, Anchor, Share2, Radio, Ship, Network, BarChart3, Layers,
  Globe, MapPinned // 아이콘 2개 추가
} from 'lucide-react';

interface LayerPanelProps {
  data: any;
  activeLayers: any;
  setActiveLayers: React.Dispatch<React.SetStateAction<any>>;
  isMobile?: boolean;
  onSearch?: () => void;
  onPinMode?: () => void;
  onMemoMode?: () => void;
  // 새로 추가된 지도 조작 Props
  mapStyle?: string;
  toggleMapStyle?: () => void;
  projection?: string;
  toggleProjection?: () => void;
}

const LAYER_GROUPS = [
  {
    label: '▹ SDK',
    fullLabel: 'HORUS SDK',
    color: '#1565C0',
    layers: [
      { key: 'sdk_sea', label: 'Maritime Lines', icon: Anchor, color: '#4FC3F7', dataKey: 'sdk_entities' },
      { key: 'sdk_ransomware', label: 'Ransomware Feed', icon: AlertTriangle, color: '#FF3D3D', dataKey: 'sdk_entities' },
    ],
  },
  {
    label: '▹ AVIAT',
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
    label: '▹ MT&S',
    fullLabel: 'MARITIME & SPACE',
    color: '#00BCD4',
    layers: [
      { key: 'maritime', label: 'Maritime / Naval', icon: Ship, color: '#00BCD4', dataKey: 'maritime_ships,maritime_ports,maritime_chokepoints' },
      { key: 'cables', label: 'Submarine Cables', icon: Share2, color: '#4FC3F7', dataKey: 'submarine_cables' },
      { key: 'satellites', label: 'Satellites', icon: Satellite, color: '#D4AF37', dataKey: 'satellites' },
    ],
  },
  {
    label: '▹ SRVL',
    fullLabel: 'SURVEILLANCE',
    color: '#39FF14',
    layers: [
      { key: 'cctv', label: 'CCTV Cameras', icon: Camera, color: '#39FF14', dataKey: 'cameras' },
      { key: 'live_news', label: 'Live News Feeds', icon: Tv, color: '#FF4081', dataKey: 'live_feeds' },
    ],
  },
  {
    label: '▹ HZD',
    fullLabel: 'NATURAL HAZARDS',
    color: '#FF9500',
    layers: [
      { key: 'earthquakes', label: 'Earthquakes (24h)', icon: Activity, color: '#FF9500', dataKey: 'earthquakes' },
      { key: 'fires', label: 'Active Fires', icon: Flame, color: '#FF6B00', dataKey: 'fires' },
      { key: 'weather', label: 'Severe Weather', icon: CloudLightning, color: '#E040FB', dataKey: 'weather_events' },
    ],
  },
  {
    label: '▹ TRT',
    fullLabel: 'THREATS & INFRA',
    color: '#FF3D3D',
    layers: [
      { key: 'infrastructure', label: 'Nuclear Facilities', icon: Radiation, color: '#76FF03', dataKey: 'infrastructure' },
      { key: 'global_incidents', label: 'Global Incidents', icon: AlertTriangle, color: '#FF3D3D', dataKey: 'gdelt' },
      { key: 'gps_jamming', label: 'GPS Jamming', icon: Radio, color: '#FF4444', dataKey: 'gps_jamming' },
    ],
  },
  {
    label: '▹ NET',
    fullLabel: 'NETWORK INTEL',
    color: '#00E5FF',
    layers: [
      { key: 'internet_outages', label: 'Internet Outages', icon: Network, color: '#00E5FF', dataKey: 'ioda_outages' },
      { key: 'malware', label: 'Live Malware', icon: AlertTriangle, color: '#FF1744', dataKey: 'malware_threats' },
    ],
  },
  {
    label: '▹ CYCLE',
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

function LayerPanel({ data, activeLayers, setActiveLayers, isMobile, mapStyle, toggleMapStyle, toggleProjection, projection, setMapProjection, setMapStyle }: LayerPanelProps) {
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
    if (layer.key === 'sdk_ransomware') alert('Coming Soon');
    else toggle(layer.key);
  }}
  className={`px-3 md:px-4 py-1.5 text-[10px] md:text-[11px] font-medium text-gray-300 hover:text-white bg-white/5 border border-white/10 rounded-xs transition-all hover:bg-white/10 whitespace-nowrap w-full text-left ${
    isLayerActive ? 'bg-white/10 border-white/30' : ''
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
    // 1. pt-16을 pt-24로 늘려 헤더 밑으로 상단 여백을 충분히 확보
    // 2. 가로 스크롤을 막고 팝업이 잘리지 않도록 overflow-visible 추가
    <div className="absolute top-0 left-0 h-full w-[80px] border-r border-[#2A2A2A] flex flex-col pt-24 pb-8 z-[100] pointer-events-auto bg-[#121212] shadow-2xl overflow-visible">
      

      {/* ── 기존 레이어 메뉴 영역 ── */}
      {/* 3. overflow-y-auto 삭제, gap-8을 gap-6으로 줄여 화면에 다 들어가게 함 */}
      <div className="flex-1 flex flex-col gap-3 px-2 overflow-visible">
        {LAYER_GROUPS.map((group) => {
          const isHovered = hoveredGroup === group.label;
          return (
            <div 
              key={group.label} 
              className="relative flex justify-center items-center"
              // 4. 모바일 및 마우스 작동 안정성을 위해 클릭(onClick)으로도 열리도록 추가
              onClick={() => setHoveredGroup(isHovered ? null : group.label)}
              onMouseEnter={() => setHoveredGroup(group.label)}
              onMouseLeave={() => setHoveredGroup(null)}
            >
              {/* 글씨를 항상 완전한 흰색(text-white)으로 고정 */}
              <div 
               className="w-[60px] flex items-center justify-center py-1 text-[10px] font-mono font-bold text-white bg-white/5 border border-gray-700 rounded-xs transition-all hover:bg-white/10 hover:border-gray-700 cursor-pointer select-none"
               >
                {group.label}
                </div>

              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    className="absolute left-[70px] top-1/2 -translate-y-1/2 min-w-[200px] bg-[#1A1A1A] border border-[#333] rounded-sm p-2 shadow-2xl z-50 pointer-events-auto"
                  >
                    <div className="text-[10px] font-bold font-mono mb-2 tracking-widest text-gray-400 border-b border-[#333] pb-1">
                      {group.fullLabel}
                    </div>
                    <div className="flex flex-col gap-1">
                      {group.layers.map((layer) => {
                        const isLayerActive = activeLayers[layer.key];
                        const count = getCount(layer.dataKey);
                        return (
                          <button
                            key={layer.key}
                            onClick={() => {
                              if (layer.key === 'sdk_ransomware') alert('Coming Soon');
                              else toggle(layer.key);
                            }}
                            className={`w-full flex items-center justify-between px-2 py-1.5 rounded-sm border transition-all duration-150 ${
                              isLayerActive 
                                ? 'bg-[#333] border-gray-500 text-white font-medium' 
                                : 'bg-transparent border-transparent hover:bg-[#222] text-gray-400'
                            }`}
                          >
                            <span className="text-[10px] font-mono uppercase tracking-tight">{layer.label}</span>
                            {count !== null && (
                              <span className={`text-[9px] font-mono tabular-nums ${isLayerActive ? 'text-gray-300' : 'text-gray-500'}`}>
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
      </div>
    </div>
  );
}

export default memo(LayerPanel);
