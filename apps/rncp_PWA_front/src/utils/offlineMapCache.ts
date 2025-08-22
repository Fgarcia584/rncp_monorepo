// Utility pour la mise en cache des tiles de carte pour usage hors ligne

interface TileCache {
    url: string;
    data: string; // Base64 data URL
    timestamp: number;
    x: number;
    y: number;
    z: number; // zoom level
}

const CACHE_NAME = 'map-tiles-cache';
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 jours
const MAX_CACHE_SIZE = 100; // Limite de 100 tiles en cache

class OfflineMapCache {
    private cache = new Map<string, TileCache>();
    private initialized = false;

    async init() {
        if (this.initialized) return;
        
        try {
            const stored = localStorage.getItem(CACHE_NAME);
            if (stored) {
                const cacheData = JSON.parse(stored);
                Object.entries(cacheData).forEach(([key, value]) => {
                    const tile = value as TileCache;
                    // Vérifier que la tile n'est pas expirée
                    if (Date.now() - tile.timestamp < MAX_CACHE_AGE) {
                        this.cache.set(key, tile);
                    }
                });
                console.log(`🗺️ Cache de tiles chargé: ${this.cache.size} tiles`);
            }
        } catch (error) {
            console.warn('⚠️ Erreur lors du chargement du cache de tiles:', error);
        }
        
        this.initialized = true;
    }

    generateTileKey(x: number, y: number, z: number): string {
        return `${z}/${x}/${y}`;
    }

    async cacheTile(url: string, x: number, y: number, z: number): Promise<boolean> {
        await this.init();
        
        try {
            // Vérifier si déjà en cache
            const key = this.generateTileKey(x, y, z);
            if (this.cache.has(key)) {
                return true;
            }

            // Charger la tile
            const response = await fetch(url);
            if (!response.ok) {
                return false;
            }

            const blob = await response.blob();
            const dataUrl = await this.blobToDataUrl(blob);

            const tileCache: TileCache = {
                url,
                data: dataUrl,
                timestamp: Date.now(),
                x,
                y,
                z,
            };

            this.cache.set(key, tileCache);
            
            // Nettoyer le cache si trop gros
            this.cleanupCache();
            
            // Sauvegarder en localStorage
            this.persistCache();

            return true;
        } catch (error) {
            console.warn('⚠️ Erreur lors de la mise en cache de la tile:', error);
            return false;
        }
    }

    getCachedTile(x: number, y: number, z: number): string | null {
        const key = this.generateTileKey(x, y, z);
        const cached = this.cache.get(key);
        
        if (!cached) {
            return null;
        }

        // Vérifier l'âge du cache
        if (Date.now() - cached.timestamp > MAX_CACHE_AGE) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    private blobToDataUrl(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    private cleanupCache() {
        if (this.cache.size <= MAX_CACHE_SIZE) {
            return;
        }

        // Trier par timestamp et garder les plus récents
        const sorted = Array.from(this.cache.entries())
            .sort(([, a], [, b]) => b.timestamp - a.timestamp);

        this.cache.clear();
        sorted.slice(0, MAX_CACHE_SIZE).forEach(([key, value]) => {
            this.cache.set(key, value);
        });

        console.log(`🧹 Cache nettoyé: ${this.cache.size} tiles conservées`);
    }

    private persistCache() {
        try {
            const cacheObject = Object.fromEntries(this.cache);
            localStorage.setItem(CACHE_NAME, JSON.stringify(cacheObject));
        } catch (error) {
            console.warn('⚠️ Erreur lors de la sauvegarde du cache:', error);
        }
    }

    getCacheSize(): number {
        return this.cache.size;
    }

    clearCache() {
        this.cache.clear();
        try {
            localStorage.removeItem(CACHE_NAME);
            console.log('🗑️ Cache de tiles vidé');
        } catch (error) {
            console.warn('⚠️ Erreur lors du vidage du cache:', error);
        }
    }

    // Pré-charger les tiles pour une zone donnée
    async preloadArea(centerLat: number, centerLng: number, zoom: number, radius = 2) {
        await this.init();
        
        console.log(`📦 Pré-chargement des tiles autour de ${centerLat}, ${centerLng} (zoom ${zoom})`);
        
        // Convertir les coordonnées en tiles
        const centerX = Math.floor((centerLng + 180) / 360 * Math.pow(2, zoom));
        const centerY = Math.floor((1 - Math.log(Math.tan(centerLat * Math.PI / 180) + 1 / Math.cos(centerLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
        
        const promises: Promise<boolean>[] = [];
        
        // Charger les tiles autour du centre
        for (let x = centerX - radius; x <= centerX + radius; x++) {
            for (let y = centerY - radius; y <= centerY + radius; y++) {
                if (x >= 0 && y >= 0 && x < Math.pow(2, zoom) && y < Math.pow(2, zoom)) {
                    const tileUrl = `https://a.tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
                    promises.push(this.cacheTile(tileUrl, x, y, zoom));
                }
            }
        }
        
        try {
            const results = await Promise.allSettled(promises);
            const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
            console.log(`✅ Pré-chargement terminé: ${successful}/${promises.length} tiles cachées`);
        } catch (error) {
            console.warn('⚠️ Erreur lors du pré-chargement:', error);
        }
    }
}

export const mapCache = new OfflineMapCache();