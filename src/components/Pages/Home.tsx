import React from 'react';
import { Moon, Star, Shield, User, Play, X } from 'lucide-react';
import Carousel from '../UI/Carousel';
import QuotesCarousel from '../UI/QuotesCarousel';
import { modules } from '../../data/modules';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useProfilePicture } from '../../hooks/useProfilePicture';

interface HomeProps {
  onSelectModule: (moduleId: string, lessonIndex?: number) => void;
}

const Home: React.FC<HomeProps> = ({ onSelectModule }) => {
  const { isDark } = useTheme();
  const { isReturningUser } = useAuth();
  const { profilePicture, hasProfilePicture } = useProfilePicture();
  const [showWelcomePopup, setShowWelcomePopup] = React.useState(false);

  // Show welcome popup for returning users
  React.useEffect(() => {
    if (isReturningUser()) {
      const timer = setTimeout(() => {
        setShowWelcomePopup(true);
      }, 800); // Show after 800ms for better UX

      return () => clearTimeout(timer);
    }
  }, [isReturningUser]);

  const handleCloseWelcomePopup = () => {
    setShowWelcomePopup(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 relative ${
      isDark 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950' 
        : 'bg-gradient-to-br from-white via-emerald-50/80 to-emerald-100/60'
    }`}>
      {/* Welcome Back Popup */}
      {showWelcomePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleCloseWelcomePopup}
          />
          
          {/* Popup Content */}
          <div className={`relative max-w-sm w-full rounded-2xl p-6 border shadow-2xl transform transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900/95 border-slate-700' 
              : 'bg-white/95 border-emerald-200/50 shadow-emerald-500/10'
          }`}>
            {/* Close Button */}
            <button
              onClick={handleCloseWelcomePopup}
              className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${
                isDark 
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Picture and Content */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-md flex-shrink-0">
                {hasProfilePicture ? (
                  <img
                    src={profilePicture!}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-bold mb-1 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-emerald-900'
                }`}>
                  🌟 Bem-vindo de volta!
                </h3>
                <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                  isDark ? 'text-slate-300' : 'text-emerald-700'
                }`}>
                  Continue sua jornada para um sono perfeito. Suas técnicas militares te esperam!
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleCloseWelcomePopup}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Continuar Jornada
            </button>
          </div>
        </div>
      )}

      {/* Container with max width for larger screens */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="relative py-8 lg:py-12 text-center">
          <div className={`absolute inset-0 transition-colors duration-300 ${
            isDark 
              ? 'bg-gradient-to-b from-emerald-900/20 to-transparent' 
              : 'bg-gradient-to-b from-emerald-200/30 to-transparent'
          }`} />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8 lg:w-10 lg:h-10 text-emerald-400" />
              <h1 className={`text-2xl lg:text-4xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-emerald-900'
              }`}>Sleep Protocol</h1>
            </div>
            <p className={`text-lg lg:text-xl font-medium transition-colors duration-300 ${
              isDark ? 'text-slate-300' : 'text-emerald-800'
            }`}>
              Desafio de 7 Dias para Criar uma
            </p>
            <p className={`text-xl lg:text-2xl font-bold transition-colors duration-300 ${
              isDark ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              Rotina de Sono Saudável
            </p>
          </div>
        </header>

        {/* Main Content Grid - Responsive layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column - Stats and Quotes */}
          <div className="lg:col-span-4 space-y-8">
            {/* Stats Section */}
            <section>
              <div className="grid grid-cols-3 gap-4">
                <div className={`backdrop-blur-sm rounded-xl p-4 lg:p-6 text-center border transition-colors duration-300 ${
                  isDark 
                    ? 'bg-slate-900/50 border-slate-800' 
                    : 'bg-white/70 border-emerald-200/50 shadow-sm'
                }`}>
                  <Moon className={`w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 transition-colors duration-300 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                  }`} />
                  <div className={`text-2xl lg:text-3xl font-bold mb-1 transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-emerald-900'
                  }`}>7</div>
                  <div className={`text-xs lg:text-sm transition-colors duration-300 ${
                    isDark ? 'text-slate-400' : 'text-emerald-700'
                  }`}>Dias</div>
                </div>
                <div className={`backdrop-blur-sm rounded-xl p-4 lg:p-6 text-center border transition-colors duration-300 ${
                  isDark 
                    ? 'bg-slate-900/50 border-slate-800' 
                    : 'bg-white/70 border-emerald-200/50 shadow-sm'
                }`}>
                  <Star className={`w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 transition-colors duration-300 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                  }`} />
                  <div className={`text-2xl lg:text-3xl font-bold mb-1 transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-emerald-900'
                  }`}>15</div>
                  <div className={`text-xs lg:text-sm transition-colors duration-300 ${
                    isDark ? 'text-slate-400' : 'text-emerald-700'
                  }`}>Aulas</div>
                </div>
                <div className={`backdrop-blur-sm rounded-xl p-4 lg:p-6 text-center border transition-colors duration-300 ${
                  isDark 
                    ? 'bg-slate-900/50 border-slate-800' 
                    : 'bg-white/70 border-emerald-200/50 shadow-sm'
                }`}>
                  <Shield className={`w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 transition-colors duration-300 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                  }`} />
                  <div className={`text-2xl lg:text-3xl font-bold mb-1 transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-emerald-900'
                  }`}>2min</div>
                  <div className={`text-xs lg:text-sm transition-colors duration-300 ${
                    isDark ? 'text-slate-400' : 'text-emerald-700'
                  }`}>Técnica</div>
                </div>
              </div>
            </section>

            {/* Featured Quotes Carousel */}
            <section>
              <QuotesCarousel />
            </section>

            {/* CTA Section */}
            <section className="hidden lg:block">
              <div className={`border rounded-2xl p-6 text-center transition-colors duration-300 ${
                isDark 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-gradient-to-br from-emerald-100/80 to-emerald-200/60 border-emerald-300/50 shadow-sm'
              }`}>
                <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-emerald-900'
                }`}>
                  {isReturningUser() && "Continue sua Jornada"}
                </h3>
                <p className={`text-sm mb-4 transition-colors duration-300 ${
                  isDark ? 'text-slate-300' : 'text-emerald-800'
                }`}>
                  Transforme suas noites e desperte com mais energia e disposição.
                </p>
                <div className={`flex items-center justify-center gap-1 text-sm font-medium transition-colors duration-300 ${
                  isDark ? 'text-emerald-400' : 'text-emerald-600'
                }`}>
                  <Star className="w-4 h-4" />
                  <span>Método comprovado cientificamente</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Modules */}
          <div className="lg:col-span-8">
            <section>
              <h2 className={`text-xl lg:text-2xl font-bold mb-6 text-center lg:text-left transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-emerald-900'
              }`}>
                Escolha seu Módulo
              </h2>
              
              {/* Desktop Grid Layout */}
              <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    onClick={() => onSelectModule(module.id)}
                    className={`relative rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer ${
                      isDark 
                        ? 'bg-slate-900 hover:shadow-emerald-500/20' 
                        : 'bg-white/80 hover:shadow-emerald-500/20 border border-emerald-200/30'
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectModule(module.id);
                      }
                    }}
                    aria-label={`Acessar módulo: ${module.title}`}
                  >
                    <div className="aspect-[4/3] relative">
                      <img
                        src={module.coverImage}
                        alt={module.title}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute inset-0 ${
                        isDark 
                          ? 'bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent' 
                          : 'bg-gradient-to-t from-white via-white/70 to-transparent'
                      }`} />
                      
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className={`text-lg font-bold mb-2 line-clamp-2 transition-colors duration-300 ${
                        isDark ? 'text-white' : 'text-emerald-900'
                      }`}>{module.title}</h3>
                      <p className={`text-sm mb-3 line-clamp-2 transition-colors duration-300 ${
                        isDark ? 'text-slate-300' : 'text-emerald-700'
                      }`}>{module.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className={`text-xs transition-colors duration-300 ${
                          isDark ? 'text-slate-400' : 'text-emerald-600'
                        }`}>
                          {module.lessons.length} aulas • ~45 min
                        </div>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectModule(module.id);
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full font-bold text-sm transition-colors duration-200"
                        >
                          Acessar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Carousel */}
              <div className="lg:hidden">
                <Carousel modules={modules} onSelectModule={(moduleId) => onSelectModule(moduleId)} />
              </div>
            </section>
          </div>
        </div>

        {/* Mobile CTA Section */}
        <section className="lg:hidden mt-8 mb-8">
          <div className={`border rounded-2xl p-6 text-center max-w-md mx-auto transition-colors duration-300 ${
            isDark 
              ? 'bg-emerald-500/10 border-emerald-500/30' 
              : 'bg-gradient-to-br from-emerald-100/80 to-emerald-200/60 border-emerald-300/50 shadow-sm'
          }`}>
            <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-emerald-900'
            }`}>
              Comece sua Jornada Hoje
            </h3>
            <p className={`text-sm mb-4 transition-colors duration-300 ${
              isDark ? 'text-slate-300' : 'text-emerald-800'
            }`}>
              Transforme suas noites e desperte com mais energia e disposição.
            </p>
            <div className={`flex items-center justify-center gap-1 text-sm font-medium transition-colors duration-300 ${
              isDark ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              <Star className="w-4 h-4" />
              <span>Método comprovado cientificamente</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;