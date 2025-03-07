import { useState } from "react";
import { ArrowUpRight, ArrowUp, RefreshCw, Shirt } from "lucide-react";
import { getRandomSuggestions, Suggestion } from "@/lib/suggestions";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type QualityMode = "performance" | "quality";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
  showProviders: boolean;
  onToggleProviders: () => void;
  mode: QualityMode;
  onModeChange: (mode: QualityMode) => void;
  suggestions: Suggestion[];
}

export function PromptInput({
  suggestions: initSuggestions,
  isLoading,
  onSubmit,
}: PromptInputProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initSuggestions);

  const updateSuggestions = () => {
    setSuggestions(getRandomSuggestions());
  };
  const handleSuggestionSelect = (prompt: string) => {
    setInput(prompt);
    onSubmit(prompt);
  };

  const handleSubmit = () => {
    if (!isLoading && input.trim()) {
      onSubmit(input);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        onSubmit(input);
      }
    }
  };

  return (
    <div className="w-full mb-8">
      <div className="bg-zinc-50 rounded-xl p-4">
        <div className="flex flex-col gap-3">
          {/* Input con icono dentro y cambio de color en el borde */}
          <div className="relative focus-within:ring-2 focus-within:ring-black rounded-lg bg-white p-2">
            <span className="absolute left-3 top-3 text-zinc-400">
              <Shirt className="w-5 h-5" />
            </span>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Choose a clothing item"
              rows={3}
              className="pl-10 text-base bg-transparent border-none p-0 resize-none placeholder:text-zinc-500 text-[#111111] focus:ring-transparent"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center justify-between space-x-2">
              <button
                onClick={updateSuggestions}
                className="flex items-center justify-between px-2 rounded-lg py-1 bg-background text-sm hover:opacity-70 group transition-opacity duration-200"
              >
                <RefreshCw className="w-4 h-4 text-zinc-500 group-hover:opacity-70" />
              </button>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(suggestion.prompt)}
                  className={cn(
                    "flex items-center justify-between px-2 rounded-lg py-1 bg-background text-sm transition-transform duration-200 ease-in-out hover:scale-105 hover:bg-zinc-200",
                    index > 3
                      ? "hidden md:flex"
                      : index > 2
                        ? "hidden sm:flex"
                        : "",
                  )}
                >
                  <span>
                    <span className="text-black text-xs sm:text-sm">
                      {suggestion.text.toLowerCase()}
                    </span>
                  </span>
                  <ArrowUpRight className="ml-1 h-2 w-2 sm:h-3 sm:w-3 text-zinc-500" />
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="h-8 w-8 rounded-full bg-black flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? (
                <Spinner className="w-3 h-3 text-white" />
              ) : (
                <ArrowUp className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
