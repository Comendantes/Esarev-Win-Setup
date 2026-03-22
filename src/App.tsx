import React, { useState, useEffect, useRef } from 'react';
import { Settings, Download, Monitor, Moon, Sun, Shield, FolderOpen, CheckCircle2, Circle, Search, Terminal, Package, EyeOff, Globe, Key, FileText, Info, Gamepad2, Camera, AlertCircle, HardDrive, Flame, WifiOff, Unlock, Send, Cpu, PlayCircle, AlertTriangle, Sparkles, Zap, LayoutGrid, MessageSquare, Sliders, Volume2, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import CinematicIntro from './CinematicIntro';
import imgGryazni from './assets/gryazni.jpg';
import imgDesktopClean from './assets/desktop-clean.png';
import { playClickSound, isClickSoundEnabled, setClickSoundEnabled } from './utils/sound';
import { getLatestVersion } from './utils/appVersions';
import { useElectron, type HardwareInfo } from './hooks/useElectron';

type Page = 'info' | 'disk-partition' | 'windows-office' | 'tweaks' | 'software' | 'bypass' | 'hardware' | 'aesthetics' | 'reinstall' | 'settings' | 'changelog';

interface Tweak {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

interface Software {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  url: string;
}

interface ActivationItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  activated: boolean;
  category: 'windows' | 'office' | 'mas' | 'install';
}


// ── Весенний блок — цветущее дерево + лепестки ─────────────
function PetalCanvas() {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let rafId: number;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    // ── Лепестки ──────────────────────────────────────────
    type Petal = {
      x: number; y: number; size: number; speed: number;
      sway: number; swaySpeed: number; swayOffset: number;
      rotation: number; rotSpeed: number; opacity: number; color: string;
    };
    // Весенние цвета: розовые, белые, нежно-сиреневые
    const COLORS = ['#fda4af','#fbcfe8','#f9a8d4','#ffffff','#e9d5ff','#fecdd3','#fce7f3','#ddd6fe'];
    const COUNT = 22;
    const makePetal = (fromTop: boolean): Petal => ({
      x: Math.random() * canvas.width,
      y: fromTop ? -10 - Math.random() * 50 : Math.random() * canvas.height,
      size: 4 + Math.random() * 5,
      speed: 0.35 + Math.random() * 0.5,
      sway: 18 + Math.random() * 25,
      swaySpeed: 0.007 + Math.random() * 0.01,
      swayOffset: Math.random() * Math.PI * 2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.03,
      opacity: 0.5 + Math.random() * 0.45,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
    const petals: Petal[] = Array.from({ length: COUNT }, () => makePetal(false));

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.4, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // ── Дерево — генерируем один раз, рисуем статично ──────
    type Blossom = { x: number; y: number; r: number; color: string; alpha: number };
    type GrassBlade = { x1: number; y1: number; cx: number; cy: number; x2: number; y2: number };
    const blossoms: Blossom[] = [];
    const grassBlades: GrassBlade[] = [];
    let treeBuilt = false;

    const buildTree = () => {
      if (treeBuilt || !canvas.width) return;
      treeBuilt = true;
      const bx = canvas.width - 55;
      const by = canvas.height + 5;

      // Собираем позиции цветов один раз
      const collectBlossoms = (x: number, y: number, len: number, angle: number, depth: number) => {
        if (depth === 0 || len < 4) return;
        const ex = x + Math.cos(angle) * len;
        const ey = y + Math.sin(angle) * len;
        if (depth <= 2) {
          for (let i = 0; i < 4; i++) {
            blossoms.push({
              x: ex + (Math.random() - 0.5) * 12,
              y: ey + (Math.random() - 0.5) * 12,
              r: 3 + Math.random() * 2.5,
              color: Math.random() > 0.3 ? '#fda4af' : '#fce7f3',
              alpha: 0.65 + Math.random() * 0.3,
            });
          }
        }
        collectBlossoms(ex, ey, len * 0.68, angle - 0.45, depth - 1);
        collectBlossoms(ex, ey, len * 0.68, angle + 0.38, depth - 1);
        if (depth > 2) collectBlossoms(ex, ey, len * 0.55, angle - 0.1, depth - 2);
      };
      collectBlossoms(bx - 5, by - 55, 30, -Math.PI / 2 - 0.1, 5);

      // Трава — фиксированные точки
      for (let i = -15; i <= 15; i += 5) {
        grassBlades.push({
          x1: bx + i, y1: by,
          cx: bx + i + (Math.random()-0.5)*4, cy: by - 8,
          x2: bx + i + (Math.random()-0.5)*3, y2: by - 14,
        });
      }
    };

    const drawTree = () => {
      buildTree();
      const bx = canvas.width - 55;
      const by = canvas.height + 5;

      // Ствол
      ctx.save();
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - 5, by - 55); ctx.stroke();

      // Ветки
      const drawBranch = (x: number, y: number, len: number, angle: number, depth: number) => {
        if (depth === 0 || len < 4) return;
        const ex = x + Math.cos(angle) * len;
        const ey = y + Math.sin(angle) * len;
        ctx.lineWidth = Math.max(1, depth * 1.1);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
        drawBranch(ex, ey, len * 0.68, angle - 0.45, depth - 1);
        drawBranch(ex, ey, len * 0.68, angle + 0.38, depth - 1);
        if (depth > 2) drawBranch(ex, ey, len * 0.55, angle - 0.1, depth - 2);
      };
      drawBranch(bx - 5, by - 55, 30, -Math.PI / 2 - 0.1, 5);
      ctx.restore();

      // Цветы — фиксированные позиции
      blossoms.forEach(b => {
        ctx.save();
        ctx.globalAlpha = b.alpha;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Трава
      ctx.save();
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      grassBlades.forEach(g => {
        ctx.beginPath();
        ctx.moveTo(g.x1, g.y1);
        ctx.quadraticCurveTo(g.cx, g.cy, g.x2, g.y2);
        ctx.stroke();
      });
      ctx.restore();
    };

    // ── Анимация ──────────────────────────────────────────
    let t = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t++;
      drawTree();
      petals.forEach(p => {
        p.y += p.speed;
        p.x += Math.sin(t * p.swaySpeed + p.swayOffset) * 0.5;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height + 10 || p.x < -20 || p.x > canvas.width + 20) {
          Object.assign(p, makePetal(true));
          p.x = Math.random() * canvas.width;
        }
        drawPetal(p);
      });
      rafId = requestAnimationFrame(animate);
    };
    animate();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ borderRadius: '1rem' }}
    />
  );
}

