
'use client';

import { nexusAIAssistant } from '@/ai/flows/nexus-ai-assistant';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/lib/user-store';
import { Bot, Send, User, Sparkles, Trash2, Loader2, AudioLines } from 'lucide-react';
import { useRef, useState, useTransition, useEffect } from 'react';
import { useAboutInfoConfig, useDeveloperInfoConfig, useMenuConfig } from '@/lib/menu-store';
import ReactMarkdown from 'react-markdown';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const promptSuggestions = [
    "Apa saja fitur di aplikasi ini?",
    "Siapa yang membuat aplikasi ini?",
    "Bagaimana cara mengubah profil saya?",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { user } = useUserStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null); // message content being played
  const [apiStatus, setApiStatus] = useState<'ok' | 'error'>('ok');


  // Fetching app context
  const { aboutInfo } = useAboutInfoConfig();
  const { developerInfo } = useDeveloperInfoConfig();
  const { menuItems } = useMenuConfig();

  useEffect(() => {
    try {
        const savedMessages = localStorage.getItem('nexus-chat-history');
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
    } catch (error) {
        console.error("Failed to parse chat history from localStorage", error);
        localStorage.removeItem('nexus-chat-history');
    }
  }, []);

  useEffect(() => {
      if (messages.length > 0) {
          localStorage.setItem('nexus-chat-history', JSON.stringify(messages));
      } else {
          localStorage.removeItem('nexus-chat-history');
      }
  }, [messages]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPending]);

  const handlePlayAudio = async (text: string) => {
    if (isPlaying === text && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(null);
        setAudioUrl(null);
        return;
    }

    setIsPlaying(text);
    setAudioUrl(null);
    try {
        const result = await textToSpeech({ text });
        setAudioUrl(result.audioDataUri);
    } catch(error) {
        console.error("TTS Error:", error);
        setIsPlaying(null);
    }
  }

  useEffect(() => {
    if(audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
    }
  }, [audioUrl]);

  const handleAudioEnded = () => {
      setIsPlaying(null);
      setAudioUrl(null);
  }

  const handlePromptSuggestionClick = (prompt: string) => {
      // No need to setInput, directly call handleSubmit
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
      handleSubmit(syntheticEvent, prompt);
  };

  const handleClearChat = () => {
      setMessages([]);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, suggestedPrompt?: string) => {
    e.preventDefault();
    const currentInput = suggestedPrompt || input;
    if (!currentInput.trim()) return;

    const userMessage: Message = { role: 'user', content: currentInput };
    // Create the new history array immediately
    const newHistory = [...messages, userMessage];
    
    // Update the UI state
    setMessages(newHistory);
    // Clear input field only if it wasn't a suggested prompt
    if (!suggestedPrompt) {
      setInput('');
    }

    startTransition(async () => {
      const appContext = {
          appName: aboutInfo.appName,
          appVersion: aboutInfo.version,
          appDescription: aboutInfo.description,
          features: menuItems.map(item => item.title),
          developerName: developerInfo.name,
          developerTitle: developerInfo.title,
      };
      
      try {
        // Only send the last 5 messages for context
        const limitedHistory = newHistory.slice(-5);
        const result = await nexusAIAssistant({ 
          history: limitedHistory, 
          appContext,
          userName: user?.fullName || 'Pengguna',
          userAvatar: user?.avatarUrl || user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'P')}`
        });
        const assistantMessage: Message = { role: 'model', content: result.response };
        setMessages((prev) => [...prev, assistantMessage]);
        setApiStatus('ok');
      } catch (error) {
        console.error("AI Assistant Error:", error);
        const errorMessage: Message = { role: 'model', content: "Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba lagi nanti." };
        setMessages((prev) => [...prev, errorMessage]);
        setApiStatus('error');
      }

    });
  };

  return (
    <div className="flex flex-col flex-1 bg-background rounded-2xl border shadow-neumorphic-light">
      <header className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
              <div className="relative">
                 <Avatar>
                    <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                 <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background transition-colors ${apiStatus === 'ok' ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <div>
                  <p className="font-semibold">Nexus</p>
                  <p className="text-xs text-muted-foreground">{apiStatus === 'ok' ? 'Online' : 'Gangguan'}</p>
              </div>
          </div>
          {messages.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                    <Trash2 className="h-4 w-4 text-muted-foreground"/>
                    <span className="sr-only">Bersihkan percakapan</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Riwayat Percakapan?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Seluruh percakapan Anda dengan Nexus akan dihapus secara permanen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearChat}>
                      Ya, Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 && !isPending && (
             <div className="text-center text-muted-foreground space-y-8 animate-in fade-in duration-500 pt-8">
                <div className="flex justify-center">
                    <div className="p-5 bg-primary/10 rounded-full w-fit shadow-inner">
                        <Sparkles className="h-12 w-12 text-primary" />
                    </div>
                </div>
                <div>
                    <p className="font-semibold text-xl text-foreground">Hai, {user?.fullName || 'Sobat'}! Aku Nexus.</p>
                    <p className="text-sm">Asisten AI pribadimu. Ada yang bisa kubantu?</p>
                </div>
                 <div className="flex flex-wrap justify-center gap-2 px-4">
                    {promptSuggestions.map((prompt, index) => (
                        <Button key={index} variant="outline" size="sm" onClick={() => handlePromptSuggestionClick(prompt)}>
                            {prompt}
                        </Button>
                    ))}
                </div>
            </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <Avatar className="w-8 h-8 flex-shrink-0">
               {msg.role === 'model' ? (
                    <AvatarFallback className="bg-primary/20 text-primary"><Bot className="w-5 h-5"/></AvatarFallback>
               ) : (
                <>
                   <AvatarImage src={user?.avatarUrl || user?.photoURL || undefined} alt={user?.fullName || "User"} data-ai-hint="user avatar" />
                   <AvatarFallback><User className="w-4 h-4"/></AvatarFallback>
                </>
               )}
            </Avatar>
            
            <div className={`rounded-2xl p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground rounded-br-none' 
                : 'bg-muted rounded-bl-none'
            }`}>
              <div className="prose prose-xs sm:prose-base dark:prose-invert max-w-full leading-relaxed">
                  <ReactMarkdown
                      components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside" {...props} />,
                          li: ({node, ...props}) => <li className="pl-2" {...props} />,
                      }}
                  >
                      {msg.content}
                  </ReactMarkdown>
              </div>

              {msg.role === 'model' && msg.content && (
                  <div className="mt-2 pt-2 border-t border-muted-foreground/10 flex items-center gap-2">
                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handlePlayAudio(msg.content)} disabled={isPending || (isPlaying !== null && isPlaying !== msg.content)}>
                        {isPlaying === msg.content ? <Loader2 className="h-4 w-4 animate-spin"/> : <AudioLines className="h-4 w-4"/>}
                        <span className="sr-only">Dengarkan</span>
                     </Button>
                  </div>
              )}
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex items-start gap-3 animate-in fade-in duration-300">
             <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary"><Bot className="w-5 h-5"/></AvatarFallback>
              </Avatar>
            <div className="rounded-2xl p-3 bg-muted flex items-center gap-2 rounded-bl-none">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Mengetik...</p>
            </div>
          </div>
        )}
         <div ref={messagesEndRef} />
         <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />
      </main>

      <footer className="border-t p-2 sm:p-4">
        <form ref={formRef} onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesan Anda..."
            disabled={isPending}
            className="flex-1"
          />
          <Button type="submit" disabled={isPending || !input.trim()} size="icon" className="h-10 w-10 flex-shrink-0">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
