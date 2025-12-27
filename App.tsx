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

const THEMES: Record<ThemeId, { name: string, palette: string[], bg: string, accent: string, text: string }> = {
  classic: {
    name: '吉祥紅綠',
    palette: ['#E85D44', '#4D7C5B', '#FEF9E7', '#B6A691'],
    bg: '#FFF5F5',
    accent: '#E85D44',
    text: '#423a32'
  },
  royal: {
    name: '盛世金紅',
    palette: ['#a30000', '#1a4d2e', '#d4af37', '#fef3c7'],
    bg: '#7a0000',
    accent: '#d4af37',
    text: '#fef3c7'
  },
  emerald: {
    name: '富貴青金',
    palette: ['#1a4d2e', '#a30000', '#d4af37', '#fef3c7'],
    bg: '#0e2a19',
    accent: '#d4af37',
    text: '#fef3c7'
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

const CelebrationOverlay: React.FC<{ themeColor?: string }> = ({ themeColor = "#E85D44" }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Enhanced Firecrackers - Multiple strings */}
      {[0, 1, 2, 3].map((pos) => (
        <div 
          key={pos} 
          className="absolute top-0 animate-bounce" 
          style={{ 
            left: `${10 + pos * 25}%`, 
            animationDuration: `${2 + Math.random()}s`,
            animationDelay: `${pos * 0.2}s`
          }}
        >
          <svg width="40" height="300" viewBox="0 0 40 300">
            <line x1="20" y1="0" x2="20" y2="280" stroke="#FFD700" strokeWidth="2" />
            {[...Array(12)].map((_, i) => (
              <g key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.05}s` }}>
                <rect 
                  x={i % 2 === 0 ? 5 : 25} 
                  y={i * 22} 
                  width="12" 
                  height="18" 
                  fill="#D90429" 
                  stroke="#FFD700" 
                  strokeWidth="0.5" 
                  rx="2"
                />
                <circle cx={i % 2 === 0 ? 11 : 31} cy={i * 22 + 9} r="1.5" fill="#FFD700" className="animate-ping" />
              </g>
            ))}
            <circle cx="20" cy="280" r="15" fill="#FFD700" className="animate-ping" />
          </svg>
        </div>
      ))}
      
      {/* High-quality Fireworks Bursts */}
      {[...Array(15)].map((_, i) => (
        <div key={i} className="absolute animate-burst opacity-0" style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`
        }}>
          <svg width="80" height="80" viewBox="0 0 100 100">
            <g transform="translate(50,50)">
              {[...Array(12)].map((_, j) => (
                <line 
                  key={j}
                  x1="0" y1="0" 
                  x2="0" y2="40" 
                  stroke={j % 2 === 0 ? "#FFD700" : "#D90429"} 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  transform={`rotate(${j * 30})`}
                />
              ))}
            </g>
            <circle cx="50" cy="50" r="5" fill="#FFF" />
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
                    <label className="block font-black uppercase text-sm tracking-[0.3em] mb-3" style={{ color: activeTheme.accent }}>Wheel Title • 輪盤標題</label>
                    <input 
                      type="text" 
                      value={config.name}
                      onChange={e => setConfig(prev => ({...prev, name: e.target.value}))}
                      className="w-full p-5 rounded-xl outline-none text-2xl font-black shadow-inner"
                      style={{ backgroundColor: activeTheme.bg, color: activeTheme.text, border: `2px solid ${activeTheme.accent}30` }}
                    />
                  </div>

                  <div className="mb-10">
                    <label className="block font-black uppercase text-sm tracking-[0.3em] mb-4" style={{ color: activeTheme.accent }}>Theme Style • 主題配色</label>
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
                          <div className="p-10 text-center border-2 border-dashed rounded-xl" style={{ borderColor: `${activeTheme.accent}40`, color: `${activeTheme.accent}60` }}>
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
                    進入抽獎場景
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
                {isSpinning ? '祈福旋轉中' : '開運旋轉'}
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
                        <div className="text-8xl md:text-9xl font-black font-[ZCOOL KuaiLe] drop-shadow-lg leading-tight" style={{ color: activeTheme.text }}>{result.option.content}</div>
                      ) : (
                        <div className="relative inline-block">
                           <img src={result.option.content} className="w-72 h-72 mx-auto rounded-full border-8 shadow-2xl transform transition-transform group-hover:scale-105" style={{ borderColor: activeTheme.accent }} alt="Winner" />
                           <div className="absolute -bottom-6 -right-6 w-20 h-20 flex items-center justify-center rounded-full text-4xl font-black border-4 shadow-2xl animate-bounce" style={{ backgroundColor: activeTheme.accent, color: activeTheme.bg, borderColor: activeTheme.text }}>福</div>
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