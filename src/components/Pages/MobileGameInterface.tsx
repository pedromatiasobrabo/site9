import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Save, RotateCcw, ChevronLeft, ChevronRight, Heart, Zap, Moon, Users, BarChart3, User, ArrowLeft, Tv, Phone, Refrigerator, ChefHat, Bed, Monitor, BookOpen, ShowerHead as Shower, Carrot as Mirror, Dumbbell, Activity, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useProfilePicture } from '../../hooks/useProfilePicture';
import { useGameAudio } from '../../hooks/useGameAudio';

interface MobileGameInterfaceProps {
  onBack: () => void;
}

interface GameState {
  day: number;
  hour: number;
  minute: number;
  currentRoom: number;
  isPlaying: boolean;
  gameSpeed: number;
  score: number;
  factors: {
    health: number;
    energy: number;
    sleep: number;
    social: number;
    productivity: number;
  };
}

interface RoomObject {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  position: { top: string; left: string };
  timeJump: number; // em minutos
  action: {
    question: string;
    effects: {
      health?: number;
      energy?: number;
      sleep?: number;
      social?: number;
      productivity?: number;
    };
    consequence: string;
  };
}

interface Situation {
  id: string;
  day: number;
  hour: number;
  minute: number;
  title: string;
  description: string;
  yesOption: {
    effects: {
      health?: number;
      energy?: number;
      sleep?: number;
      social?: number;
      productivity?: number;
    };
    score: number;
    timeJump?: { hour: number; minute: number; day?: number };
    consequence: string;
  };
  noOption: {
    effects: {
      health?: number;
      energy?: number;
      sleep?: number;
      social?: number;
      productivity?: number;
    };
    score: number;
    timeJump?: { hour: number; minute: number; day?: number };
    consequence: string;
  };
}

