import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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

          <div className="mt-6 text-center">
            <button
              onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setStep('email'); setPassword(''); }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === 'signup' ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
