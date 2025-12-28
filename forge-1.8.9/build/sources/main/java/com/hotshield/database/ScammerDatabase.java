package com.hotshield.database;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.hotshield.HotShield;
import com.hotshield.config.HotShieldConfig;
import com.hotshield.util.CacheManager;
import net.minecraftforge.fml.common.eventhandler.SubscribeEvent;
import net.minecraftforge.fml.common.gameevent.TickEvent;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

public class ScammerDatabase {
    
    private final CacheManager cacheManager;
    private final HotShieldConfig config;
    private final Gson gson = new Gson();
    
    private final Map<UUID, ScammerInfo> scammers = new ConcurrentHashMap<>();
    private final Map<UUID, ScammerInfo> pending = new ConcurrentHashMap<>();
    private final Map<UUID, ScammerInfo> disputed = new ConcurrentHashMap<>();
    
    private long lastFetch = 0;
    private long nextFetchTime = 0;
    private boolean isFetching = false;
    
    private final ScheduledExecutorService executor = Executors.newScheduledThreadPool(2);
    
    public ScammerDatabase(CacheManager cacheManager, HotShieldConfig config) {
        this.cacheManager = cacheManager;
        this.config = config;
        loadFromCache();
        scheduleNextFetch();
    }
    
    public static class ScammerInfo {
        public UUID uuid;
        public String name;
        public String reportReason;
        public int proofCount;
        public float confidence;
        public long lastUpdated;
        public String source;
        
        public ScammerInfo(UUID uuid) {
            this.uuid = uuid;
            this.confidence = 0.5f;
            this.proofCount = 0;
            this.lastUpdated = System.currentTimeMillis();
        }
    }
    
    public boolean isScammer(UUID uuid) {
        if (uuid == null) return false;
        
        ScammerInfo info = scammers.get(uuid);
        if (info != null && info.confidence >= 0.3f) {
            return true;
        }
        if (config.profileMode == HotShieldConfig.ProfileMode.PARANOID || 
            config.profileMode == HotShieldConfig.ProfileMode.UNHINGED) {
            return pending.containsKey(uuid);
        }
        
        return false;
    }
    
    public ScammerInfo getScammerInfo(UUID uuid) {
        if (uuid == null) return null;
        
        ScammerInfo info = scammers.get(uuid);
        if (info != null) return info;
        
        info = pending.get(uuid);
        if (info != null) return info;
        
        return disputed.get(uuid);
    }
    
    public void fetchScammersAsync() {
        if (isFetching || config.enableOfflineMode) {
            return;
        }
        
        isFetching = true;
        executor.execute(() -> {
            try {
                fetchFromAPI();
            } catch (Exception e) {
            } finally {
                isFetching = false;
                scheduleNextFetch();
            }
        });
    }
    
    private void fetchFromAPI() throws IOException {
        HttpURLConnection con = (HttpURLConnection) new URL(config.scamApiUrl).openConnection();
        con.setRequestMethod("GET");
        con.setConnectTimeout(5000);
        con.setReadTimeout(10000);
        con.setRequestProperty("User-Agent", "HotShield/1.0");
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(con.getInputStream()))) {
            String response = readAll(reader);
            
            try {
                JsonArray jsonArray = gson.fromJson(response, JsonArray.class);
                processJsonResponse(jsonArray);
            } catch (Exception e) {
                processLineByLine(response);
            }
            saveToCache();
        }
    }
    
    private String readAll(BufferedReader reader) throws IOException {
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line).append("\n");
        }
        return sb.toString();
    }
    
    private void processJsonResponse(JsonArray jsonArray) {
        Map<UUID, ScammerInfo> newScammers = new HashMap<>();
        
        for (JsonElement element : jsonArray) {
            JsonObject obj = element.getAsJsonObject();
            String uuidStr = obj.has("uuid") ? obj.get("uuid").getAsString() : null;
            if (uuidStr == null) continue;
            
            try {
                UUID uuid = UUID.fromString(uuidStr);
                ScammerInfo info = new ScammerInfo(uuid);
                
                if (obj.has("name")) info.name = obj.get("name").getAsString();
                if (obj.has("reason")) info.reportReason = obj.get("reason").getAsString();
                if (obj.has("proofCount")) info.proofCount = obj.get("proofCount").getAsInt();
                if (obj.has("confidence")) info.confidence = obj.get("confidence").getAsFloat();
                if (obj.has("source")) info.source = obj.get("source").getAsString();
                
                newScammers.put(uuid, info);
            } catch (IllegalArgumentException e) {
            }
        }
        
        scammers.clear();
        scammers.putAll(newScammers);
    }
    
    private void processLineByLine(String response) {
        Map<UUID, ScammerInfo> newScammers = new HashMap<>();
        
        for (String line : response.split("\n")) {
            line = line.trim();
            if (line.isEmpty()) continue;
            
            try {
                UUID uuid = UUID.fromString(line);
                newScammers.put(uuid, new ScammerInfo(uuid));
            } catch (IllegalArgumentException e) {
            }
        }
        
        scammers.clear();
        scammers.putAll(newScammers);
    }
    
    private void scheduleNextFetch() {
        int jitter = new Random().nextInt(config.fetchJitterSeconds * 1000);
        nextFetchTime = System.currentTimeMillis() + (config.fetchIntervalSeconds * 1000L) + jitter;
    }
    
    @SubscribeEvent
    public void tick(TickEvent.ClientTickEvent event) {
        if (event.phase == TickEvent.Phase.END && 
            System.currentTimeMillis() >= nextFetchTime && 
            !isFetching) {
            fetchScammersAsync();
        }
    }
    
    private void loadFromCache() {
        try {
            File cacheFile = cacheManager.getCacheFile("scammers.json");
            if (!cacheFile.exists()) return;
            
            if (System.currentTimeMillis() - cacheFile.lastModified() > 
                (config.cacheExpiryMinutes * 60 * 1000L)) {
                return;
            }
            
            try (BufferedReader reader = new BufferedReader(new FileReader(cacheFile))) {
                String response = readAll(reader);
                JsonArray jsonArray = gson.fromJson(response, JsonArray.class);
                processJsonResponse(jsonArray);
            }
        } catch (Exception e) {
        }
    }
    
    private void saveToCache() {
        try {
            File cacheFile = cacheManager.getCacheFile("scammers.json");
            JsonArray jsonArray = new JsonArray();
            
            for (ScammerInfo info : scammers.values()) {
                JsonObject obj = new JsonObject();
                obj.addProperty("uuid", info.uuid.toString());
                if (info.name != null) obj.addProperty("name", info.name);
                if (info.reportReason != null) obj.addProperty("reason", info.reportReason);
                obj.addProperty("proofCount", info.proofCount);
                obj.addProperty("confidence", info.confidence);
                if (info.source != null) obj.addProperty("source", info.source);
                jsonArray.add(obj);
            }
            
            try (FileWriter writer = new FileWriter(cacheFile)) {
                writer.write(gson.toJson(jsonArray));
            }
        } catch (Exception e) {
        }
    }
    
    public void addPending(UUID uuid, String reason, int proofCount) {
        ScammerInfo info = new ScammerInfo(uuid);
        info.reportReason = reason;
        info.proofCount = proofCount;
        info.confidence = 0.3f;
        info.source = "pending";
        pending.put(uuid, info);
    }
    
    public Map<UUID, ScammerInfo> getAllScammers() {
        return new HashMap<>(scammers);
    }
    
    public int getScammerCount() {
        return scammers.size();
    }
}

