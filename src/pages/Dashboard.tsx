import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, MessageSquare, Code2, TrendingUp, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import logo from '@/assets/logo.png';
import { PLANS } from '@/lib/constants';

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [stats, setStats] = useState({ totalMessages: 0, totalCodeGen: 0, totalCreditsUsed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [txRes, msgRes, codeRes] = await Promise.all([
        supabase.from('credit_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('role', 'user'),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('has_code', true),
      ]);
      if (txRes.data) setTransactions(txRes.data);
      setStats({
        totalMessages: msgRes.count || 0,
        totalCodeGen: codeRes.count || 0,
        totalCreditsUsed: profile?.total_credits_used || 0,
      });
      setLoading(false);
    };
    load();
  }, [user, profile]);

  const dailyUsage = transactions.reduce((acc, tx) => {
    if (tx.amount < 0) {
      const day = new Date(tx.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      const existing = acc.find(d => d.day === day);
      if (existing) existing.credits += Math.abs(tx.amount);
      else acc.push({ day, credits: Math.abs(tx.amount) });
    }
    return acc;
  }, [] as { day: string; credits: number }[]).reverse().slice(-7);

  const pieData = [
    { name: 'Utilisés', value: stats.totalCreditsUsed, color: 'hsl(262, 83%, 58%)' },
    { name: 'Restants', value: profile?.credits || 0, color: 'hsl(250, 15%, 25%)' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/chat')} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
          <img src={logo} alt="" className="w-8 h-8" />
          <h1 className="text-xl font-display font-bold text-foreground">Dashboard</h1>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Coins, label: 'Crédits restants', value: profile?.credits ?? 0, color: 'text-primary' },
            { icon: MessageSquare, label: 'Messages envoyés', value: stats.totalMessages, color: 'text-blue-400' },
            { icon: Code2, label: 'Codes générés', value: stats.totalCodeGen, color: 'text-green-400' },
            { icon: TrendingUp, label: 'Crédits utilisés', value: stats.totalCreditsUsed, color: 'text-orange-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-4"
            >
              <stat.icon size={18} className={`${stat.color} mb-2`} />
              <p className="text-2xl font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="glass rounded-xl p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Utilisation (7 derniers jours)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyUsage}>
                <XAxis dataKey="day" stroke="hsl(250,8%,55%)" fontSize={11} />
                <YAxis stroke="hsl(250,8%,55%)" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: 'hsl(250,18%,10%)', border: '1px solid hsl(250,15%,18%)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'hsl(250,10%,95%)' }}
                />
                <Bar dataKey="credits" fill="hsl(262,83%,58%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="font-display font-semibold text-foreground mb-4">Répartition crédits</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'hsl(250,18%,10%)', border: '1px solid hsl(250,15%,18%)', borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-muted-foreground">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="mb-8">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-primary" />
            Acheter des crédits
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map(plan => (
              <div key={plan.name} className={`glass rounded-xl p-5 ${plan.popular ? 'border-primary/50 shadow-glow' : ''}`}>
                {plan.popular && (
                  <span className="text-xs font-medium text-primary mb-2 block">⚡ Populaire</span>
                )}
                <h4 className="font-display font-semibold text-foreground">{plan.name}</h4>
                <p className="text-2xl font-display font-bold text-foreground my-2">${plan.price}<span className="text-sm text-muted-foreground font-normal">/mois</span></p>
                <p className="text-xs text-muted-foreground mb-4">{plan.credits} crédits/mois</p>
                <a href={plan.stripeUrl} target="_blank" rel="noopener noreferrer"
                  className={`block w-full py-2 text-center rounded-lg text-sm font-medium ${plan.popular ? 'bg-gradient-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                  Choisir
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Transactions */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Historique des transactions</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
            {transactions.length === 0 && <p className="text-sm text-muted-foreground">Aucune transaction</p>}
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-foreground">{tx.description || tx.type}</p>
                  <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className={`text-sm font-medium ${tx.amount > 0 ? 'text-green-400' : 'text-destructive'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
