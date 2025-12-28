package com.hotshield.config;

import com.hotshield.util.ConfigEncryption;
import net.minecraftforge.common.config.Configuration;

import java.io.File;
import java.util.Map;

public class HotShieldConfig {
    
    private Configuration config;
    
    public String scamApiUrl = "https://yourserver.com/api/scammers";
    public String flagApiUrl = "https://yourserver.com/api/flag";
    
    public TagMode tagMode = TagMode.SOFT;
    public boolean showChatTag = true;
    public boolean showNametag = true;
    public boolean showTablistTag = true;
    public boolean showHoverInfo = true;
    
    public boolean enablePhraseDetection = true;
    public boolean showWarningOverlay = true;
    public boolean autoHighlightSuspicious = true;
    public boolean autoMuteScammers = false;
    public boolean autoReply = false;
    
    public boolean enableScammerSound = true;
    public float soundVolume = 0.3f;
    
    public boolean enableTrustSystem = true;
    public boolean allowAnonymousReports = true;
    
    public boolean showTradeWarning = true;
    public boolean showSessionWarnings = true;
    public boolean enableScreenWatermark = false;
    
    public boolean showDebugOverlay = false;
    public boolean enableOfflineMode = false;
    public ProfileMode profileMode = ProfileMode.SAFE;
    
    public int cacheExpiryMinutes = 60;
    public int fetchIntervalSeconds = 300;
    public int fetchJitterSeconds = 30;
    
    public enum TagMode {
        SOFT("Soft (Yellow)"),
        HARD("Hard (Red)"),
        NUCLEAR("Nuclear (Red + Italics)");
        
        private final String displayName;
        
        TagMode(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public enum ProfileMode {
        SAFE("Safe"),
        PARANOID("Paranoid"),
        UNHINGED("Unhinged");
        
        private final String displayName;
        
        ProfileMode(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    public HotShieldConfig(File configFile) {
        config = new Configuration(configFile);
        loadEncryptedConfig();
    }
    
    private void loadEncryptedConfig() {
        Map<String, String> encrypted = ConfigEncryption.loadEncryptedConfig();
        if (encrypted.containsKey("scamApiUrl")) scamApiUrl = encrypted.get("scamApiUrl");
        if (encrypted.containsKey("flagApiUrl")) flagApiUrl = encrypted.get("flagApiUrl");
    }
    
    public void load() {
        config.load();
        
        scamApiUrl = config.getString("scamApiUrl", "api", scamApiUrl, "URL for scammer database API");
        flagApiUrl = config.getString("flagApiUrl", "api", flagApiUrl, "URL for flag/report API");
        
        // Visual Settings
        String tagModeStr = config.getString("tagMode", "visual", tagMode.name(), "Tag display mode: SOFT, HARD, NUCLEAR");
        try {
            tagMode = TagMode.valueOf(tagModeStr);
        } catch (IllegalArgumentException e) {
            tagMode = TagMode.SOFT;
        }
        
        showChatTag = config.getBoolean("showChatTag", "visual", showChatTag, "Show [SCAMMER] tag in chat");
        showNametag = config.getBoolean("showNametag", "visual", showNametag, "Show [SCAMMER] tag on nametag");
        showTablistTag = config.getBoolean("showTablistTag", "visual", showTablistTag, "Show [SCAMMER] tag in tablist");
        showHoverInfo = config.getBoolean("showHoverInfo", "visual", showHoverInfo, "Show hover info on scammer names");
        
        enablePhraseDetection = config.getBoolean("enablePhraseDetection", "chat", enablePhraseDetection, "Enable scam phrase detection");
        showWarningOverlay = config.getBoolean("showWarningOverlay", "chat", showWarningOverlay, "Show warning overlay for suspicious messages");
        autoHighlightSuspicious = config.getBoolean("autoHighlightSuspicious", "chat", autoHighlightSuspicious, "Auto-highlight suspicious messages");
        autoMuteScammers = config.getBoolean("autoMuteScammers", "chat", autoMuteScammers, "Auto-mute scammers locally");
        autoReply = config.getBoolean("autoReply", "chat", autoReply, "Auto-reply to scammers (chaos mode)");
        
        enableScammerSound = config.getBoolean("enableScammerSound", "sound", enableScammerSound, "Play sound when scammer is nearby");
        soundVolume = config.getFloat("soundVolume", "sound", soundVolume, 0.0f, 1.0f, "Volume for scammer detection sound");
        
        enableTrustSystem = config.getBoolean("enableTrustSystem", "trust", enableTrustSystem, "Enable trust system");
        allowAnonymousReports = config.getBoolean("allowAnonymousReports", "trust", allowAnonymousReports, "Allow anonymous reports");
        
        showTradeWarning = config.getBoolean("showTradeWarning", "safety", showTradeWarning, "Show trade confirmation overlay");
        showSessionWarnings = config.getBoolean("showSessionWarnings", "safety", showSessionWarnings, "Show session warnings");
        enableScreenWatermark = config.getBoolean("enableScreenWatermark", "safety", enableScreenWatermark, "Enable screen watermark when recording");
        
        showDebugOverlay = config.getBoolean("showDebugOverlay", "power", showDebugOverlay, "Show debug overlay");
        enableOfflineMode = config.getBoolean("enableOfflineMode", "power", enableOfflineMode, "Enable offline mode (cached DB only)");
        String profileModeStr = config.getString("profileMode", "power", profileMode.name(), "Profile mode: SAFE, PARANOID, UNHINGED");
        try {
            profileMode = ProfileMode.valueOf(profileModeStr);
        } catch (IllegalArgumentException e) {
            profileMode = ProfileMode.SAFE;
        }
        
        cacheExpiryMinutes = config.getInt("cacheExpiryMinutes", "cache", cacheExpiryMinutes, 1, 1440, "Cache expiry time in minutes");
        fetchIntervalSeconds = config.getInt("fetchIntervalSeconds", "cache", fetchIntervalSeconds, 60, 3600, "Fetch interval in seconds");
        fetchJitterSeconds = config.getInt("fetchJitterSeconds", "cache", fetchJitterSeconds, 0, 300, "Random jitter for fetch timing");
        
        if (config.hasChanged()) {
            config.save();
        }
    }
    
    public void save() {
        config.save();
    }
}

