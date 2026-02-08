import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Zap, Eye, Users, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.png';
const features = [{
  icon: Code2,
  title: "IA Expert Code",
  desc: "Génère +3000 lignes de code oneshot parfait"
}, {
  icon: Eye,
  title: "Preview Temps Réel",
  desc: "Voyez votre création prendre vie instantanément"
}, {
  icon: Zap,
  title: "Ultra Performant",
  desc: "Propulsé par Gemini Pro, l'IA la plus avancée"
}, {
  icon: Users,
  title: "Collaboration",
  desc: "Travaillez en équipe avec crédits partagés"
}, {
  icon: Shield,
  title: "Backend Intégré",
  desc: "Base de données, auth, storage automatiques"
}, {
  icon: Sparkles,
  title: "No-Code",
  desc: "Décrivez, l'IA construit. Zéro connaissance requise"
}];
export default function Landing() {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  return <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-subtle border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="NexCode" className="w-8 h-8" />
            <span className="text-lg font-display font-bold text-gradient">NexCode</span>
          </Link>
          <button onClick={() => navigate(user ? '/chat' : '/auth')} className="px-5 py-2 bg-gradient-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
            {user ? 'Ouvrir App' : 'Commencer Gratuitement'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      

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
            {features.map((f, i) => <motion.div key={f.title} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: i * 0.1
          }} className="group p-6 glass rounded-xl hover:border-primary/30 transition-all cursor-default">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon size={20} className="text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>)}
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
            {[{
            name: 'Starter',
            price: 16,
            credits: '100 crédits/mois',
            link: 'https://buy.stripe.com/dRmeV63qgdUU4Q2bHrdnW00'
          }, {
            name: 'Pro',
            price: 30,
            credits: '300 crédits/mois',
            link: 'https://buy.stripe.com/8x2fZaf8Y2ccdmydPzdnW01',
            popular: true
          }, {
            name: 'Business',
            price: 75,
            credits: '1000 crédits/mois',
            link: 'https://buy.stripe.com/4gM8wI1i82ccgyK8vfdnW02'
          }].map(plan => <div key={plan.name} className={`glass rounded-xl p-6 relative ${plan.popular ? 'border-primary/50 shadow-glow' : ''}`}>
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-primary rounded-full text-xs font-medium text-primary-foreground">
                    Populaire
                  </div>}
                <h3 className="font-display font-semibold text-foreground text-lg mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-display font-bold text-foreground">{plan.price}€</span>
                  <span className="text-sm text-muted-foreground">/mois</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.credits}</p>
                <a href={plan.link} target="_blank" rel="noopener noreferrer" className={`block w-full py-2.5 text-center rounded-lg font-medium transition-opacity hover:opacity-90 ${plan.popular ? 'bg-gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                  Choisir {plan.name}
                </a>
              </div>)}
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
    </div>;
}