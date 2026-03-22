/**
 * useAppVersions — проверяет актуальные версии приложений через GitHub Releases API
 * Для не-GitHub приложений (Chrome, Steam, VLC) версии обновляются вручную здесь.
 */

export interface AppVersion {
  id: string;
  latestVersion: string;
  downloadUrl: string;
  checking: boolean;
  error: boolean;
}

// Статические версии для приложений не на GitHub
const STATIC_VERSIONS: Record<string, { version: string; url: string }> = {
  chrome:   { version: 'latest', url: 'https://dl.google.com/chrome/install/latest/chrome_installer.exe' },
  steam:    { version: 'latest', url: 'https://cdn.akamai.steamstatic.com/client/installer/SteamSetup.exe' },
  telegram: { version: 'latest', url: 'https://telegram.org/dl/desktop/win' },
  vlc:      { version: '3.0.23', url: 'https://download.videolan.org/pub/videolan/vlc/3.0.23/win64/vlc-3.0.23-win64.exe' },
};

// GitHub репозитории для автоматической проверки
const GITHUB_SOURCES: Record<string, { repo: string; assetPattern: RegExp; fallbackUrl: string }> = {
  zapret: {
    repo: 'Flowseal/zapret-discord-youtube',
    assetPattern: /\.zip$/i,
    fallbackUrl: 'https://github.com/Flowseal/zapret-discord-youtube/releases/latest',
  },
  '7zip': {
    repo: 'ip7z/7zip',
    assetPattern: /x64\.exe$/i,
    fallbackUrl: 'https://www.7-zip.org/a/7z2600-x64.exe',
  },
  notepadpp: {
    repo: 'notepad-plus-plus/notepad-plus-plus',
    assetPattern: /Installer\.x64\.exe$/i,
    fallbackUrl: 'https://github.com/notepad-plus-plus/notepad-plus-plus/releases/latest',
  },
  sharex: {
    repo: 'ShareX/ShareX',
    assetPattern: /setup\.exe$/i,
    fallbackUrl: 'https://github.com/ShareX/ShareX/releases/latest',
  },
  qbittorrent: {
    repo: 'qbittorrent/qBittorrent',
    assetPattern: /x64_setup\.exe$/i,
    fallbackUrl: 'https://www.qbittorrent.org/download',
  },
};

async function fetchGithubLatest(repo: string, assetPattern: RegExp): Promise<{ version: string; url: string } | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const version: string = data.tag_name?.replace(/^v|^release-/i, '') ?? '';
    const asset = data.assets?.find((a: { name: string }) => assetPattern.test(a.name));
    const url: string = asset?.browser_download_url ?? '';
    if (!url) return null;
    return { version, url };
  } catch {
    return null;
  }
}

// Кэш чтобы не долбить API при каждом рендере
const cache: Record<string, { version: string; url: string; ts: number }> = {};
const CACHE_TTL = 1000 * 60 * 30; // 30 минут

export async function getLatestVersion(appId: string): Promise<{ version: string; url: string } | null> {
  // Статические
  if (STATIC_VERSIONS[appId]) return STATIC_VERSIONS[appId];

  // Кэш
  const cached = cache[appId];
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { version: cached.version, url: cached.url };
  }

  // GitHub
  const src = GITHUB_SOURCES[appId];
  if (!src) return null;

  const result = await fetchGithubLatest(src.repo, src.assetPattern);
  if (result) {
    cache[appId] = { ...result, ts: Date.now() };
    return result;
  }
  // Фоллбэк — возвращаем захардкоженный URL без версии
  return { version: '', url: src.fallbackUrl };
}
