# Esarev WinSetup

Утилита для настройки Windows. React + Vite + Electron.

---

## Запуск в режиме разработки

```bash
npm install
npm run dev
```

Откроется Vite-сервер на `localhost:3000`, затем автоматически запустится окно Electron.

---

## Сборка .exe установщика

```bash
npm run build
```

Готовый установщик появится в папке `release/`.

> **Важно:** при сборке electron-builder скачивает Electron (~80 МБ) и подписывает сборку.  
> Для Windows-сборки нужно запускать `npm run build` **на Windows**.

---

## Структура проекта

```
electron/
  main.cjs      — главный процесс Electron (Node.js, доступ к ОС)
  preload.cjs   — безопасный мост между React и Electron
src/
  App.tsx           — основной компонент
  hooks/
    useElectron.ts  — хук для вызова Electron API из React
  utils/
    sound.ts        — звук нажатий
public/
  icon.ico      — иконка приложения (добавить самостоятельно)
```

---
исходного кода нет, ибо мне лень, и вообще запутался ахахахахах
