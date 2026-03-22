import React, { useEffect, useRef, useState } from 'react';
import { playClickSound } from './utils/sound';

interface Props {
  onComplete: () => void;
  volume?: number; // 0.0–1.0, default 1.0
}

export default function CinematicIntro({ onComplete, volume = 1.0 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef  = useRef<AudioContext | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Инициализируем размеры до создания частиц
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Частицы теперь распределяются по всей ширине экрана
    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0.5 + Math.random() * 2,
      size: 1 + Math.random() * 2,
    }));

    const DURATION   = 8000; // мс — полная длина интро
    const startTime  = performance.now();
    let   rafId: number;

    const BRAND_COLOR = '#6366f1';
    const BRAND_TEXT  = 'ESAREV';

    // ─── ЗВУК ───────────────────────────────────────────────
    const playSound = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioRef.current = audioCtx;
        const now = audioCtx.currentTime;
        const VOL = 0.15 * volume;

        // Глубокий саббас — ощущение "запуска системы"
        const createSub = (freq: number, start: number, dur: number) => {
          const osc  = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.3 * VOL, start + 2);
          gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(start); osc.stop(start + dur);
        };

        // Высокочастотные пинги — буква за буквой
        const createPing = (freq: number, start: number) => {
          const osc  = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.05 * VOL, start + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(start); osc.stop(start + 0.5);
        };

        createSub(55, now, 8);        // низкий бас
        createSub(82.41, now + 2, 6); // квинта
        [440, 880, 1320, 1760].forEach((f, i) => {
          createPing(f, now + 1 + i * 0.5); // нарастающие пинги
        });
      } catch (e) {
        console.warn('Audio failed:', e);
      }
    };

    // ─── АНИМАЦИЯ ───────────────────────────────────────────
    const drawLogo = (opacity: number) => {
      const cx = canvas.width  / 2;
      const cy = canvas.height / 2;

      ctx.save();
      ctx.globalAlpha = opacity;

      // Рамка с градиентом
      const grad = ctx.createLinearGradient(cx - 350, cy, cx + 350, cy);
      grad.addColorStop(0,   BRAND_COLOR);
      grad.addColorStop(0.5, '#818cf8');
      grad.addColorStop(1,   '#312e81');
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 4;
      ctx.shadowBlur  = 20;
      ctx.shadowColor = BRAND_COLOR;
      ctx.strokeRect(cx - 350, cy - 100, 700, 200);

      // Текст логотипа
      const fontSize    = 80;
      const charWidth   = 50;
      const tracking    = 0.35 * fontSize;
      const letterSpace = charWidth + tracking;
      const startX      = cx - ((BRAND_TEXT.length * charWidth + (BRAND_TEXT.length - 1) * tracking) / 2) + charWidth / 2;

      const colors = ['#ffffff', BRAND_COLOR, '#818cf8', '#4f46e5', '#ffffff', '#ffffff'];
      ctx.font      = `normal ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 10;

      BRAND_TEXT.split('').forEach((char, i) => {
        ctx.fillStyle = colors[i] || '#ffffff';
        ctx.fillText(char, startX + i * letterSpace, cy);
      });

      // Подпись снизу (FIX: letterSpacing не поддерживается в Canvas API Firefox/Safari)
      ctx.font      = '500 12px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.shadowBlur = 0;
      const subText = 'SYSTEM INITIALIZED // v1.0.0';
      const charSpacing = 6;
      const totalSubWidth = subText.split('').reduce((acc, ch) => acc + ctx.measureText(ch).width + charSpacing, 0) - charSpacing;
      let subX = cx - totalSubWidth / 2;
      subText.split('').forEach((ch) => {
        ctx.fillText(ch, subX, cy + 75);
        subX += ctx.measureText(ch).width + charSpacing;
      });

      ctx.restore();
    };

    const animate = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1); // 0..1

      // Ресайз
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      // Фон
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Fade-out всего canvas после 80%
      const globalAlpha = progress > 0.8
        ? Math.max(0, 1 - (progress - 0.8) / 0.1)
        : 1;
      ctx.globalAlpha = globalAlpha;

      // Сетка
      ctx.strokeStyle = `rgba(99,102,241,${0.05 * globalAlpha})`;
      ctx.lineWidth   = 1;
      const gridSize  = 50;
      const offset    = (progress * 100) % gridSize;
      for (let x = offset; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = offset; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Частицы
      ctx.fillStyle = `rgba(99,102,241,${0.3 * globalAlpha})`;
      particles.forEach(p => {
        p.y -= p.speed;
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width; // Рандомизируем X при появлении сверху
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Логотип
      let logoOpacity = 0;
      if      (progress > 0.1 && progress < 0.3) logoOpacity = (progress - 0.1) / 0.2;
      else if (progress >= 0.3 && progress <= 0.8) logoOpacity = 1;
      else if (progress > 0.8)  logoOpacity = 1 - (progress - 0.8) / 0.2;
      drawLogo(logoOpacity * globalAlpha);

      ctx.globalAlpha = 1;

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        if (audioRef.current?.state !== 'closed') {
          audioRef.current?.close().catch(() => {});
        }
        setTimeout(onComplete, 1200);
      }
    };

    playSound();
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      if (audioRef.current?.state !== 'closed') {
        audioRef.current?.close().catch(() => {});
      }
    };
  }, [started, onComplete, volume]);

  if (!started) {
    return (
      <div 
        className="fixed inset-0 z-[9999] bg-black flex items-center justify-center cursor-pointer"
        onClick={() => {
          playClickSound();
          setStarted(true);
        }}
      >
        <div className="text-zinc-500 font-mono text-sm tracking-widest animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          НАЖМИТЕ ДЛЯ ЗАПУСКА СИСТЕМЫ
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
}
