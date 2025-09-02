import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';

interface IconPickerProps {
  onSelect: (icon: string) => void;
}

const emojiCategories = {
  'Smileys & Emotion': ['😀', '😂', '😍', '🤔', '😢', '😡', '🤩', '🥳', '🤯', '😭', '😱', '😇'],
  'People & Body': ['👋', '👍', '🙏', '💪', '👀', '🧠', '🧑‍💻', '👩‍🎨', '👨‍🚀', '🦸‍♂️', '🏃‍♀️', '💃'],
  'Animals & Nature': ['🐶', '🐱', '🐭', '🌍', '🌳', '🌸', '🐳', '🦋', '⭐', '🔥', '💧', '⚡'],
  'Food & Drink': ['🍎', '🍌', '🍕', '🍔', '☕️', '🍺', '🍇', '🍓', '🥑', '🌮', '🍣', '🍩'],
  'Travel & Places': ['✈️', '🚗', '🏠', '🚀', '🗺️', '🏛️', '🗼', '🗽', '🏝️', '⛰️', '🏕️', '🏟️'],
  'Activities': ['⚽️', '🏀', '🎨', '🎵', '🎮', '🎉', '🏆', '🎯', '🎬', '🎤', '🎸', '📚'],
  'Objects': ['💻', '📱', '💡', '🔔', '✏️', '📎', '🔑', '💰', '💎', '⚙️', '🔬', '🔭'],
  'Symbols': ['❤️', '✅', '❌', '❓', '❗️', '💯', '➕', '➖', '➗', '✖️', '©️', '®️']
};

const allEmojis = Object.values(emojiCategories).flat();

const IconPicker: React.FC<IconPickerProps> = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmojis = searchTerm
    ? allEmojis.filter(emoji => 
        emoji.codePointAt(0)?.toString(16).includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="bg-card border border-border rounded-lg shadow-xl w-80 h-96 flex flex-col">
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search emoji..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {searchTerm ? (
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => onSelect(emoji)}
                className="text-2xl p-1 rounded-md hover:bg-muted transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  {category}
                </h3>
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => onSelect(emoji)}
                      className="text-2xl p-1 rounded-md hover:bg-muted transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IconPicker;