export default function App() {
  const { runPowerShell, openExternal, isElectron, getHardwareInfo } = useElectron();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [introEnabled, setIntroEnabled] = useState(() => {
    const saved = localStorage.getItem('introEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [introVolume, setIntroVolume] = useState(() => {
    const saved = localStorage.getItem('introVolume');
    const v = saved !== null ? parseFloat(saved) : 1.0;
    return (isNaN(v) || v <= 0) ? 1.0 : v;
  });
  useEffect(() => {
    localStorage.setItem('introEnabled', JSON.stringify(introEnabled));
  }, [introEnabled]);

  useEffect(() => {
    localStorage.setItem('introVolume', String(introVolume));
  }, [introVolume]);

  // Пропускаем интро если основное окно открыто через параметр ?noIntro=1
  const skipIntroParam = new URLSearchParams(window.location.search).get('noIntro') === '1';
  const [showIntro, setShowIntro] = useState(!skipIntroParam);
  const [currentPage, setCurrentPage] = useState<Page>('info');
  const isNavigatingRef = useRef(false);
  const navigateTo = (page: Page) => {
    if (isNavigatingRef.current || page === currentPage) return;
    isNavigatingRef.current = true;
    setCurrentPage(page);
    setTimeout(() => { isNavigatingRef.current = false; }, 250);
  };
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [notification, setNotification] = useState<string | null>(null);
  const [isScanningHardware, setIsScanningHardware] = useState(false);
  const [softwareSearch, setSoftwareSearch] = useState('');
  // Актуальные URL после проверки версий (appId -> url)
  const [checkedUrls, setCheckedUrls] = useState<Record<string, string>>({});
  const [checkingVersions, setCheckingVersions] = useState(false);

  // Проверяем версии при открытии страницы установки программ
  useEffect(() => {
    if (currentPage !== 'software' || checkingVersions || Object.keys(checkedUrls).length > 0) return;
    setCheckingVersions(true);
    const ids = software.map(s => s.id);
    Promise.all(ids.map(id => getLatestVersion(id).then(r => ({ id, url: r?.url ?? '' }))))
      .then(results => {
        const map: Record<string, string> = {};
        results.forEach(r => { if (r.url) map[r.id] = r.url; });
        setCheckedUrls(map);
        setCheckingVersions(false);
      })
      .catch(() => setCheckingVersions(false));
  }, [currentPage]);
  // Звук нажатия — по умолчанию ВЫКЛЮЧЕН
  const [clickSoundEnabled, setClickSoundEnabledState] = useState(() => isClickSoundEnabled());

  // Модалка курсоров
  const [showCursorsModal, setShowCursorsModal] = useState(false);

  // Глобальный поиск
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{title: string; desc: string; page: Page; keywords: string[]}[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchIndex: {title: string; desc: string; page: Page; keywords: string[]}[] = [
    { title: 'Добро пожаловать', desc: 'Информация о программе, советы по использованию', page: 'info', keywords: ['информация', 'привет', 'добро пожаловать', 'антивирус', 'defender', 'яндекс', 'браузер', 'opera'] },
    { title: 'Разделение диска', desc: 'Как разбить диск на C: и D:', page: 'disk-partition', keywords: ['диск', 'раздел', 'c:', 'd:', 'сжать том', 'управление дисками', 'diskmgmt', 'hdd', 'ssd', 'накопитель'] },
    { title: 'Windows и Office (MAS)', desc: 'Активация Windows и установка Office', page: 'windows-office', keywords: ['активация', 'windows', 'office', 'mas', 'ключ', 'лицензия', 'powershell', 'активировать'] },
    { title: 'Системные твики', desc: 'Тёмная тема, скрытые файлы, телеметрия, Edge', page: 'tweaks', keywords: ['твики', 'тёмная тема', 'dark mode', 'скрытые файлы', 'расширения', 'телеметрия', 'edge', 'chrome', 'bloatware', 'мусор'] },
    { title: 'Установка программ', desc: '7-Zip, Chrome, Discord, Telegram, Steam и другие', page: 'software', keywords: ['программы', 'скачать', '7zip', 'chrome', 'discord', 'telegram', 'vlc', 'notepad', 'steam', 'qbittorrent', 'sharex', 'zapret'] },
    { title: 'Обход блокировок', desc: 'Zapret, tg-ws-proxy, автозапуск', page: 'bypass', keywords: ['обход', 'блокировка', 'zapret', 'youtube', 'vpn', 'прокси', 'proxy', 'telegram', 'discord', 'рф', 'провайдер'] },
    { title: 'Железо и драйверы', desc: 'Сканирование ПК, видеокарта, драйверы', page: 'hardware', keywords: ['железо', 'драйвер', 'видеокарта', 'nvidia', 'amd', 'intel', 'процессор', 'cpu', 'gpu', 'ram', 'оперативная память', 'материнская плата'] },
    { title: 'Эстетика и порядок', desc: 'Чистый рабочий стол, кастомные курсоры', page: 'aesthetics', keywords: ['эстетика', 'рабочий стол', 'ярлыки', 'курсор', 'обои', 'порядок', 'красота', 'оформление'] },
    { title: 'Переустановка Windows', desc: 'Пошаговый гайд: Rufus, флешка, установка', page: 'reinstall', keywords: ['переустановка', 'установка windows', 'rufus', 'флешка', 'загрузочная', 'boot', 'bios', 'форматирование', 'чистая установка'] },
  ];

  const handleGlobalSearch = (query: string) => {
    setGlobalSearch(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const q = query.toLowerCase();
    const results = searchIndex.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.keywords.some(k => k.includes(q))
    );
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const [hardwareScanned, setHardwareScanned] = useState(false);
  const [hardwareData, setHardwareData] = useState<HardwareInfo | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tweaks, setTweaks] = useState<Tweak[]>([
    { id: 'dark-mode', title: 'Включить темную тему', description: 'Переключить Windows и приложения на темную тему', icon: Moon, enabled: false },
    { id: 'hidden-files', title: 'Показывать скрытые файлы', description: 'Отображать скрытые файлы и папки в проводнике', icon: FolderOpen, enabled: false },
    { id: 'file-ext', title: 'Показывать расширения файлов', description: 'Показывать расширения для известных типов файлов', icon: Settings, enabled: false },
    { id: 'telemetry', title: 'Отключить телеметрию', description: 'Прекратить отправку диагностических данных в Microsoft', icon: Shield, enabled: false },
    { id: 'hide-edge', title: 'Скрыть и отключить Microsoft Edge', description: 'Максимально убирает Edge из системы и отключает его. ВАЖНО: Перед применением обязательно скачайте Chrome!', icon: EyeOff, enabled: false },
    { id: 'chrome-default', title: 'Chrome по умолчанию для всего', description: 'Автоматически переназначает все веб-ссылки и форматы с Edge на Google Chrome.', icon: Globe, enabled: false },
  ]);

  const [software] = useState<Software[]>([
    { id: 'zapret', name: 'Zapret (Обход блокировок)', description: 'Обход блокировки YouTube, Discord и других сервисов в РФ. Только для ПК.', icon: Unlock, url: 'https://github.com/Flowseal/zapret-discord-youtube/archive/refs/tags/1.9.7b.zip' },
    { id: 'tg-ws-proxy', name: 'tg-ws-proxy (Telegram на ПК)', description: 'Обход блокировки Telegram Desktop на Windows. Только для ПК.', icon: Send, url: 'https://github.com/Flowseal/tg-ws-proxy/releases/download/v1.1.1/TgWsProxy.exe' },
    { id: '7zip', name: '7-Zip', description: 'Архиватор файлов с высокой степенью сжатия.', icon: Package, url: 'https://www.7-zip.org/a/7z2600-x64.exe' },
    { id: 'chrome', name: 'Google Chrome', description: 'Быстрый, безопасный и бесплатный веб-браузер.', icon: Monitor, url: 'https://dl.google.com/chrome/install/latest/chrome_installer.exe' },
    // Discord CDN — discordapp.net работает в РФ надёжнее, чем discord.com
    { id: 'discord', name: 'Discord', description: 'Популярный мессенджер для голосового и текстового общения.', icon: MessageSquare, url: 'https://stable.dl2.discordapp.net/distro/app/stable/win/x64/1.0.9226/DiscordSetup.exe' },
    // Telegram — официальный CDN Telegram, всегда последняя версия, доступен в РФ
    { id: 'telegram', name: 'Telegram Desktop', description: 'Быстрый и безопасный мессенджер. Официальный CDN — качается без VPN.', icon: Send, url: 'https://telegram.org/dl/desktop/win' },
    { id: 'vlc', name: 'VLC Media Player', description: 'Бесплатный кроссплатформенный медиаплеер с открытым исходным кодом.', icon: Monitor, url: 'https://download.videolan.org/pub/videolan/vlc/3.0.23/win64/vlc-3.0.23-win64.exe' },
    { id: 'notepadpp', name: 'Notepad++', description: 'Бесплатный редактор исходного кода и замена Блокноту.', icon: FolderOpen, url: 'https://github.com/notepad-plus-plus/notepad-plus-plus/releases/download/v8.9.2/npp.8.9.2.Installer.x64.exe' },
    { id: 'steam', name: 'Steam', description: 'Крупнейшая платформа для игр и программ.', icon: Gamepad2, url: 'https://cdn.akamai.steamstatic.com/client/installer/SteamSetup.exe' },
    // qBittorrent v5.1.4 — лучший торрент-клиент, без рекламы и спайваря
    { id: 'qbittorrent', name: 'qBittorrent', description: 'Лучший бесплатный торрент-клиент. Без рекламы, без слежки, без мусора.', icon: Download, url: 'https://downloads.sourceforge.net/project/qbittorrent/qbittorrent-win32/qbittorrent-5.1.3/qbittorrent_5.1.3_x64_setup.exe' },
    { id: 'sharex', name: 'ShareX', description: 'Мощная программа для создания скриншотов и записи экрана.', icon: Camera, url: 'https://github.com/ShareX/ShareX/releases/download/v19.0.2/ShareX-19.0.2-setup.exe' },
    { id: 'yandex-music-mod', name: 'Яндекс Музыка Мод', description: 'Яндекс Музыка без Плюса — патчер со всеми функциями. Запусти от администратора после установки.', icon: Music, url: 'https://github.com/Stephanzion/YandexMusicBetaMod/releases/download/v2.2.0/YandexMusicMod-5.86.0-2.2.0.windows.zip' },
  ]);

  // Проверка состояния системы при запуске
  useEffect(() => {
    const checkSystemState = () => {
      // 1. Реальная проверка темной темы через API браузера
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      setTweaks(prev => prev.map(t => {
        // Устанавливаем реальное значение для темной темы
        if (t.id === 'dark-mode') return { ...t, enabled: isDarkMode };
        if (t.id === 'file-ext') return { ...t, enabled: true };
        
        return t;
      }));
    };

    checkSystemState();

    // Слушатель изменения темы системы в реальном времени
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTweaks(prev => prev.map(t => t.id === 'dark-mode' ? { ...t, enabled: e.matches } : t));
    };
    
    mediaQuery.addEventListener('change', handleChange);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleTweak = (id: string) => {
    playClickSound();
    setTweaks(tweaks.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };


  // Сброс позиции скролла при смене страницы
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [currentPage]);

  const installSoftware = (id: string) => {
    playClickSound();
    const app = software.find(s => s.id === id);
    if (app) {
      const url = checkedUrls[id] || app.url;
      openExternal(url);
    }
  };

  if (showIntro) {
    return <CinematicIntro onComplete={() => setShowIntro(false)} volume={introVolume} skipIntro={!introEnabled} />;
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Кастомный тайтлбар — перетаскивание окна + кнопки управления */}
      <div
        className="flex items-center justify-between h-9 px-4 bg-zinc-950 border-b border-zinc-800/50 shrink-0 select-none"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400/70" />
          <span className="text-xs text-zinc-500 font-mono tracking-widest">SYS // VARAN</span>
        </div>
        {/* Кнопки управления окном — не перетаскиваемые */}
        <div
          className="flex items-center gap-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >

          <button
            onClick={() => window.electronAPI?.minimize()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Свернуть"
          >
            <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor"><rect width="10" height="1"/></svg>
          </button>
          <button
            onClick={() => window.electronAPI?.maximize()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Развернуть"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="0.6" y="0.6" width="8.8" height="8.8"/></svg>
          </button>
          <button
            onClick={() => window.electronAPI?.close()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500/80 text-zinc-500 hover:text-white transition-colors"
            title="Закрыть"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/></svg>
          </button>
        </div>
      </div>

      {/* Основной layout — сайдбар + контент */}
      <div className="flex flex-1 overflow-hidden">
      <aside className="w-64 border-r border-zinc-800/50 bg-zinc-900/50 flex flex-col backdrop-blur-xl relative z-10 select-none">
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9"/>
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.5"/>
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.5"/>
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-widest text-white uppercase">Varan_WiNUP</h1>
            <p className="text-[10px] text-indigo-400/70 font-mono tracking-wider mt-0.5">v1.0.3 VaRaN</p>
          </div>
        </div>

        {/* GitHub + Telegram кнопки под логотипом */}
        <div className="px-5 pb-3 flex items-center gap-2">
          <button
            onClick={() => openExternal('https://github.com/Comendantes/Esarev-Win-Setup')}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/50 hover:border-zinc-600/60 text-zinc-400 hover:text-zinc-200 transition-all text-xs font-medium"
            title="GitHub репозиторий"
          >
            <svg width="13" height="13" viewBox="0 0 98 96" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/></svg>
            GitHub
          </button>
          <button
            onClick={() => openExternal('https://t.me/+072p9oHw88cyMWRh')}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/60 hover:bg-indigo-500/10 border border-zinc-700/50 hover:border-indigo-500/30 text-zinc-400 hover:text-indigo-300 transition-all text-xs font-medium"
            title="Telegram канал"
          >
            <Send className="w-3 h-3" />
            Telegram
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-1">
          <button
            onClick={() => { playClickSound(); navigateTo('info'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 'info' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <Info className="w-4 h-4" />
            Информация
          </button>
          <button
            onClick={() => { playClickSound(); navigateTo('disk-partition'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 'disk-partition' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            Разделение диска
          </button>
          <button
            onClick={() => { playClickSound(); navigateTo('windows-office'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 'windows-office' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <Key className="w-4 h-4" />
            Windows и Office (MAS)
          </button>
          <button
            onClick={() => { playClickSound(); navigateTo('tweaks'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 'tweaks' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            Системные твики
          </button>
          <button
            onClick={() => { playClickSound(); navigateTo('software'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 'software' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <Download className="w-4 h-4" />
            Установка программ
          </button>
          <button
            onClick={() => { playClickSound(); navigateTo('bypass'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 'bypass' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <WifiOff className="w-4 h-4" />
            Обход блокировок
          </button>
          <button
            onClick={() => { playClickSound(); navigateTo('hardware'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 'hardware' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Железо и драйверы
          </button>
          <button
            onClick={() => { playClickSound(); navigateTo('aesthetics'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 'aesthetics' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Эстетика и порядок
          </button>
          <button
            onClick={() => { playClickSound(); navigateTo('reinstall'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 'reinstall'
                ? 'bg-emerald-500/10 text-emerald-300'
                : 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
            }`}
          >
            <Zap className="w-4 h-4" />
            Переустановка Windows
          </button>

          <div className="my-4 border-t border-zinc-800/50" />

          <button
            onClick={() => { playClickSound(); navigateTo('settings'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 'settings' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Настройки
          </button>

          <button
            onClick={() => { playClickSound(); navigateTo('changelog'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 'changelog'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Что нового?
          </button>

        </nav>

        <div className="px-5 pb-4 mt-auto">
          <div className="flex items-center justify-center py-1 select-none">
            <span className="text-[10px] font-mono tracking-widest text-zinc-600">
              <span className="text-indigo-400/60">1.0.3</span>
              <span className="text-zinc-500"> VaRaN</span>
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden bg-zinc-950">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

        <div ref={scrollRef} className="h-full overflow-y-auto p-8 relative z-10">

          <AnimatePresence mode="wait">
            {currentPage === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-2">
                  <h2 className="text-2xl font-semibold text-white tracking-tight">Добро пожаловать!</h2>
                  <p className="text-zinc-400 mt-1 text-sm">Важная информация перед началом настройки системы.</p>
                </div>

                {/* ── Строка поиска ── */}
                <div className="relative mt-4 mb-6">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Поиск"
                    value={globalSearch}
                    onChange={e => handleGlobalSearch(e.target.value)}
                    onFocus={() => globalSearch && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-9 pr-8 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  {globalSearch && (
                    <button onClick={() => { setGlobalSearch(''); setSearchResults([]); setShowSearchResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg>
                    </button>
                  )}
                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                      {searchResults.length > 0 ? searchResults.map((r, i) => (
                        <button key={i} onMouseDown={() => { playClickSound(); navigateTo(r.page); setGlobalSearch(''); setSearchResults([]); setShowSearchResults(false); }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/60 transition-colors text-left border-b border-zinc-800/40 last:border-0">
                          <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{r.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{r.desc}</p>
                          </div>
                        </button>
                      )) : globalSearch.trim() ? (
                        <div className="px-4 py-3"><p className="text-sm text-zinc-500">Ничего не найдено по запросу «{globalSearch}»</p></div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Welcome Card */}
                  <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                    <div className="flex gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                        <Terminal className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-zinc-100">Приветствие от разработчика</h3>
                        <p className="text-zinc-400 text-sm mt-2 leading-relaxed">
                          Привет! Я <strong>Esarev</strong>, создатель этой утилиты. Я разработал её для того, чтобы сделать процесс настройки Windows, установки базовых программ и активации максимально быстрым, безопасным и удобным. Пройдитесь по вкладкам слева, чтобы настроить систему под себя.
                        </p>
                        <div className="mt-4 flex items-center gap-4">
                          <button
                            onClick={() => { playClickSound(); openExternal('https://t.me/Comendant'); }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/50 hover:bg-indigo-500/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-300 font-medium text-sm"
                          >
                            <Send className="w-4 h-4" />
                            Связь с разработчиком (@Comendant)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Recommendation Card */}
                  <div className="p-6 rounded-2xl bg-blue-900/20 border border-blue-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                    <div className="flex gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                        <LayoutGrid className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-blue-400 flex items-center gap-2">
                          Как правильно пользоваться утилитой
                        </h3>
                        <div className="text-zinc-300 text-sm mt-2 space-y-3 leading-relaxed">
                          <p>
                            Для достижения идеального результата настоятельно рекомендую проходить все этапы настройки <strong>строго по порядку сверху вниз</strong> (по меню слева: от «Информации» до «Эстетики»). 
                          </p>
                          <p>
                            Так выстроена логика программы: сначала мы подготавливаем диски, затем применяем системные твики, скачиваем нужный софт, активируем Windows и только в конце наводим красоту. Это самый простой и правильный путь, чтобы ничего не упустить!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Disk Advice Card */}
                  <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 relative overflow-hidden">
                    <div className="flex gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <HardDrive className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
                          Важный совет: Разделение диска
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        </h3>
                        <div className="text-zinc-400 text-sm mt-2 space-y-3 leading-relaxed">
                          <p>
                            Если у вас один физический накопитель большого объема (например, 1 ТБ), настоятельно рекомендуется разделить его на два логических раздела:
                          </p>
                          <ul className="list-disc list-inside space-y-1 ml-2 text-zinc-300">
                            <li><strong>Диск C:</strong> (100-150 ГБ) — только для Windows и системных программ.</li>
                            <li><strong>Диск D:</strong> (оставшееся место) — для игр, личных файлов, фото и видео.</li>
                          </ul>
                          <p className="text-amber-400/90 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 mt-4">
                            <strong>Миф о вирусах:</strong> Разделение диска <em>не защищает</em> от вирусов. Вирус, запущенный в Windows, имеет доступ ко всем дискам. 
                            <br/><br/>
                            <strong>Реальная польза:</strong> Это спасет ваши личные данные и тяжелые игры при переустановке ОС. Если Windows сломается, вы сможете просто отформатировать диск C: и установить чистую систему, при этом все ваши файлы на диске D: останутся в полной сохранности!
                          </p>
                          <button
                            onClick={() => { playClickSound(); navigateTo('disk-partition'); }}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/50 hover:bg-amber-500/20 transition-all duration-300 font-medium text-sm"
                          >
                            <HardDrive className="w-4 h-4" />
                            Перейдите сразу туда
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Antivirus Advice Card */}
                  <div className="p-6 rounded-2xl bg-emerald-900/20 border border-emerald-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                    <div className="flex gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <Shield className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-emerald-400 flex items-center gap-2">
                          Сторонние антивирусы не нужны
                        </h3>
                        <div className="text-zinc-300 text-sm mt-2 space-y-3 leading-relaxed">
                          <p>
                            Не устанавливайте сторонние антивирусы для постоянной работы (Avast, 360 Total Security, McAfee и прочие). Они только бессмысленно нагружают систему, замедляют работу компьютера и часто ведут себя навязчиво.
                          </p>
                          <p className="text-emerald-300 font-medium bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                            Встроенный <strong>Windows Defender</strong> — самый топовый антивирус. Он работает незаметно, не нагружает ресурсы ПК и отлично справляется со всеми угрозами!
                          </p>
                          <div className="mt-4 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                            <p className="text-emerald-400 font-medium mb-1">🛡️ Исключение из правил (из моего личного опыта): Kaspersky</p>
                            <p className="text-zinc-400">
                              Касперский действительно крутой, но <strong>только в одном случае!</strong> Если вы уже отключили Windows Defender, чтобы скачать читы на Роблокс, и у вас всё пошло наперекосяк. В такой критической ситуации Касперский — настоящий спаситель. Его можно установить даже через флешку на заражённый ПК, и он реально со всем справится и вычистит систему. Но как только он всё удалит — сносите его и возвращайтесь на Defender!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hotkeys Card */}
                  <div className="p-6 rounded-2xl bg-violet-900/20 border border-violet-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                    <div className="flex gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0 border border-violet-500/30">
                        <Zap className="w-6 h-6 text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-violet-300 flex items-center gap-2">
                          Горячие клавиши которые изменят твою жизнь
                        </h3>
                        <div className="mt-4 space-y-4 text-sm text-zinc-300">

                          {/* Базовые */}
                          <div>
                            <p className="text-xs font-semibold text-violet-400/70 uppercase tracking-wider mb-2">Базовые — без них никуда</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {[
                                ['Ctrl + C', 'Копировать'],
                                ['Ctrl + X', 'Вырезать'],
                                ['Ctrl + V', 'Вставить'],
                                ['Ctrl + Z', 'Отменить действие'],
                                ['Ctrl + Y', 'Повторить отменённое'],
                                ['Ctrl + A', 'Выделить всё'],
                                ['Ctrl + S', 'Сохранить файл'],
                                ['Ctrl + F', 'Поиск на странице'],
                              ].map(([key, desc]) => (
                                <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
                                  <kbd className="shrink-0 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-600 text-[11px] font-mono text-violet-300 whitespace-nowrap">{key}</kbd>
                                  <span className="text-xs text-zinc-400">{desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Windows */}
                          <div>
                            <p className="text-xs font-semibold text-violet-400/70 uppercase tracking-wider mb-2">Windows — мало кто знает</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {[
                                ['Win + V', 'Буфер обмена — история скопированного'],
                                ['Win + Shift + S', 'Скриншот области экрана'],
                                ['Win + D', 'Свернуть все окна / показать рабочий стол'],
                                ['Win + L', 'Заблокировать компьютер'],
                                ['Win + E', 'Открыть Проводник'],
                                ['Win + R', 'Открыть окно «Выполнить»'],
                                ['Win + .', 'Панель эмодзи 😎'],
                                ['Alt + F4', 'Закрыть текущее окно'],
                              ].map(([key, desc]) => (
                                <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
                                  <kbd className="shrink-0 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-600 text-[11px] font-mono text-violet-300 whitespace-nowrap">{key}</kbd>
                                  <span className="text-xs text-zinc-400">{desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Буфер обмена */}
                          <div className="p-4 rounded-xl bg-violet-900/20 border border-violet-500/20">
                            <p className="text-violet-300 font-medium mb-2 flex items-center gap-2">
                              <span className="text-base">📋</span> Буфер обмена — включаем!
                            </p>
                            <p className="text-zinc-400 text-xs leading-relaxed mb-2">
                              По умолчанию Windows помнит только <strong className="text-zinc-300">последнее скопированное</strong>. Но есть режим истории — он запоминает всё что ты копировал за сессию. Чтобы включить:
                            </p>
                            <p className="text-zinc-300 text-xs">
                              Нажми <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-600 font-mono text-violet-300 text-[11px]">Win + V</kbd> → появится окно с кнопкой <strong>«Включить»</strong>. После этого <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-600 font-mono text-violet-300 text-[11px]">Win + V</kbd> будет открывать полную историю скопированного — очень удобно!
                            </p>
                          </div>

                          {/* Эмодзи */}
                          <div className="p-4 rounded-xl bg-violet-900/20 border border-violet-500/20">
                            <p className="text-violet-300 font-medium mb-2 flex items-center gap-2">
                              <span className="text-base">😄</span> Эмодзи прямо на ПК
                            </p>
                            <p className="text-zinc-400 text-xs leading-relaxed">
                              Нажми <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-600 font-mono text-violet-300 text-[11px]">Win + .</kbd> или <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-600 font-mono text-violet-300 text-[11px]">Win + ;</kbd> в любом текстовом поле — откроется встроенная панель эмодзи, GIF и специальных символов. Работает везде: в браузере, мессенджерах, документах.
                            </p>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Yandex Rant Card */}
                  <div className="p-6 rounded-2xl bg-red-900/20 border border-red-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                    <div className="flex gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/30">
                        <Flame className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-red-400 flex items-center gap-2 uppercase tracking-wide">
                          Мы и наша система ненавидим Яндекс
                        </h3>
                        <div className="text-zinc-300 text-sm mt-2 space-y-3 leading-relaxed">
                          <p>
                            ...и всё, что с ним связано. <strong>Единственное исключение — Яндекс Музыка</strong> (она норм, её уважаем).
                          </p>
                          <p className="text-red-300/90 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            <strong>Разнос по фактам:</strong> Каждая вторая программа в интернете пытается втихаря подсунуть вам этот мусор. Стоит только забыть снять одну микроскопическую галочку при установке какого-нибудь безобидного архиватора, как на ваш ПК тут же десантируется Яндекс Браузер, Яндекс Алиса, какие-то кнопки на панели задач, а в придачу ещё и Мир Танков с Миром Кораблей — в полном комплекте!
                          </p>
                          <p className="font-medium text-red-400">
                            Это не софт, это цифровая плесень. Будьте максимально бдительны при установке любых программ из интернета и всегда выбирайте «Выборочную установку»!
                          </p>
                          <div className="mt-4 p-4 rounded-xl bg-red-950/40 border border-red-500/30">
                            <p className="text-red-400 font-bold mb-2">🌐 Пару слов про браузеры (Яндекс и Opera):</p>
                            <p className="text-zinc-300 mb-2">
                              Давайте по фактам: <strong>Яндекс Браузер и Opera — это не самостоятельные браузеры, это франкенштейны.</strong> Под капотом у них крутится абсолютно тот же самый бесплатный движок от Google Chrome (Chromium), только сверху навалена тонна свистоперделок.
                            </p>
                            <p className="text-zinc-300 mb-2">
                              Вам реально нужны встроенные криптокошельки, вылезающие сбоку мессенджеры, шопинг-ассистенты, Алисы, которые вы не просили, и агрессивная реклама прямо на главной? Всё это просто висит в фоне и пожирает вашу оперативную память (RAM) как не в себя.
                            </p>
                            <p className="text-zinc-300 mb-3">
                              <strong>А как же Opera GX для геймеров?</strong> Это вообще отдельный вид маркетингового скама. Все сходят с ума по этим звукам печатной машинки при наборе текста, фоновой музычке и неоновому дизайну. А их хвалёные «ограничители RAM и CPU для оптимизации игр» — полная туфта (я проверил факты, всё так и есть). Если вы искусственно урежете ресурсы браузеру на прожорливом движке Chromium, он просто начнёт безбожно лагать и зависать. Хотите, чтобы игра не тормозила? <em>Просто закройте браузер — и всё!</em> Не ведитесь на этот геймерский развод, он тратит ресурсы только на то, чтобы поддерживать свои же анимации и боковые панели.
                            </p>
                            <p className="text-red-300 font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                              <strong>Что использовать?</strong> Хотите нормальный интернет без тормозов — ставьте оригинальный <strong>Google Chrome</strong> (чистый, быстрый, эталонный) или <strong>Mozilla Firefox</strong> (независимый движок, топ за приватность). Хватит кормить свой ПК этим цветастым подобием браузеров!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {currentPage === 'disk-partition' && (
              <motion.div
                key="disk-partition"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-2 flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">Разделение диска</h2>
                    <p className="text-zinc-400 mt-1 text-sm">Разбиваем один диск на C: (система) и D: (всё остальное).</p>
                  </div>
                  <button
                    onClick={async () => {
                      playClickSound();
                      if (isElectron) {
                        await runPowerShell('Start-Process diskmgmt.msc');
                      } else {
                        showNotification('Нажми Win+R, введи diskmgmt.msc и Enter');
                      }
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 shrink-0"
                  >
                    <HardDrive className="w-4 h-4" />
                    Открыть управление дисками
                  </button>
                </div>

                {/* ── Строка поиска ── */}
                <div className="relative mt-4 mb-6">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Поиск"
                    value={globalSearch}
                    onChange={e => handleGlobalSearch(e.target.value)}
                    onFocus={() => globalSearch && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-9 pr-8 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  {globalSearch && (
                    <button onClick={() => { setGlobalSearch(''); setSearchResults([]); setShowSearchResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg>
                    </button>
                  )}
                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                      {searchResults.length > 0 ? searchResults.map((r, i) => (
                        <button key={i} onMouseDown={() => { playClickSound(); navigateTo(r.page); setGlobalSearch(''); setSearchResults([]); setShowSearchResults(false); }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/60 transition-colors text-left border-b border-zinc-800/40 last:border-0">
                          <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{r.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{r.desc}</p>
                          </div>
                        </button>
                      )) : globalSearch.trim() ? (
                        <div className="px-4 py-3"><p className="text-sm text-zinc-500">Ничего не найдено по запросу «{globalSearch}»</p></div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="space-y-4">

                  {/* Зачем это нужно */}
                  <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                    <h3 className="font-semibold text-indigo-300 mb-2 flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      Зачем делить диск?
                    </h3>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      Если у тебя один большой диск — при переустановке Windows <strong>всё удалится</strong>. Игры, фото, документы — всё. Если разделить на C: и D: — Windows ставится на C:, а всё твоё лежит на D: и остаётся нетронутым.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                        <p className="text-xs text-zinc-500 mb-1">Диск C: — только система</p>
                        <p className="text-sm font-semibold text-white">100–150 ГБ</p>
                        <p className="text-xs text-zinc-500 mt-1">Windows, программы, браузер</p>
                      </div>
                      <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                        <p className="text-xs text-zinc-500 mb-1">Диск D: — твои файлы</p>
                        <p className="text-sm font-semibold text-white">Всё остальное</p>
                        <p className="text-xs text-zinc-500 mt-1">Игры, фото, видео, проекты</p>
                      </div>
                    </div>
                  </div>

                  {/* Пошаговая инструкция */}
                  <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                    <h3 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-emerald-400" />
                      Как сделать — по шагам
                    </h3>
                    <div className="space-y-3">

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                        <div className="text-sm text-zinc-300 leading-relaxed">
                          Нажми кнопку <strong className="text-white">«Открыть управление дисками»</strong> вверху этой страницы — программа откроется сама.
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                        <div className="text-sm text-zinc-300 leading-relaxed">
                          В нижней части окна найди большой прямоугольник с буквой <strong className="text-white">(C:)</strong>. Кликни по нему <strong className="text-white">правой кнопкой</strong> → выбери <strong className="text-white">«Сжать том...»</strong>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                        <div className="text-sm text-zinc-300 leading-relaxed">
                          В поле <strong className="text-white">«Размер сжимаемого пространства»</strong> впиши сколько МБ отдать под диск D: и нажми <strong className="text-white">«Сжать»</strong>.
                          <div className="mt-2 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/50 text-xs text-zinc-400 space-y-1">
                            <p>• Диск <strong className="text-zinc-300">1 ТБ</strong> → впиши <strong className="text-white">850000</strong></p>
                            <p>• Диск <strong className="text-zinc-300">512 ГБ</strong> → впиши <strong className="text-white">350000</strong></p>
                            <p>• Диск <strong className="text-zinc-300">256 ГБ</strong> → впиши <strong className="text-white">100000</strong></p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
                        <div className="text-sm text-zinc-300 leading-relaxed">
                          Появится новый чёрный прямоугольник <strong className="text-white">«Не распределена»</strong>. Кликни по нему <strong className="text-white">правой кнопкой</strong> → <strong className="text-white">«Создать простой том...»</strong>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">5</div>
                        <div className="text-sm text-zinc-300 leading-relaxed">
                          Откроется мастер — просто жми <strong className="text-white">«Далее» → «Далее» → «Далее» → «Готово»</strong>. Ничего не меняй. Новый диск D: появится в «Этот компьютер». 🎉
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Предупреждение */}
                  <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-500/20 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      <strong className="text-amber-400">Важно:</strong> разделение диска не удаляет данные с C:. Это безопасная операция — ты просто «отрезаешь» часть свободного места.
                    </p>
                  </div>

                </div>
              </motion.div>
            )}

            {currentPage === 'tweaks' && (
              <motion.div
                key="tweaks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-2">
                  <h2 className="text-2xl font-semibold text-white tracking-tight">Системные твики</h2>
                  <p className="text-zinc-400 mt-1 text-sm">Настройте параметры Windows под свои предпочтения.</p>
                </div>

                {/* ── Строка поиска ── */}
                <div className="relative mt-4 mb-6">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Поиск"
                    value={globalSearch}
                    onChange={e => handleGlobalSearch(e.target.value)}
                    onFocus={() => globalSearch && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-9 pr-8 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  {globalSearch && (
                    <button onClick={() => { setGlobalSearch(''); setSearchResults([]); setShowSearchResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg>
                    </button>
                  )}
                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                      {searchResults.length > 0 ? searchResults.map((r, i) => (
                        <button key={i} onMouseDown={() => { playClickSound(); navigateTo(r.page); setGlobalSearch(''); setSearchResults([]); setShowSearchResults(false); }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/60 transition-colors text-left border-b border-zinc-800/40 last:border-0">
                          <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{r.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{r.desc}</p>
                          </div>
                        </button>
                      )) : globalSearch.trim() ? (
                        <div className="px-4 py-3"><p className="text-sm text-zinc-500">Ничего не найдено по запросу «{globalSearch}»</p></div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tweaks.map((tweak) => (
                    <div 
                      key={tweak.id}
                      onClick={() => toggleTweak(tweak.id)}
                      className={`p-5 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                        tweak.enabled 
                          ? 'bg-indigo-500/10 border-indigo-500/30' 
                          : 'bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className={`p-2.5 rounded-lg ${tweak.enabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
                        <tweak.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium text-sm ${tweak.enabled ? 'text-indigo-100' : 'text-zinc-200'}`}>
                          {tweak.title}
                        </h3>
                        <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                          {tweak.description}
                        </p>
                      </div>
                      <div className="pt-1">
                        {tweak.enabled ? (
                          <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-zinc-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Удаление Windows bloatware */}
                <div className="mt-6 p-5 rounded-xl border border-red-500/20 bg-red-900/10">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 shrink-0">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-red-200">Удалить мусорные приложения Windows</h3>
                      <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                        Удаляет предустановленный хлам: Карты, Погода, Новости, Xbox-приложения, Solitaire, Cortana, 3D-просмотрщик, Смешанная реальность, Почта, Календарь и прочий мусор. Откроется меню — выбираете сами что сносить.
                      </p>
                      <p className="text-zinc-600 text-xs mt-2">
                        Тихо удаляет конкретный список мусора без страшных GUI. Потребуется подтвердить запрос администратора. После завершения напишет «Готово!» и закроется сам.
                      </p>
                      <button
                        onClick={async () => {
                          playClickSound();
                          if (!isElectron) {
                            showNotification('Доступно только в .exe версии приложения');
                            return;
                          }
                          showNotification('Запускаем удаление...');
                          const apps = [
                            'Microsoft.BingWeather', 'Microsoft.BingNews', 'Microsoft.GetHelp',
                            'Microsoft.Getstarted', 'Microsoft.MicrosoftOfficeHub',
                            'Microsoft.MicrosoftSolitaireCollection', 'Microsoft.People',
                            'Microsoft.PowerAutomateDesktop', 'Microsoft.Todos',
                            'Microsoft.WindowsFeedbackHub', 'Microsoft.WindowsMaps',
                            'Microsoft.Xbox.TCUI', 'Microsoft.XboxApp', 'Microsoft.XboxGameOverlay',
                            'Microsoft.XboxGamingOverlay', 'Microsoft.XboxIdentityProvider',
                            'Microsoft.YourPhone', 'Microsoft.ZuneMusic', 'Microsoft.ZuneVideo',
                            'Microsoft.MixedReality.Portal', 'Microsoft.Microsoft3DViewer',
                            'Microsoft.windowscommunicationsapps', 'MicrosoftTeams',
                            'Clipchamp.Clipchamp', 'Microsoft.ScreenSketch',
                            'Microsoft.549981C3F5F10', 'Microsoft.BingSearch',
                          ];
                          const script = [
                            '$ErrorActionPreference="SilentlyContinue"',
                            '$ProgressPreference="SilentlyContinue"',
                            '$apps=@(' + apps.map(a => '"' + a + '"').join(',') + ')',
                            'foreach($a in $apps){',
                            '  Write-Host ("Удаляю: "+$a) -ForegroundColor Yellow',
                            '  Get-AppxPackage -Name $a | Remove-AppxPackage',
                            '  Get-AppxProvisionedPackage -Online | Where-Object DisplayName -like $a | Remove-AppxProvisionedPackage -Online',
                            '}',
                            'Write-Host ""',
                            'Write-Host "Готово! Мусорные приложения удалены." -ForegroundColor Green',
                            'Read-Host "Нажмите Enter для выхода"',
                          ].join('; ');
                          const encoded = btoa(unescape(encodeURIComponent(script)));
                          await runPowerShell(
                            `Start-Process powershell -Verb runAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encoded}'`
                          );
                        }}
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-all text-xs font-medium"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        Запустить удаление мусора
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={async () => {
                      playClickSound();
                      if (!isElectron) {
                        showNotification('Применение твиков доступно только в .exe версии');
                        return;
                      }

                      const darkTweak   = tweaks.find(t => t.id === 'dark-mode');
                      const hiddenTweak = tweaks.find(t => t.id === 'hidden-files');
                      const extTweak    = tweaks.find(t => t.id === 'file-ext');
                      const telOn  = !!tweaks.find(t => t.id === 'telemetry'      && t.enabled);
                      const edgeOn = !!tweaks.find(t => t.id === 'hide-edge'      && t.enabled);
                      const chrOn  = !!tweaks.find(t => t.id === 'chrome-default' && t.enabled);

                      const darkVal   = darkTweak?.enabled   ? '0' : '1';
                      const hiddenVal = hiddenTweak?.enabled ? '1' : '2';
                      const extVal    = extTweak?.enabled    ? '0' : '1';

                      // Строим PS скрипт через новые строки — надёжнее чем `;`
                      // Используем UTF-16LE Base64 — именно это ожидает -EncodedCommand
                      const lines: string[] = [
                        '$ErrorActionPreference = "Continue"',
                        '$ProgressPreference = "SilentlyContinue"',
                        `Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "AppsUseLightTheme" -Value ${darkVal} -Type DWord -Force`,
                        `Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize" -Name "SystemUsesLightTheme" -Value ${darkVal} -Type DWord -Force`,
                        `Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "Hidden" -Value ${hiddenVal} -Type DWord -Force`,
                        `Set-ItemProperty -Path "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "HideFileExt" -Value ${extVal} -Type DWord -Force`,
                      ];

                      if (telOn) {
                        lines.push(
                          'if (!(Test-Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection")) { New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Force | Out-Null }',
                          'Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "AllowTelemetry" -Value 0 -Type DWord -Force',
                          'Get-ScheduledTask -TaskName "Microsoft Compatibility Appraiser" -ErrorAction SilentlyContinue | Disable-ScheduledTask -ErrorAction SilentlyContinue',
                          'Get-ScheduledTask -TaskName "Consolidator" -ErrorAction SilentlyContinue | Disable-ScheduledTask -ErrorAction SilentlyContinue',
                          'Stop-Service "DiagTrack" -Force -ErrorAction SilentlyContinue',
                          'Set-Service "DiagTrack" -StartupType Disabled -ErrorAction SilentlyContinue',
                        );
                      }
                      if (edgeOn) {
                        lines.push(
                          'if (!(Test-Path "HKLM:\SOFTWARE\Policies\Microsoft\Edge")) { New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Edge" -Force | Out-Null }',
                          'Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Edge" -Name "HideFirstRunExperience" -Value 1 -Type DWord -Force',
                          'Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Edge" -Name "StartupBoostEnabled" -Value 0 -Type DWord -Force',
                          'Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Edge" -Name "BackgroundModeEnabled" -Value 0 -Type DWord -Force',
                          'Get-Process -Name "msedge" -ErrorAction SilentlyContinue | Stop-Process -Force',
                        );
                      }
                      if (chrOn) {
                        lines.push('Start-Process "ms-settings:defaultapps"');
                      }

                      lines.push(
                        'Stop-Process -Name "explorer" -Force -ErrorAction SilentlyContinue',
                        'Start-Sleep -Milliseconds 1000',
                        'Start-Process "explorer"',
                        'Write-Host ""',
                        'Write-Host "Твики успешно применены!" -ForegroundColor Green',
                        'Read-Host "Нажмите Enter для выхода"',
                      );

                      // UTF-16LE Base64 — именно это требует PowerShell -EncodedCommand
                      const script = lines.join("\n");
                      const utf16 = Array.from(script).flatMap(c => {
                        const code = c.charCodeAt(0);
                        return [code & 0xFF, (code >> 8) & 0xFF];
                      });
                      const encoded = btoa(String.fromCharCode(...utf16));
                      showNotification('Применяем твики...');
                      await runPowerShell(
                        `Start-Process powershell -Verb runAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encoded}"`
                      );
                    }}
                    className="px-6 py-2.5 bg-white text-zinc-950 font-medium text-sm rounded-lg hover:bg-zinc-200 transition-colors shadow-sm">
                    Применить твики
                  </button>
                </div>
              </motion.div>
            )}

            {currentPage === 'software' && (
              <motion.div
                key="software"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-2">
                  <h2 className="text-2xl font-semibold text-white tracking-tight">Установка программ</h2>
                  <p className="text-zinc-400 mt-1 text-sm flex items-center gap-2">
                    Скачивание и установка необходимых приложений.
                    {checkingVersions && (
                      <span className="text-xs text-indigo-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse inline-block" />
                        Проверяем актуальные версии...
                      </span>
                    )}
                    {!checkingVersions && Object.keys(checkedUrls).length > 0 && (
                      <span className="text-xs text-emerald-500">✓ Версии актуальны</span>
                    )}
                  </p>
                </div>

                {/* ── Поиск по приложениям ── */}
                <div className="relative mt-4 mb-6">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Поиск по приложениям"
                    value={softwareSearch}
                    onChange={e => setSoftwareSearch(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-9 pr-8 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  {softwareSearch && (
                    <button onClick={() => setSoftwareSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {software
                    .filter(app =>
                      softwareSearch.trim() === '' ||
                      app.name.toLowerCase().includes(softwareSearch.toLowerCase()) ||
                      app.description.toLowerCase().includes(softwareSearch.toLowerCase())
                    )
                    .map((app) => (
                    <div 
                      key={app.id}
                      className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:bg-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center shrink-0 border border-zinc-700/50 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 transition-all">
                          <app.icon className="w-6 h-6 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-medium text-zinc-100 text-base flex items-center gap-2 flex-wrap">
                            {app.name}
                            {app.id === 'zapret' && <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">Must Have (РФ)</span>}
                            {app.id === 'chrome' && <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Рекомендуем</span>}
                            {app.id === '7zip' && <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">База</span>}
                          </h3>
                          <p className="text-zinc-500 text-sm mt-0.5">{app.description}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => installSoftware(app.id)}
                        className="sm:ml-4 shrink-0 w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 bg-white text-zinc-900 hover:bg-zinc-200 shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        Скачать
                      </button>
                    </div>
                  ))}
                  {/* Пустой результат поиска */}
                  {softwareSearch.trim() !== '' && software.filter(app =>
                    app.name.toLowerCase().includes(softwareSearch.toLowerCase()) ||
                    app.description.toLowerCase().includes(softwareSearch.toLowerCase())
                  ).length === 0 && (
                    <div className="py-12 text-center text-zinc-500 text-sm">
                      По запросу «{softwareSearch}» ничего не найдено
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {currentPage === 'windows-office' && (
              <motion.div
                key="windows-office"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-2">
                  <h2 className="text-2xl font-semibold text-white tracking-tight">Windows и Microsoft Office</h2>
                  <p className="text-zinc-400 mt-1 text-sm">Единый инструмент для скачивания, установки и активации через официальный скрипт MAS.</p>
                </div>

                {/* ── Строка поиска ── */}
                <div className="relative mt-4 mb-6">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Поиск"
                    value={globalSearch}
                    onChange={e => handleGlobalSearch(e.target.value)}
                    onFocus={() => globalSearch && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-9 pr-8 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  {globalSearch && (
                    <button onClick={() => { setGlobalSearch(''); setSearchResults([]); setShowSearchResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg>
                    </button>
                  )}
                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                      {searchResults.length > 0 ? searchResults.map((r, i) => (
                        <button key={i} onMouseDown={() => { playClickSound(); navigateTo(r.page); setGlobalSearch(''); setSearchResults([]); setShowSearchResults(false); }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/60 transition-colors text-left border-b border-zinc-800/40 last:border-0">
                          <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{r.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{r.desc}</p>
                          </div>
                        </button>
                      )) : globalSearch.trim() ? (
                        <div className="px-4 py-3"><p className="text-sm text-zinc-500">Ничего не найдено по запросу «{globalSearch}»</p></div>
                      ) : null}
                    </div>
                  )}
                </div>



                {/* Video section */}
                <div className="mb-8 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 space-y-5">
                  <div className="flex items-center gap-3">
                    <PlayCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-zinc-100">Видеоинструкция</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">Своё видео появится позже — пока держи полезные от других авторов 👇</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => { playClickSound(); openExternal('https://yandex.kz/video/preview/5207661626620758529'); }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-red-500/40 hover:bg-zinc-800 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                        <PlayCircle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">Инструкция по MAS</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Яндекс Видео</p>
                      </div>
                    </button>

                    <button
                      onClick={() => { playClickSound(); openExternal('https://www.youtube.com/watch?v=ccrvYuTDaeY'); }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-red-500/40 hover:bg-zinc-800 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                        <PlayCircle className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">Активация через MAS</p>
                        <p className="text-xs text-zinc-500 mt-0.5">YouTube</p>
                      </div>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      <span className="text-indigo-400 font-medium">💡 Как это работает у нас:</span> В видео люди вручную открывают PowerShell и вводят команду <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 text-[11px]">irm https://get.activated.win | iex</code>. У нас это делает кнопка ниже — она сама открывает PowerShell от администратора и автоматически вводит эту команду. Тебе остаётся только подтвердить запрос UAC и наблюдать.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-3">1</div>
                    <h4 className="font-medium text-zinc-200 mb-1">Запуск</h4>
                    <p className="text-sm text-zinc-500">Нажмите кнопку ниже. Откроется синее окно PowerShell.</p>
                  </div>
                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-3">2</div>
                    <h4 className="font-medium text-zinc-200 mb-1">Установка Office</h4>
                    <p className="text-sm text-zinc-500">В меню нажмите цифру <strong>8</strong> (Install Office). Выберите нужные программы и ждите окончания.</p>
                  </div>
                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-3">3</div>
                    <h4 className="font-medium text-zinc-200 mb-1">Активация</h4>
                    <p className="text-sm text-zinc-500">Вернитесь в главное меню. Нажмите <strong>1</strong> для Windows (HWID) или <strong>2</strong> для Office (Ohook).</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-900/20 border border-amber-500/20 flex gap-3 mb-8">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-400">Возможное зависание при первом запуске</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Иногда при первом запуске скрипта PowerShell может зависнуть на бесконечной загрузке (мигает курсор и ничего не происходит). Если окно висит без изменений дольше минуты, <strong>просто закройте его крестиком и нажмите кнопку запуска еще раз</strong>. Со второго раза меню MAS загрузится моментально.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={async () => {
                      playClickSound();
                      if (!isElectron) {
                        showNotification('Доступно только в .exe версии приложения');
                        return;
                      }
                      showNotification('Открываем PowerShell...');
                      const result = await runPowerShell(
                        'Start-Process powershell -Verb runAs -ArgumentList \'-NoProfile -ExecutionPolicy Bypass -Command "irm https://get.activated.win | iex"\''
                      );

                    }}
                    className="px-8 py-3 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    Запустить MAS (Установка и Активация)
                  </button>
                </div>
              </motion.div>
            )}

            {currentPage === 'bypass' && (
              <motion.div
                key="bypass"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto pb-10"
              >
                <div className="mb-2">
                  <h2 className="text-2xl font-semibold text-white tracking-tight">Обход блокировок</h2>
                  <p className="text-zinc-400 mt-1 text-sm">Zapret, tg-ws-proxy и автозапуск — всё для обхода блокировок на ПК.</p>
                </div>

                {/* ── Строка поиска ── */}
                <div className="relative mt-4 mb-6">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Поиск"
                    value={globalSearch}
                    onChange={e => handleGlobalSearch(e.target.value)}
                    onFocus={() => globalSearch && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-9 pr-8 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  {globalSearch && (
                    <button onClick={() => { setGlobalSearch(''); setSearchResults([]); setShowSearchResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg>
                    </button>
                  )}
                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                      {searchResults.length > 0 ? searchResults.map((r, i) => (
                        <button key={i} onMouseDown={() => { playClickSound(); navigateTo(r.page); setGlobalSearch(''); setSearchResults([]); setShowSearchResults(false); }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/60 transition-colors text-left border-b border-zinc-800/40 last:border-0">
                          <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{r.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{r.desc}</p>
                          </div>
                        </button>
                      )) : globalSearch.trim() ? (
                        <div className="px-4 py-3"><p className="text-sm text-zinc-500">Ничего не найдено по запросу «{globalSearch}»</p></div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="space-y-6">

                  {/* Блок 1 — Zapret и поиск рабочего альта */}
                  <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                    <div className="flex gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                        <Unlock className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-zinc-100 mb-3">Zapret — как найти рабочий вариант именно для тебя</h3>
                        <div className="text-zinc-400 text-sm space-y-3 leading-relaxed">
                          <p>
                            Zapret — это не одна программа, а набор стратегий обхода (их называют <strong className="text-zinc-200">пресетами</strong>). Провайдеры в разных городах и регионах блокируют по-разному, поэтому пресет который работает у одного — у другого может не работать вообще.
                          </p>
                          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/50 space-y-2">
                            <p className="text-zinc-300 font-medium">Как подобрать рабочий пресет:</p>
                            <ol className="list-decimal list-inside space-y-2 text-zinc-400 ml-1">
                              <li>Скачай Zapret через вкладку <strong className="text-zinc-300">«Установка программ»</strong> — получишь zip-архив.</li>
                              <li>Распакуй в любую папку, <strong className="text-zinc-300">желательно на диск D:</strong> чтобы путь был коротким (например <code className="bg-zinc-800 px-1 rounded text-xs select-text">D:\zapret</code>).</li>
                              <li>Зайди в папку и запусти файл <code className="bg-zinc-800 px-1 rounded text-xs select-text">service_install.bat</code> от имени администратора — он проверит все пресеты и установит рабочий автоматически.</li>
                              <li>Программа по очереди попробует каждый пресет. Тот на котором YouTube/Discord заработали — установится как служба Windows.</li>
                            </ol>
                          </div>
                          <p className="text-amber-400/80 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 text-xs">
                            <strong>Не работает ни один пресет?</strong> Попробуй другую версию Zapret — они выходят регулярно. <button onClick={() => { playClickSound(); openExternal('https://github.com/Flowseal/zapret-discord-youtube/archive/refs/tags/1.9.7b.zip'); }} className="underline text-amber-300 bg-transparent border-0 cursor-pointer p-0">Скачать актуальный архив</button>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Блок 2 — Автозапуск */}
                  <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                        <Zap className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-zinc-100 mb-3">Автозапуск Zapret вместе с Windows</h3>
                        <div className="text-zinc-400 text-sm space-y-3 leading-relaxed">
                          <p>
                            Если ты установил Zapret через <code className="bg-zinc-800 px-1 rounded text-xs select-text">service_install.bat</code> — поздравляю, он уже запускается автоматически как служба Windows. Ничего дополнительно делать не нужно.
                          </p>
                          <p>
                            Убедиться что служба работает можно так: нажми <kbd className="bg-zinc-800 border border-zinc-600 px-2 py-0.5 rounded text-xs text-zinc-300 select-text">Win + R</kbd>, введи <code className="bg-zinc-800 px-1 rounded text-xs select-text">services.msc</code>, нажми Enter. В списке найди <strong className="text-zinc-200">«zapret»</strong> — статус должен быть <span className="text-emerald-400 font-medium">«Выполняется»</span>.
                          </p>
                          <div className="p-4 rounded-xl bg-emerald-900/10 border border-emerald-500/20">
                            <p className="text-emerald-300 font-medium mb-2">Если хочешь убрать Zapret:</p>
                            <p className="text-zinc-400">Запусти <code className="bg-zinc-800 px-1 rounded text-xs select-text">service_remove.bat</code> от имени администратора — служба удалится и Zapret перестанет работать.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Блок 3 — tg-ws-proxy для ПК */}
                  <div className="p-6 rounded-2xl bg-blue-900/20 border border-blue-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                    <div className="flex gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                        <Send className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className="text-lg font-semibold text-blue-300">tg-ws-proxy — обход блокировки Telegram на ПК</h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Только ПК</span>
                        </div>
                        <div className="text-zinc-400 text-sm space-y-3 leading-relaxed">
                          <p>
                            Если Telegram не открывается или постоянно не подключается — это специальная утилита для Windows которая решает проблему раз и навсегда. Работает только на ПК, для телефона не подходит.
                          </p>
                          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/50 space-y-2">
                            <p className="text-zinc-300 font-medium mb-2">Как установить и использовать:</p>
                            <ol className="list-decimal list-inside space-y-2 text-zinc-400 ml-1">
                              <li>Нажми кнопку <strong className="text-zinc-300">«Скачать tg-ws-proxy»</strong> ниже — скачается zip-архив.</li>
                              <li>Распакуй архив в любую папку, желательно на <code className="bg-zinc-800 px-1 rounded text-xs select-text">D:	g-ws-proxy</code>.</li>
                              <li>Запусти файл <code className="bg-zinc-800 px-1 rounded text-xs select-text">tg-ws-proxy.exe</code> от имени администратора.</li>
                              <li>Программа запустится в трее (значок в правом нижнем углу панели задач) и автоматически настроит проксирование для Telegram.</li>
                              <li>Открой Telegram — он должен подключиться. Программу можно оставить работать в фоне.</li>
                            </ol>
                          </div>
                          <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/20 text-xs text-blue-300/80">
                            <strong>Автозапуск:</strong> Чтобы прокси работал всегда — добавь <code className="bg-zinc-800 px-1 rounded">tg-ws-proxy.exe</code> в автозагрузку Windows (Win+R → <code className="bg-zinc-800 px-1 rounded">shell:startup</code> → скинь ярлык).
                          </div>
                          <button
                            onClick={() => { playClickSound(); openExternal('https://github.com/Flowseal/tg-ws-proxy/releases/download/v1.1.1/TgWsProxy.exe'); }}
                            className="mt-1 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 transition-all text-sm font-medium"
                          >
                            <Download className="w-4 h-4" />
                            Скачать tg-ws-proxy v1.1.1
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {currentPage === 'hardware' && (
              <motion.div
                key="hardware"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto pb-10"
              >
                <div className="mb-2">
                  <h2 className="text-2xl font-semibold text-white tracking-tight">Железо и драйверы</h2>
                  <p className="text-zinc-400 mt-1 text-sm">Информация о вашем ПК и советы по правильной установке драйверов.</p>
                </div>

                {/* ── Строка поиска ── */}
                <div className="relative mt-4 mb-6">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Поиск"
                    value={globalSearch}
                    onChange={e => handleGlobalSearch(e.target.value)}
                    onFocus={() => globalSearch && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-9 pr-8 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  {globalSearch && (
                    <button onClick={() => { setGlobalSearch(''); setSearchResults([]); setShowSearchResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg>
                    </button>
                  )}
                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                      {searchResults.length > 0 ? searchResults.map((r, i) => (
                        <button key={i} onMouseDown={() => { playClickSound(); navigateTo(r.page); setGlobalSearch(''); setSearchResults([]); setShowSearchResults(false); }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/60 transition-colors text-left border-b border-zinc-800/40 last:border-0">
                          <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{r.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{r.desc}</p>
                          </div>
                        </button>
                      )) : globalSearch.trim() ? (
                        <div className="px-4 py-3"><p className="text-sm text-zinc-500">Ничего не найдено по запросу «{globalSearch}»</p></div>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Warning Banner */}
                <div className="mb-6 p-5 rounded-2xl bg-red-950/30 border border-red-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                  <div className="flex gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/30">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-red-400">ВНИМАНИЕ: Никаких драйвер-паков!</h3>
                      <p className="text-zinc-300 text-sm mt-1 leading-relaxed">
                        Никогда не используйте <strong>DriverPack Solution</strong>, Driver Booster и подобный мусор. Кривые драйверы = синие экраны смерти (BSOD). Windows 10/11 сами скачивают 99% драйверов. Вручную нужен только драйвер видеокарты.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scan block */}
                {!hardwareScanned && !isScanningHardware ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl">
                    <Cpu className="w-16 h-16 text-zinc-600 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-200 mb-2">Сканирование системы</h3>
                    <p className="text-zinc-500 text-sm text-center max-w-md mb-6">
                      {isElectron
                        ? 'Нажмите кнопку — приложение соберёт реальную информацию о вашем железе.'
                        : 'Сканирование доступно только в .exe версии приложения.'}
                    </p>
                    <button
                      onClick={async () => {
                        playClickSound();
                        if (!isElectron) {
                          showNotification('Доступно только в .exe версии');
                          return;
                        }
                        setIsScanningHardware(true);
                        const result = await getHardwareInfo();
                        setIsScanningHardware(false);
                        if (result.success && result.data) {
                          setHardwareData(result.data);
                          setHardwareScanned(true);
                        } else {
                          showNotification('Ошибка сканирования: ' + (result.error ?? 'неизвестная ошибка'));
                        }
                      }}
                      className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                      <Search className="w-5 h-5" />
                      Запустить сканирование
                    </button>
                  </div>
                ) : isScanningHardware ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                    <p className="text-indigo-400 font-medium animate-pulse">Читаем данные системы...</p>
                  </div>
                ) : hardwareData ? (
                  <div className="space-y-6">
                    {/* CPU + RAM + Board */}
                    <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                          <Monitor className="w-5 h-5 text-indigo-400" />
                          Ваша система
                        </h3>
                        <button
                          onClick={() => { playClickSound(); setHardwareScanned(false); setHardwareData(null); }}
                          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          ↻ Пересканировать
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                          <p className="text-xs text-zinc-500 mb-1">Процессор (CPU)</p>
                          <p className="text-sm font-medium text-zinc-200">{hardwareData.cpu}</p>
                          <p className="text-xs text-zinc-500 mt-1">{hardwareData.cores} · {hardwareData.clockGHz} ГГц</p>
                        </div>
                        <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                          <p className="text-xs text-zinc-500 mb-1">Оперативная память</p>
                          <p className="text-sm font-medium text-zinc-200">{hardwareData.ramGB} ГБ {hardwareData.ramType}</p>
                          <p className="text-xs text-zinc-500 mt-1">{hardwareData.ramSpeed} МГц</p>
                        </div>
                        <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                          <p className="text-xs text-zinc-500 mb-1">Материнская плата</p>
                          <p className="text-sm font-medium text-zinc-200">{hardwareData.board}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                          <p className="text-xs text-zinc-500 mb-1">Операционная система</p>
                          <p className="text-sm font-medium text-zinc-200">{hardwareData.os}</p>
                        </div>
                        {hardwareData.disks.map((disk, i) => (
                          <div key={i} className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                            <p className="text-xs text-zinc-500 mb-1">Накопитель {i + 1}</p>
                            <p className="text-sm font-medium text-zinc-200">{disk.name}</p>
                            <p className="text-xs text-zinc-500 mt-1">{disk.sizeGB} ГБ · {disk.type === 'SSD' ? 'SSD' : disk.type === 'HDD' ? 'HDD' : disk.type}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* GPU + драйверы */}
                    <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                      <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2 mb-4">
                        <Monitor className="w-5 h-5 text-emerald-400" />
                        Видеокарт{hardwareData.gpus.length > 1 ? 'ы' : 'а'} и драйверы
                      </h3>
                      <div className="space-y-3">
                        {hardwareData.gpus.map((gpu, i) => {
                          const isNvidia = /nvidia/i.test(gpu.name);
                          const isAmd    = /amd|radeon/i.test(gpu.name);
                          const isIntel  = /intel/i.test(gpu.name);
                          const driverUrl = isNvidia
                            ? 'https://www.nvidia.com/Download/index.aspx'
                            : isAmd
                            ? 'https://www.amd.com/en/support'
                            : isIntel
                            ? 'https://www.intel.com/content/www/us/en/download-center/home.html'
                            : null;
                          const color = isNvidia ? 'emerald' : isAmd ? 'red' : isIntel ? 'blue' : 'zinc';

                          return (
                            <div key={i} className={`p-4 rounded-xl bg-${color}-900/10 border border-${color}-500/20 flex items-center justify-between gap-4 flex-wrap`}>
                              <div>
                                <p className={`font-medium text-${color}-300 text-sm`}>{gpu.name}</p>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                  Драйвер: {gpu.driver} · Дата: {gpu.driverDate}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {driverUrl && (
                                  <button
                                    onClick={() => { playClickSound(); openExternal(driverUrl); }}
                                    className={`shrink-0 px-4 py-2 rounded-lg text-xs font-medium bg-${color}-500/10 text-${color}-400 border border-${color}-500/30 hover:bg-${color}-500/20 transition-all`}
                                  >
                                    Скачать актуальный драйвер
                                  </button>
                                )}
                                {isNvidia && (
                                  <button
                                    onClick={() => { playClickSound(); openExternal('https://www.nvidia.com/ru-ru/geforce/geforce-experience/'); }}
                                    className="shrink-0 px-4 py-2 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200 transition-all"
                                  >
                                    GeForce Experience
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {hardwareData.gpus.length === 0 && (
                          <p className="text-sm text-zinc-500">Видеокарты не обнаружены или драйвер не установлен.</p>
                        )}
                      </div>
                    </div>

                    {/* Периферия */}
                    <div className="p-5 rounded-xl bg-purple-900/10 border border-purple-500/20 flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                        <Gamepad2 className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-purple-400">Мышки, клавиатуры и наушники</h4>
                        <p className="text-sm text-zinc-400 mt-1">
                          Для подсветки, DPI и макросов нужен софт от производителя: Logitech G HUB, Razer Synapse, SteelSeries GG, HyperX NGENUITY.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            )}

            {currentPage === 'aesthetics' && (
              <motion.div
                key="aesthetics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto pb-10"
              >
                <div className="mb-2 flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">Эстетика и порядок</h2>
                    <p className="text-zinc-400 mt-1 text-sm">Путь продвинутого пользователя ПК: почему чистый рабочий стол — это круто.</p>
                  </div>
                  <button
                    onClick={() => { playClickSound(); setShowCursorsModal(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    Кастомные курсоры
                  </button>
                </div>

                {/* ── Строка поиска ── */}
                <div className="relative mt-4 mb-6">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Поиск"
                    value={globalSearch}
                    onChange={e => handleGlobalSearch(e.target.value)}
                    onFocus={() => globalSearch && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-9 pr-8 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  {globalSearch && (
                    <button onClick={() => { setGlobalSearch(''); setSearchResults([]); setShowSearchResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg>
                    </button>
                  )}
                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                      {searchResults.length > 0 ? searchResults.map((r, i) => (
                        <button key={i} onMouseDown={() => { playClickSound(); navigateTo(r.page); setGlobalSearch(''); setSearchResults([]); setShowSearchResults(false); }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/60 transition-colors text-left border-b border-zinc-800/40 last:border-0">
                          <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{r.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{r.desc}</p>
                          </div>
                        </button>
                      )) : globalSearch.trim() ? (
                        <div className="px-4 py-3"><p className="text-sm text-zinc-500">Ничего не найдено по запросу «{globalSearch}»</p></div>
                      ) : null}
                    </div>
                  )}
                </div>



                <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 mb-8">
                  <h3 className="text-lg font-medium text-zinc-100 mb-4">Свалка или Дзен?</h3>
                  <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                    Сегодня я призываю вас двигаться в сторону современного и чистого использования ПК. Забудьте о десятках ярлыков, папок и файлов, разбросанных по всему экрану. Рабочий стол должен быть местом для красивых обоев и вдохновения, а не мусорной корзиной.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bad Example */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-red-400 font-medium text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        Ужасно (ДО)
                      </div>
                      <div 
                        className="aspect-video rounded-xl overflow-hidden border border-red-500/30 relative group cursor-pointer"
                        onClick={() => { playClickSound(); setSelectedImage(imgGryazni); }}
                      >
                        <img 
                          src={imgGryazni} 
                          alt="Грязный рабочий стол" 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Search className="w-8 h-8 text-white/70" />
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 text-center">Свалка из ярлыков, в которой ничего не найти</p>
                    </div>

                    {/* Good Example */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Идеал (ПОСЛЕ)
                      </div>
                      <div 
                        className="aspect-video rounded-xl overflow-hidden border border-emerald-500/30 relative group cursor-pointer"
                        onClick={() => { playClickSound(); setSelectedImage(imgDesktopClean); }}
                      >
                        <img 
                          src={imgDesktopClean} 
                          alt="Чистый рабочий стол" 
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Search className="w-8 h-8 text-white/70" />
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 text-center">Чистота, фокус и красивые обои</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-medium text-zinc-100 mb-6">Почему без ярлыков лучше? Факты:</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                      <Zap className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h4 className="font-medium text-zinc-200 mb-2">Скорость работы</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Каждый ярлык на рабочем столе — это отдельный элемент, который Windows постоянно держит в оперативной памяти (RAM) и перерисовывает. Пустой стол = меньше нагрузка на Проводник (explorer.exe) и быстрее загрузка ПК.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                      <Search className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h4 className="font-medium text-zinc-200 mb-2">Мгновенный поиск</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Искать программу среди 100 иконок — долго. Намного быстрее нажать клавишу <strong>Win</strong> и начать вводить название (например, "tel..." -{'>'} Telegram -{'>'} Enter). Это занимает ровно 1 секунду!
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                      <LayoutGrid className="w-5 h-5 text-blue-400" />
                    </div>
                    <h4 className="font-medium text-zinc-200 mb-2">Панель задач</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Самые частые программы (браузер, игры, мессенджеры) лучше закрепить на панели задач внизу. Они всегда под рукой, даже если открыто другое окно. Не нужно сворачивать все окна (Win+D), чтобы запустить софт.
                    </p>
                  </div>
                </div>

                {/* Личный совет от Esarev */}
                <div className="mt-6 p-6 rounded-2xl bg-indigo-900/20 border border-indigo-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                  <div className="flex gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                      <span className="text-xl">💡</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-indigo-300 mb-1">
                        Мой личный способ — просто совет, делай по-своему
                      </h3>
                      <p className="text-xs text-indigo-400/50 font-mono mb-3">— Esarev</p>
                      <div className="text-sm text-zinc-300 space-y-3 leading-relaxed">
                        <p>
                          Я не призываю полностью отказываться от ярлыков — это неудобно. Вот как организовано у меня:
                        </p>
                        <div className="space-y-2">
                          <div className="flex gap-3 items-start p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
                            <span className="text-base shrink-0">📌</span>
                            <p className="text-zinc-300 text-sm"><strong className="text-zinc-100">Панель задач</strong> — всё что открываю каждый день: браузер, мессенджеры, Steam. Одно нажатие — программа открыта.</p>
                          </div>
                          <div className="flex gap-3 items-start p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
                            <span className="text-base shrink-0">🎮</span>
                            <p className="text-zinc-300 text-sm"><strong className="text-zinc-100">Пуск</strong> — ярлыки игр. Нажал Win → увидел все игры плиткой, запустил нужную. Рабочий стол при этом чистый.</p>
                          </div>
                          <div className="flex gap-3 items-start p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/50">
                            <span className="text-base shrink-0">📁</span>
                            <p className="text-zinc-300 text-sm"><strong className="text-zinc-100">Папка «Проводник» в Документах</strong> — туда кладу всё редко нужное: установщики, специфичный софт, рабочие файлы. Папки нет на рабочем столе — она живёт в Документах и не мозолит глаза. Открыл Проводник → нашёл → запустил.</p>
                          </div>
                        </div>
                        <p className="text-zinc-500 text-xs">
                          Итог: стол абсолютно пустой, всё всегда под рукой. Но это лишь один из вариантов — главное найти систему, которая удобна именно тебе.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {currentPage === 'reinstall' && (
              <motion.div
                key="reinstall"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto pb-10"
              >
                <div className="mb-2">
                  <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Zap className="w-8 h-8 text-emerald-400" />
                    Переустановка Windows (Гайд для чайников)
                  </h2>
                  <p className="text-zinc-400 mt-3 text-base leading-relaxed">
                    Не бойтесь, это намного проще, чем кажется! Вам не нужно быть программистом или вызывать мастера за 5000 рублей. 
                    Просто внимательно читайте каждый шаг и делайте ровно так, как тут написано. У вас всё получится!
                  </p>
                </div>

                {/* ── Строка поиска ── */}
                <div className="relative mt-4 mb-6">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Поиск"
                    value={globalSearch}
                    onChange={e => handleGlobalSearch(e.target.value)}
                    onFocus={() => globalSearch && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                    className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-9 pr-8 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                  {globalSearch && (
                    <button onClick={() => { setGlobalSearch(''); setSearchResults([]); setShowSearchResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="11" y2="11"/><line x1="11" y1="1" x2="1" y2="11"/></svg>
                    </button>
                  )}
                  {showSearchResults && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                      {searchResults.length > 0 ? searchResults.map((r, i) => (
                        <button key={i} onMouseDown={() => { playClickSound(); navigateTo(r.page); setGlobalSearch(''); setSearchResults([]); setShowSearchResults(false); }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/60 transition-colors text-left border-b border-zinc-800/40 last:border-0">
                          <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-zinc-200">{r.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{r.desc}</p>
                          </div>
                        </button>
                      )) : globalSearch.trim() ? (
                        <div className="px-4 py-3"><p className="text-sm text-zinc-500">Ничего не найдено по запросу «{globalSearch}»</p></div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  {/* Подготовка */}
                  <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
                    <div className="flex items-center gap-4 mb-5 relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                        <Info className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Подготовка: Что вам понадобится?</h3>
                        <p className="text-sm text-zinc-400 mt-1">Соберите всё необходимое перед тем, как начать.</p>
                      </div>
                    </div>
                    <ul className="space-y-4 text-sm text-zinc-300 relative z-10">
                      <li className="flex items-start gap-3 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                        <div>
                          <strong className="text-zinc-200 block mb-1">USB-флешка объемом от 8 ГБ</strong>
                          Вставьте её в компьютер. ВАЖНО: В процессе создания загрузочной флешки <b>абсолютно все данные на ней будут удалены!</b> Если там есть важные файлы — скопируйте их заранее.
                        </div>
                      </li>
                      <li className="flex items-start gap-3 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                        <div>
                          <strong className="text-zinc-200 block mb-1">Сохраненные важные файлы</strong>
                          При переустановке диск C: (а часто и весь диск, если он не разделен) будет <b>полностью стёрт</b>. Обязательно сохраните всё ценное (фото, документы, сохранения игр) на другое устройство, вторую флешку, внешний накопитель или в облако.
                        </div>
                      </li>
                      <li className="flex items-start gap-3 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                        <div>
                          <strong className="text-zinc-200 block mb-1">Примерно 30-60 минут свободного времени</strong>
                          Сам процесс не сложный, но скачивание образа и установка потребуют немного ожидания.
                        </div>
                      </li>
                    </ul>

                    {/* Лайфхак — Varan_WiNUP на флешке */}
                    <div className="mt-4 p-4 rounded-xl bg-indigo-900/20 border border-indigo-500/30 relative z-10">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-indigo-300 mb-2">💡 Держи Varan_WiNUP прямо на флешке!</p>
                          <p className="text-xs text-zinc-400 leading-relaxed mb-2">
                            После того как Rufus запишет ISO — на флешке останется свободное место. Можно скинуть туда папку с нашей утилитой — она запустится прямо с флешки на свежеустановленной Windows, без конфликтов с образом.
                          </p>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            <strong className="text-zinc-400">Как это работает:</strong> ISO-образ занимает только системный раздел флешки (скрытый). Обычная папка с файлами лежит отдельно и Windows-установщик её не трогает. Скинул папку — загрузился с флешки — поставил Windows — вытащил флешку — запустил <strong className="text-zinc-300">Varan_WiNUP</strong> уже на чистой системе.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Шаг 1: Скачиваем всё необходимое */}
                  <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/10">1</div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Шаг 1: Скачиваем всё необходимое</h3>
                        <p className="text-sm text-zinc-400 mt-1">Нам нужен сам "образ" Windows и программа, которая запишет его на флешку.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-zinc-950/50 p-5 rounded-xl border border-zinc-800/50 flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                          <Monitor className="w-5 h-5 text-blue-400" />
                          <h4 className="font-semibold text-zinc-200">1. Образ Windows 11</h4>
                        </div>
                        <div className="text-xs text-zinc-400 mb-4 flex-grow space-y-2">
                          <p>Оригинальные файлы Microsoft. Откроется сайт с зеркалами — там быстрее чем качать напрямую.</p>
                          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800/60 space-y-1.5">
                            <p className="text-zinc-300 font-medium mb-1">Как скачать на сайте:</p>
                            <p>1. Нажми кнопку ниже — откроется страница</p>
                            <p>2. Найди раздел <strong className="text-zinc-200">Windows 11</strong> → <strong className="text-zinc-200">24H2</strong></p>
                            <p>3. Найди строку <strong className="text-zinc-200">Russian</strong></p>
                            <p>4. Нажми на любую ссылку справа — это и есть скачивание</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => { 
                            playClickSound(); 
                            showNotification('Открываем страницу скачивания...');
                            openExternal('https://massgrave.dev/windows_11_links');
                          }}
                          className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-blue-500/20"
                        >
                          <Globe className="w-4 h-4" />
                          Открыть страницу скачивания Windows 11
                        </button>
                      </div>

                      <div className="bg-zinc-950/50 p-5 rounded-xl border border-zinc-800/50 flex flex-col">
                        <div className="flex items-center gap-3 mb-3">
                          <HardDrive className="w-5 h-5 text-emerald-400" />
                          <h4 className="font-semibold text-zinc-200">2. Программа Rufus</h4>
                        </div>
                        <p className="text-xs text-zinc-400 mb-4 flex-grow">
                          Крошечная, но мощная программа. Она правильно "распакует" скачанный образ Windows на вашу флешку, чтобы компьютер смог с неё загрузиться.
                        </p>
                        <button 
                          onClick={() => { 
                            playClickSound(); 
                            showNotification('Загрузка Rufus 4.13 началась...');
                            openExternal('https://github.com/pbatard/rufus/releases/download/v4.13/rufus-4.13.exe');
                          }}
                          className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-all border border-zinc-700"
                        >
                          <Download className="w-4 h-4" />
                          Скачать Rufus 4.13 (.exe)
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 mt-4 text-center">
                      * Дождитесь, пока скачаются оба файла, прежде чем переходить к следующему шагу. Образ Windows весит около 6 ГБ.
                    </p>
                  </div>

                  {/* Шаг 2: Создаем загрузочную флешку */}
                  <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/10">2</div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Шаг 2: Делаем флешку "загрузочной"</h3>
                        <p className="text-sm text-zinc-400 mt-1">Записываем Windows на флешку с помощью Rufus.</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                      <div className="space-y-4 text-sm text-zinc-300">
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                          <p>Вставьте вашу флешку в компьютер (желательно в синий порт USB 3.0 сзади системного блока, так будет быстрее).</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                          <p>Запустите скачанный файл <strong>rufus-4.13.exe</strong>. На вопрос "Разрешить этому приложению вносить изменения?" ответьте "Да".</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                          <p>В самом верху, в поле <strong>"Устройство"</strong>, убедитесь, что выбрана именно ваша флешка (проверьте по объему и букве диска).</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">4</div>
                          <p>Нажмите кнопку <strong>"ВЫБРАТЬ"</strong> и найдите скачанный огромный файл Windows 11 (ISO-образ).</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">5</div>
                          <p>Убедитесь, что настройки выглядят как на картинке справа: Схема раздела — <strong>GPT</strong>, Целевая система — <strong>UEFI (non CSM)</strong>.</p>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">6</div>
                          <p>Нажмите большую кнопку <strong>"СТАРТ"</strong> в самом низу.</p>
                        </div>

                        <div className="mt-2 p-4 rounded-xl bg-emerald-900/20 border border-emerald-500/30">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-emerald-400" />
                            <h4 className="font-bold text-emerald-400">Секретный лайфхак от Rufus!</h4>
                          </div>
                          <p className="text-xs text-emerald-200/80 leading-relaxed">
                            После нажатия "СТАРТ" появится окошко с галочками (Windows User Experience). 
                            <strong>ОБЯЗАТЕЛЬНО</strong> поставьте эти галочки: <br/><br/>
                            1. <i>"Remove requirement for 4GB+ RAM, Secure Boot and TPM 2.0"</i> (Это позволит поставить Win11 на любой старый ПК).<br/>
                            2. <i>"Remove requirement for an online Microsoft account"</i> (Это позволит создать обычный локальный профиль без интернета и почты Microsoft).<br/>
                            3. <i>"Set a local account using the same name as this user's"</i> (Если впишете туда свое имя, то все Windows, установленные с этой флешки, будут сразу создаваться с этим именем пользователя).<br/><br/>
                            Нажмите ОК и ждите завершения (зеленая полоса "ГОТОВ" внизу). Это займет 5-15 минут.
                          </p>
                        </div>
                      </div>

                      <div>
                        <img 
                          src="https://rufus.ie/pics/screenshot1_ru.png" 
                          alt="Настройки Rufus" 
                          className="w-full rounded-lg shadow-2xl border border-zinc-700" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Шаг 3: Запуск установки (Boot Menu) */}
                  <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/10">3</div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Шаг 3: Запуск с флешки (Самый "страшный" этап)</h3>
                        <p className="text-sm text-zinc-400 mt-1">Нам нужно сказать компьютеру: "Эй, грузись не со старого диска, а с нашей новой флешки!"</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 text-sm text-zinc-300">
                      <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                        <p className="mb-3"><strong>1. Не вытаскивая флешку</strong>, нажмите "Пуск" -{'>'} "Выключение" -{'>'} <strong>"Перезагрузка"</strong>.</p>
                        <p className="mb-3"><strong>2. Как только экран погаснет</strong> и компьютер начнет включаться (появится логотип материнской платы, например ASUS, MSI, Gigabyte), <strong>быстро и много раз (как из пулемета)</strong> нажимайте специальную кнопку на клавиатуре, чтобы вызвать <strong>Boot Menu (Меню загрузки)</strong>.</p>
                        
                        <div className="my-4 p-4 bg-zinc-900 rounded-lg border border-zinc-700">
                          <p className="text-zinc-400 text-xs mb-2 uppercase tracking-wider font-semibold">Какую кнопку спамить?</p>
                          <ul className="grid grid-cols-2 gap-2 text-sm">
                            <li>Ноутбуки <strong>ASUS</strong>: <kbd className="bg-zinc-800 px-2 py-1 rounded text-white border border-zinc-600 select-text">Esc</kbd> или <kbd className="bg-zinc-800 px-2 py-1 rounded text-white border border-zinc-600 select-text">F8</kbd></li>
                            <li>Материнские платы <strong>ASUS</strong>: <kbd className="bg-zinc-800 px-2 py-1 rounded text-white border border-zinc-600 select-text">F8</kbd></li>
                            <li><strong>MSI</strong>: <kbd className="bg-zinc-800 px-2 py-1 rounded text-white border border-zinc-600 select-text">F11</kbd></li>
                            <li><strong>Gigabyte</strong>: <kbd className="bg-zinc-800 px-2 py-1 rounded text-white border border-zinc-600 select-text">F12</kbd></li>
                            <li><strong>Acer</strong>: <kbd className="bg-zinc-800 px-2 py-1 rounded text-white border border-zinc-600 select-text">F12</kbd></li>
                            <li><strong>Lenovo</strong>: <kbd className="bg-zinc-800 px-2 py-1 rounded text-white border border-zinc-600 select-text">F12</kbd> или <kbd className="bg-zinc-800 px-2 py-1 rounded text-white border border-zinc-600 select-text">Fn + F12</kbd></li>
                            <li><strong>HP</strong>: <kbd className="bg-zinc-800 px-2 py-1 rounded text-white border border-zinc-600 select-text">F9</kbd></li>
                          </ul>
                          <p className="text-xs text-zinc-500 mt-3">* Если не сработало, просто перезагрузите ПК еще раз и попробуйте другую кнопку.</p>
                        </div>

                        <p><strong>3. В появившемся синем или черном меню</strong> (Boot Menu) вы увидите список дисков. С помощью стрелочек на клавиатуре выберите вашу флешку (обычно там есть слово <strong>"USB"</strong>, <strong>"UEFI: USB"</strong> или название самой флешки, например <strong>"Kingston DataTraveler"</strong>) и нажмите <strong>Enter</strong>.</p>
                      </div>
                    </div>
                  </div>

                  {/* Шаг 4: Процесс установки */}
                  <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/10">4</div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Шаг 4: Процесс установки (Синий экран)</h3>
                        <p className="text-sm text-zinc-400 mt-1">Если вы всё сделали правильно, появится красивое синее окно установки Windows.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-5 text-sm text-zinc-300">
                      <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0 mt-1">1</div>
                        <div>
                          <p className="font-semibold text-white mb-1">Язык и время</p>
                          <p className="text-zinc-400">Ничего не меняем (везде Русский). Нажимаем <strong>"Далее"</strong>, затем большую кнопку <strong>"Установить"</strong>.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0 mt-1">2</div>
                        <div>
                          <p className="font-semibold text-white mb-1">Активация Windows</p>
                          <p className="text-zinc-400">Появится окно с просьбой ввести ключ. В самом низу нажмите неприметную надпись <strong>"У меня нет ключа продукта"</strong>. (Мы активируем её позже бесплатно).</p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0 mt-1">3</div>
                        <div>
                          <p className="font-semibold text-white mb-1">Выбор версии</p>
                          <p className="text-zinc-400">В списке выберите <strong>Windows 11 Pro</strong> (Профессиональная). Нажмите "Далее", примите условия лицензии.</p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0 mt-1">4</div>
                        <div>
                          <p className="font-semibold text-white mb-1">Тип установки (ВНИМАНИЕ!)</p>
                          <p className="text-zinc-400">Обязательно выберите нижний вариант: <strong>"Выборочная: только установка Windows (для опытных пользователей)"</strong>. Верхний вариант (Обновление) нам не нужен, мы делаем чистую установку.</p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start p-4 bg-red-950/20 border border-red-500/20 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold shrink-0 mt-1">5</div>
                        <div>
                          <p className="font-bold text-red-400 mb-2">Работа с дисками (Удаляем старую винду)</p>
                          <p className="text-zinc-300 mb-2">Вы увидите список дисков. Ваша задача — удалить разделы старой Windows, чтобы освободить место для новой.</p>
                          <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-2">
                            <li>Обычно старая Windows находится на <strong>Диске 0</strong>.</li>
                            <li>Там будет несколько мелких разделов (по 16 МБ, 100 МБ, 500 МБ) — это системные разделы старой винды.</li>
                            <li>И один большой раздел (например, 100 ГБ или 250 ГБ) — это ваш старый диск C:.</li>
                            <li>Кликайте по каждому из этих разделов <strong>Диска 0</strong> по очереди и нажимайте кнопку <strong>"Удалить"</strong> (снизу).</li>
                            <li><strong className="text-white">ОСТОРОЖНО:</strong> Если у вас есть Диск 1 (ваш диск D: с играми и фото) — <strong>ЕГО НЕ ТРОГАЙТЕ!</strong> Удаляйте только разделы Диска 0.</li>
                            <li>В итоге вместо кучи разделов Диска 0 у вас должна остаться одна строчка: <strong>"Незанятое пространство на диске 0"</strong>.</li>
                          </ul>
                          <p className="text-zinc-300 mt-3">Выделите это "Незанятое пространство" и просто нажмите <strong>"Далее"</strong>. Windows сама всё создаст и отформатирует как надо.</p>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0 mt-1">6</div>
                        <div>
                          <p className="font-semibold text-white mb-1">Ожидание</p>
                          <p className="text-zinc-400">Начнется процесс "Копирование файлов Windows". Просто откиньтесь на спинку кресла и ждите. Компьютер сам пару раз перезагрузится. <strong>Флешку пока не вытаскивайте!</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Шаг 5: Финал */}
                  <div className="p-6 rounded-2xl bg-emerald-900/20 border border-emerald-500/30 shadow-xl text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-400 mb-2">Шаг 5: Финал! Вы восхитительны!</h3>
                    <p className="text-zinc-300 max-w-2xl mx-auto text-sm leading-relaxed">
                      После всех перезагрузок вас встретит экран первоначальной настройки (выбор региона, имени пользователя). 
                      Просто нажимайте "Далее", введите свое имя (желательно на английском, например "Admin" или "User"). 
                      <br/><br/>
                      Как только появится рабочий стол — <strong>поздравляем, вы успешно переустановили Windows!</strong> 🎉<br/>
                      Теперь можете вытащить флешку. Её можно отформатировать и пользоваться как обычной, либо оставить загрузочной — полезно иметь такую под рукой, чтобы в любой момент стать "компьютерным мастером" для друга!<br/><br/>
                      Возвращайтесь в нашу утилиту, чтобы установить драйвера, программы и настроить систему на максимальную производительность!
                    </p>
                  </div>

                </div>
              </motion.div>
            )}

            {currentPage === 'changelog' && (
              <motion.div
                key="changelog"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto pb-10"
              >
                <div className="mb-2">
                  <h2 className="text-2xl font-semibold text-white tracking-tight">Что нового?</h2>
                  <p className="text-zinc-400 mt-1 text-sm">История изменений Varan_WiNUP.</p>
                </div>

                <div className="space-y-6 mt-6">

                  {/* v1.0.3 */}
                  <div className="p-5 rounded-2xl bg-orange-900/20 border border-orange-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-orange-400/8 blur-[60px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/5 blur-[50px] rounded-full pointer-events-none" />
                    {/* Падающие лепестки */}
                    <PetalCanvas />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[11px] font-mono font-bold border border-orange-500/30">v1.0.3 VaRaN</span>
                        <span className="text-[10px] text-orange-400/70 font-mono tracking-wider">ТЕКУЩАЯ ВЕРСИЯ</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-zinc-300">
                        <p className="flex items-center gap-1.5"><span className="text-emerald-400">✦</span> Переименовано в Varan_WiNUP</p>
                        <p className="flex items-center gap-1.5"><span className="text-emerald-400">✦</span> Маскот-варан с переключением фона</p>
                        <p className="flex items-center gap-1.5"><span className="text-emerald-400">✦</span> Экран приветствия с анимацией въезда</p>
                        <p className="flex items-center gap-1.5"><span className="text-emerald-400">✦</span> Иконка и установщик из арта варана</p>
                        <p className="flex items-center gap-1.5"><span className="text-emerald-400">✦</span> Падающие лепестки в разделе «Что нового?»</p>
                        <p className="flex items-center gap-1.5"><span className="text-emerald-400">✦</span> Яндекс Музыка Мод добавлена в программы</p>
                        <p className="flex items-center gap-1.5"><span className="text-emerald-400">✦</span> Фикс системных твиков — UTF-16LE кодировка</p>
                        <p className="flex items-center gap-1.5"><span className="text-emerald-400">✦</span> Фикс кнопки удаления мусора Windows</p>
                        <p className="flex items-center gap-1.5"><span className="text-emerald-400">✦</span> Фикс звука интро — синглтон AudioContext</p>
                        <p className="flex items-center gap-1.5"><span className="text-emerald-400">✦</span> Раздел «Что нового?» и горячие клавиши</p>
                        <p className="flex items-center gap-1.5 col-span-2"><span className="text-emerald-400">✦</span> <strong className="text-white">Исходный код открыт на GitHub!</strong></p>
                      </div>
                    </div>
                  </div>

                  {/* v1.0.2 */}
                  <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-700/50 text-zinc-300 text-[11px] font-mono font-bold border border-zinc-600/50">v1.0.2 OffiCiaL</span>
                        <span className="text-[10px] text-zinc-500 font-mono"></span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-zinc-300">
                        <p className="flex items-center gap-1.5"><span className="text-zinc-500">✦</span> Глобальный поиск по всем разделам</p>
                        <p className="flex items-center gap-1.5"><span className="text-zinc-500">✦</span> Экран загрузки в стиле приложения</p>
                        <p className="flex items-center gap-1.5"><span className="text-zinc-500">✦</span> tg-ws-proxy для Telegram на ПК</p>
                        <p className="flex items-center gap-1.5"><span className="text-zinc-500">✦</span> Раздел «Что нового?» с историей</p>
                        <p className="flex items-center gap-1.5"><span className="text-zinc-500">✦</span> Горячие клавиши в «Информации»</p>
                        <p className="flex items-center gap-1.5"><span className="text-zinc-500">✦</span> Кнопка GitHub в тайтлбаре</p>
                        <p className="flex items-center gap-1.5"><span className="text-zinc-500">✦</span> Твики работают в обе стороны</p>
                        <p className="flex items-center gap-1.5"><span className="text-zinc-500">✦</span> Удаление мусора Windows надёжнее</p>
                        <p className="flex items-center gap-1.5"><span className="text-zinc-500">✦</span> Антибаг быстрых кликов по разделам</p>
                        <p className="flex items-center gap-1.5"><span className="text-zinc-500">✦</span> Исправлены все структурные баги JSX</p>
                        <p className="flex items-center gap-1.5"><span className="text-zinc-500">✦</span> GitHub и Telegram кнопки в сайдбаре</p>
                      </div>
                    </div>
                  </div>

                  {/* v1.0.1 */}
                  <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-700/50 text-zinc-300 text-[11px] font-mono font-bold border border-zinc-600/50">v1.0.1 OffiCiaL</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-zinc-400">
                      <p className="flex items-center gap-1.5"><span className="text-zinc-500">✦</span> Интро без клика — сразу запускается</p>
                      <p className="flex items-center gap-1.5"><span className="text-zinc-500">✦</span> Кастомные курсоры в Эстетике</p>
                      <p className="flex items-center gap-1.5"><span className="text-zinc-500">✦</span> Улучшен установщик</p>
                      <p className="flex items-center gap-1.5"><span className="text-zinc-500">✦</span> Брендинг 1.0.1 OffiCiaL</p>
                    </div>
                  </div>

                  {/* v1.0.0 */}
                  <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/40">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-500 text-[11px] font-mono font-bold border border-zinc-700/50">v1.0.0</span>
                      <span className="text-[10px] text-zinc-600 font-mono">ПЕРВЫЙ РЕЛИЗ</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-zinc-500">
                      <p className="flex items-center gap-1.5"><span className="text-zinc-600">✦</span> Все основные разделы утилиты</p>
                      <p className="flex items-center gap-1.5"><span className="text-zinc-600">✦</span> Кинематографичное интро</p>
                      <p className="flex items-center gap-1.5"><span className="text-zinc-600">✦</span> Сканирование железа</p>
                      <p className="flex items-center gap-1.5"><span className="text-zinc-600">✦</span> Активация через MAS</p>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {currentPage === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl mx-auto pb-10"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-zinc-100">Настройки утилиты</h2>
                    <p className="text-sm text-zinc-500 mt-1">Параметры работы самой программы</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Click Sound Settings */}
                  <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 relative overflow-hidden">
                    <h3 className="text-lg font-medium text-zinc-100 mb-6 flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-indigo-400" />
                      Звук интерфейса
                    </h3>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
                      <div>
                        <h4 className="font-medium text-zinc-200">Звук нажатий («пуньк»)</h4>
                        <p className="text-sm text-zinc-500 mt-1">Одному из наших тестировщиков стало плохо от этого звука, поэтому по стандарту он отключён. Включай на свой страх и риск.</p>
                      </div>
                      <button
                        onClick={() => {
                          const next = !clickSoundEnabled;
                          setClickSoundEnabledState(next);
                          setClickSoundEnabled(next);
                          // Играем звук только если только что ВКЛЮЧИЛИ
                          if (next) playClickSound();
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          clickSoundEnabled ? 'bg-indigo-500' : 'bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            clickSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Intro Settings */}
                  <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 relative overflow-hidden">
                    <h3 className="text-lg font-medium text-zinc-100 mb-6 flex items-center gap-2">
                      <PlayCircle className="w-5 h-5 text-indigo-400" />
                      Настройки Интро (Заставки)
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Enable/Disable Intro */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
                        <div>
                          <h4 className="font-medium text-zinc-200">Показывать интро при запуске</h4>
                          <p className="text-sm text-zinc-500 mt-1">Включает или отключает кинематографичную заставку при открытии программы.</p>
                        </div>
                        <button
                          onClick={() => {
                            playClickSound();
                            setIntroEnabled(!introEnabled);
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            introEnabled ? 'bg-indigo-500' : 'bg-zinc-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              introEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Intro Volume */}
                      <div className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-medium text-zinc-200 flex items-center gap-2">
                              <Volume2 className="w-4 h-4 text-zinc-400" />
                              Громкость интро
                            </h4>
                            <p className="text-sm text-zinc-500 mt-1">Настройте уровень звука для заставки.</p>
                          </div>
                          <span className="text-sm font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                            {Math.round(introVolume * 100)}%
                          </span>
                        </div>
                        
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={introVolume}
                          onChange={(e) => {
                            setIntroVolume(parseFloat(e.target.value));
                          }}
                          onMouseUp={playClickSound}
                          className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-xs text-zinc-500 mt-2 font-mono">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}


          </AnimatePresence>
        </div>
      </main>



      {/* Cursors Modal */}
      <AnimatePresence>
        {showCursorsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { playClickSound(); setShowCursorsModal(false); }}
            className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    Кастомные курсоры
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">Выбери курсор и нажми «Применить»</p>
                </div>
                <button
                  onClick={() => { playClickSound(); setShowCursorsModal(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="13" y2="13"/><line x1="13" y1="1" x2="1" y2="13"/></svg>
                </button>
              </div>

              {/* Cursor list */}
              <div className="space-y-3">

                {/* Базовый курсор Windows */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/50 hover:border-zinc-600/60 transition-all">
                  <div className="flex items-center gap-4">
                    {/* Preview стандартного курсора Windows (Aero) */}
                    <div className="w-16 h-14 flex items-center justify-center bg-zinc-900/80 rounded-lg border border-zinc-700/50 shrink-0">
                      <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
                        <path d="M4 2L4 26L9.5 20.5L13.5 30L16.5 28.5L12.5 18.5L20 18.5L4 2Z" fill="white" stroke="#666" strokeWidth="1.2"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">Стандартный Windows Aero</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Белый курсор по умолчанию — сбрасывает любые темы</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      playClickSound();
                      if (!isElectron) {
                        showNotification('Доступно только в .exe версии');
                        return;
                      }
                      const ps = [
                        `$c = 'HKCU:\\Control Panel\\Cursors'`,
                        `Set-ItemProperty $c -Name '(Default)' -Value '' -Type String`,
                        `Set-ItemProperty $c -Name 'Arrow' -Value '%SystemRoot%\\cursors\\aero_arrow.cur' -Type ExpandString`,
                        `Set-ItemProperty $c -Name 'Help' -Value '%SystemRoot%\\cursors\\aero_helpsel.cur' -Type ExpandString`,
                        `Set-ItemProperty $c -Name 'AppStarting' -Value '%SystemRoot%\\cursors\\aero_working.ani' -Type ExpandString`,
                        `Set-ItemProperty $c -Name 'Wait' -Value '%SystemRoot%\\cursors\\aero_busy.ani' -Type ExpandString`,
                        `Set-ItemProperty $c -Name 'Crosshair' -Value '' -Type String`,
                        `Set-ItemProperty $c -Name 'IBeam' -Value '' -Type String`,
                        `Set-ItemProperty $c -Name 'No' -Value '%SystemRoot%\\cursors\\aero_unavail.cur' -Type ExpandString`,
                        `Set-ItemProperty $c -Name 'SizeNS' -Value '%SystemRoot%\\cursors\\aero_ns.cur' -Type ExpandString`,
                        `Set-ItemProperty $c -Name 'SizeWE' -Value '%SystemRoot%\\cursors\\aero_ew.cur' -Type ExpandString`,
                        `Set-ItemProperty $c -Name 'SizeNWSE' -Value '%SystemRoot%\\cursors\\aero_nwse.cur' -Type ExpandString`,
                        `Set-ItemProperty $c -Name 'SizeNESW' -Value '%SystemRoot%\\cursors\\aero_nesw.cur' -Type ExpandString`,
                        `Set-ItemProperty $c -Name 'SizeAll' -Value '%SystemRoot%\\cursors\\aero_move.cur' -Type ExpandString`,
                        `Set-ItemProperty $c -Name 'Hand' -Value '%SystemRoot%\\cursors\\aero_link.cur' -Type ExpandString`,
                        `$sig = '[DllImport("user32.dll")] public static extern bool SystemParametersInfo(uint a, uint b, IntPtr c, uint d);'`,
                        `$t = Add-Type -MemberDefinition $sig -Name W32 -Namespace W32 -PassThru`,
                        `$t::SystemParametersInfo(0x0057,0,[IntPtr]::Zero,0x03)`,
                      ].join('; ');
                      const psSafe = ps.split('"').join('\\"');
                      const result = await runPowerShell(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psSafe}"`);
                      if (result.success !== false) {
                        showNotification('✅ Стандартный курсор применён!');
                        setShowCursorsModal(false);
                      } else {
                        showNotification('Ошибка применения курсора');
                      }
                    }}
                    className="shrink-0 px-4 py-2 rounded-lg text-xs font-medium bg-zinc-700/50 text-zinc-300 border border-zinc-600/50 hover:bg-zinc-700 transition-all"
                  >
                    Применить
                  </button>
                </div>

                {/* Win11 Cursors Concept v2 — тёмный */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/40 border border-indigo-500/30 hover:border-indigo-500/50 transition-all">
                  <div className="flex items-center gap-4">
                    {/* Preview курсора jepriCreations — голубой треугольник */}
                    <div className="w-16 h-14 flex items-center justify-center bg-zinc-200/10 rounded-lg border border-zinc-700/50 shrink-0 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" className="relative z-10" style={{filter: 'drop-shadow(0px 1px 3px rgba(0,0,0,0.5))'}}>
                        <path d="M5 3 L5 27 L25 15 Z" rx="2" fill="#5BB8F5" stroke="#3A9FE8" strokeWidth="1.2" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-zinc-200">Win11 Cursors Concept v2</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono">Esarev</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">Минималистичный чёрный курсор by jepriCreations — скачай и установи через .inf</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound();
                      openExternal('https://jepricreations.com/products/w11-cursor-concept-free');
                    }}
                    className="shrink-0 px-4 py-2 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all"
                  >
                    Скачать
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Notification */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: -20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: -20 }}
            className="fixed bottom-6 left-6 z-50 max-w-sm p-4 rounded-xl bg-red-950/90 border border-red-500/50 shadow-2xl shadow-red-900/20 backdrop-blur-md flex gap-3 items-start"
          >
            <WifiOff className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-400">Нет подключения к интернету</h4>
              <p className="text-xs text-red-300/80 mt-1 leading-relaxed">
                Без доступа к сети вы не сможете скачивать программы и выполнять активацию. Пожалуйста, проверьте подключение.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { playClickSound(); setSelectedImage(null); }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImage}
              alt="Enlarged view"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
            
            <button 
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-colors"
              onClick={() => { playClickSound(); setSelectedImage(null); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-zinc-900 border border-zinc-800 shadow-2xl rounded-xl p-4 max-w-md"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-sm font-medium text-zinc-200">{notification}</p>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