const situations: Situation[] = [
  // Primeira semana
  {
    id: 'early_meeting',
    day: 1, // Segunda-feira
    hour: 8,
    minute: 0,
    title: 'Reunião Matinal',
    description: 'Alex acorda e recebe uma mensagem: seu chefe pediu para ele chegar 1h mais cedo no trabalho para uma reunião.',
    yesOption: {
      effects: { productivity: 15, sleep: -20, energy: -10 },
      score: 10,
      timeJump: { hour: 9, minute: 0 },
      consequence: 'Alex chegou cedo, participou da reunião e impressionou o chefe, mas ficou com sono o dia todo.'
    },
    noOption: {
      effects: { productivity: -10 },
      score: -20,
      timeJump: { hour: 8, minute: 0 },
      consequence: 'Alex ignorou a mensagem do chefe e chegou no horário normal. Foi notado negativamente no trabalho.'
    }
  },
  {
    id: 'afternoon_nap',
    day: 2, // Terça-feira
    hour: 16,
    minute: 0,
    title: 'Soneca da Tarde',
    description: 'Alex está exausto. Uma soneca rápida pode ajudar.',
    yesOption: {
      effects: { sleep: 20, energy: 15, productivity: -10 },
      score: 5,
      timeJump: { hour: 17, minute: 0 },
      consequence: 'Alex cochilou e acordou renovado, mas perdeu o ritmo de trabalho.'
    },
    noOption: {
      effects: { sleep: -15, energy: -10, productivity: 10 },
      score: 10,
      timeJump: { hour: 17, minute: 0 },
      consequence: 'Alex resistiu ao cansaço e finalizou todas as suas tarefas.'
    }
  },
  {
    id: 'traffic_walk',
    day: 3, // Quarta-feira
    hour: 18,
    minute: 0,
    title: 'Trânsito Parado',
    description: 'O trânsito está parado e Alex pode escolher entre ir pela rota mais longa a pé ou esperar no carro.',
    yesOption: {
      effects: { health: 10, energy: -15, productivity: 5 },
      score: 5,
      timeJump: { hour: 19, minute: 0 },
      consequence: 'Alex caminhou por quase 1 hora, se exercitou, mas chegou suado e cansado.'
    },
    noOption: {
      effects: { energy: -5, productivity: -5 },
      score: -10,
      timeJump: { hour: 20, minute: 0 },
      consequence: 'Alex ficou preso no trânsito e se estressou, chegando atrasado.'
    }
  },
  {
    id: 'forgotten_lunch',
    day: 4, // Quinta-feira
    hour: 12,
    minute: 0,
    title: 'Almoço Esquecido',
    description: 'Alex esqueceu o almoço em casa. Pode comprar algo rápido na rua.',
    yesOption: {
      effects: { health: -10, energy: 10, productivity: 5 },
      score: 0,
      timeJump: { hour: 13, minute: 0 },
      consequence: 'Alex comeu algo rápido e industrializado, mas voltou ao trabalho com energia.'
    },
    noOption: {
      effects: { health: -20, energy: -20, productivity: -10 },
      score: -10,
      timeJump: { hour: 15, minute: 0 },
      consequence: 'Alex ficou o dia inteiro sem comer e não rendeu nada.'
    }
  },
  {
    id: 'romantic_date',
    day: 5, // Sexta-feira
    hour: 19,
    minute: 0,
    title: 'Encontro Romântico',
    description: 'Alex foi convidado para um encontro romântico com uma colega do trabalho.',
    yesOption: {
      effects: { social: 10, health: -5, sleep: -10, energy: -10 },
      score: 15,
      timeJump: { hour: 23, minute: 0 },
      consequence: 'Alex saiu, se divertiu e terminou a noite com um beijo. Promissor.'
    },
    noOption: {
      effects: { social: -10, energy: 5, productivity: 10 },
      score: 0,
      timeJump: { hour: 21, minute: 0 },
      consequence: 'Alex recusou o encontro e ficou em casa focado nos estudos.'
    }
  },
  {
    id: 'party_invitation',
    day: 6, // Sábado
    hour: 21,
    minute: 0,
    title: 'Festa com Amigos',
    description: 'Alex foi chamado para uma festa com os amigos.',
    yesOption: {
      effects: { social: 20, health: -10, sleep: -25, energy: -20 },
      score: -10,
      timeJump: { hour: 5, minute: 0, day: 7 },
      consequence: 'Alex se divertiu até tarde com os amigos, mas virou a noite.'
    },
    noOption: {
      effects: { social: -10, productivity: 10, sleep: 15 },
      score: 10,
      timeJump: { hour: 6, minute: 0, day: 7 },
      consequence: 'Alex recusou a festa e aproveitou para descansar e colocar a vida em ordem.'
    }
  },
  {
    id: 'family_lunch',
    day: 7, // Domingo
    hour: 11,
    minute: 0,
    title: 'Almoço em Família',
    description: 'Alex pode visitar seus pais para um almoço de família.',
    yesOption: {
      effects: { social: 15, productivity: -5, energy: -10 },
      score: 5,
      timeJump: { hour: 15, minute: 0 },
      consequence: 'Alex teve um almoço agradável com os pais, mas perdeu tempo para tarefas pessoais.'
    },
    noOption: {
      effects: { social: -5, productivity: 10 },
      score: 5,
      timeJump: { hour: 13, minute: 0 },
      consequence: 'Alex decidiu ficar em casa e organizou sua semana.'
    }
  },
  // Segunda semana
  {
    id: 'help_colleague',
    day: 8, // Segunda-feira
    hour: 14,
    minute: 0,
    title: 'Ajuda ao Colega',
    description: 'Um colega de trabalho pediu ajuda para terminar uma tarefa em equipe.',
    yesOption: {
      effects: { productivity: 10, energy: -10, social: 5 },
      score: 5,
      timeJump: { hour: 15, minute: 0 },
      consequence: 'Alex ajudou o colega e foi elogiado por sua colaboração.'
    },
    noOption: {
      effects: { social: -10 },
      score: -5,
      timeJump: { hour: 14, minute: 30 },
      consequence: 'Alex ignorou o pedido e acabou sendo visto como pouco colaborativo.'
    }
  },
  {
    id: 'friend_argument',
    day: 9, // Terça-feira
    hour: 16,
    minute: 0,
    title: 'Briga com Amigo',
    description: 'Alex teve uma discussão séria com seu melhor amigo. Pode tentar resolver ou deixar para depois.',
    yesOption: {
      effects: { social: 15, energy: -10, productivity: -5 },
      score: 10,
      timeJump: { hour: 18, minute: 0 },
      consequence: 'Alex conversou com o amigo, se desculparam mutuamente e a amizade ficou mais forte.'
    },
    noOption: {
      effects: { social: -20, energy: -15 },
      score: -15,
      timeJump: { hour: 16, minute: 30 },
      consequence: 'Alex ignorou o problema e ficou remoendo a briga o resto do dia.'
    }
  },
  {
    id: 'morning_run',
    day: 10, // Quarta-feira
    hour: 6,
    minute: 0,
    title: 'Corrida Matinal',
    description: 'Alex pode acordar cedo e ir correr no parque.',
    yesOption: {
      effects: { health: 20, sleep: -20, energy: 10 },
      score: 10,
      timeJump: { hour: 7, minute: 30 },
      consequence: 'Alex correu 5km e começou o dia com disposição.'
    },
    noOption: {
      effects: { health: -5, sleep: 10 },
      score: 0,
      timeJump: { hour: 8, minute: 0 },
      consequence: 'Alex ficou mais um tempo na cama, mas perdeu a chance de se exercitar.'
    }
  },
  {
    id: 'headache_problem',
    day: 11, // Quinta-feira
    hour: 10,
    minute: 0,
    title: 'Dor de Cabeça',
    description: 'Alex acordou com uma forte dor de cabeça. Pode tomar remédio e descansar ou tentar trabalhar assim mesmo.',
    yesOption: {
      effects: { health: 10, energy: 5, productivity: -10 },
      score: 5,
      timeJump: { hour: 11, minute: 30 },
      consequence: 'Alex tomou remédio e descansou um pouco. A dor passou, mas perdeu tempo de trabalho.'
    },
    noOption: {
      effects: { health: -15, energy: -20, productivity: -15 },
      score: -10,
      timeJump: { hour: 12, minute: 0 },
      consequence: 'Alex tentou trabalhar com dor de cabeça e não conseguiu se concentrar em nada.'
    }
  },
  {
    id: 'impulse_shopping',
    day: 12, // Sexta-feira
    hour: 15,
    minute: 0,
    title: 'Compras por Impulso',
    description: 'Alex viu uma promoção irresistível online. Pode gastar dinheiro em algo que não precisa.',
    yesOption: {
      effects: { social: 5, productivity: -15, energy: -5 },
      score: -15,
      timeJump: { hour: 16, minute: 30 },
      consequence: 'Alex comprou várias coisas desnecessárias e se arrependeu depois.'
    },
    noOption: {
      effects: { productivity: 10, energy: 5 },
      score: 10,
      timeJump: { hour: 15, minute: 30 },
      consequence: 'Alex resistiu à tentação e se sentiu orgulhoso do autocontrole.'
    }
  },
  {
    id: 'weekend_trip',
    day: 13, // Sábado
    hour: 8,
    minute: 0,
    title: 'Viagem Bate-volta',
    description: 'Um amigo convidou Alex para uma viagem bate-volta para a praia no último dia do desafio.',
    yesOption: {
      effects: { social: 25, health: 10, energy: -15, productivity: -20 },
      score: 15,
      timeJump: { hour: 22, minute: 0 },
      consequence: 'Alex foi à praia, se divertiu muito e terminou o desafio com uma experiência incrível.'
    },
    noOption: {
      effects: { social: -10, productivity: 15, sleep: 10 },
      score: 5,
      timeJump: { hour: 10, minute: 0 },
      consequence: 'Alex ficou em casa, organizou tudo para a próxima semana e refletiu sobre o desafio.'
    }
  },
  {
    id: 'movie_night',
    day: 14, // Domingo
    hour: 20,
    minute: 0,
    title: 'Noite de Filme',
    description: 'Alex pode assistir a um filme sozinho para relaxar antes da semana começar.',
    yesOption: {
      effects: { social: 5, sleep: -10, energy: -5 },
      score: 5,
      timeJump: { hour: 22, minute: 0 },
      consequence: 'Alex assistiu a um filme envolvente e terminou o domingo relaxado.'
    },
    noOption: {
      effects: { productivity: 5, sleep: 10 },
      score: 5,
      timeJump: { hour: 5, minute: 0, day: 15 },
      consequence: 'Alex dormiu cedo e se preparou bem para a segunda-feira.'
    }
  }
];

