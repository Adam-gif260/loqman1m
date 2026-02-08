import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { lovable } from '@/integrations/lovable/index';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

export default function Auth() {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasNumber;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) { toast.error("Email invalide"); return; }
    if (mode === 'signup') {
      setStep('password');
    } else {
      setStep('password');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid && mode === 'signup') { toast.error("Mot de passe invalide"); return; }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message?.includes('already registered')) {
            toast.error("Cet email est déjà utilisé");
          } else {
            toast.error(error.message || "Erreur lors de l'inscription");
          }
        } else {
          navigate('/verify-email', { state: { email } });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error("Email ou mot de passe incorrect");
        } else {
          navigate('/chat');
        }
      }
    } catch { toast.error("Une erreur est survenue"); }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast.error("Erreur lors de la connexion Google");
      }
    } catch {
      toast.error("Une erreur est survenue");
    }
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <img src={logo} alt="NexCode" className="w-10 h-10" />
          <span className="text-2xl font-display font-bold text-gradient">NexCode</span>
        </Link>

        <div className="glass rounded-xl p-8">
          <h2 className="text-xl font-display font-semibold text-foreground text-center mb-6">
            {mode === 'signup' ? "Créer un compte" : "Se connecter"}
          </h2>

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 bg-secondary rounded-lg text-foreground border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!isEmailValid}
                className="w-full py-3 bg-gradient-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {mode === 'signup' ? "S'inscrire" : "Continuer"}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-3 bg-muted rounded-lg text-muted-foreground border border-border cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="w-full px-4 py-3 pr-12 bg-secondary rounded-lg text-foreground border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <div className="mt-3 space-y-1.5 text-sm">
                    <p className="text-muted-foreground text-xs mb-2">Le mot de passe doit contenir :</p>
                    <div className="flex items-center gap-2">
                      {hasMinLength ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-muted-foreground" />}
                      <span className={hasMinLength ? "text-green-500" : "text-muted-foreground"}>Au moins 8 caractères</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasNumber ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-muted-foreground" />}
                      <span className={hasNumber ? "text-green-500" : "text-muted-foreground"}>Un chiffre (0-9)</span>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || (mode === 'signup' && !isPasswordValid)}
                className="w-full py-3 bg-gradient-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {mode === 'signup' ? "Créer mon compte" : "Se connecter"}
              </button>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Changer d'email
              </button>
            </form>
          )}

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-lg border border-border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
              )}
              Continuer avec Google
            </button>

            <div className="text-center">
              <button
                onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setStep('email'); setPassword(''); }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {mode === 'signup' ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
