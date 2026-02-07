import { X, Zap } from 'lucide-react';
import { PLANS } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '@/assets/logo.png';

interface SubscriptionPopupProps {
  onClose: () => void;
}

export default function SubscriptionPopup({ onClose }: SubscriptionPopupProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl glass rounded-2xl p-6 relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>

          <div className="text-center mb-6">
            <img src={logo} alt="NexCode" className="w-10 h-10 mx-auto mb-3" />
            <h2 className="text-xl font-display font-bold text-foreground mb-1">Plus de crédits disponibles</h2>
            <p className="text-sm text-muted-foreground">Choisissez un abonnement pour continuer à créer</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-5 border transition-all ${
                  plan.popular
                    ? 'border-primary shadow-glow bg-primary/5'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                {plan.popular && (
                  <div className="flex items-center gap-1 text-primary text-xs font-medium mb-3">
                    <Zap size={12} />
                    Populaire
                  </div>
                )}
                <h3 className="font-display font-semibold text-foreground">{plan.name}</h3>
                <div className="flex items-baseline gap-1 my-2">
                  <span className="text-2xl font-display font-bold text-foreground">${plan.price}</span>
                  <span className="text-xs text-muted-foreground">/mois</span>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{plan.credits} crédits/mois</p>
                <a
                  href={plan.stripeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full py-2 text-center rounded-lg text-sm font-medium transition-opacity hover:opacity-90 ${
                    plan.popular
                      ? 'bg-gradient-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  Choisir
                </a>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            5 crédits gratuits se rechargent automatiquement toutes les 24h
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
