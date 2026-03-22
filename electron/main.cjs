const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { writeFileSync, unlinkSync, existsSync } = require('fs');
const { tmpdir } = require('os');

const isDev = !app.isPackaged;

function createWindow() {
  // ── Интро-окно: широкое, нельзя изменить размер, только скрыть/закрыть ──
  const introWin = new BrowserWindow({
    width: 1600,
    height: 900,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    movable: true,
    frame: false,
    backgroundColor: '#09090b',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  introWin.setMenu(null);

  // ── Основное окно: создаём сразу, но скрываем до конца интро ──
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1000,
    minHeight: 660,
    frame: false,
    show: false,
    backgroundColor: '#09090b',
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setMenu(null);

  const DEV_URL = 'http://localhost:3000';
  if (isDev) {
    introWin.loadURL(DEV_URL);
    win.loadURL(DEV_URL + '?noIntro=1');
    introWin.webContents.on('did-fail-load', (_event, errorCode) => {
      if (errorCode === -3) return;
      setTimeout(() => { if (!introWin.isDestroyed()) introWin.loadURL(DEV_URL); }, 1500);
    });
    win.webContents.on('did-fail-load', (_event, errorCode) => {
      if (errorCode === -3) return;
      setTimeout(() => { if (!win.isDestroyed()) win.loadURL(DEV_URL); }, 1500);
    });
  } else {
    introWin.loadFile(path.join(__dirname, '../dist/index.html'));
    win.loadFile(path.join(__dirname, '../dist/index.html'), { query: { noIntro: '1' } });
  }

  introWin.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });

  // Интро-окно: только minimize и close
  ipcMain.on('intro-minimize', () => { if (!introWin.isDestroyed()) introWin.minimize(); });
  ipcMain.on('intro-close',    () => { if (!introWin.isDestroyed()) introWin.close(); });

  // Когда интро завершилось — показываем основное окно
  ipcMain.on('intro-complete', () => {
    if (!introWin.isDestroyed()) introWin.close();
    if (!win.isDestroyed()) { win.show(); win.focus(); }
  });

  // Основное окно
  ipcMain.on('window-minimize', () => { if (!win.isDestroyed()) win.minimize(); });
  ipcMain.on('window-maximize', () => {
    if (!win.isDestroyed()) win.isMaximized() ? win.unmaximize() : win.maximize();
  });
  ipcMain.on('window-close', () => { app.quit(); });
}

// ─── PowerShell (видимое окно — для MAS, удаления мусора и т.д.) ─────────────
ipcMain.handle('run-powershell', (_event, command) => {
  return new Promise((resolve) => {
    const ps = spawn(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command],
      { shell: true, windowsHide: false }
    );
    ps.on('close', (code) => resolve({ success: code === 0, code }));
    ps.on('error', (err) => resolve({ success: false, error: err.message }));
  });
});

