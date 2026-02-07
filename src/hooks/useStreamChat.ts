import { useCallback, useRef } from 'react';

interface StreamChatOptions {
  messages: { role: string; content: any }[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
  signal?: AbortSignal;
}

export function useStreamChat() {
  const abortRef = useRef<AbortController | null>(null);

  const streamChat = useCallback(async ({ messages, onDelta, onDone, onError, signal }: StreamChatOptions) => {
    const controller = new AbortController();
    abortRef.current = controller;
    const combinedSignal = signal || controller.signal;

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages }),
        signal: combinedSignal,
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        if (resp.status === 429) {
          onError('Limite atteinte. Réessayez dans un moment.');
          return;
        }
        if (resp.status === 402) {
          onError('Crédits insuffisants. Passez à un abonnement supérieur.');
          return;
        }
        onError(errorData.error || 'Erreur de génération');
        return;
      }

      if (!resp.body) { onError('Pas de réponse'); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { onDone(); return; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onDelta(content);
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Flush remaining
      if (buffer.trim()) {
        for (let raw of buffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onDelta(content);
          } catch { /* skip */ }
        }
      }
      onDone();
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        onError(e.message || 'Erreur de connexion');
      }
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { streamChat, cancel };
}
