package com.hotshield.util;

import net.minecraft.client.Minecraft;
import java.io.File;

public class CacheManager {
    
    private File cacheDir;
    
    public CacheManager() {
        File mcDir = Minecraft.getMinecraft().mcDataDir;
        cacheDir = new File(mcDir, "hotshield_cache");
        if (!cacheDir.exists()) {
            cacheDir.mkdirs();
        }
    }
    
    public File getCacheFile(String filename) {
        return new File(cacheDir, filename);
    }
    
    public void clearCache() {
        if (cacheDir.exists()) {
            File[] files = cacheDir.listFiles();
            if (files != null) {
                for (File file : files) {
                    file.delete();
                }
            }
        }
    }
}

