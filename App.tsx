import React, { useState, useCallback, useMemo } from 'react';
import { Option, WheelConfig, SpinResult, ThemeId } from './types';
import { processToSticker } from './utils/image';
import Wheel from './components/Wheel';
import Lantern from './components/Lantern';

type View = 'home' | 'setup' | 'spin';

const LUNAR_GREETINGS = [
  "新春大吉，好運連連！",
  "恭喜發財，紅包拿來！",
  "龍馬精神，萬事如意！",
  "歲歲平安，年年有餘！",
  "前程似錦，大展宏圖！"
];

const THEMES: Record<ThemeId, { name: string, palette: string[], bg: string, accent: string, text: string, label: string }> = {
  classic: {
    name: '粉春綻放',
    palette: ['#E85D44', '#4D7C5B', '#FEF9E7', '#B6A691'],
    bg: '#FFF5F5',
    accent: '#E85D44',
    text: '#423a32',
    label: '#8B4513'
  },
  royal: {
    name: '迎春報喜',
    palette: ['#a30000', '#1a4d2e', '#d4af37', '#fef3c7'],
    bg: '#7a0000',
    accent: '#d4af37',
    text: '#fef3c7',
    label: '#fef3c7'
  },
  emerald: {
    name: '福壽金貴',
    palette: ['#1a4d2e', '#a30000', '#d4af37', '#fef3c7'],
    bg: '#0e2a19',
    accent: '#d4af37',
    text: '#fef3c7',
    label: '#fef3c7'
  }
};

const Peony: React.FC<{ className?: string, color?: string }> = ({ className, color = "#a30000" }) => (
  <div className={`pointer-events-none ${className}`}>
    <svg width="120" height="120" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="20" fill={color} />
      {[...Array(8)].map((_, i) => (
        <ellipse 
          key={i} 
          cx="50" cy="30" rx="15" ry="25" 
          fill={color} 
          transform={`rotate(${i * 45} 50 50)`} 
          opacity="0.8"
        />
      ))}
      <circle cx="50" cy="50" r="10" fill="#ffd700" />
    </svg>
  </div>
);

const Cloud: React.FC<{ className?: string, color?: string }> = ({ className, color = "#d4af37" }) => (
  <div className={`pointer-events-none opacity-40 ${className}`}>
    <svg width="100" height="60" viewBox="0 0 100 60">
      <circle cx="30" cy="40" r="20" fill={color} />
      <circle cx="50" cy="35" r="25" fill={color} />
      <circle cx="70" cy="40" r="20" fill={color} />
      <rect x="30" y="40" width="40" height="20" fill={color} />
    </svg>
  </div>
);

const PlumBlossomBranch: React.FC<{ className?: string, flip?: boolean }> = ({ className, flip = false }) => (
  <div className={`pointer-events-none ${className}`} style={{ transform: flip ? 'scaleX(-1)' : 'none' }}>
    <svg width="200" height="300" viewBox="0 0 200 300">
      {/* Main branch */}
      <path
        d="M180 300 Q160 250 140 200 Q120 150 80 100 Q60 70 30 40"
        stroke="#4A3728"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      {/* Smaller branches */}
      <path d="M140 200 Q150 180 170 170" stroke="#4A3728" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M100 140 Q120 130 140 140" stroke="#4A3728" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M60 80 Q80 70 90 55" stroke="#4A3728" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Plum blossoms - 5 petal pink flowers */}
      {[
        { cx: 30, cy: 40, size: 1.2 },
        { cx: 60, cy: 80, size: 1 },
        { cx: 90, cy: 55, size: 0.9 },
        { cx: 140, cy: 140, size: 1.1 },
        { cx: 170, cy: 170, size: 1 },
      ].map((flower, fi) => (
        <g key={fi} transform={`translate(${flower.cx}, ${flower.cy}) scale(${flower.size})`}>
          {/* 5 petals */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <ellipse
              key={i}
              cx="0"
              cy="-12"
              rx="8"
              ry="10"
              fill="#FFB6C1"
              transform={`rotate(${angle})`}
              opacity="0.9"
            />
          ))}
          {/* Darker pink inner */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <ellipse
              key={`inner-${i}`}
              cx="0"
              cy="-8"
              rx="4"
              ry="5"
              fill="#FF91A4"
              transform={`rotate(${angle})`}
              opacity="0.6"
            />
          ))}
          {/* Center */}
          <circle cx="0" cy="0" r="5" fill="#FFEB99" />
          {/* Stamens */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <g key={`stamen-${i}`} transform={`rotate(${angle})`}>
              <line x1="0" y1="0" x2="0" y2="-6" stroke="#C9302C" strokeWidth="1" />
              <circle cx="0" cy="-7" r="1.5" fill="#C9302C" />
            </g>
          ))}
        </g>
      ))}

      {/* Small buds */}
      {[
        { cx: 50, cy: 60, size: 0.5 },
        { cx: 110, cy: 120, size: 0.6 },
        { cx: 155, cy: 185, size: 0.5 },
      ].map((bud, bi) => (
        <g key={`bud-${bi}`} transform={`translate(${bud.cx}, ${bud.cy}) scale(${bud.size})`}>
          <ellipse cx="0" cy="0" rx="6" ry="8" fill="#FFB6C1" />
          <ellipse cx="0" cy="-2" rx="4" ry="5" fill="#FF91A4" opacity="0.7" />
        </g>
      ))}
    </svg>
  </div>
);

