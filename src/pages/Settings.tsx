import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Trash2, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

export default function Settings() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [saving, setSaving] = useState(false);
  const [deletingHistory, setDeletingHistory] = useState(false);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('user_id', user.id);
    if (error) toast.error("Erreur de sauvegarde");
    else { toast.success("Profil mis à jour"); await refreshProfile(); }
    setSaving(false);
  };

  const clearHistory = async () => {
    if (!user || !confirm("Supprimer tout l'historique ? Cette action est irréversible.")) return;
    setDeletingHistory(true);
    await supabase.from('messages').delete().eq('user_id', user.id);
    await supabase.from('conversations').delete().eq('user_id', user.id);
    toast.success("Historique supprimé");
    setDeletingHistory(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/chat')} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
          <img src={logo} alt="" className="w-8 h-8" />
          <h1 className="text-xl font-display font-bold text-foreground">Paramètres</h1>
        </div>

        {/* Profile */}
        <div className="glass rounded-xl p-6 mb-6">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <User size={18} className="text-primary" />
            Profil
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Email</label>
              <input type="email" value={user?.email || ''} readOnly
                className="w-full px-4 py-3 bg-muted rounded-lg text-muted-foreground border border-border cursor-not-allowed text-sm" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Nom d'utilisateur</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-secondary rounded-lg text-foreground border border-border focus:border-primary focus:outline-none text-sm" />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-foreground">Plan actuel</p>
                <p className="text-xs text-muted-foreground capitalize">{profile?.subscription_plan || 'Gratuit'}</p>
              </div>
              <div>
                <p className="text-sm text-foreground">Crédits</p>
                <p className="text-xs text-primary font-medium">{profile?.credits ?? 0} restants</p>
              </div>
            </div>
            <button onClick={saveProfile} disabled={saving}
              className="px-6 py-2.5 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              Sauvegarder
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="glass rounded-xl p-6 mb-6">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            Sécurité
          </h3>
          <p className="text-sm text-muted-foreground mb-3">Votre compte est sécurisé avec une authentification par email.</p>
          <p className="text-xs text-muted-foreground">Membre depuis le {user ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}</p>
        </div>

        {/* Danger zone */}
        <div className="glass rounded-xl p-6 border-destructive/30">
          <h3 className="font-display font-semibold text-destructive mb-4 flex items-center gap-2">
            <Trash2 size={18} />
            Zone de danger
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Supprimer tout l'historique de conversations et messages.</p>
          <button onClick={clearHistory} disabled={deletingHistory}
            className="px-6 py-2.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm font-medium hover:bg-destructive/20 disabled:opacity-50 flex items-center gap-2">
            {deletingHistory && <Loader2 size={14} className="animate-spin" />}
            Supprimer l'historique
          </button>
        </div>
      </div>
    </div>
  );
}
