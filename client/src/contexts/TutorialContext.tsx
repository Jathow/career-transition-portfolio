import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { preferencesAPI } from '../services/api';

interface TutorialContextType {
  showTutorials: boolean;
  setShowTutorials: (show: boolean) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

interface TutorialProviderProps {
  children: ReactNode;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [showTutorials, setShowTutorials] = useState(true);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Load tutorial preference only when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadTutorialPreference = async () => {
      try {
        const response = await preferencesAPI.getPreferences();
        setShowTutorials(response.data.data.showTutorials);
      } catch (error) {
        // Fallback to localStorage
        const savedPrefs = localStorage.getItem('user-preferences');
        if (savedPrefs) {
          try {
            const prefs = JSON.parse(savedPrefs);
            setShowTutorials(prefs.showTutorials);
          } catch (e) {
            console.error('Error parsing tutorial preference:', e);
          }
        }
      }
    };

    loadTutorialPreference();
  }, [isAuthenticated]);

  const value = {
    showTutorials,
    setShowTutorials,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}; 