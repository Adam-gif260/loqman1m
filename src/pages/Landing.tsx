import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Zap, Eye, Users, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.png';

const features = [
  { icon: Code2, title: "IA Expert Code", desc: "Génère +3000 lignes de code oneshot parfait" },
  { icon: Eye, title: "Preview Temps Réel", desc: "Voyez votre création prendre vie instantanément" },
  { icon: Zap, title: "Ultra Performant", desc: "Propulsé par Gemini Pro, l'IA la plus avancée" },
  { icon: Users, title: "Collaboration", desc: "Travaillez en équipe avec crédits partagés" },
  { icon: Shield, title: "Backend Intégré", desc: "Base de données, auth, storage automatiques" },
  { icon: Sparkles, title: "No-Code", desc: "Décrivez, l'IA construit. Zéro connaissance requise" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-subtle border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="NexCode" className="w-8 h-8" />
            <span className="text-lg font-display font-bold text-gradient">NexCode</span>
          </Link>
          <button
            onClick={() => navigate(user ? '/chat' : '/auth')}
            className="px-5 py-2 bg-gradient-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            {user ? 'Ouvrir App' : 'Commencer Gratuitement'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-primary mb-6">
                <Zap size={12} />
                Propulsé par Gemini Pro
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
                Créez des apps{' '}
                <span className="text-gradient">sans coder</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Décrivez votre projet, notre IA génère le code parfait instantanément.
                Preview en temps réel, backend intégré, publication en un clic.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <button
                  onClick={() => navigate(user ? '/chat' : '/auth')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-glow"
                >
                  Commencer Gratuitement
                  <ArrowRight size={18} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">15 crédits offerts • Sans carte bancaire</p>
            </motion.div>

            {/* Demo Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="glass rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-sidebar/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-accent/60" />
                    <div className="w-3 h-3 rounded-full bg-primary/60" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">NexCode — AI Workspace</span>
                </div>
                <div className="grid grid-cols-2 h-72">
                  <div className="p-4 border-r border-border/50 flex flex-col">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex-shrink-0" />
                        <div className="glass rounded-lg p-2.5 text-xs text-foreground">
                          Crée-moi un portfolio moderne avec animations
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent/50 flex-shrink-0" />
                        <div className="glass rounded-lg p-2.5 text-xs text-muted-foreground">
                          Je crée votre portfolio avec des animations fluides...
                        </div>
                      </div>
                    </div>
                    <div className="glass rounded-lg p-2 text-xs text-muted-foreground/50">
                      Décrivez votre projet...
                    </div>
                  </div>
                  <div className="p-4 flex flex-col">
                    <div className="flex gap-2 mb-3">
                      <span className="text-xs font-medium text-primary px-2 py-0.5 glass rounded">Preview</span>
                      <span className="text-xs text-muted-foreground px-2 py-0.5">Code</span>
                    </div>
                    <div className="flex-1 glass rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Eye size={24} className="text-primary/40 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Preview en temps réel</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-muted-foreground text-lg">Une plateforme complète pour créer sans limites</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 glass rounded-xl hover:border-primary/30 transition-all cursor-default"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon size={20} className="text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-subtle">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Tarifs simples</h2>
            <p className="text-muted-foreground text-lg">Commencez gratuitement, évoluez à votre rythme</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Starter', price: 16, credits: '100 crédits/mois', link: 'https://buy.stripe.com/dRmeV63qgdUU4Q2bHrdnW00' },
              { name: 'Pro', price: 30, credits: '300 crédits/mois', link: 'https://buy.stripe.com/8x2fZaf8Y2ccdmydPzdnW01', popular: true },
              { name: 'Business', price: 75, credits: '1000 crédits/mois', link: 'https://buy.stripe.com/4gM8wI1i82ccgyK8vfdnW02' },
            ].map((plan) => (
              <div key={plan.name} className={`glass rounded-xl p-6 relative ${plan.popular ? 'border-primary/50 shadow-glow' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-primary rounded-full text-xs font-medium text-primary-foreground">
                    Populaire
                  </div>
                )}
                <h3 className="font-display font-semibold text-foreground text-lg mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-display font-bold text-foreground">{plan.price}€</span>
                  <span className="text-sm text-muted-foreground">/mois</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.credits}</p>
                <a
                  href={plan.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full py-2.5 text-center rounded-lg font-medium transition-opacity hover:opacity-90 ${
                    plan.popular
                      ? 'bg-gradient-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Choisir {plan.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="NexCode" className="w-6 h-6" />
            <span className="text-sm font-display font-semibold text-gradient">NexCode</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 NexCode. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
