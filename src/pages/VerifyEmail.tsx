import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ExternalLink } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function VerifyEmail() {
  const location = useLocation();
  const email = location.state?.email || '';

  const getMailProvider = () => {
    if (email.includes('gmail')) return { name: 'Gmail', url: 'https://mail.google.com' };
    if (email.includes('outlook') || email.includes('hotmail') || email.includes('live')) return { name: 'Outlook', url: 'https://outlook.live.com' };
    if (email.includes('yahoo')) return { name: 'Yahoo', url: 'https://mail.yahoo.com' };
    return null;
  };

  const provider = getMailProvider();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <img src={logo} alt="NexCode" className="w-10 h-10" />
          <span className="text-2xl font-display font-bold text-gradient">NexCode</span>
        </Link>

        <div className="glass rounded-xl p-8 space-y-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <Mail size={28} className="text-primary-foreground" />
          </div>

          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-2">
              Vérifiez votre boîte mail
            </h2>
            <p className="text-muted-foreground text-sm">
              Nous avons envoyé un lien de confirmation à{' '}
              <span className="text-foreground font-medium">{email}</span>.
              <br />Cliquez sur le lien pour activer votre compte.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {['Gmail', 'Outlook', 'Yahoo'].map((name) => {
              const urls: Record<string, string> = {
                Gmail: 'https://mail.google.com',
                Outlook: 'https://outlook.live.com',
                Yahoo: 'https://mail.yahoo.com',
              };
              return (
                <a
                  key={name}
                  href={urls[name]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-secondary/80 rounded-lg text-sm text-foreground transition-colors"
                >
                  <ExternalLink size={14} />
                  Ouvrir {name}
                </a>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">
              Vous ne trouvez pas l'email ? Vérifiez vos spams.
            </p>
            <Link
              to="/auth"
              className="text-sm text-primary hover:underline"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
