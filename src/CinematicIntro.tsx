import React, { useEffect, useRef, useState } from 'react';
import mascotImg from './assets/mascot.png';

interface Props {
  onComplete: () => void;
  volume?: number;
  skipIntro?: boolean;
}

type Phase = 'intro' | 'mascot-loading' | 'mascot-welcome';
type LoadStage = { label: string; duration: number };

const STAGES: LoadStage[] = [
  { label: 'Инициализация ядра приложения...', duration: 600 },
  { label: 'Загрузка интерфейса...',           duration: 500 },
  { label: 'Подключение системных модулей...',  duration: 700 },
  { label: 'Чтение конфигурации...',            duration: 400 },
  { label: 'Проверка окружения Windows...',     duration: 600 },
  { label: 'Готово.',                           duration: 400 },
];

// Синглтон AudioContext — один на всё приложение, не пересоздаётся при hot-reload
let _sharedAC: AudioContext | null = null;
const getAC = (): AudioContext | null => {
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    if (!_sharedAC || _sharedAC.state === 'closed') {
      _sharedAC = new AC();
    }
    return _sharedAC;
  } catch (_) { return null; }
};

export default function CinematicIntro({ onComplete, volume = 1.0, skipIntro = false }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase]       = useState<Phase>(skipIntro ? 'mascot-loading' : 'intro');
  const [stageIdx, setStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stageDone, setStageDone] = useState<boolean[]>([]);
  const [dots, setDots]         = useState('');
  const [welcomeIn, setWelcomeIn] = useState(false);

  // ─── INTRO ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase !== 'intro') return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0.5 + Math.random() * 2,
      size: 1 + Math.random() * 2,
    }));

    const DURATION  = 8000;
    const startTime = performance.now();
    let rafId: number;
    const BRAND_COLOR = '#6366f1';
    const BRAND_TEXT  = 'ESAREV';

    // ── ЗВУК — используем синглтон чтобы не превысить лимит браузера ──
    const ac = getAC();
    if (ac) {
      const V = 0.15 * Math.max(0.01, volume);
      const play = () => {
        const t = ac.currentTime;
        const sub = (f: number, s: number, d: number) => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.type = 'sine'; o.frequency.setValueAtTime(f, s);
          g.gain.setValueAtTime(0, s);
          g.gain.linearRampToValueAtTime(0.3 * V, s + 2);
          g.gain.exponentialRampToValueAtTime(0.001, s + d);
          o.connect(g); g.connect(ac.destination);
          o.start(s); o.stop(s + d);
        };
        const ping = (f: number, s: number) => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.type = 'triangle'; o.frequency.setValueAtTime(f, s);
          g.gain.setValueAtTime(0, s);
          g.gain.linearRampToValueAtTime(0.05 * V, s + 0.01);
          g.gain.exponentialRampToValueAtTime(0.001, s + 0.5);
          o.connect(g); g.connect(ac.destination);
          o.start(s); o.stop(s + 0.5);
        };
        sub(55, t, 8);
        sub(82.41, t + 2, 6);
        [440, 880, 1320, 1760].forEach((f, i) => ping(f, t + 1 + i * 0.5));
      };
      if (ac.state === 'suspended') { ac.resume().then(play).catch(() => {}); } else { play(); }
    }
        // ── АНИМАЦИЯ ─────────────────────────────────────────
    const drawLogo = (opacity: number) => {
      const cx = canvas.width / 2, cy = canvas.height / 2;
      ctx.save(); ctx.globalAlpha = opacity;
      const grad = ctx.createLinearGradient(cx - 350, cy, cx + 350, cy);
      grad.addColorStop(0, BRAND_COLOR); grad.addColorStop(0.5, '#818cf8'); grad.addColorStop(1, '#312e81');
      ctx.strokeStyle = grad; ctx.lineWidth = 4; ctx.shadowBlur = 20; ctx.shadowColor = BRAND_COLOR;
      ctx.strokeRect(cx - 350, cy - 100, 700, 200);
      const fs = 80, cw = 50, tr = 0.35 * fs, ls = cw + tr;
      const sx = cx - ((BRAND_TEXT.length * cw + (BRAND_TEXT.length - 1) * tr) / 2) + cw / 2;
      const cols = ['#ffffff', BRAND_COLOR, '#818cf8', '#4f46e5', '#ffffff', '#ffffff'];
      ctx.font = `normal ${fs}px Inter, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowBlur = 10;
      BRAND_TEXT.split('').forEach((ch, i) => { ctx.fillStyle = cols[i] || '#fff'; ctx.fillText(ch, sx + i * ls, cy); });
      ctx.font = '500 12px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.shadowBlur = 0;
      const sub2 = 'SYSTEM INITIALIZED // Varan_WiNUP 1.0.3 VaRaN';
      const sp = 6;
      const tw = sub2.split('').reduce((a, c) => a + ctx.measureText(c).width + sp, 0) - sp;
      let sx2 = cx - tw / 2;
      sub2.split('').forEach(c => { ctx.fillText(c, sx2, cy + 75); sx2 += ctx.measureText(c).width + sp; });
      ctx.restore();
    };

    const animate = (now: number) => {
      const prog = Math.min((now - startTime) / DURATION, 1);
      if (canvas.width !== window.innerWidth) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      const ga = prog > 0.8 ? Math.max(0, 1 - (prog - 0.8) / 0.1) : 1;
      ctx.globalAlpha = ga;
      ctx.strokeStyle = `rgba(99,102,241,${0.05 * ga})`; ctx.lineWidth = 1;
      const gs = 50, off = (prog * 100) % gs;
      for (let x = off; x < canvas.width; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
      for (let y = off; y < canvas.height; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
      ctx.fillStyle = `rgba(99,102,241,${0.3 * ga})`;
      particles.forEach(p => { p.y -= p.speed; if (p.y < 0) { p.y = canvas.height; p.x = Math.random() * canvas.width; } ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); });
      let lo = 0;
      if (prog > 0.1 && prog < 0.3) lo = (prog - 0.1) / 0.2;
      else if (prog >= 0.3 && prog <= 0.8) lo = 1;
      else if (prog > 0.8) lo = 1 - (prog - 0.8) / 0.2;
      drawLogo(lo * ga);
      ctx.globalAlpha = 1;
      if (prog < 1) { rafId = requestAnimationFrame(animate); }
      else { setPhase('mascot-loading'); }
    };

    rafId = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafId); };
  }, [phase, volume]);

  // ─── LOADING ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'mascot-loading') return;
    const di = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 350);
    let elapsed = 0, cur = 0;
    setStageDone([]); setStageIdx(0); setProgress(0);
    const total = STAGES.reduce((a, s) => a + s.duration, 0);
    const tick = () => {
      const stage = STAGES[cur];
      if (!stage) { setProgress(100); clearInterval(di); setTimeout(() => setPhase('mascot-welcome'), 600); return; }
      const stepMs = 30, steps = stage.duration / stepMs;
      let step = 0;
      const si = setInterval(() => {
        step++;
        setProgress(Math.round(((elapsed + stage.duration * (step / steps)) / total) * 100));
        if (step >= steps) {
          clearInterval(si); elapsed += stage.duration;
          setStageDone(p => { const n = [...p]; n[cur] = true; return n; });
          cur++; setStageIdx(cur); tick();
        }
      }, stepMs);
    };
    tick();
    return () => clearInterval(di);
  }, [phase]);

  // ─── WELCOME slide-in ─────────────────────────────────────
  useEffect(() => {
    if (phase === 'mascot-welcome') {
      setTimeout(() => setWelcomeIn(true), 100);
    } else {
      setWelcomeIn(false);
    }
  }, [phase]);

  // ─── RENDER ──────────────────────────────────────────────
  if (phase === 'intro') return (
    <div className="fixed inset-0 z-[9999] bg-black select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] select-none overflow-hidden" style={{ backgroundColor: '#09090b', WebkitAppRegion: 'drag' } as React.CSSProperties}>

      {/* Кнопки окна — сверху справа */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={() => (window as any).electronAPI?.introMinimize?.()}
          className="w-7 h-7 flex items-center justify-center rounded text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
          title="Свернуть"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor"><rect width="10" height="1"/></svg>
        </button>
        <button
          onClick={() => (window as any).electronAPI?.introClose?.()}
          className="w-7 h-7 flex items-center justify-center rounded text-zinc-600 hover:bg-red-500/80 hover:text-white transition-colors"
          title="Закрыть"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/></svg>
        </button>
      </div>

      {/* Варан — по центру, уезжает вправо к стенке при welcome */}
      <div
        className="absolute inset-0 flex items-end justify-center pointer-events-none"
        style={{
          transform: phase === 'mascot-welcome' ? 'translateX(22%)' : 'translateX(0)',
          transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <img
          src={mascotImg}
          alt="Varan_WiNUP"
          style={{ height: '90vh', width: 'auto', objectFit: 'contain', objectPosition: 'center bottom', marginBottom: '-10vh' }}
        />
      </div>

      {/* LOADING — слева */}
      {phase === 'mascot-loading' && (
        <div className="absolute top-1/2 -translate-y-1/2 flex flex-col" style={{ left: '6%', minWidth: '260px', maxWidth: '300px' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9"/>
                <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.5"/>
                <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.5"/>
                <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm tracking-widest uppercase text-white">Varan_WiNUP</p>
              <p className="text-[10px] font-mono tracking-wider" style={{ color: '#6366f1' }}>v1.0.3 VaRaN</p>
            </div>
          </div>
          <div className="space-y-3 mb-8">
            {STAGES.map((stage, i) => {
              const done = stageDone[i], cur2 = i === stageIdx && !done, pend = i > stageIdx;
              return (
                <div key={i} className="flex items-center gap-3 transition-all duration-300" style={{ opacity: pend ? 0.25 : 1 }}>
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                    {done ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth="1"/>
                        <path d="M4 7l2 2 4-4" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : cur2 ? (
                      <div className="w-3 h-3 rounded-full border-2 border-indigo-400/30 border-t-indigo-500 animate-spin" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    )}
                  </div>
                  <span className="text-xs font-mono" style={{ color: done ? '#71717a' : cur2 ? '#ffffff' : '#52525b', fontWeight: cur2 ? 600 : 400 }}>
                    {cur2 ? `${stage.label}${dots}` : stage.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Загрузка</span>
              <span className="text-[10px] font-mono font-bold" style={{ color: '#6366f1' }}>{progress}%</span>
            </div>
            <div className="h-[3px] w-full rounded-full overflow-hidden bg-white/8">
              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#6366f1,#818cf8)', transition: 'width 0.1s linear' }} />
            </div>
          </div>
        </div>
      )}

      {/* WELCOME — въезжает с левой стороны (где была загрузка) к центру */}
      {phase === 'mascot-welcome' && (
        <div
          className="absolute flex flex-col"
          style={{
            top: '50%',
            left: welcomeIn ? '42%' : '6%',
            transform: 'translateY(-50%)',
            minWidth: '280px',
            maxWidth: '340px',
            opacity: welcomeIn ? 1 : 0,
            transition: 'left 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9"/>
                <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.5"/>
                <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.5"/>
                <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-base tracking-widest uppercase text-white">Varan_WiNUP</p>
              <p className="text-[10px] font-mono tracking-wider" style={{ color: '#6366f1' }}>v1.0.3 VaRaN</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-3 text-white">Добро<br/>пожаловать.</h1>
          <p className="text-sm leading-relaxed mb-1 text-zinc-400">
            Утилита для быстрой настройки Windows<br/>от <span style={{ color: '#6366f1', fontWeight: 600 }}>Esarev</span>.
          </p>
          <p className="text-xs mb-8 text-zinc-600">Всё что нужно — в одном месте.</p>
          <button
            onClick={() => { onComplete(); (window as any).electronAPI?.introComplete?.(); }}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="w-fit flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 bg-white text-zinc-900 hover:bg-zinc-100"
          >
            Начать работу
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="8" x2="13" y2="8"/><polyline points="9,4 13,8 9,12"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
