import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, Play, Pause, RotateCcw, Save, Calendar, Trophy, Clock, User, Gamepad2, Zap, FileX2 as X2, AArrowDown as X4 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useGameAudio } from '../../hooks/useGameAudio';

interface MobileGameInterfaceProps {
  onBack: () => void;
}

interface GameState {
  day: number;
  hour: number;
  minute: number;
  energy: number;
  happiness: number;
  health: number;
  sleepQuality: number;
  currentRoom: 'bedroom' | 'living' | 'kitchen' | 'gym' | 'bathroom';
  isPlaying: boolean;
  gameSpeed: number;
  completedActions: string[];
  character: {
    name: string;
    mood: 'happy' | 'tired' | 'energetic' | 'relaxed' | 'stressed';
    activity: 'idle' | 'sleep' | 'eat' | 'exercise' | 'relax' | 'drinkWater' | 'shower';
  };
  achievements: string[];
  totalScore: number;
}

const MobileGameInterface: React.FC<MobileGameInterfaceProps> = ({ onBack }) => {
  const { isDark } = useTheme();
  const { audioSettings, toggleMute, playButtonSound, playNavigationSound, playConsequenceSound } = useGameAudio();
  const [showWelcome, setShowWelcome] = useState(true);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    hour: 7,
    minute: 0,
    energy: 80,
    happiness: 70,
    health: 85,
    sleepQuality: 60,
    currentRoom: 'bedroom',
    isPlaying: false,
    gameSpeed: 1,
    completedActions: [],
    character: {
      name: 'Alex',
      mood: 'happy',
      activity: 'idle'
    },
    achievements: [],
    totalScore: 0
  });

  // Função para formatar o tempo do jogo
  const formatGameTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  // Sistema de tempo: 1 segundo real = 15 minutos no jogo
  useEffect(() => {
    if (gameState.isPlaying) {
      gameLoopRef.current = setInterval(() => {
        setGameState(prev => {
          let newMinute = prev.minute + 15; // 15 minutos por segundo
          let newHour = prev.hour;
          let newDay = prev.day;

          // Ajustar minutos e horas
          if (newMinute >= 60) {
            newHour += Math.floor(newMinute / 60);
            newMinute = newMinute % 60;
          }

          // Ajustar dias
          if (newHour >= 24) {
            newDay += Math.floor(newHour / 24);
            newHour = newHour % 24;
          }

          // Efeitos baseados no tempo
          let energyChange = 0;
          let happinessChange = 0;
          let healthChange = 0;

          // Ciclo natural de energia baseado na hora
          if (newHour >= 6 && newHour <= 12) {
            energyChange = 0.1; // Manhã - energia aumenta
          } else if (newHour >= 13 && newHour <= 18) {
            energyChange = -0.05; // Tarde - energia diminui lentamente
          } else if (newHour >= 19 && newHour <= 23) {
            energyChange = -0.2; // Noite - energia diminui mais
          } else {
            energyChange = -0.3; // Madrugada - energia diminui rapidamente
          }

          // Aplicar mudanças graduais
          const newEnergy = Math.max(0, Math.min(100, prev.energy + energyChange));
          const newHappiness = Math.max(0, Math.min(100, prev.happiness + happinessChange));
          const newHealth = Math.max(0, Math.min(100, prev.health + healthChange));

          return {
            ...prev,
            day: newDay,
            hour: newHour,
            minute: newMinute,
            energy: newEnergy,
            happiness: newHappiness,
            health: newHealth
          };
        });
      }, 1000 / gameState.gameSpeed); // 1 segundo real

      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
  }, [gameState.isPlaying, gameState.gameSpeed]);

  const togglePlayPause = () => {
    playButtonSound();
    setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const changeGameSpeed = (speed: number) => {
    playButtonSound();
    setGameState(prev => ({ ...prev, gameSpeed: speed }));
  };

  const resetGame = () => {
    playButtonSound();
    setGameState({
      day: 1,
      hour: 7,
      minute: 0,
      energy: 80,
      happiness: 70,
      health: 85,
      sleepQuality: 60,
      currentRoom: 'bedroom',
      isPlaying: false,
      gameSpeed: 1,
      completedActions: [],
      character: {
        name: 'Alex',
        mood: 'happy',
        activity: 'idle'
      },
      achievements: [],
      totalScore: 0
    });
  };

  const saveGame = () => {
    playButtonSound();
    localStorage.setItem('dream-story-save', JSON.stringify(gameState));
    // Mostrar feedback visual de salvamento
    const button = document.querySelector('.save-button');
    if (button) {
      button.classList.add('animate-pulse');
      setTimeout(() => button.classList.remove('animate-pulse'), 1000);
    }
  };

  const changeRoom = (room: GameState['currentRoom']) => {
    playNavigationSound();
    setGameState(prev => ({ ...prev, currentRoom: room }));
  };

  const performAction = (action: string, object: string) => {
    playConsequenceSound('success');
    
    setGameState(prev => {
      let energyChange = 0;
      let happinessChange = 0;
      let healthChange = 0;
      let newMood = prev.character.mood;
      let newActivity = prev.character.activity;
      let newAchievements = [...prev.achievements];
      let scoreIncrease = 10;

      // Definir efeitos baseados na ação
      switch (action) {
        case 'sleep':
          energyChange = 30;
          healthChange = 10;
          newMood = 'relaxed';
          newActivity = 'sleep';
          scoreIncrease = 20;
          break;
        case 'eat':
          energyChange = 15;
          happinessChange = 10;
          newMood = 'happy';
          newActivity = 'eat';
          break;
        case 'exercise':
          energyChange = -10;
          healthChange = 20;
          happinessChange = 15;
          newMood = 'energetic';
          newActivity = 'exercise';
          scoreIncrease = 25;
          break;
        case 'relax':
          happinessChange = 20;
          newMood = 'relaxed';
          newActivity = 'relax';
          break;
        case 'drinkWater':
          healthChange = 5;
          energyChange = 5;
          newActivity = 'drinkWater';
          break;
        case 'shower':
          happinessChange = 10;
          healthChange = 5;
          newMood = 'happy';
          newActivity = 'shower';
          break;
      }

      // Verificar conquistas
      const actionKey = `${action}-${object}`;
      if (!prev.completedActions.includes(actionKey)) {
        if (prev.completedActions.length === 0) {
          newAchievements.push('Primeira Ação');
        }
        if (prev.completedActions.filter(a => a.startsWith('exercise')).length === 2) {
          newAchievements.push('Atleta Iniciante');
        }
      }

      return {
        ...prev,
        energy: Math.max(0, Math.min(100, prev.energy + energyChange)),
        happiness: Math.max(0, Math.min(100, prev.happiness + happinessChange)),
        health: Math.max(0, Math.min(100, prev.health + healthChange)),
        completedActions: prev.completedActions.includes(actionKey) 
          ? prev.completedActions 
          : [...prev.completedActions, actionKey],
        character: {
          ...prev.character,
          mood: newMood,
          activity: newActivity
        },
        achievements: newAchievements,
        totalScore: prev.totalScore + scoreIncrease
      };
    });

    // Resetar atividade após um tempo
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        character: { ...prev.character, activity: 'idle' }
      }));
    }, 3000);
  };

  const handleWelcomeStart = () => {
    playButtonSound();
    setShowWelcome(false);
    setGameState(prev => ({ ...prev, isPlaying: true }));
  };

  // Função para obter o dia da semana
  const getDayOfWeek = (day: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[(day - 1) % 7];
  };
  // Tela de Boas-vindas
  if (showWelcome) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-white via-emerald-50/80 to-emerald-100/60'
      }`}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-2xl p-8 border shadow-2xl transition-colors duration-300 ${
            isDark 
              ? 'bg-slate-900/95 border-slate-700' 
              : 'bg-white/95 border-emerald-200/50 shadow-emerald-500/10'
          }`}>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gamepad2 className="w-10 h-10 text-purple-400" />
              </div>
              
              <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-emerald-900'
              }`}>
                🌙 Dream Story
              </h2>
              
              <p className={`text-sm mb-6 leading-relaxed transition-colors duration-300 ${
                isDark ? 'text-slate-300' : 'text-emerald-700'
              }`}>
                Bem-vindo ao Dream Story! Ajude Alex a criar uma rotina de sono saudável através de ações diárias. 
                O tempo passa rapidamente - cada segundo real equivale a 15 minutos no jogo!
              </p>

              <div className={`border rounded-xl p-4 mb-6 transition-colors duration-300 ${
                isDark 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-emerald-100/80 border-emerald-300/50'
              }`}>
                <h3 className={`font-bold mb-2 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-emerald-900'
                }`}>⏰ Sistema de Tempo:</h3>
                <div className={`text-xs space-y-1 transition-colors duration-300 ${
                  isDark ? 'text-slate-300' : 'text-emerald-700'
                }`}>
                  <p>• 1 segundo real = 15 minutos no jogo</p>
                  <p>• 1 minuto real = 15 horas no jogo</p>
                  <p>• 1 hora real = 37.5 dias no jogo</p>
                </div>
              </div>

              <div className={`text-xs mb-6 space-y-2 transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-emerald-600'
              }`}>
                <p>🎯 <strong>Objetivo:</strong> Mantenha energia, felicidade e saúde altas</p>
                <p>🏠 <strong>Navegação:</strong> Toque nos botões dos cômodos para se mover</p>
                <p>🎮 <strong>Ações:</strong> Toque nos objetos para interagir</p>
              </div>
              
              <button
                onClick={handleWelcomeStart}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-4 rounded-xl font-bold text-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Começar Jornada
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-white via-emerald-50/80 to-emerald-100/60'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b-2 transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-900/95 border-slate-800' 
          : 'bg-white/95 border-emerald-200/50'
      }`}>
        <div className="px-4 py-2">
          {/* Primeira linha: Foto, Nome, Play/Pause, Mute, Save, Reset */}
          <div className="flex items-center justify-between mb-2">
            {/* Lado esquerdo: Foto de perfil + Nome + Controles */}
            <div className="flex items-center gap-3">
              {/* Foto de perfil do Alex */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center border-2 border-emerald-400/30 shadow-md">
                <span className="text-lg">👨‍💼</span>
              </div>
              
              {/* Nome Alex */}
              <span className={`text-sm font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-emerald-900'
              }`}>
                Alex
              </span>
              
              {/* Botão Play/Pause */}
              <button
                onClick={togglePlayPause}
                className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                  gameState.isPlaying 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-gray-500/20 text-gray-400'
                } ${
                  isDark 
                    ? 'hover:bg-slate-800' 
                    : 'hover:bg-emerald-100'
                }`}
              >
                {gameState.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              
              {/* Botão Mute */}
              <button
                onClick={toggleMute}
                className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                  audioSettings.isMuted 
                    ? 'bg-red-500/20 text-red-400' 
                    : 'bg-blue-500/20 text-blue-400'
                } ${
                  isDark 
                    ? 'hover:bg-slate-800' 
                    : 'hover:bg-emerald-100'
                }`}
              >
                {audioSettings.isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              
              {/* Botão Save */}
              <button
                onClick={saveGame}
                className={`save-button p-2 rounded-full transition-all duration-200 hover:scale-110 bg-green-500/20 text-green-400 ${
                  isDark 
                    ? 'hover:bg-slate-800' 
                    : 'hover:bg-emerald-100'
                }`}
              >
                <Save className="w-4 h-4" />
              </button>
              
              {/* Botão Reset */}
              <button
                onClick={resetGame}
                className={`p-2 rounded-full transition-all duration-200 hover:scale-110 bg-red-500/20 text-red-400 ${
                  isDark 
                    ? 'hover:bg-slate-800' 
                    : 'hover:bg-emerald-100'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            
            {/* Lado direito: Botão de voltar */}
            <button
              onClick={onBack}
              className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                isDark 
                  ? 'hover:bg-slate-800 text-white' 
                  : 'hover:bg-emerald-100 text-emerald-900'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          
          {/* Segunda linha: Dia da semana, Pontuação, Velocidade do tempo */}
          <div className="flex items-center justify-between">
            {/* Lado esquerdo: Dia da semana */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors duration-300 ${
              isDark 
                ? 'bg-slate-800/50 text-white' 
                : 'bg-emerald-100/80 text-emerald-900'
            }`}>
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className={`text-sm font-medium transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-emerald-900'
              }`}>
                {getDayOfWeek(gameState.day)}
              </span>
            </div>
            
            {/* Centro: Pontuação geral total */}
            <div className={`flex items-center gap-2 px-4 py-1 rounded-full transition-colors duration-300 ${
              isDark 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-emerald-500/20 text-emerald-600'
            }`}>
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span className={`text-sm font-bold transition-colors duration-300 ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                {gameState.totalScore} pts
              </span>
            </div>
            
            {/* Lado direito: Controles de velocidade */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => changeGameSpeed(1)}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all duration-200 ${
                  gameState.gameSpeed === 1
                    ? 'bg-emerald-500 text-white shadow-md'
                    : isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50'
                }`}
              >
                1x
              </button>
              <button
                onClick={() => changeGameSpeed(2)}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all duration-200 ${
                  gameState.gameSpeed === 2
                    ? 'bg-emerald-500 text-white shadow-md'
                    : isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50'
                }`}
              >
                2x
              </button>
              <button
                onClick={() => changeGameSpeed(4)}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all duration-200 ${
                  gameState.gameSpeed === 4
                    ? 'bg-emerald-500 text-white shadow-md'
                    : isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50'
                }`}
              >
                4x
              </button>
            </div>
          </div>
        </div>
      </header>


      {/* Stats Bar */}
      <div className={`px-4 py-3 border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-900/50 border-slate-800' 
          : 'bg-emerald-50/50 border-emerald-200/50'
      }`}>
        <div className="grid grid-cols-4 gap-2 text-xs">
          {/* Energy */}
          <div className="text-center">
            <div className={`text-xs font-medium mb-1 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-emerald-900'
            }`}>⚡ Energia</div>
            <div className={`rounded-full h-2 transition-colors duration-300 ${
              isDark ? 'bg-slate-800' : 'bg-emerald-200/50'
            }`}>
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${gameState.energy}%` }}
              />
            </div>
            <div className={`text-xs mt-1 transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-emerald-700'
            }`}>{Math.round(gameState.energy)}%</div>
          </div>

          {/* Happiness */}
          <div className="text-center">
            <div className={`text-xs font-medium mb-1 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-emerald-900'
            }`}>😊 Humor</div>
            <div className={`rounded-full h-2 transition-colors duration-300 ${
              isDark ? 'bg-slate-800' : 'bg-emerald-200/50'
            }`}>
              <div
                className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${gameState.happiness}%` }}
              />
            </div>
            <div className={`text-xs mt-1 transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-emerald-700'
            }`}>{Math.round(gameState.happiness)}%</div>
          </div>

          {/* Health */}
          <div className="text-center">
            <div className={`text-xs font-medium mb-1 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-emerald-900'
            }`}>❤️ Saúde</div>
            <div className={`rounded-full h-2 transition-colors duration-300 ${
              isDark ? 'bg-slate-800' : 'bg-emerald-200/50'
            }`}>
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${gameState.health}%` }}
              />
            </div>
            <div className={`text-xs mt-1 transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-emerald-700'
            }`}>{Math.round(gameState.health)}%</div>
          </div>

          {/* Score */}
          <div className="text-center">
            <div className={`text-xs font-medium mb-1 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-emerald-900'
            }`}>🏆 Pontos</div>
            <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full transition-colors duration-300 ${
              isDark 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-emerald-500/20 text-emerald-600'
            }`}>
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
              <span className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`}>{gameState.totalScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative h-[60vh] overflow-hidden pixel-game-container">
        <div className={`pixel-room room-${gameState.currentRoom} h-full relative`}>
          {/* Room Background */}
          <div className={`pixel-room-bg room-bg-${gameState.currentRoom} absolute inset-0`} />

          {/* Character */}
          <div className="pixel-character">
            <div className={`alex-sprite-2d alex-${gameState.character.activity} ${
              gameState.character.activity === 'idle' ? 'alex-idle-2d' : ''
            }`} />
            <div className="character-shadow-2d mt-1" />
          </div>

          {/* Room Objects */}
          {gameState.currentRoom === 'bedroom' && (
            <>
              <div 
                className="pixel-object pixel-bed available"
                onClick={() => performAction('sleep', 'bed')}
              >
                {gameState.completedActions.includes('sleep-bed') && (
                  <div className="pixel-completion">✓</div>
                )}
              </div>
              <div 
                className="pixel-object pixel-computer available"
                onClick={() => performAction('relax', 'computer')}
              >
                {gameState.completedActions.includes('relax-computer') && (
                  <div className="pixel-completion">✓</div>
                )}
              </div>
              <div className="pixel-object pixel-wardrobe" />
              <div className="pixel-object pixel-bedroom-mirror" />
            </>
          )}

          {gameState.currentRoom === 'living' && (
            <>
              <div 
                className="pixel-object pixel-sofa available"
                onClick={() => performAction('relax', 'sofa')}
              >
                {gameState.completedActions.includes('relax-sofa') && (
                  <div className="pixel-completion">✓</div>
                )}
              </div>
              <div 
                className="pixel-object pixel-tv available"
                onClick={() => performAction('relax', 'tv')}
              >
                {gameState.completedActions.includes('relax-tv') && (
                  <div className="pixel-completion">✓</div>
                )}
              </div>
              <div className="pixel-object pixel-bookshelf" />
              <div 
                className="pixel-object pixel-videogame available"
                onClick={() => performAction('relax', 'videogame')}
              >
                {gameState.completedActions.includes('relax-videogame') && (
                  <div className="pixel-completion">✓</div>
                )}
              </div>
              <div className="pixel-living-window" />
            </>
          )}

          {gameState.currentRoom === 'kitchen' && (
            <>
              <div 
                className="pixel-object pixel-table available"
                onClick={() => performAction('eat', 'table')}
              >
                {gameState.completedActions.includes('eat-table') && (
                  <div className="pixel-completion">✓</div>
                )}
              </div>
              <div className="pixel-object pixel-fridge" />
              <div className="pixel-object pixel-stove" />
              <div className="pixel-object pixel-microwave" />
              <div 
                className="pixel-object pixel-water available"
                onClick={() => performAction('drinkWater', 'water')}
              >
                {gameState.completedActions.includes('drinkWater-water') && (
                  <div className="pixel-completion">✓</div>
                )}
              </div>
            </>
          )}

          {gameState.currentRoom === 'gym' && (
            <>
              <div 
                className="pixel-object pixel-exercise available"
                onClick={() => performAction('exercise', 'weights')}
              >
                {gameState.completedActions.includes('exercise-weights') && (
                  <div className="pixel-completion">✓</div>
                )}
              </div>
              <div 
                className="pixel-object pixel-treadmill available"
                onClick={() => performAction('exercise', 'treadmill')}
              >
                {gameState.completedActions.includes('exercise-treadmill') && (
                  <div className="pixel-completion">✓</div>
                )}
              </div>
              <div className="pixel-object pixel-dumbbells" />
              <div 
                className="pixel-object pixel-yoga-mat available"
                onClick={() => performAction('exercise', 'yoga')}
              >
                {gameState.completedActions.includes('exercise-yoga') && (
                  <div className="pixel-completion">✓</div>
                )}
              </div>
              <div className="pixel-object pixel-gym-mirror" />
              <div className="pixel-object pixel-speaker" />
            </>
          )}

          {gameState.currentRoom === 'bathroom' && (
            <>
              <div 
                className="pixel-object pixel-shower available"
                onClick={() => performAction('shower', 'shower')}
              >
                {gameState.completedActions.includes('shower-shower') && (
                  <div className="pixel-completion">✓</div>
                )}
              </div>
              <div className="pixel-object pixel-bathroom-sink" />
              <div className="pixel-object pixel-toilet" />
              <div 
                className="pixel-object pixel-skincare available"
                onClick={() => performAction('relax', 'skincare')}
              >
                {gameState.completedActions.includes('relax-skincare') && (
                  <div className="pixel-completion">✓</div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Floating Controls */}
        <div className="fixed top-20 right-4 z-50">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors duration-300 ${
            isDark 
              ? 'bg-slate-800/90 text-white' 
              : 'bg-white/90 text-emerald-900 border border-emerald-200/50'
          }`}>
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className={`text-sm font-medium transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-emerald-900'
            }`}>
              {formatGameTime(gameState.hour, gameState.minute)}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-300 ${
              isDark 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-emerald-500/20 text-emerald-600'
            }`}>
              Dia {gameState.day}
            </span>
          </div>
        </div>
      </div>

      {/* Room Navigation */}
      <div className={`px-4 py-4 border-t transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-900/50 border-slate-800' 
          : 'bg-emerald-50/50 border-emerald-200/50'
      }`}>
        <div className="grid grid-cols-5 gap-2">
          {[
            { id: 'bedroom', label: '🛏️ Quarto', emoji: '🛏️' },
            { id: 'living', label: '🛋️ Sala', emoji: '🛋️' },
            { id: 'kitchen', label: '🍽️ Cozinha', emoji: '🍽️' },
            { id: 'gym', label: '💪 Academia', emoji: '💪' },
            { id: 'bathroom', label: '🚿 Banheiro', emoji: '🚿' }
          ].map((room) => (
            <button
              key={room.id}
              onClick={() => changeRoom(room.id as GameState['currentRoom'])}
              className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                gameState.currentRoom === room.id
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : isDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50'
              }`}
            >
              <div className="hidden sm:block">
                {room.label}
              </div>
              <div className="sm:hidden text-lg">
                {room.emoji}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Character Status */}
      <div className={`px-4 py-3 border-t transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-900/30 border-slate-800' 
          : 'bg-gray-100/80 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-400" />
              <span className={`text-sm font-medium transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-emerald-900'
              }`}>
                {gameState.character.name}
              </span>
            </div>
            
            <div className={`px-2 py-1 rounded-full text-xs transition-colors duration-300 ${
              isDark 
                ? 'bg-slate-800 text-slate-300' 
                : 'bg-emerald-100/80 text-emerald-700'
            }`}>
              {gameState.character.mood === 'happy' && '😊 Feliz'}
              {gameState.character.mood === 'tired' && '😴 Cansado'}
              {gameState.character.mood === 'energetic' && '⚡ Energético'}
              {gameState.character.mood === 'relaxed' && '😌 Relaxado'}
              {gameState.character.mood === 'stressed' && '😰 Estressado'}
            </div>
          </div>

          {gameState.achievements.length > 0 && (
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className={`text-xs transition-colors duration-300 ${
                isDark ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {gameState.achievements.length} conquista{gameState.achievements.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Time Speed Indicator */}
        {gameState.gameSpeed > 1 && (
          <div className="mt-2 flex items-center justify-center">
            <div className={`px-3 py-1 rounded-full text-xs transition-colors duration-300 ${
              isDark 
                ? 'bg-yellow-500/20 text-yellow-400' 
                : 'bg-yellow-500/20 text-yellow-600'
            }`}>
              <p className={`text-xs font-medium transition-colors duration-300 ${
                isDark ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                ⚡ Velocidade {gameState.gameSpeed}x ativa
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileGameInterface;