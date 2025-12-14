"use client";

import React from 'react';

interface InteractiveSubtitleProps {
  text: string;
  onWordClick: (word: string) => void;
  className?: string;
}

export const InteractiveSubtitle = React.memo(function InteractiveSubtitle({ text, onWordClick, className = "" }: InteractiveSubtitleProps) {
  // Split text into words and punctuation
  // This regex matches words (including apostrophes) or non-whitespace sequences
  const tokens = text.split(/(\s+|[.,!?;:"'()\[\]]+)/g).filter(t => t.length > 0);

  return (
    <span className={`inline-block ${className}`}>
      {tokens.map((token, index) => {
        // Check if token is a word (contains letters)
        const isWord = /[a-zA-Z]/.test(token);

        if (isWord) {
          return (
            <span
              key={index}
              className="cursor-pointer hover:text-yellow-400 hover:underline decoration-yellow-400 decoration-2 underline-offset-4 transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation(); // Prevent video pause/play
                // Clean the word before passing it (remove punctuation if any slipped through)
                const cleanWord = token.replace(/[^a-zA-Z']/g, "");
                onWordClick(cleanWord);
              }}
            >
              {token}
            </span>
          );
        }

        return <span key={index}>{token}</span>;
      })}
    </span>
  );
});
