; ─────────────────────────────────────────────────────────────
;  Esarev WinSetup — Custom NSIS UI
; ─────────────────────────────────────────────────────────────

!macro customHeader
  ; Убираем стандартный серый фон — ставим тёмный
  SetOverwrite on
!macroend

!macro customWelcomePage
  ; Кастомная страница приветствия не нужна — используем стандартную с нашими текстами
!macroend

!macro customInstall
  ; Записываем в реестр для "Программы и компоненты"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EsarevWinSetup" \
    "DisplayName" "Esarev WinSetup"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EsarevWinSetup" \
    "Publisher" "Esarev"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EsarevWinSetup" \
    "URLInfoAbout" "https://t.me/Comendant"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EsarevWinSetup" \
    "DisplayVersion" "1.0.0"
!macroend

!macro customUnInstall
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\EsarevWinSetup"
!macroend
