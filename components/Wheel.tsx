
import React, { useMemo } from 'react';
import { Option } from '../types';

interface WheelProps {
  options: Option[];
  rotation: number;
  spinning: boolean;
  palette: string[];
}

const Wheel: React.FC<WheelProps> = ({ options, rotation, spinning, palette }) => {
  const size = 500;
  const center = size / 2;
  const radius = center - 20;
  
  const TOTAL_SECTORS = 12;
  const angleStep = 360 / TOTAL_SECTORS;

  const sectors = useMemo(() => {
    const displayOptions = Array.from({ length: TOTAL_SECTORS }, (_, i) => options[i % options.length] || { id: 'empty', type: 'text', content: '' });

    return displayOptions.map((opt, i) => {
      const startAngle = i * angleStep;
      const endAngle = (i + 1) * angleStep;
      
      const x1 = center + radius * Math.cos((Math.PI * startAngle) / 180);
      const y1 = center + radius * Math.sin((Math.PI * startAngle) / 180);
      const x2 = center + radius * Math.cos((Math.PI * endAngle) / 180);
      const y2 = center + radius * Math.sin((Math.PI * endAngle) / 180);

      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

      const fillColor = palette[i % palette.length];
      // Heuristic for text color
      const textColor = (fillColor === '#fef3c7' || fillColor === '#fef9e7' || fillColor === '#FEF9E7' || fillColor === '#d4af37') ? '#423a32' : '#FFFFFF';

      return { pathData, fillColor, textColor, angle: startAngle + angleStep / 2, ...opt };
    });
  }, [options, radius, center, angleStep, palette]);

  return (
    <div className="relative flex justify-center items-center select-none filter drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 z-30">
        <svg width="60" height="60" viewBox="0 0 60 60">
            <path d="M30 60 L60 0 L0 0 Z" fill={palette[2] || '#d4af37'} stroke={palette[0]} strokeWidth="2" />
            <circle cx="30" cy="20" r="8" fill={palette[0]} stroke="white" strokeWidth="2" />
        </svg>
      </div>

      <div 
        className="transition-transform duration-[5000ms] cubic-bezier(0.15, 0, 0.1, 1)"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-[85vw] h-auto">
          {/* Outer Border */}
          <circle cx={center} cy={center} r={radius + 18} fill={palette[2]} />
          <circle cx={center} cy={center} r={radius + 12} fill={palette[0]} />
          <circle cx={center} cy={center} r={radius + 8} fill={palette[2]} />
          
          {sectors.map((sector, i) => (
            <g key={i}>
              <path d={sector.pathData} fill={sector.fillColor} stroke={palette[2]} strokeWidth="1" />
              <g transform={`rotate(${sector.angle} ${center} ${center})`}>
                <text
                  x={center + radius * 0.65}
                  y={center}
                  fill={sector.textColor}
                  fontSize="24"
                  fontWeight="900"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  transform={`rotate(90 ${center + radius * 0.65} ${center})`}
                  style={{ pointerEvents: 'none', filter: sector.textColor === '#FFFFFF' ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' : 'none' }}
                >
                  {sector.type === 'text' ? (
                    sector.content.length > 5 ? sector.content.slice(0,4)+'..' : sector.content
                  ) : ''}
                </text>
                {sector.type === 'image' && (
                  <image
                    href={sector.content}
                    x={center + radius * 0.5}
                    y={center - 35}
                    width="75"
                    height="75"
                    clipPath="circle(37.5px at center)"
                  />
                )}
              </g>
            </g>
          ))}
          
          {/* Center Hub */}
          <circle cx={center} cy={center} r="54" fill={palette[2]} className="filter drop-shadow-md" />
          <circle cx={center} cy={center} r="48" fill={palette[0]} stroke="white" strokeWidth="2" />
          <text 
            x={center} 
            y={center} 
            textAnchor="middle" 
            dominantBaseline="central"
            fontSize="60" 
            fontWeight="900" 
            fill={palette[2]} 
            transform={`rotate(180 ${center} ${center})`}
            style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' }}
          >
            福
          </text>
        </svg>
      </div>
    </div>
  );
};

export default Wheel;
