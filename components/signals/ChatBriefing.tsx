"use client";

import { MessageCircle } from 'lucide-react';

interface ChatBriefingProps {
  text: string;
}

export function ChatBriefing({ text }: ChatBriefingProps) {
  return (
    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-900/50 rounded-xl p-4 flex gap-3">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-primary-700 dark:text-primary-400 mb-1">G-Chat Briefing</p>
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}