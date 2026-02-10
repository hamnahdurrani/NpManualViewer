import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { languageCodeList, type LanguageCode } from "../../util/languageCodeUtil";
import {
  Combobox,
  ComboboxContent,
  ComboboxList,
  ComboboxEmpty,
} from "@/components/ui/combobox";

interface LanguageComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

const LanguageCombobox = ({ value, onChange }: LanguageComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Get selected language display
  const selectedLanguage = languageCodeList.find((lang) => lang.code === value);
  const displayValue = selectedLanguage ? selectedLanguage.nativeName : "Select language...";

  // Filter languages based on search
  const filteredLanguages = languageCodeList.filter((lang) => {
    const search = searchQuery.toLowerCase();
    return (
      lang.name.toLowerCase().includes(search) ||
      lang.code.toLowerCase().includes(search) ||
      lang.nativeName.toLowerCase().includes(search)
    );
  });

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [open]);

  const handleSelect = (lang: LanguageCode) => {
    onChange(lang.code);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Combobox open={open} onOpenChange={setOpen}>
      <div className="relative w-64">
        {/* Trigger Button */}
        <ComboboxPrimitive.Trigger
          ref={triggerRef}
          render={
            <button
              type="button"
              className="w-full px-0 py-1 pr-1 bg-transparent text-foreground text-right border-0 hover:text-primary focus:outline-none cursor-pointer transition-colors flex items-center justify-end gap-2"
              aria-haspopup="listbox"
              aria-expanded={open}
            />
          }
        >
          <span className="truncate">{displayValue}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </ComboboxPrimitive.Trigger>

        {/* Dropdown */}
        <ComboboxContent
          side="bottom"
          sideOffset={8}
          align="end"
          anchor={triggerRef.current}
          className="w-80 pb-3"
        >
          {/* Search Input */}
          <div className="p-3 border-b border-border bg-background">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-accent/50 text-foreground text-sm rounded-md border-0 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Language List */}
          <ComboboxList>
            {filteredLanguages.length === 0 && <ComboboxEmpty>No languages found</ComboboxEmpty>}
            {filteredLanguages.map((lang) => {
              const isSelected = lang.code === value;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang)}
                  className={cn(
                    "w-full px-4 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-accent transition-colors",
                    isSelected && "bg-accent/50"
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {lang.nativeName || lang.name}
                    </div>
                    {lang.nativeName && lang.nativeName !== lang.name && (
                      <div className="text-xs text-muted-foreground">
                        {lang.name}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })}
            {filteredLanguages.length > 0 && <div className="h-6 pb-3"/>}
          </ComboboxList>
          
        </ComboboxContent>
      </div>
    </Combobox>
  );
};

export default LanguageCombobox;
