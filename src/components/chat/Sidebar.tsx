import { useAuth } from '@/hooks/useAuth';
import { Plus, MessageSquare, Trash2, ChevronLeft, LogOut, Coins, Settings, Gift, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import type { Conversation } from '@/pages/Chat';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  credits: number;
  isMobile: boolean;
}

export default function Sidebar({ conversations, activeId, isOpen, onToggle, onNewChat, onSelect, onDelete, credits, isMobile }: SidebarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  if (isMobile && !isOpen) return null;

  return (
    <>
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" onClick={onToggle} />
      )}
      <div className={`${
        isMobile ? 'fixed left-0 top-0 bottom-0 z-50 w-72' : 'w-64 flex-shrink-0'
      } bg-sidebar border-r border-sidebar-border flex flex-col h-full`}>
        {/* Header */}
        <div className="p-3 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img src={logo} alt="NexCode" className="w-7 h-7" />
              <span className="text-sm font-display font-bold text-gradient">NexCode</span>
            </div>
            <button onClick={onToggle} className="p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors text-sidebar-foreground">
              <ChevronLeft size={18} />
            </button>
          </div>
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-gradient-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Nouveau Chat
          </button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-0.5">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${
                activeId === conv.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <MessageSquare size={14} className="flex-shrink-0 opacity-50" />
              <span className="flex-1 truncate">{conv.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/50">
            <Coins size={14} className="text-primary" />
            <span className="text-sm text-sidebar-foreground">{credits} crédits</span>
          </div>
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
            <BarChart3 size={14} />
            <span>Dashboard</span>
          </button>
          <button onClick={() => navigate('/referral')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
            <Gift size={14} />
            <span>Parrainage</span>
          </button>
          <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
            <Settings size={14} />
            <span>Paramètres</span>
          </button>
          <button
            onClick={async () => { await signOut(); navigate('/'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut size={14} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
}
