import { Workbox } from 'workbox-window';
import { APP_VERSION } from '../version';

export interface UpdateInfo {
    hasUpdate: boolean;
    currentVersion: string;
    newVersion?: string;
    updateAvailable?: boolean;
}

class UpdateService {
    private workbox: Workbox | null = null;
    private currentVersion: string;
    private updateCallbacks: ((updateInfo: UpdateInfo) => void)[] = [];

    constructor() {
        // Get version from the injected version file
        this.currentVersion = APP_VERSION;
    }

    async initialize(): Promise<void> {
        if ('serviceWorker' in navigator) {
            try {
                this.workbox = new Workbox('/sw.js');

                // Listen for updates
                this.workbox.addEventListener('waiting', () => {
                    this.notifyUpdateAvailable();
                });

                // Listen for controlling service worker updates
                this.workbox.addEventListener('controlling', () => {
                    this.notifyUpdateInstalled();
                });

                await this.workbox.register();
            } catch (error) {
                console.error('Failed to register service worker:', error);
            }
        }
    }

    async checkForUpdates(): Promise<UpdateInfo> {
        if (!this.workbox) {
            return {
                hasUpdate: false,
                currentVersion: this.currentVersion,
            };
        }

        try {
            // Force update check
            await this.workbox.update();

            // Check if there's a waiting service worker
            const registration = await navigator.serviceWorker.getRegistration();
            const hasWaitingWorker = registration?.waiting !== null;

            return {
                hasUpdate: hasWaitingWorker,
                currentVersion: this.currentVersion,
                updateAvailable: hasWaitingWorker,
            };
        } catch (error) {
            console.error('Error checking for updates:', error);
            return {
                hasUpdate: false,
                currentVersion: this.currentVersion,
            };
        }
    }

    async applyUpdate(): Promise<void> {
        if (!this.workbox) {
            throw new Error('Service worker not initialized');
        }

        try {
            // Send message to waiting service worker to skip waiting
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration?.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
        } catch (error) {
            console.error('Error applying update:', error);
            throw error;
        }
    }

    onUpdateAvailable(callback: (updateInfo: UpdateInfo) => void): void {
        this.updateCallbacks.push(callback);
    }

    private notifyUpdateAvailable(): void {
        const updateInfo: UpdateInfo = {
            hasUpdate: true,
            currentVersion: this.currentVersion,
            updateAvailable: true,
        };

        this.updateCallbacks.forEach(callback => callback(updateInfo));
    }

    private notifyUpdateInstalled(): void {
        const updateInfo: UpdateInfo = {
            hasUpdate: false,
            currentVersion: this.currentVersion,
            updateAvailable: false,
        };

        this.updateCallbacks.forEach(callback => callback(updateInfo));
    }

    getCurrentVersion(): string {
        return this.currentVersion;
    }

    setVersion(version: string): void {
        this.currentVersion = version;
    }
}

export const updateService = new UpdateService();
