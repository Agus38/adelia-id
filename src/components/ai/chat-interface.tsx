
'use client';

import { nexusAssistant } from '@/ai/flows/nexus-ai-assistant';
import type { AssistantInput } from '@/ai/flows/nexus-ai-flow';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUserStore } from '@/lib/user-store';
import { Bot, Send, User, Sparkles, Trash2, Loader2, AlertCircle, Copy, Pencil, ThumbsUp, RefreshCw } from 'lucide-react';
import { useRef, useState, useEffect, useTransition } from 'react';
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
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

// Define Message schema locally for client-side state
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

type Message = z.infer<typeof MessageSchema>;

const allPromptSuggestions = [
    "Apa yang bisa kamu lakukan?",
    "Jelaskan tentang fitur BudgetFlow",
    "Siapa yang membuat aplikasi ini?",
    "Jam berapa sekarang?",
    "Fitur apa saja yang ada di aplikasi ini?",
    "Bantu saya membuat laporan harian",
    "Bagaimana cara kerja fitur Stok Produk?",
    "Apa fungsi dari halaman Cek Usia?",
    "Ceritakan lelucon tentang teknologi",
    "Beri saya kutipan motivasi",
];

// Helper function to shuffle an array and pick the first N items
const getShuffledPrompts = (arr: string[], num: number) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
};


