import React, { useState } from 'react';
import { LogoIcon, CheckCircleIcon } from '../components/Icons';
import { supabase } from '../supabaseClient';

interface OnboardingScreenProps {
  onFinish: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(false); // Toggle between Signup and Login
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStep = () => setStep((prev) => prev + 1);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split('@')[0], // Default name from email
            },
          },
        });
        if (error) throw error;
      }
      onFinish(); // Proceed to app on success
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const WelcomeStep = () => (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-light dark:bg-dark-bg">
      <div className="w-full max-w-md">
        <LogoIcon className="w-32 h-32 text-primary-500 mb-8 mx-auto" />
        <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-3">Bienvenue sur doxamy</h1>
        <p className="text-lg text-text-secondary dark:text-text-muted mb-12">Votre Avenir Financier en Main.</p>
        <button
          onClick={nextStep}
          className="btn-primary w-full"
        >
          Commencer
        </button>
      </div>
    </div>
  );

  const FeatureStep = () => (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-light dark:bg-dark-bg">
      <div className="w-full max-w-md">
        <div className="w-28 h-28 bg-primary-500/10 rounded-full flex items-center justify-center mb-8 mx-auto">
          <CheckCircleIcon className="w-14 h-14 text-primary-500" />
        </div>
        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">Prédiction Intelligente</h2>
        <p className="text-lg text-text-secondary dark:text-text-muted mb-12">
          Anticipez vos finances et ne soyez jamais pris au dépourvu.
        </p>
        <button
          onClick={nextStep}
          className="btn-primary w-full"
        >
          Continuer
        </button>
      </div>
    </div>
  );

  const AuthStep = () => (
    <div className="flex flex-col justify-center min-h-screen p-8 bg-light dark:bg-dark-bg">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <LogoIcon className="w-20 h-20 text-primary-500 mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
            {isLogin ? 'Bon retour !' : 'Créez votre compte'}
          </h2>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-xl relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleAuth}>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              className="input-modern mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="********"
              className="input-modern mt-1"
            />
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`w-full font-semibold py-3 px-6 rounded-xl transition-all duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white shadow-md hover:shadow-lg'}`}
            >
              {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'Créer un compte')}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-text-secondary dark:text-text-muted mt-6">
          {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="font-semibold text-primary-600 dark:text-primary-400 hover:underline ml-1"
          >
            {isLogin ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0: return <WelcomeStep />;
      case 1: return <FeatureStep />;
      case 2: return <AuthStep />;
      default: return <WelcomeStep />;
    }
  };

  return <div className="h-full w-full">{renderStep()}</div>;
};

export default OnboardingScreen;