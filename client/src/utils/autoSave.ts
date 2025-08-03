import { preferencesAPI } from '../services/api';

class AutoSaveManager {
  private isEnabled: boolean = true;
  private saveQueue: Map<string, () => Promise<void>> = new Map();
  private saveTimeout: NodeJS.Timeout | null = null;

  public async loadAutoSavePreference() {
    try {
      const response = await preferencesAPI.getPreferences();
      this.isEnabled = response.data.data.autoSave;
    } catch (error) {
      // Fallback to localStorage
      const savedPrefs = localStorage.getItem('user-preferences');
      if (savedPrefs) {
        try {
          const prefs = JSON.parse(savedPrefs);
          this.isEnabled = prefs.autoSave;
        } catch (e) {
          console.error('Error parsing auto-save preference:', e);
        }
      }
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
  }

  public scheduleSave(key: string, saveFunction: () => Promise<void>) {
    if (!this.isEnabled) {
      return;
    }

    this.saveQueue.set(key, saveFunction);

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.executeSaves();
    }, 1000); // Save after 1 second of inactivity
  }

  private async executeSaves() {
    if (this.saveQueue.size === 0) return;

    const saves = Array.from(this.saveQueue.values());
    this.saveQueue.clear();

    try {
      await Promise.all(saves.map(save => save()));
      console.log('Auto-save completed successfully');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  public forceSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.executeSaves();
  }
}

export const autoSaveManager = new AutoSaveManager(); 