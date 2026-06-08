// src/components/TagsInput.tsx
// Componente reutilizable de entrada de tags.
// Permite agregar tags con Enter o coma, y eliminarlos con × o Backspace.
import { useState, type KeyboardEvent } from 'react';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagsInput({ value, onChange, placeholder }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = inputValue.trim();
      if (tag && !value.includes(tag)) {
        onChange([...value, tag]);
      }
      setInputValue('');
    }
    if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="border border-gray-300 rounded-lg px-3 py-2 flex flex-wrap gap-2 focus-within:outline focus-within:outline-2 focus-within:outline-[var(--color-primary)] min-h-[44px]">
      {value.map((tag, i) => (
        <span
          key={i}
          className="bg-[#4342FF]/10 text-[#4342FF] text-sm fira-code-regular px-2 py-1 rounded-full flex items-center gap-1"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(i)}
            className="text-[#4342FF] hover:text-[#4342FF]/70 leading-none"
            aria-label={`Eliminar ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
      />
    </div>
  );
}
