let audioCtx: AudioContext | null = null;

/** Читает настройку из localStorage — дефолт ВЫКЛЮЧЕН (false) */
export const isClickSoundEnabled = (): boolean => {
  return localStorage.getItem('clickSoundEnabled') === 'true';
};

export const setClickSoundEnabled = (enabled: boolean) => {
  localStorage.setItem('clickSoundEnabled', String(enabled));
};

export const playClickSound = () => {
  // Звук выключен по умолчанию — проверяем перед каждым воспроизведением
  if (!isClickSoundEnabled()) return;

  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtx = new AudioContextClass();
    }
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {
    // Ignore errors
  }
};