const CelebrationOverlay: React.FC<{ themeColor?: string }> = ({ themeColor = "#E85D44" }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Firecrackers - Left and Right sides with 福 diamond */}
      {[false, true].map((isRight, idx) => (
        <div
          key={idx}
          className="absolute top-4"
          style={{
            left: isRight ? 'auto' : '5%',
            right: isRight ? '5%' : 'auto',
            animation: `firecracker-swing 2s ease-in-out infinite`,
            animationDelay: `${idx * 0.3}s`
          }}
        >
          <svg width="80" height="350" viewBox="0 0 80 350">
            {/* 福 Diamond hanging plate */}
            <g transform="translate(40, 35) rotate(45)">
              <rect x="-25" y="-25" width="50" height="50" fill="#E31C25" stroke="#FFD700" strokeWidth="2" />
              <rect x="-20" y="-20" width="40" height="40" fill="none" stroke="#FFD700" strokeWidth="1" />
            </g>
            <text x="40" y="42" textAnchor="middle" fill="#FFD700" fontSize="24" fontWeight="bold">福</text>

            {/* Hanging rope */}
            <line x1="40" y1="0" x2="40" y2="10" stroke="#8B4513" strokeWidth="3" />

            {/* Twisted firecracker string */}
            <path
              d="M40 60 Q25 80 40 100 Q55 120 40 140 Q25 160 40 180 Q55 200 40 220 Q25 240 40 260 Q55 280 40 300"
              stroke="#D4A017"
              strokeWidth="2"
              fill="none"
            />

            {/* Firecrackers along the curve */}
            {[
              {x: 32, y: 75, r: -15}, {x: 48, y: 95, r: 15},
              {x: 32, y: 115, r: -15}, {x: 48, y: 135, r: 15},
              {x: 32, y: 155, r: -15}, {x: 48, y: 175, r: 15},
              {x: 32, y: 195, r: -15}, {x: 48, y: 215, r: 15},
              {x: 32, y: 235, r: -15}, {x: 48, y: 255, r: 15},
              {x: 32, y: 275, r: -15}, {x: 48, y: 295, r: 15},
            ].map((fc, i) => (
              <g key={i} transform={`translate(${fc.x}, ${fc.y}) rotate(${fc.r})`}>
                <rect x="-8" y="-6" width="16" height="12" fill="#E31C25" rx="2" />
                <rect x="-8" y="-2" width="16" height="4" fill="#FFD700" />
                <line x1="0" y1="-6" x2="0" y2="-10" stroke="#333" strokeWidth="1" />
              </g>
            ))}

            {/* Explosion sparks at bottom */}
            <g transform="translate(40, 320)">
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                <line
                  key={i}
                  x1="0" y1="0"
                  x2={Math.cos(angle * Math.PI / 180) * (12 + (i % 3) * 5)}
                  y2={Math.sin(angle * Math.PI / 180) * (12 + (i % 3) * 5)}
                  stroke={i % 2 === 0 ? "#FFD700" : "#FF6B00"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.05}s` }}
                />
              ))}
              <circle cx="0" cy="0" r="5" fill="#FFD700" className="animate-ping" />
            </g>
          </svg>
        </div>
      ))}

      {/* Floating sparks */}
      {[...Array(20)].map((_, i) => (
        <div
          key={`spark-${i}`}
          className="absolute animate-ping"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: '2s'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <polygon points="8,0 9,6 16,8 9,10 8,16 7,10 0,8 7,6" fill="#FFD700" />
          </svg>
        </div>
      ))}

      {/* Fireworks Bursts */}
      {[...Array(10)].map((_, i) => (
        <div key={i} className="absolute animate-burst opacity-0" style={{
          left: `${15 + Math.random() * 70}%`,
          top: `${10 + Math.random() * 60}%`,
          animationDelay: `${Math.random() * 3}s`
        }}>
          <svg width="80" height="80" viewBox="0 0 100 100">
            <g transform="translate(50,50)">
              {[...Array(12)].map((_, j) => (
                <line
                  key={j}
                  x1="0" y1="0"
                  x2="0" y2="40"
                  stroke={j % 3 === 0 ? "#FFD700" : j % 3 === 1 ? "#FF0000" : "#FF6B00"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  transform={`rotate(${j * 30})`}
                />
              ))}
            </g>
            <circle cx="50" cy="50" r="6" fill="#FFF" />
          </svg>
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [config, setConfig] = useState<WheelConfig>({
    name: '2026 迎春 • 開運輪盤',
    themeId: 'royal',
    options: []
  });

  const activeTheme = useMemo(() => THEMES[config.themeId], [config.themeId]);

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const newOptions: Option[] = lines.slice(0, 12).map((l, i) => ({
        id: `csv-${i}-${Date.now()}`,
        type: 'text',
        content: l.split(',')[0] 
      }));
      setConfig(prev => ({ ...prev, options: newOptions }));
    };
    reader.readAsText(file);
  };

  const handlePhotoImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList) as File[];
    const processed = await Promise.all(files.map((f: File) => processToSticker(f)));
    const newOptions: Option[] = processed.slice(0, 12).map((b64, i) => ({
      id: `img-${i}-${Date.now()}`,
      type: 'image',
      content: b64,
      label: `相片 ${i+1}`
    }));
    setConfig(prev => ({ ...prev, options: [...prev.options, ...newOptions].slice(0, 12) }));
  };

  const spin = () => {
    if (isSpinning || config.options.length < 1) return;
    const TOTAL_SECTORS = 12;
    const targetSectorIndex = Math.floor(Math.random() * TOTAL_SECTORS);
    const sectorAngle = 360 / TOTAL_SECTORS;
    const extraRotations = (7 + Math.floor(Math.random() * 5)) * 360;
    const targetRotation = extraRotations + (270 - (targetSectorIndex * sectorAngle + (sectorAngle/2)));
    setIsSpinning(true);
    setResult(null);
    setRotation(targetRotation);
    setTimeout(() => {
      setIsSpinning(false);
      const winningOption = config.options[targetSectorIndex % config.options.length];
      setResult({ option: winningOption, index: targetSectorIndex });
    }, 5000);
  };

  return (
    <div className="min-h-screen flex flex-col transition-all safe-pb" style={{
      backgroundColor: activeTheme.bg,
      backgroundImage: config.themeId === 'classic' 
        ? `radial-gradient(circle at top, #FFECEC 0%, #FFF5F5 100%)`
        : `radial-gradient(circle at center, ${activeTheme.bg} 0%, #000 100%)`
    }}>
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Plum blossom branches on both sides */}
        <PlumBlossomBranch className="absolute -bottom-10 -left-10 opacity-60" />
        <PlumBlossomBranch className="absolute -bottom-10 -right-10 opacity-60" flip={true} />
        <Cloud className="absolute top-20 left-1/4" color={activeTheme.accent} />
        <Cloud className="absolute bottom-40 right-1/3" color={activeTheme.accent} />
        <Peony className="absolute -top-10 -right-10 opacity-30" color={activeTheme.palette[0]} />
        <Peony className="absolute -bottom-10 -left-10 opacity-30 scale-150" color={activeTheme.palette[0]} />
        <Lantern className="absolute top-10 left-10" />
        <Lantern className="absolute top-10 right-10" />
        
        {/* Golden corner patterns */}
        <div className="absolute top-4 left-4 w-20 h-20 border-l-4 border-t-4 opacity-60" style={{ borderColor: activeTheme.accent }}></div>
        <div className="absolute top-4 right-4 w-20 h-20 border-r-4 border-t-4 opacity-60" style={{ borderColor: activeTheme.accent }}></div>
        <div className="absolute bottom-4 left-4 w-20 h-20 border-l-4 border-b-4 opacity-60" style={{ borderColor: activeTheme.accent }}></div>
        <div className="absolute bottom-4 right-4 w-20 h-20 border-r-4 border-b-4 opacity-60" style={{ borderColor: activeTheme.accent }}></div>
      </div>
      
      <div className="relative z-10 flex-1 flex flex-col">
        {view === 'home' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-700">
            <div className="bg-black/20 backdrop-blur-md p-12 md:p-16 rounded-[1rem] shadow-[0_30px_90px_rgba(0,0,0,0.8)] w-full max-w-xl border-4 border-double relative" style={{ borderColor: activeTheme.accent }}>
              <div className="flex justify-center gap-2 mb-8">
                 <span className="text-4xl font-black" style={{ color: activeTheme.accent }}>二</span>
                 <span className="text-4xl font-black" style={{ color: activeTheme.text }}>〇</span>
                 <span className="text-4xl font-black" style={{ color: activeTheme.accent }}>二</span>
                 <span className="text-4xl font-black" style={{ color: activeTheme.text }}>六</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-4 font-[ZCOOL KuaiLe] tracking-widest drop-shadow-lg" style={{ color: activeTheme.text }}>
                迎春開運輪盤
              </h1>
              <p className="text-lg md:text-xl mb-12 font-bold tracking-[0.4em] uppercase" style={{ color: activeTheme.accent }}>Year of the Horse</p>
              
              <div className="flex justify-center mb-12">
                 <div className="w-40 h-40 flex items-center justify-center rounded-full shadow-inner border-4 animate-bounce bg-white/10" style={{ borderColor: activeTheme.accent }}>
                    <span className="text-7xl">🐴</span>
                 </div>
              </div>

              <button 
                onClick={() => setView('setup')}
                className="w-full md:w-auto px-20 py-6 text-3xl font-black rounded-xl shadow-2xl hover:brightness-110 transform transition hover:scale-105 active:scale-95 border-b-8 bouncy"
                style={{ backgroundColor: activeTheme.accent, color: activeTheme.bg === '#FFF5F5' ? '#FFF' : activeTheme.bg, borderColor: activeTheme.palette[3] }}
              >
                立即開運
              </button>
            </div>
          </div>
        )}

        {view === 'setup' && (
          <div className="flex-1 flex flex-col container mx-auto p-4 md:p-6 max-w-5xl animate-in fade-in duration-300">
            <div className="rounded-2xl shadow-2xl flex-1 flex flex-col overflow-hidden border-4 relative" style={{ backgroundColor: activeTheme.palette[0], borderColor: activeTheme.accent }}>
              <div className="p-8 flex justify-between items-center border-b" style={{ borderColor: activeTheme.accent, backgroundColor: activeTheme.bg, color: activeTheme.text }}>
                <h2 className="text-4xl font-black tracking-widest">獎項名單配置</h2>
                <button onClick={() => setView('home')} className="p-3 hover:scale-110 transition-transform" style={{ color: activeTheme.accent }}>
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/10">
                  <div className="mb-10">
                    <label className="block font-black uppercase text-sm tracking-[0.3em] mb-3" style={{ color: activeTheme.label }}>Custom Title • 客製化標題 (顯示於輪盤上方)</label>
                    <input 
                      type="text" 
                      value={config.name}
                      onChange={e => setConfig(prev => ({...prev, name: e.target.value}))}
                      className="w-full p-5 rounded-xl outline-none text-2xl font-black shadow-inner"
                      style={{ backgroundColor: activeTheme.bg, color: activeTheme.text, border: `2px solid ${activeTheme.accent}30` }}
                    />
                  </div>

                  <div className="mb-10">
                    <label className="block font-black uppercase text-sm tracking-[0.3em] mb-4" style={{ color: activeTheme.label }}>Theme Style • 主題配色</label>
                    <div className="grid grid-cols-3 gap-4">
                      {(Object.keys(THEMES) as ThemeId[]).map(tid => (
                        <button 
                          key={tid}
                          onClick={() => setConfig(prev => ({ ...prev, themeId: tid }))}
                          className={`p-4 rounded-xl border-4 transition-all flex flex-col items-center gap-2 ${config.themeId === tid ? 'scale-105 shadow-xl' : 'opacity-60 scale-95'}`}
                          style={{ 
                            backgroundColor: THEMES[tid].bg, 
                            borderColor: config.themeId === tid ? THEMES[tid].accent : 'transparent' 
                          }}
                        >
                          <div className="flex gap-1">
                            {THEMES[tid].palette.map((c, i) => <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }}></div>)}
                          </div>
                          <span className="font-black text-xs" style={{ color: THEMES[tid].text }}>{THEMES[tid].name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black" style={{ color: activeTheme.text }}>獎項列表 ({config.options.length}/12)</h3>
                        <button onClick={() => setConfig(prev => ({...prev, options: [...prev.options, {id: Date.now().toString(), type:'text', content:'新獎項'}]}))} className="px-6 py-2 rounded-lg font-black shadow-lg hover:brightness-110" style={{ backgroundColor: activeTheme.accent, color: activeTheme.bg }}>+ 新增</button>
                      </div>
                      <div className="space-y-3">
                        {config.options.length === 0 && (
                          <div className="p-10 text-center border-2 border-dashed rounded-xl" style={{ borderColor: activeTheme.label, color: activeTheme.label, backgroundColor: `${activeTheme.bg}90` }}>
                            目前沒有選項，請匯入或點擊新增
                          </div>
                        )}
                        {config.options.map((opt, i) => (
                          <div key={opt.id} className="flex items-center gap-4 p-4 rounded-xl border shadow-lg" style={{ backgroundColor: activeTheme.bg, borderColor: `${activeTheme.accent}20` }}>
                            <span className="w-10 h-10 flex items-center justify-center rounded-full font-black" style={{ backgroundColor: activeTheme.accent, color: activeTheme.bg }}>{i+1}</span>
                            <div className="flex-1 flex items-center gap-3">
                              {opt.type === 'image' ? (
                                <>
                                  <img src={opt.content} className="w-14 h-14 rounded-full border-2 shadow-md bg-white object-cover" style={{ borderColor: activeTheme.accent }} alt="Preview" />
                                  <span className="text-sm font-bold" style={{ color: activeTheme.text }}>{opt.label || '相片貼紙'}</span>
                                </>
                              ) : (
                                <input 
                                  type="text" 
                                  value={opt.content}
                                  onChange={e => {
                                      const newOpts = [...config.options];
                                      newOpts[i].content = e.target.value;
                                      setConfig(prev => ({...prev, options: newOpts}));
                                  }}
                                  className="flex-1 bg-transparent border-none focus:ring-0 outline-none font-bold text-xl"
                                  style={{ color: activeTheme.text }}
                                />
                              )}
                            </div>
                            <button onClick={() => setConfig(prev => ({...prev, options: prev.options.filter(o => o.id !== opt.id)}))} className="transition-colors text-2xl" style={{ color: `${activeTheme.accent}40` }}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-10 rounded-2xl border-4 border-double shadow-2xl flex flex-col justify-center" style={{ backgroundColor: activeTheme.bg, borderColor: activeTheme.accent }}>
                        <h3 className="text-2xl font-black mb-8 text-center tracking-widest" style={{ color: activeTheme.text }}>批量製作工具</h3>
                        <div className="flex flex-col gap-6">
                          <label className="flex items-center justify-center p-8 rounded-xl cursor-pointer hover:bg-black/5 transition-all border-2 border-dashed group" style={{ borderColor: activeTheme.accent }}>
                             <span className="text-2xl font-black group-hover:scale-105 transition-transform" style={{ color: activeTheme.accent }}>📄 匯入 CSV 名單</span>
                             <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
                          </label>
                          <label className="flex items-center justify-center p-8 rounded-xl cursor-pointer hover:bg-black/5 transition-all border-2 border-dashed group" style={{ borderColor: activeTheme.accent }}>
                             <span className="text-2xl font-black group-hover:scale-105 transition-transform" style={{ color: activeTheme.accent }}>📸 AI 相片貼紙化</span>
                             <input type="file" accept="image/*" multiple onChange={handlePhotoImport} className="hidden" />
                          </label>
                        </div>
                    </div>
                  </div>
              </div>

              <div className="p-8 border-t" style={{ borderColor: activeTheme.accent, backgroundColor: activeTheme.bg }}>
                  <button 
                    onClick={() => setView('spin')}
                    disabled={config.options.length === 0}
                    className={`w-full py-8 font-black text-4xl rounded-xl shadow-xl transition-all border-b-8 uppercase tracking-widest ${config.options.length === 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:brightness-110 active:scale-95'}`}
                    style={{ backgroundColor: activeTheme.accent, color: activeTheme.bg === '#FFF5F5' ? '#FFF' : activeTheme.bg, borderColor: activeTheme.palette[3] }}
                  >
                    抽獎GO
                  </button>
              </div>
            </div>
          </div>
        )}

        {view === 'spin' && (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <button onClick={() => setView('setup')} className="absolute top-6 left-6 font-black flex items-center gap-2 hover:brightness-110 transition-all p-4 rounded-xl border backdrop-blur-md z-20 shadow-lg" style={{ backgroundColor: activeTheme.palette[0], color: activeTheme.text, borderColor: `${activeTheme.accent}30` }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
              返回設定
            </button>
            
            <div className="text-center mb-10 animate-in slide-in-from-top duration-700">
              <h2 className="text-6xl md:text-8xl font-black drop-shadow-xl font-[ZCOOL KuaiLe] tracking-widest" style={{ color: activeTheme.text }}>
                {config.name}
              </h2>
              <div className="h-2 w-32 mx-auto mt-4 rounded-full" style={{ backgroundColor: activeTheme.accent }}></div>
            </div>

            <div className="relative transform scale-95 md:scale-110 transition-transform duration-500">
              <Wheel options={config.options} rotation={rotation} spinning={isSpinning} palette={activeTheme.palette} />
            </div>

            <div className="mt-16 w-full max-w-md animate-in slide-in-from-bottom duration-700">
              <button 
                onClick={spin}
                disabled={isSpinning}
                className={`w-full py-8 rounded-xl text-5xl font-black shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all transform active:scale-95 border-b-8 ${isSpinning ? 'opacity-50 grayscale' : 'hover:brightness-110 bouncy'}`}
                style={{ backgroundColor: activeTheme.accent, color: activeTheme.bg === '#FFF5F5' ? '#FFF' : activeTheme.bg, borderColor: activeTheme.palette[3] }}
              >
                {isSpinning ? '開始' : '開運旋轉'}
              </button>
            </div>

            {result && !isSpinning && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-3xl p-6 animate-in fade-in zoom-in duration-500">
                <CelebrationOverlay themeColor={activeTheme.accent} />
                
                <div className="rounded-2xl p-12 w-full max-w-xl text-center border-8 border-double shadow-[0_0_120px_rgba(0,0,0,0.6)] relative z-10 overflow-hidden" style={{ backgroundColor: activeTheme.palette[0], borderColor: activeTheme.accent }}>
                  <div className="font-black text-3xl mb-8 tracking-[0.6em] animate-pulse drop-shadow-md" style={{ color: activeTheme.accent }}>🎊 恭喜獲獎 🎊</div>
                  
                  <div className="mb-12 p-12 rounded-xl border-2 shadow-inner relative group overflow-hidden" style={{ backgroundColor: activeTheme.bg, borderColor: `${activeTheme.accent}40` }}>
                      <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
                      {result.option.type === 'text' ? (
                        <div className="text-8xl md:text-9xl font-black font-[ZCOOL KuaiLe] drop-shadow-lg leading-tight animate-winner-glow" style={{ color: activeTheme.text }}>{result.option.content}</div>
                      ) : (
                        <div className="relative inline-block">
                           <div className="absolute inset-0 rounded-full animate-winner-border" style={{
                             background: `conic-gradient(from 0deg, ${activeTheme.accent}, #FFD700, #FF6B00, ${activeTheme.accent})`,
                             padding: '8px',
                             margin: '-8px'
                           }}></div>
                           <img src={result.option.content} className="relative w-72 h-72 mx-auto rounded-full border-8 shadow-2xl transform transition-transform group-hover:scale-105 animate-winner-pulse" style={{ borderColor: activeTheme.accent }} alt="Winner" />
                           <div className="absolute -bottom-6 -right-6 w-20 h-20 flex items-center justify-center rounded-full text-4xl font-black border-4 shadow-2xl animate-bounce" style={{ backgroundColor: activeTheme.accent, color: activeTheme.bg, borderColor: activeTheme.text }}>福</div>
                           {/* Sparkle effects around the image */}
                           {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                             <div
                               key={i}
                               className="absolute w-4 h-4 animate-ping"
                               style={{
                                 left: `${50 + 52 * Math.cos(angle * Math.PI / 180)}%`,
                                 top: `${50 + 52 * Math.sin(angle * Math.PI / 180)}%`,
                                 transform: 'translate(-50%, -50%)',
                                 animationDelay: `${i * 0.15}s`,
                                 animationDuration: '1.5s'
                               }}
                             >
                               <svg viewBox="0 0 20 20" fill="#FFD700">
                                 <polygon points="10,0 12,8 20,10 12,12 10,20 8,12 0,10 8,8" />
                               </svg>
                             </div>
                           ))}
                        </div>
                      )}
                  </div>

                  <p className="text-3xl font-black italic mb-12 tracking-widest drop-shadow-sm" style={{ color: activeTheme.text }}>"{LUNAR_GREETINGS[Math.floor(Math.random()*LUNAR_GREETINGS.length)]}"</p>
                  
                  <div className="flex flex-col gap-5">
                      <button 
                        onClick={() => {setResult(null); spin();}} 
                        className="w-full py-6 text-3xl font-black rounded-xl shadow-2xl border-b-4 hover:brightness-110 transition-all active:scale-95 tracking-widest"
                        style={{ backgroundColor: activeTheme.accent, color: activeTheme.bg === '#FFF5F5' ? '#FFF' : activeTheme.bg, borderColor: activeTheme.palette[3] }}
                      >
                        龍馬精神 (再轉一次)
                      </button>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => {setResult(null); setView('setup');}} 
                          className="py-4 text-[#fef3c7] text-xl font-black rounded-xl shadow-xl border-b-4 hover:brightness-110 transition-all active:scale-95"
                          style={{ backgroundColor: activeTheme.palette[1], borderColor: '#000' }}
                        >
                          重新製作
                        </button>
                        <button 
                          onClick={() => setResult(null)} 
                          className="py-4 text-xl font-black rounded-xl shadow-xl border-2 hover:bg-white/10 transition-all active:scale-95"
                          style={{ backgroundColor: activeTheme.bg, color: activeTheme.accent, borderColor: activeTheme.accent }}
                        >
                          關閉
                        </button>
                      </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;