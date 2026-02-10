import { X } from "lucide-react";
import { useState, useEffect } from "react";
import LanguageCombobox from "./LanguageCombobox";
import { useNPClient } from "@/hooks/NPClientContext";
import { SETTINGS_STORAGE_KEYS } from "@/api/core/SettingsManager";

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal = ({ onClose }: SettingsModalProps) => {
  const [userName, setUserName] = useState("");
  const [languageCode, setLanguageCode] = useState("en");
  const { saveSettings } = useNPClient();


  useEffect(() => {
    const savedUserName = localStorage.getItem(SETTINGS_STORAGE_KEYS.userName);
    const savedLanguageCode = localStorage.getItem(SETTINGS_STORAGE_KEYS.languageCode);

    if (!!savedUserName) {
      setUserName(savedUserName)
    }
    if (!!savedLanguageCode) {
      setLanguageCode(savedLanguageCode);
    }
  }, []);

  const handleSave = () => {
    saveSettings({
      userName: userName,
      languageCode: languageCode,
    });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 ">
          <h2 className="text-xl  text-foreground">Settings</h2>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Content */}
        <div className="px-6 py-2">
          {/* Settings List */}
          <div className="divide-y divide-border">          
            {/* User Name */}
            <div className="py-4 flex items-center justify-between gap-8">
              <label htmlFor="userName" className="text-sm font-medium text-foreground">
                User Name
              </label>
              <input
                id="userName"
                type="text"
                placeholder="<Enter User Name>"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-64 px-0 py-1 bg-transparent text-foreground text-right border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Language */}
            <div className="py-4 flex items-center justify-between gap-8">
              <label className="text-sm font-medium text-foreground">
                Language
              </label>
              <LanguageCombobox value={languageCode} onChange={setLanguageCode} />
            </div>

            {/* Version Number - Read only */}
            <div className="py-4 flex items-center justify-between gap-8">
               <label htmlFor="accessCode" className="text-sm font-medium text-foreground">
                Version Number
              </label>
              <input
                id="accessCode"
                type="text"
                value={"NPBC-5.0.0"}
                disabled
                placeholder="NPBC-5.0.0"
                className="w-64 px-0 py-1 bg-transparent text-foreground text-right border-0 border-b-2 border-transparent focus:border-primary focus:outline-none transition-colors"
              />
            </div>

          </div>

          {/* Helper Text */}
          <p className="mt-6 text-xs text-muted-foreground">
            Changes will take effect after saving.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
