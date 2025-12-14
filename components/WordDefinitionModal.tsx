"use client";

import { useState, useEffect } from "react";
import { X, Volume2, Save, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";

interface WordDefinitionModalProps {
  word: string;
  isOpen: boolean;
  onClose: () => void;
  movieId?: string;
  contextSentence?: string;
  contextSentenceVi?: string;
}

export function WordDefinitionModal({ word, isOpen, onClose, movieId, contextSentence, contextSentenceVi }: WordDefinitionModalProps) {
  const [isLoadingDefinition, setIsLoadingDefinition] = useState(false);
  const [translation, setTranslation] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen && word) {
      // Reset state
      setTranslation("");
      setIsSaved(false);
      checkIfSaved();
      fetchDefinition(word);
    }
  }, [isOpen, word]);

  const fetchDefinition = async (searchWord: string) => {
    setIsLoadingDefinition(true);
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(searchWord)}`
      );
      const data = await response.json();

      if (data && data[0] && data[0][0] && data[0][0][0]) {
        setTranslation(data[0][0][0]);
      } else {
        setTranslation("");
      }
    } catch (error) {
      console.error("Error fetching definition:", error);
      setTranslation("");
    } finally {
      setIsLoadingDefinition(false);
    }
  };

  const checkIfSaved = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('saved_words')
      .select('id, translation')
      .eq('user_id', user.id)
      .eq('word', word)
      .single();

    if (data) {
      setIsSaved(true);
      // If we already have a saved translation, use it instead of the API one
      if (data.translation) {
        setTranslation(data.translation);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Vui lòng đăng nhập để lưu từ vựng");
        return;
      }

      const { error } = await supabase
        .from('saved_words')
        .upsert({
          user_id: user.id,
          word: word,
          translation: translation,
          context_sentence: contextSentence,
          movie_id: movieId
        }, { onConflict: 'user_id, word' });

      if (error) throw error;
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving word:", error);
      alert("Có lỗi xảy ra khi lưu từ");
    } finally {
      setSaving(false);
    }
  };

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-lg text-white">Tra từ nhanh</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-yellow-500">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Word & Pronunciation */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">{word}</h2>
              <p className="text-zinc-400 text-sm italic">English</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-12 h-12 border-yellow-500/50 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all"
              onClick={handleSpeak}
            >
              <Volume2 className="w-6 h-6" />
            </Button>
          </div>

          {/* Translation Input (Simplified View) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Nghĩa tiếng Việt</label>
            <div className="relative">
              {isLoadingDefinition && !translation && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                </div>
              )}
              <textarea
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none h-24 text-lg"
                placeholder={isLoadingDefinition ? "Đang tìm nghĩa..." : "Nhập nghĩa của từ..."}
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
              />
            </div>
          </div>

          {/* Context */}
          {(contextSentence || contextSentenceVi) && (
            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-800 space-y-3">
              <p className="text-xs text-zinc-500 uppercase font-bold">Ngữ cảnh</p>
              {contextSentence && (
                <div>
                  <p className="text-zinc-400 text-xs mb-1">Tiếng Anh:</p>
                  <p className="text-white italic font-medium">"{contextSentence}"</p>
                </div>
              )}
              {contextSentenceVi && (
                <div>
                  <p className="text-zinc-400 text-xs mb-1">Tiếng Việt:</p>
                  <p className="text-yellow-500/90 italic font-medium">"{contextSentenceVi}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 shrink-0">
          <Button
            className={`w-full h-12 font-bold text-base ${isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-400 text-black'}`}
            onClick={isSaved ? onClose : handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : isSaved ? (
              <>
                <Save className="w-5 h-5 mr-2" />
                Đã lưu vào từ vựng
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Lưu từ vựng
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