export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useUserStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [activeMessageIndex, setActiveMessageIndex] = useState<number | null>(null);

  // Firestore document reference for chat history
  const chatHistoryRef = user ? doc(db, `users/${user.uid}/ai-assistant-chats`, 'nexus') : null;

  // Effect to load and listen for chat history from Firestore
  useEffect(() => {
    if (!chatHistoryRef) {
      setIsHistoryLoading(false);
      return;
    }
    
    setIsHistoryLoading(true); // Set loading true on new user/mount
    
    const unsubscribe = onSnapshot(chatHistoryRef, 
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().messages) {
          setMessages(docSnap.data().messages);
        } else {
          setMessages([]);
        }
        setIsHistoryLoading(false);
      }, 
      (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: chatHistoryRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Original onSnapshot error:", serverError);
        setError("Gagal memuat riwayat obrolan karena masalah izin.");
        setIsHistoryLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]); // Rerun only when user changes
  
  // This effect handles scrolling to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPending]);

  // This effect sets the initial prompt suggestions
  useEffect(() => {
    setPromptSuggestions(getShuffledPrompts(allPromptSuggestions, 3));
  }, []);

   // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);
  
  const saveHistoryToFirestore = (updatedMessages: Message[]) => {
    if (!chatHistoryRef) return;
    
    setDoc(chatHistoryRef, { messages: updatedMessages }, { merge: true }).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: chatHistoryRef.path,
            operation: 'write',
            requestResourceData: { messages: updatedMessages }
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error saving chat history:", serverError);
        setError("Gagal menyimpan pesan karena masalah izin.");
    });
  }

  const handlePromptSuggestionClick = (prompt: string) => {
      setInput(prompt);
      // Directly call handleSubmit logic, as we don't have a form event
      handleSubmit(new Event('submit') as any, prompt);
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Pesan disalin!",
        description: "Teks telah disalin ke clipboard Anda.",
    });
  };

  const handleEdit = (text: string, index: number) => {
    setInput(text);
    const remainingMessages = messages.slice(0, index);
    setMessages(remainingMessages);
    setActiveMessageIndex(null);
    textareaRef.current?.focus();
  };
  
  const handleLike = () => {
    toast({ title: "Terima kasih atas masukan Anda!" });
  };
  
  const handleRegenerate = (aiMessageIndex: number) => {
    const historyUpToUserPrompt = messages.slice(0, aiMessageIndex);
    const userPromptMessage = historyUpToUserPrompt[historyUpToUserPrompt.length - 1];

    if (userPromptMessage?.role !== 'user') {
        setError("Tidak dapat membuat ulang respons. Prompt pengguna tidak ditemukan.");
        return;
    }
    
    setMessages(historyUpToUserPrompt);
    setError(null);
    setActiveMessageIndex(null);

    startTransition(async () => {
      try {
        const assistantInput: AssistantInput = {
          history: historyUpToUserPrompt,
          appContext: {
            userName: user?.fullName || 'Pengguna',
            userRole: user?.role || 'Pengguna',
          },
        };

        const result = await nexusAssistant(assistantInput);
        const modelMessage: Message = { role: 'model', content: result.response };
        
        const finalMessages = [...historyUpToUserPrompt, modelMessage];
        setMessages(finalMessages);
        saveHistoryToFirestore(finalMessages);

      } catch (err: any) {
        console.error('AI Error on regenerate:', err);
        setError('Maaf, terjadi kesalahan saat mencoba membuat ulang respons.');
        // Restore the original messages if regeneration fails
        setMessages([...historyUpToUserPrompt, messages[aiMessageIndex]]);
      }
    });
  }


  const toggleMessageActions = (index: number) => {
    if (activeMessageIndex === index) {
      setActiveMessageIndex(null);
    } else {
      setActiveMessageIndex(index);
    }
  };

  const handleClearChat = async () => {
    if (!chatHistoryRef) return;
    try {
        await deleteDoc(chatHistoryRef);
        setMessages([]); // Optimistically update UI
        toast({ title: "Riwayat percakapan dihapus."});
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
          path: chatHistoryRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Failed to clear chat history:", serverError);
        setError("Gagal menghapus riwayat karena masalah izin.");
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>, suggestedPrompt?: string) => {
    e.preventDefault();
    const currentInput = suggestedPrompt || input;
    if (!currentInput.trim() || isPending) return;

    setError(null);
    const userMessage: Message = { role: 'user', content: currentInput };
    
    // Optimistically update the UI with the user's message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    
    startTransition(async () => {
      try {
        const assistantInput: AssistantInput = {
          history: updatedMessages,
          appContext: {
            userName: user?.fullName || 'Pengguna',
            userRole: user?.role || 'Pengguna',
          },
        };

        const result = await nexusAssistant(assistantInput);
        const modelMessage: Message = { role: 'model', content: result.response };
        
        const finalMessages = [...updatedMessages, modelMessage];
        setMessages(finalMessages);
        saveHistoryToFirestore(finalMessages);

      } catch (err: any) {
        console.error('AI Error:', err);
        setError('Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba lagi nanti.');
        setMessages(messages);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
    }
  };


  return (
    <div className="flex h-full flex-col bg-card rounded-lg">
      <header className="p-4 border-b flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
              <div className="relative">
                 {/* AI Avatar */}
              </div>
              <div>
                  <p className="font-semibold">Nexus AI Assistant</p>
                  <p className="text-xs text-muted-foreground">Online</p>
              </div>
          </div>
          {messages.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Riwayat Percakapan?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Seluruh percakapan Anda dengan asisten AI akan dihapus.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearChat}>Ya, Hapus</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
        {isHistoryLoading ? (
             <div className="flex flex-1 items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : messages.length === 0 && !isPending && !error && (
             <div className="text-center text-muted-foreground space-y-8 animate-in fade-in duration-500 pt-8">
                <div className="flex justify-center">
                    <div className="p-5 bg-primary/10 rounded-full w-fit shadow-inner">
                        <Sparkles className="h-12 w-12 text-primary" />
                    </div>
                </div>
                <div>
                    <p className="font-semibold text-xl text-foreground">Halo, {user?.fullName || 'Sobat'}!</p>
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
          <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                onClick={() => toggleMessageActions(index)}
                className={`flex items-start max-w-[85%] sm:max-w-[75%] cursor-pointer ${
                  msg.role === 'user' ? 'ml-auto' : ''
                }`}
              >
                <div
                  className={`rounded-2xl p-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted rounded-bl-none'
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-full leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
              {activeMessageIndex === index && msg.role === 'user' && (
                <div className="flex gap-1 mt-1.5 mr-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(msg.content)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(msg.content, index)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>
              )}
               {activeMessageIndex === index && msg.role === 'model' && (
                <div className="flex gap-1 mt-1.5 ml-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(msg.content)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleLike}>
                        <ThumbsUp className="h-4 w-4" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRegenerate(index)}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
              )}
          </div>
        ))}
        
        {isPending && (
          <div className="flex items-start gap-3 animate-in fade-in duration-300">
            <div className="rounded-2xl p-3 bg-muted flex items-center gap-2 rounded-bl-none">
              <Loader2 className="h-4 w-4 animate-spin"/>
              <p className="text-sm text-muted-foreground">Mengetik...</p>
            </div>
          </div>
        )}
        
        {error && (
             <div className="flex items-start gap-3">
                <div className="rounded-2xl p-3 bg-destructive/10 text-sm text-destructive flex items-center gap-2 rounded-bl-none">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                </div>
            </div>
        )}
         <div ref={messagesEndRef} />
      </main>

      <footer className="border-t p-2 sm:p-4 flex-shrink-0">
        <form onSubmit={(e) => handleSubmit(e)} className="flex w-full items-start gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan Anda... (Shift+Enter untuk baris baru)"
            disabled={isPending}
            className="flex-1 resize-none max-h-40"
            rows={1}
          />
          <Button type="submit" disabled={isPending || !input.trim()} size="icon" className="h-10 w-10 flex-shrink-0">
            {isPending ? <Loader2 className="h-5 w-5 animate-spin"/> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </footer>
    </div>
  );
}
