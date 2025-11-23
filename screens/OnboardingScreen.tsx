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
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-light dark:bg-gray-900">
      <div className="w-full max-w-md">
        <LogoIcon className="w-24 h-24 text-primary mb-6 mx-auto" />
        <h1 className="text-3xl font-bold text-dark dark:text-light mb-2">Bienvenue sur doxamy</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12">Votre Avenir Financier en Main.</p>
        <button
          onClick={nextStep}
          className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Commencer
        </button>
      </div>
    </div>
  );

  const FeatureStep = () => (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-light dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
          <CheckCircleIcon className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-dark dark:text-light mb-4">Prédiction Intelligente</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-12">
          Anticipez vos finances et ne soyez jamais pris au dépourvu.
        </p>
        <button
          onClick={nextStep}
          className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Continuer
        </button>
      </div>
    </div>
  );

  const AuthStep = () => (
    <div className="flex flex-col justify-center min-h-screen p-8 bg-light dark:bg-gray-900">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <LogoIcon className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark dark:text-light">
            {isLogin ? 'Bon retour !' : 'Créez votre compte'}
          </h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleAuth}>
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
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary text-dark dark:text-light"
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
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary text-dark dark:text-light"
            />
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors mb-4 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondary hover:bg-green-600'}`}
            >
              {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'Créer un compte')}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="font-medium text-primary hover:underline ml-1"
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