// ─── Сканирование железа ─────────────────────────────────────────────────────
ipcMain.handle('get-hardware-info', () => {
  return new Promise((resolve) => {
    // Пишем скрипт во временный файл — избегаем проблем с экранированием в -Command
    const tmpScript = path.join(tmpdir(), 'esarev_hw_scan.ps1');
    const psScript = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ProgressPreference  = 'SilentlyContinue'
$WarningPreference   = 'SilentlyContinue'
$ErrorActionPreference = 'SilentlyContinue'

function Safe([string]$s) { if ($s) { $s.Trim() } else { '' } }

$cpu   = Get-CimInstance -ClassName Win32_Processor    | Select-Object -First 1
$gpus  = Get-CimInstance -ClassName Win32_VideoController |
           Where-Object { $_.Name -notmatch 'Basic|Generic|Remote|Virtual|Microsoft' }
$ram   = Get-CimInstance -ClassName Win32_PhysicalMemory
$board = Get-CimInstance -ClassName Win32_BaseBoard    | Select-Object -First 1
$os    = Get-CimInstance -ClassName Win32_OperatingSystem | Select-Object -First 1
$disks = Get-CimInstance -ClassName Win32_DiskDrive

$totalRamGB = [math]::Round(($ram | Measure-Object -Property Capacity -Sum).Sum / 1GB)
$ramSpeed = 0
$ramType  = 'DDR4'
$fr = $ram | Select-Object -First 1
if ($fr -and $fr.Speed -gt 0) {
  $ramSpeed = [int]$fr.Speed
  if    ($ramSpeed -ge 4800) { $ramType = 'DDR5' }
  elseif($ramSpeed -ge 2133) { $ramType = 'DDR4' }
  else                       { $ramType = 'DDR3' }
}

$gpuArr = @()
foreach ($g in $gpus) {
  $dd = 'N/A'
  if ($g.DriverDate) {
    try {
      # CimInstance возвращает нормальный DateTime
      $dt = $g.DriverDate
      if ($dt -is [datetime]) {
        $dd = $dt.ToString('dd.MM.yyyy')
      } else {
        # Формат WMI: 20230101000000.000000+000
        $s = [string]$dt
        if ($s.Length -ge 8) { $dd = "$($s[6..7] -join '').$($s[4..5] -join '').$($s[0..3] -join '')" }
      }
    } catch { $dd = 'N/A' }
  }
  $gpuArr += [PSCustomObject]@{
    name       = (Safe $g.Name)
    driver     = if ($g.DriverVersion) { [string]$g.DriverVersion } else { 'N/A' }
    driverDate = $dd
  }
}

$diskArr = @()
foreach ($d in $disks) {
  $sz = if ($d.Size) { [math]::Round([double]$d.Size / 1GB) } else { 0 }
  $mt = if ($d.Model -match 'SSD|NVMe|M\.2|KINGSTON|SAMSUNG.*870|SAMSUNG.*980|CRUCIAL|SABRENT|WD.*GREEN|WD.*BLUE.*SA') { 'SSD' } else { 'HDD' }
  $diskArr += [PSCustomObject]@{ name = (Safe $d.Model); sizeGB = $sz; type = $mt }
}

$out = [PSCustomObject]@{
  cpu      = Safe $cpu.Name
  cores    = "$($cpu.NumberOfCores)C/$($cpu.NumberOfLogicalProcessors)T"
  clockGHz = [math]::Round($cpu.MaxClockSpeed / 1000.0, 1)
  gpus     = $gpuArr
  ramGB    = $totalRamGB
  ramSpeed = $ramSpeed
  ramType  = $ramType
  board    = "$(Safe $board.Manufacturer) $(Safe $board.Product)"
  disks    = $diskArr
  os       = "$(Safe $os.Caption) (Build $($os.BuildNumber))"
}

$out | ConvertTo-Json -Depth 4 -Compress
`;

    try {
      writeFileSync(tmpScript, psScript, 'utf8');
    } catch (e) {
      return resolve({ success: false, error: 'Не удалось создать временный файл: ' + e.message });
    }

    const ps = spawn(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tmpScript],
      { shell: false, windowsHide: true }
    );

    let output = '';
    let errorOutput = '';

    ps.stdout.on('data', (d) => { output += d.toString('utf8'); });
    ps.stderr.on('data', (d) => { errorOutput += d.toString('utf8'); });

    ps.on('close', () => {
      try { if (existsSync(tmpScript)) unlinkSync(tmpScript); } catch {}
      // Ищем JSON в выводе — берём последнюю строку с фигурной скобкой
      const lines = output.split('\n').map(l => l.trim()).filter(l => l.startsWith('{'));
      const jsonLine = lines[lines.length - 1];
      if (!jsonLine) {
        return resolve({ success: false, error: errorOutput || 'Пустой вывод скрипта' });
      }
      try {
        const data = JSON.parse(jsonLine);
        if (data.error) return resolve({ success: false, error: data.error });
        resolve({ success: true, data });
      } catch (e) {
        resolve({ success: false, error: 'JSON parse error: ' + e.message + ' | Output: ' + output.slice(0, 200) });
      }
    });

    ps.on('error', (err) => {
      try { if (existsSync(tmpScript)) unlinkSync(tmpScript); } catch {}
      resolve({ success: false, error: err.message });
    });
  });
});

// Открыть ссылку во внешнем браузере
ipcMain.on('open-external', (_event, url) => {
  shell.openExternal(url);
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  // Не выходим при закрытии интро-окна — ждём пока закроется основное
  app.quit();
});