const MobileGameInterface: React.FC<MobileGameInterfaceProps> = ({ onBack }) => {
  const { isDark } = useTheme();
  const { profilePicture, hasProfilePicture } = useProfilePicture();
  const { 
    audioSettings, 
    toggleMute, 
    playButtonSound, 
    playNavigationSound, 
    playRandomConsequenceSound 
  } = useGameAudio();
  
  const [gameState, setGameState] = useState<GameState>({
    day: 1,
    hour: 0,
    minute: 0,
    currentRoom: 0,
    isPlaying: false,
    gameSpeed: 1,
    score: 0,
    factors: {
      health: 50,
      energy: 50,
      sleep: 50,
      social: 50,
      productivity: 50
    }
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [showModal, setShowModal] = useState<{
    isOpen: boolean;
    object: RoomObject | null;
  }>({ isOpen: false, object: null });
  const [showConsequence, setShowConsequence] = useState<string | null>(null);
  const [showPauseScreen, setShowPauseScreen] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  
  // Estados para o sistema de situações
  const [currentSituation, setCurrentSituation] = useState<Situation | null>(null);
  const [triggeredSituations, setTriggeredSituations] = useState<Set<string>>(new Set());
  const [showSituationConsequence, setShowSituationConsequence] = useState<string | null>(null);

  // Carregar jogo salvo ao inicializar
  useEffect(() => {
    const savedGame = localStorage.getItem('dream-story-save');
    if (savedGame) {
      try {
        const parsedGame = JSON.parse(savedGame);
        setGameState(parsedGame.gameState || parsedGame);
        setTriggeredSituations(new Set(parsedGame.triggeredSituations || []));
        setShowWelcomeMessage(false);
      } catch (error) {
        console.error('Erro ao carregar jogo salvo:', error);
      }
    }
  }, []);

  // Função para verificar situações
  const checkForSituations = (day: number, hour: number, minute: number) => {
    const situation = situations.find(s => 
      s.day === day && 
      s.hour === hour && 
      s.minute === minute && 
      !triggeredSituations.has(s.id)
    );

    if (situation) {
      setCurrentSituation(situation);
      setGameState(prev => ({ ...prev, isPlaying: false }));
      setTriggeredSituations(prev => new Set([...prev, situation.id]));
    }
  };

  // Atualizar tempo quando o jogo estiver rodando
  useEffect(() => {
    if (!gameState.isPlaying || showPauseScreen || showWelcomeMessage || currentSituation) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        let newMinute = prev.minute + (5 * prev.gameSpeed);
        let newHour = prev.hour;
        let newDay = prev.day;

        if (newMinute >= 60) {
          newHour += Math.floor(newMinute / 60);
          newMinute = newMinute % 60;
        }

        if (newHour >= 24) {
          newDay += Math.floor(newHour / 24);
          newHour = newHour % 24;
        }

        // Verificar situações após atualizar o tempo
        setTimeout(() => {
          checkForSituations(newDay, newHour, newMinute);
        }, 100);

        // Degradação natural dos fatores
        const newFactors = { ...prev.factors };
        if (newMinute % 30 === 0) {
          newFactors.energy = Math.max(0, newFactors.energy - 1);
          newFactors.sleep = Math.max(0, newFactors.sleep - 0.5);
          if (newHour >= 22 || newHour <= 6) {
            newFactors.health = Math.max(0, newFactors.health - 0.5);
          }
        }

        return {
          ...prev,
          minute: newMinute,
          hour: newHour,
          day: newDay,
          factors: newFactors
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isPlaying, gameState.gameSpeed, showPauseScreen, showWelcomeMessage, currentSituation, triggeredSituations]);

  const rooms = [
    { 
      name: 'Sala', 
      background: 'from-green-500/20 to-emerald-600/20',
      emoji: '🛋️',
      description: 'Relaxe e socialize'
    },
    { 
      name: 'Cozinha', 
      background: 'from-orange-500/20 to-red-600/20',
      emoji: '🍳',
      description: 'Prepare refeições saudáveis'
    },
    { 
      name: 'Quarto', 
      background: 'from-purple-500/20 to-indigo-600/20',
      emoji: '🛏️',
      description: 'Durma e trabalhe'
    },
    { 
      name: 'Banheiro', 
      background: 'from-blue-500/20 to-cyan-600/20',
      emoji: '🚿',
      description: 'Cuide da higiene pessoal'
    },
    { 
      name: 'Academia', 
      background: 'from-gray-500/20 to-slate-600/20',
      emoji: '🏋️‍♂️',
      description: 'Exercite-se e ganhe saúde'
    }
  ];

  const roomObjects: { [key: number]: RoomObject[] } = {
    // Sala
    0: [
      {
        id: 'tv',
        name: 'TV',
        icon: Tv,
        position: { top: '30%', left: '20%' },
        timeJump: 120, // 2 horas
        action: {
          question: 'Assistir TV?',
          effects: { social: 15, productivity: -10, energy: -5 },
          consequence: 'Alex assistiu TV por 2 horas e relaxou, mas perdeu um pouco de produtividade.'
        }
      },
      {
        id: 'phone',
        name: 'Telefone',
        icon: Phone,
        position: { top: '60%', left: '70%' },
        timeJump: 30, // 30 minutos
        action: {
          question: 'Ligar para um amigo?',
          effects: { social: 20, energy: -5, sleep: -5 },
          consequence: 'Alex ligou para um amigo e teve uma conversa agradável por 30 minutos.'
        }
      }
    ],
    // Cozinha
    1: [
      {
        id: 'fridge',
        name: 'Geladeira',
        icon: Refrigerator,
        position: { top: '25%', left: '15%' },
        timeJump: 15, // 15 minutos
        action: {
          question: 'Pegar um lanche saudável?',
          effects: { health: 15, energy: 10, productivity: -5 },
          consequence: 'Alex comeu um lanche saudável rapidamente e se sentiu mais energizado.'
        }
      },
      {
        id: 'stove',
        name: 'Fogão',
        icon: ChefHat,
        position: { top: '50%', left: '75%' },
        timeJump: 90, // 1h30
        action: {
          question: 'Cozinhar uma refeição completa?',
          effects: { productivity: 10, health: 10, energy: -10, social: -5 },
          consequence: 'Alex cozinhou uma refeição deliciosa por 1h30, mas gastou tempo e energia.'
        }
      }
    ],
    // Quarto
    2: [
      {
        id: 'bed',
        name: 'Cama',
        icon: Bed,
        position: { top: '40%', left: '20%' },
        timeJump: 480, // 8 horas
        action: {
          question: 'Dormir um pouco?',
          effects: { sleep: 25, health: 10, energy: 20 },
          consequence: 'Alex dormiu por 8 horas e se sentiu muito mais descansado e energizado.'
        }
      },
      {
        id: 'computer',
        name: 'Computador',
        icon: Monitor,
        position: { top: '30%', left: '70%' },
        timeJump: 120, // 2 horas
        action: {
          question: 'Usar o computador para trabalhar?',
          effects: { productivity: 20, health: -10, social: -10, sleep: -5 },
          consequence: 'Alex trabalhou no computador por 2 horas e foi produtivo, mas se cansou.'
        }
      },
      {
        id: 'books',
        name: 'Estante de Livros',
        icon: BookOpen,
        position: { top: '65%', left: '45%' },
        timeJump: 60, // 1 hora
        action: {
          question: 'Ler por 1 hora?',
          effects: { productivity: 10, energy: -10 },
          consequence: 'Alex leu um livro interessante por 1 hora e aprendeu algo novo.'
        }
      }
    ],
    // Banheiro
    3: [
      {
        id: 'shower',
        name: 'Chuveiro',
        icon: Shower,
        position: { top: '35%', left: '25%' },
        timeJump: 20, // 20 minutos
        action: {
          question: 'Tomar banho?',
          effects: { health: 15, energy: 10, productivity: 5 },
          consequence: 'Alex tomou um banho relaxante de 20 minutos e se sentiu renovado.'
        }
      },
      {
        id: 'mirror',
        name: 'Espelho',
        icon: Mirror,
        position: { top: '25%', left: '70%' },
        timeJump: 15, // 15 minutos
        action: {
          question: 'Se arrumar e cuidar da aparência?',
          effects: { social: 10, energy: -5, productivity: 5 },
          consequence: 'Alex se arrumou por 15 minutos e se sentiu mais confiante para o dia.'
        }
      }
    ],
    // Academia
    4: [
      {
        id: 'treadmill',
        name: 'Esteira',
        icon: Activity,
        position: { top: '30%', left: '20%' },
        timeJump: 30, // 30 minutos
        action: {
          question: 'Correr por 30 minutos?',
          effects: { health: 20, energy: -15, sleep: -10 },
          consequence: 'Alex correu na esteira por 30 minutos e melhorou sua saúde cardiovascular.'
        }
      },
      {
        id: 'weights',
        name: 'Pesos',
        icon: Dumbbell,
        position: { top: '55%', left: '70%' },
        timeJump: 45, // 45 minutos
        action: {
          question: 'Fazer treino de força?',
          effects: { health: 15, productivity: 5, energy: -10 },
          consequence: 'Alex fez um treino de força por 45 minutos e se sentiu mais forte.'
        }
      }
    ]
  };

  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const factors = [
    { key: 'health', name: 'Saúde', icon: Heart, color: 'bg-red-500' },
    { key: 'energy', name: 'Energia', icon: Zap, color: 'bg-yellow-500' },
    { key: 'sleep', name: 'Sono', icon: Moon, color: 'bg-indigo-500' },
    { key: 'social', name: 'Social', icon: Users, color: 'bg-pink-500' },
    { key: 'productivity', name: 'Produtividade', icon: BarChart3, color: 'bg-emerald-500' }
  ];

  const handleRoomChange = (direction: 'prev' | 'next') => {
    if (isTransitioning || showPauseScreen || showWelcomeMessage || currentSituation) return;
    
    playNavigationSound();
    setIsTransitioning(true);
    
    setGameState(prev => ({
      ...prev,
      currentRoom: direction === 'next' 
        ? (prev.currentRoom + 1) % rooms.length
        : (prev.currentRoom - 1 + rooms.length) % rooms.length
    }));

    setTimeout(() => setIsTransitioning(false), 300);
  };

  const togglePlay = () => {
    if (showWelcomeMessage || currentSituation) return;
    
    playButtonSound();
    if (gameState.isPlaying) {
      // Pausar o jogo
      setGameState(prev => ({ ...prev, isPlaying: false }));
      setShowPauseScreen(true);
    } else {
      // Despausar o jogo
      setGameState(prev => ({ ...prev, isPlaying: true }));
      setShowPauseScreen(false);
    }
  };

  const resumeGame = () => {
    playButtonSound();
    setGameState(prev => ({ ...prev, isPlaying: true }));
    setShowPauseScreen(false);
  };

  const saveGame = () => {
    if (showPauseScreen || showWelcomeMessage || currentSituation) return;
    playButtonSound();
    
    // Salvar o estado atual do jogo incluindo situações
    const saveData = {
      gameState,
      triggeredSituations: Array.from(triggeredSituations),
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('dream-story-save', JSON.stringify(saveData));
    
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 2000);
  };

  const handleResetConfirmation = () => {
    if (showPauseScreen || showWelcomeMessage || currentSituation) return;
    playButtonSound();
    setShowResetConfirmation(true);
  };

  const resetGame = () => {
    playButtonSound();
    
    // Limpar jogo salvo
    localStorage.removeItem('dream-story-save');
    
    // Resetar estado para valores iniciais
    setGameState({
      day: 1,
      hour: 0,
      minute: 0,
      currentRoom: 0,
      isPlaying: false,
      gameSpeed: 1,
      score: 0,
      factors: {
        health: 50,
        energy: 50,
        sleep: 50,
        social: 50,
        productivity: 50
      }
    });
    
    setShowPauseScreen(false);
    setShowResetConfirmation(false);
    setShowWelcomeMessage(true);
    setCurrentSituation(null);
    setTriggeredSituations(new Set());
  };

  const cancelReset = () => {
    playButtonSound();
    setShowResetConfirmation(false);
  };

  const setGameSpeed = (speed: number) => {
    if (showPauseScreen || showWelcomeMessage || currentSituation) return;
    playButtonSound();
    setGameState(prev => ({ ...prev, gameSpeed: speed }));
  };

  const handleObjectClick = (object: RoomObject) => {
    if (showPauseScreen || showWelcomeMessage || currentSituation) return;
    
    playNavigationSound();
    
    if (gameState.isPlaying) {
      setGameState(prev => ({ ...prev, isPlaying: false }));
    }
    setShowModal({ isOpen: true, object });
  };

  const addTimeToGame = (minutes: number) => {
    setGameState(prev => {
      let newMinute = prev.minute + minutes;
      let newHour = prev.hour;
      let newDay = prev.day;

      if (newMinute >= 60) {
        newHour += Math.floor(newMinute / 60);
        newMinute = newMinute % 60;
      }

      if (newHour >= 24) {
        newDay += Math.floor(newHour / 24);
        newHour = newHour % 24;
      }

      return {
        ...prev,
        minute: newMinute,
        hour: newHour,
        day: newDay
      };
    });
  };

  const handleActionConfirm = () => {
    if (!showModal.object) return;

    playButtonSound();

    const { effects, consequence } = showModal.object.action;
    const timeJump = showModal.object.timeJump;
    
    // Aplicar pulo de tempo
    addTimeToGame(timeJump);
    
    setGameState(prev => {
      const newFactors = { ...prev.factors };
      let scoreChange = 0;

      Object.entries(effects).forEach(([factor, change]) => {
        if (factor in newFactors) {
          const oldValue = newFactors[factor as keyof typeof newFactors];
          const newValue = Math.max(0, Math.min(100, oldValue + change));
          newFactors[factor as keyof typeof newFactors] = newValue;
          
          // Calcular mudança na pontuação baseada no efeito
          if (change > 0) {
            scoreChange += change * 10;
          } else {
            scoreChange += change * 5;
          }
        }
      });

      return {
        ...prev,
        factors: newFactors,
        score: Math.max(0, prev.score + scoreChange),
        isPlaying: true // Retomar o jogo após a ação
      };
    });

    setShowModal({ isOpen: false, object: null });
    setShowConsequence(consequence);
    
    // Tocar som de consequência
    playRandomConsequenceSound();
    
    setTimeout(() => {
      setShowConsequence(null);
    }, 3000);
  };

  const handleActionCancel = () => {
    playButtonSound();
    setShowModal({ isOpen: false, object: null });
    setGameState(prev => ({ ...prev, isPlaying: true })); // Retomar o jogo
  };

  const handleMuteToggle = () => {
    playButtonSound();
    toggleMute();
  };

  const handleWelcomeStart = () => {
    playButtonSound();
    setShowWelcomeMessage(false);
  };

  // Handlers para situações
  const handleSituationChoice = (choice: 'yes' | 'no') => {
    if (!currentSituation) return;

    playButtonSound();

    const option = choice === 'yes' ? currentSituation.yesOption : currentSituation.noOption;
    
    setGameState(prev => {
      const newFactors = { ...prev.factors };
      
      // Aplicar efeitos
      Object.entries(option.effects).forEach(([factor, change]) => {
        if (factor in newFactors) {
          newFactors[factor as keyof typeof newFactors] = Math.max(0, Math.min(100, 
            newFactors[factor as keyof typeof newFactors] + change
          ));
        }
      });

      // Aplicar salto de tempo se houver
      let newDay = prev.day;
      let newHour = prev.hour;
      let newMinute = prev.minute;

      if (option.timeJump) {
        newHour = option.timeJump.hour;
        newMinute = option.timeJump.minute;
        if (option.timeJump.day) {
          newDay = option.timeJump.day;
        }
      }

      return {
        ...prev,
        factors: newFactors,
        score: prev.score + option.score,
        day: newDay,
        hour: newHour,
        minute: newMinute,
        isPlaying: true // Retomar o jogo automaticamente
      };
    });

    // Mostrar consequência
    setShowSituationConsequence(option.consequence);
    setCurrentSituation(null);
    
    // Tocar som de consequência
    playRandomConsequenceSound();
    
    setTimeout(() => {
      setShowSituationConsequence(null);
    }, 4000);
  };

  const currentRoom = rooms[gameState.currentRoom];
  const currentObjects = roomObjects[gameState.currentRoom] || [];

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  // Modal de Situação
  if (currentSituation) {
    return (
      <div className={`h-screen flex items-center justify-center px-4 transition-colors duration-300 ${
        isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-white via-emerald-50/80 to-emerald-100/60'
      }`}>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-3xl p-6 border-2 transition-all duration-300 transform scale-100 ${
            isDark 
              ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-emerald-500/50 shadow-2xl' 
              : 'bg-gradient-to-br from-white to-emerald-50 border-emerald-400/60 shadow-2xl'
          }`}>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-emerald-900'
              }`}>
                {currentSituation.title}
              </h3>
              <p className={`text-sm leading-relaxed mb-8 transition-colors duration-300 ${
                isDark ? 'text-slate-300' : 'text-emerald-800'
              }`}>
                {currentSituation.description}
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => handleSituationChoice('yes')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  ✅ Sim
                </button>
                <button
                  onClick={() => handleSituationChoice('no')}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 border-2 shadow-lg ${
                    isDark 
                      ? 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white border-slate-600' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-900 border-gray-300'
                  }`}
                >
                  ❌ Não
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal de Boas-vindas
  if (showWelcomeMessage) {
    return (
      <div className={`h-screen flex items-center justify-center px-6 transition-colors duration-300 ${
        isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-white via-emerald-50/80 to-emerald-100/60'
      }`}>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-3xl p-8 border-2 transition-all duration-300 transform scale-100 ${
            isDark 
              ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-emerald-500/50 shadow-2xl' 
              : 'bg-gradient-to-br from-white to-emerald-50 border-emerald-400/60 shadow-2xl'
          }`}>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                <span className="text-4xl">🌙</span>
              </div>
              <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-emerald-900'
              }`}>
                Bem-vindo ao Dream Story!
              </h2>
              <p className={`text-base leading-relaxed mb-8 transition-colors duration-300 ${
                isDark ? 'text-slate-300' : 'text-emerald-800'
              }`}>
                Aqui começa sua jornada rumo ao melhor sono e saúde! Faça boas escolhas e boa sorte!
              </p>
              <button
                onClick={handleWelcomeStart}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                Vamos lá!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal de confirmação de reset
  if (showResetConfirmation) {
    return (
      <div className={`h-screen flex items-center justify-center px-6 transition-colors duration-300 ${
        isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-white via-emerald-50/80 to-emerald-100/60'
      }`}>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-sm w-full rounded-2xl p-6 border-2 transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900 border-slate-700' 
              : 'bg-white border-gray-200 shadow-2xl'
          }`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-red-400" />
              </div>
              <h3 className={`text-lg font-bold mb-3 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Tem certeza que deseja reiniciar o jogo?
              </h3>
              <p className={`text-sm mb-6 transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Todo o progresso atual será perdido e o jogo voltará ao início.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelReset}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={resetGame}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-bold transition-colors"
                >
                  Sim
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-white via-emerald-50/80 to-emerald-100/60'
    }`}>
      
      {/* SEÇÃO SUPERIOR - 15% da altura - Botões maiores */}
      <header className={`h-[15vh] px-3 py-2 border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-900/95 border-slate-800' 
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="h-full flex items-center justify-between">
          
          {/* Lado Esquerdo - Perfil do Alex */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playButtonSound();
                onBack();
              }}
              disabled={showPauseScreen}
              className={`p-3 rounded-full transition-all duration-200 hover:scale-110 min-w-[40px] min-h-[40px] flex items-center justify-center ${
                showPauseScreen 
                  ? 'opacity-50 cursor-not-allowed' 
                  : isDark 
                    ? 'hover:bg-slate-800 text-white' 
                    : 'hover:bg-gray-100 text-gray-900'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500/30">
              {hasProfilePicture ? (
                <img
                  src={profilePicture!}
                  alt="Alex"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-emerald-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            <div className="text-left">
              <div className={`text-sm font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Alex
              </div>
              <div className={`text-xs transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                {weekDays[(gameState.day - 1) % 7]}
              </div>
            </div>
          </div>

          {/* Centro - Controles do Jogo - Botões maiores */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              {/* Botão de Salvar - Maior */}
              <button
                onClick={saveGame}
                disabled={showPauseScreen || showWelcomeMessage || currentSituation}
                className={`p-3 rounded-full transition-all duration-200 hover:scale-110 min-w-[40px] min-h-[40px] flex items-center justify-center ${
                  showPauseScreen || showWelcomeMessage || currentSituation
                    ? 'opacity-50 cursor-not-allowed' 
                    : isDark 
                      ? 'hover:bg-slate-800 text-emerald-400' 
                      : 'hover:bg-gray-100 text-emerald-600'
                }`}
                title="Salvar Progresso"
              >
                <Save className="w-5 h-5" />
              </button>

              {/* Botão Play/Pause - Maior */}
              <button
                onClick={togglePlay}
                disabled={showWelcomeMessage || currentSituation}
                className={`p-3 rounded-full transition-all duration-200 hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center ${
                  showWelcomeMessage || currentSituation
                    ? 'opacity-50 cursor-not-allowed bg-gray-400'
                    : gameState.isPlaying && !showPauseScreen
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {gameState.isPlaying && !showPauseScreen ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              {/* Botão de Reset - Maior */}
              <button
                onClick={handleResetConfirmation}
                disabled={showPauseScreen || showWelcomeMessage || currentSituation}
                className={`p-3 rounded-full transition-all duration-200 hover:scale-110 min-w-[40px] min-h-[40px] flex items-center justify-center ${
                  showPauseScreen || showWelcomeMessage || currentSituation
                    ? 'opacity-50 cursor-not-allowed' 
                    : isDark 
                      ? 'hover:bg-slate-800 text-orange-400' 
                      : 'hover:bg-gray-100 text-orange-600'
                }`}
                title="Reiniciar Jogo"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Botão de Mute - Maior */}
              <button
                onClick={handleMuteToggle}
                className={`p-3 rounded-full transition-all duration-200 hover:scale-110 min-w-[40px] min-h-[40px] flex items-center justify-center ${
                  isDark 
                    ? 'hover:bg-slate-800 text-blue-400' 
                    : 'hover:bg-gray-100 text-blue-600'
                }`}
                title={audioSettings.isMuted ? "Ativar Som" : "Mutar Som"}
              >
                {audioSettings.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Pontuação e Tempo */}
            <div className="text-center">
              <div className={`text-xs font-mono transition-colors duration-300 ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                {formatTime(gameState.hour, gameState.minute)}
              </div>
              <div className={`text-xs font-bold transition-colors duration-300 ${
                isDark ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                {gameState.score.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Lado Direito - Velocidade - Botões maiores */}
          <div className="flex items-center gap-1">
            {[1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setGameSpeed(speed)}
                disabled={showPauseScreen || showWelcomeMessage || currentSituation}
                className={`px-3 py-2 rounded text-xs font-bold transition-all duration-200 min-w-[36px] min-h-[36px] flex items-center justify-center ${
                  showPauseScreen || showWelcomeMessage || currentSituation
                    ? 'opacity-50 cursor-not-allowed' 
                    : gameState.gameSpeed === speed
                      ? 'bg-emerald-500 text-white'
                      : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* SEÇÃO DO MEIO - 65% da altura */}
      <main className="h-[65vh] relative overflow-hidden">
        
        {/* Tela de Pausa */}
        {showPauseScreen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`max-w-sm w-full rounded-2xl p-8 border-2 transition-all duration-300 ${
              isDark 
                ? 'bg-slate-900 border-slate-700' 
                : 'bg-white border-gray-200 shadow-2xl'
            }`}>
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  isDark ? 'bg-slate-800' : 'bg-gray-100'
                }`}>
                  <Pause className="w-10 h-10 text-orange-500" />
                </div>
                <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Jogo Pausado
                </h2>
                <p className={`text-sm mb-8 transition-colors duration-300 ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Deseja voltar ao jogo?
                </p>
                <button
                  onClick={resumeGame}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Continuar Jogo
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Cenário do Cômodo */}
        <div className={`h-full relative transition-all duration-300 ${
          isTransitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
        } ${showPauseScreen || currentSituation ? 'pointer-events-none' : ''}`}>
          <div className={`h-full bg-gradient-to-br ${currentRoom.background} flex flex-col items-center justify-center relative ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            
            {/* Emoji do Cômodo */}
            <div className="text-6xl mb-3 animate-pulse">
              {currentRoom.emoji}
            </div>
            
            {/* Nome do Cômodo */}
            <h2 className="text-xl font-bold mb-2">
              {currentRoom.name}
            </h2>
            
            {/* Descrição */}
            <p className={`text-sm text-center px-4 mb-4 transition-colors duration-300 ${
              isDark ? 'text-slate-300' : 'text-gray-700'
            }`}>
              {currentRoom.description}
            </p>

            {/* Objetos Interativos */}
            {currentObjects.map((object) => {
              const IconComponent = object.icon;
              return (
                <button
                  key={object.id}
                  onClick={() => handleObjectClick(object)}
                  disabled={showPauseScreen || currentSituation}
                  className={`absolute p-3 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 border-2 min-w-[48px] min-h-[48px] flex items-center justify-center ${
                    showPauseScreen || currentSituation
                      ? 'opacity-50 cursor-not-allowed' 
                      : isDark 
                        ? 'bg-slate-800/80 hover:bg-slate-700 text-white border-slate-600 hover:border-slate-500' 
                        : 'bg-white/90 hover:bg-gray-100 text-gray-900 border-gray-200 hover:border-gray-300 shadow-lg'
                  }`}
                  style={{ 
                    top: object.position.top, 
                    left: object.position.left,
                    transform: 'translate(-50%, -50%)'
                  }}
                  title={object.name}
                >
                  <IconComponent className="w-6 h-6" />
                </button>
              );
            })}

            {/* Indicador de Cômodo */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {rooms.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === gameState.currentRoom
                      ? 'bg-emerald-500 w-6'
                      : isDark
                        ? 'bg-slate-600'
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Setas de Navegação - Maiores */}
        <button
          onClick={() => handleRoomChange('prev')}
          disabled={isTransitioning || showPauseScreen || currentSituation}
          className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-4 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 min-w-[56px] min-h-[56px] flex items-center justify-center ${
            isDark 
              ? 'bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700' 
              : 'bg-white/90 hover:bg-gray-100 text-gray-900 border border-gray-200 shadow-lg'
          } ${(isTransitioning || showPauseScreen || currentSituation) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
        
        <button
          onClick={() => handleRoomChange('next')}
          disabled={isTransitioning || showPauseScreen || currentSituation}
          className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-4 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 min-w-[56px] min-h-[56px] flex items-center justify-center ${
            isDark 
              ? 'bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700' 
              : 'bg-white/90 hover:bg-gray-100 text-gray-900 border border-gray-200 shadow-lg'
          } ${(isTransitioning || showPauseScreen || currentSituation) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      </main>

      {/* SEÇÃO INFERIOR - 20% da altura - FATORES HORIZONTAIS */}
      <footer className={`h-[20vh] px-4 py-3 border-t transition-colors duration-300 ${
        isDark 
          ? 'bg-slate-900/95 border-slate-800' 
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="h-full flex flex-col justify-between">
          {/* Fatores */}
          <div className="flex-1">
            <h3 className={`text-sm font-bold mb-2 text-center transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Status de Alex
            </h3>
            
            {/* Grid de Fatores - 2 linhas, otimizado para mobile */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {factors.slice(0, 3).map((factor) => {
                const value = gameState.factors[factor.key as keyof typeof gameState.factors];
                const IconComponent = factor.icon;
                
                return (
                  <div key={factor.key} className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                      isDark ? 'bg-slate-800' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`w-3 h-3 ${
                        value >= 70 ? 'text-green-500' :
                        value >= 40 ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                    </div>
                    
                    <div className="w-full">
                      <div className={`h-1.5 rounded-full mb-1 transition-colors duration-300 ${
                        isDark ? 'bg-slate-800' : 'bg-gray-200'
                      }`}>
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            value >= 70 ? 'bg-green-500' :
                            value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium transition-colors duration-300 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {factor.name}
                        </span>
                        <span className={`text-xs font-bold transition-colors duration-300 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {Math.round(value)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Segunda linha com 2 fatores centralizados */}
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              {factors.slice(3, 5).map((factor) => {
                const value = gameState.factors[factor.key as keyof typeof gameState.factors];
                const IconComponent = factor.icon;
                
                return (
                  <div key={factor.key} className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                      isDark ? 'bg-slate-800' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`w-3 h-3 ${
                        value >= 70 ? 'text-green-500' :
                        value >= 40 ? 'text-yellow-500' : 'text-red-500'
                      }`} />
                    </div>
                    
                    <div className="w-full">
                      <div className={`h-1.5 rounded-full mb-1 transition-colors duration-300 ${
                        isDark ? 'bg-slate-800' : 'bg-gray-200'
                      }`}>
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            value >= 70 ? 'bg-green-500' :
                            value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium transition-colors duration-300 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {factor.name}
                        </span>
                        <span className={`text-xs font-bold transition-colors duration-300 ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {Math.round(value)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Ação */}
      {showModal.isOpen && showModal.object && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`max-w-sm w-full rounded-2xl p-6 border-2 transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900 border-slate-700' 
              : 'bg-white border-gray-200 shadow-2xl'
          }`}>
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isDark ? 'bg-slate-800' : 'bg-gray-100'
              }`}>
                <showModal.object.icon className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {showModal.object.action.question}
              </h3>
              <p className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Tempo necessário: {showModal.object.timeJump >= 60 
                  ? `${Math.floor(showModal.object.timeJump / 60)}h${showModal.object.timeJump % 60 > 0 ? ` ${showModal.object.timeJump % 60}min` : ''}`
                  : `${showModal.object.timeJump}min`
                }
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleActionCancel}
                className={`flex-1 py-3 px-4 rounded-xl font-bold transition-colors ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Não
              </button>
              <button
                onClick={handleActionConfirm}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl font-bold transition-colors"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de Consequência de Objetos */}
      {showConsequence && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className={`max-w-xs p-4 rounded-xl shadow-lg transition-all duration-300 ${
            isDark ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white text-gray-900 border border-gray-200'
          }`}>
            <p className="text-sm text-center">{showConsequence}</p>
          </div>
        </div>
      )}

      {/* Mensagem de Consequência de Situações */}
      {showSituationConsequence && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className={`max-w-sm p-6 rounded-2xl shadow-2xl transition-all duration-300 border-2 ${
            isDark 
              ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border-emerald-500/50' 
              : 'bg-gradient-to-br from-white to-emerald-50 text-gray-900 border-emerald-400/60'
          }`}>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📖</span>
              </div>
              <p className="text-sm text-center leading-relaxed">{showSituationConsequence}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de Save */}
      {showSaveMessage && (
        <div className="fixed top-20 right-4 z-50">
          <div className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
            isDark ? 'bg-emerald-600 text-white' : 'bg-emerald-500 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span className="text-sm font-medium">Jogo salvo!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileGameInterface;