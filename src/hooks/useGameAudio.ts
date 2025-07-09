import { useState, useEffect, useRef } from 'react';

interface GameAudioSettings {
  isMuted: boolean;
  volume: number;
}

export const useGameAudio = () => {
  const [audioSettings, setAudioSettings] = useState<GameAudioSettings>({
    isMuted: false,
    volume: 0.7
  });

  // Referências para os áudios
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const buttonSoundRef = useRef<HTMLAudioElement | null>(null);
  const navigationSoundRef = useRef<HTMLAudioElement | null>(null);
  const consequenceSounds = useRef<HTMLAudioElement[]>([]);

  useEffect(() => {
    // Inicializar música de fundo
    backgroundMusicRef.current = new Audio('/[KAIROSOFT SOUNDTRACKS] Game Dev Story Working Hard (1) (2).mp3');
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = audioSettings.volume * 0.3; // Música mais baixa
      
      // Tentar tocar a música (pode falhar devido a políticas do navegador)
      const playPromise = backgroundMusicRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('Autoplay foi bloqueado:', error);
        });
      }
    }

    // Criar sons de botão usando Web Audio API
    createButtonSounds();
    createNavigationSounds();
    createConsequenceSounds();

    // Carregar configurações salvas
    const savedSettings = localStorage.getItem('game-audio-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setAudioSettings(settings);
      } catch (error) {
        console.error('Erro ao carregar configurações de áudio:', error);
      }
    }

    return () => {
      // Cleanup
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
    };
  }, []);

  // Atualizar volume quando configurações mudarem
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = audioSettings.isMuted ? 0 : audioSettings.volume * 0.3;
      if (!audioSettings.isMuted && backgroundMusicRef.current.paused) {
        backgroundMusicRef.current.play().catch(console.error);
      } else if (audioSettings.isMuted) {
        backgroundMusicRef.current.pause();
      }
    }

    // Salvar configurações
    localStorage.setItem('game-audio-settings', JSON.stringify(audioSettings));
  }, [audioSettings]);

  const createButtonSounds = () => {
    // Som de botão usando frequências
    const createBeepSound = (frequency: number, duration: number) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    buttonSoundRef.current = {
      play: () => {
        if (!audioSettings.isMuted) {
          createBeepSound(800, 0.1);
        }
      }
    } as any;
  };

  const createNavigationSounds = () => {
    const createNavigationSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 600;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    };

    navigationSoundRef.current = {
      play: () => {
        if (!audioSettings.isMuted) {
          createNavigationSound();
        }
      }
    } as any;
  };

  const createConsequenceSounds = () => {
    // Som de sucesso
    const createSuccessSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator1.frequency.value = 523; // C5
      oscillator2.frequency.value = 659; // E5
      oscillator1.type = 'sine';
      oscillator2.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      
      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.5);
      oscillator2.stop(audioContext.currentTime + 0.5);
    };

    // Som neutro
    const createNeutralSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 440; // A4
      oscillator.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    };

    // Som de alerta
    const createAlertSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 330; // E4
      oscillator.type = 'sawtooth';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    };

    consequenceSounds.current = [
      { play: () => !audioSettings.isMuted && createSuccessSound() },
      { play: () => !audioSettings.isMuted && createNeutralSound() },
      { play: () => !audioSettings.isMuted && createAlertSound() }
    ] as any;
  };

  const toggleMute = () => {
    setAudioSettings(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const playButtonSound = () => {
    if (buttonSoundRef.current && !audioSettings.isMuted) {
      buttonSoundRef.current.play();
    }
  };

  const playNavigationSound = () => {
    if (navigationSoundRef.current && !audioSettings.isMuted) {
      navigationSoundRef.current.play();
    }
  };

  const playConsequenceSound = (type: 'success' | 'neutral' | 'alert' = 'neutral') => {
    if (audioSettings.isMuted) return;
    
    const soundIndex = type === 'success' ? 0 : type === 'alert' ? 2 : 1;
    if (consequenceSounds.current[soundIndex]) {
      consequenceSounds.current[soundIndex].play();
    }
  };

  const playRandomConsequenceSound = () => {
    const randomIndex = Math.floor(Math.random() * consequenceSounds.current.length);
    if (consequenceSounds.current[randomIndex] && !audioSettings.isMuted) {
      consequenceSounds.current[randomIndex].play();
    }
  };

  return {
    audioSettings,
    toggleMute,
    playButtonSound,
    playNavigationSound,
    playConsequenceSound,
    playRandomConsequenceSound
  };
};