import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Copy, Check, Users, Coins, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

export default function Referral() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);

  const referralCode = profile?.referral_code || '';
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { count } = await supabase.from('referrals').select('id', { count: 'exact', head: true }).eq('referrer_id', user.id);
      setReferralCount(count || 0);
      setTotalEarned((count || 0) * 20);
    };
    load();
  }, [user]);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/chat')} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
          <img src={logo} alt="" className="w-8 h-8" />
          <h1 className="text-xl font-display font-bold text-foreground">Parrainage</h1>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 mb-6 text-center"
        >
          <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift size={28} className="text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Gagnez 20 crédits par ami</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Partagez votre lien. Quand un ami s'inscrit et utilise NexCode, vous recevez chacun 20 crédits bonus !
          </p>

          <div className="flex items-center gap-2 bg-secondary rounded-lg p-2 max-w-lg mx-auto">
            <input type="text" value={referralLink} readOnly
              className="flex-1 bg-transparent text-foreground text-sm px-3 outline-none truncate" />
            <button onClick={copyLink}
              className="px-4 py-2 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 flex-shrink-0">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copié' : 'Copier'}
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            Code : <span className="font-mono text-primary">{referralCode}</span>
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: Users, label: 'Amis invités', value: referralCount },
            { icon: Coins, label: 'Crédits gagnés', value: totalEarned },
            { icon: TrendingUp, label: 'Taux de conversion', value: referralCount > 0 ? '100%' : '—' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-4 text-center"
            >
              <s.icon size={18} className="text-primary mx-auto mb-2" />
              <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <div className="glass rounded-xl p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Comment ça marche ?</h3>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Partagez votre lien', desc: 'Envoyez votre lien à vos amis, collègues ou sur les réseaux sociaux.' },
              { step: '2', title: 'Votre ami s\'inscrit', desc: 'Il crée un compte NexCode avec votre lien de parrainage.' },
              { step: '3', title: 'Recevez vos crédits', desc: 'Vous et votre ami recevez chacun 20 crédits bonus instantanément.' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{item.step}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
