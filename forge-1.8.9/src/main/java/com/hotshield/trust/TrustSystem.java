package com.hotshield.trust;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.hotshield.util.CacheManager;

import java.io.*;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class TrustSystem {
    
    private final Gson gson = new Gson();
    private final Map<UUID, ReporterReputation> reputations = new HashMap<>();
    private CacheManager cacheManager;
    
    public TrustSystem() {
    }
    
    public void setCacheManager(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
        loadReputations();
    }
    
    public static class ReporterReputation {
        public UUID reporterUuid;
        public int totalReports = 0;
        public int verifiedReports = 0;
        public int falseReports = 0;
        public float trustScore = 1.0f;
        public long lastReportTime = 0;
        
        public ReporterReputation(UUID reporterUuid) {
            this.reporterUuid = reporterUuid;
        }
        
        public void updateTrustScore() {
            if (totalReports == 0) {
                trustScore = 1.0f;
                return;
            }
            
            float verifiedRatio = (float) verifiedReports / totalReports;
            float falseRatio = (float) falseReports / totalReports;
            
            trustScore = Math.max(0.0f, Math.min(1.0f, verifiedRatio - (falseRatio * 2.0f)));
        }
    }
    
    public ReporterReputation getReputation(UUID reporterUuid) {
        return reputations.computeIfAbsent(reporterUuid, ReporterReputation::new);
    }
    
    public void recordReport(UUID reporterUuid) {
        ReporterReputation rep = getReputation(reporterUuid);
        rep.totalReports++;
        rep.lastReportTime = System.currentTimeMillis();
        rep.updateTrustScore();
        saveReputations();
    }
    
    public void recordVerifiedReport(UUID reporterUuid) {
        ReporterReputation rep = getReputation(reporterUuid);
        rep.verifiedReports++;
        rep.updateTrustScore();
        saveReputations();
    }
    
    public void recordFalseReport(UUID reporterUuid) {
        ReporterReputation rep = getReputation(reporterUuid);
        rep.falseReports++;
        rep.updateTrustScore();
        saveReputations();
    }
    
    public float getTrustWeight(UUID reporterUuid) {
        ReporterReputation rep = getReputation(reporterUuid);
        return rep.trustScore;
    }
    
    public boolean canReport(UUID reporterUuid, long cooldownMs) {
        ReporterReputation rep = getReputation(reporterUuid);
        return System.currentTimeMillis() - rep.lastReportTime >= cooldownMs;
    }
    
    private void loadReputations() {
        if (cacheManager == null) return;
        
        try {
            File file = cacheManager.getCacheFile("reputations.json");
            if (!file.exists()) return;
            
            try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
                JsonObject json = gson.fromJson(reader, JsonObject.class);
                
                for (String key : json.keySet()) {
                    try {
                        UUID uuid = UUID.fromString(key);
                        JsonObject repJson = json.getAsJsonObject(key);
                        ReporterReputation rep = new ReporterReputation(uuid);
                        rep.totalReports = repJson.get("totalReports").getAsInt();
                        rep.verifiedReports = repJson.get("verifiedReports").getAsInt();
                        rep.falseReports = repJson.get("falseReports").getAsInt();
                        rep.trustScore = repJson.get("trustScore").getAsFloat();
                        rep.lastReportTime = repJson.get("lastReportTime").getAsLong();
                        rep.updateTrustScore();
                        reputations.put(uuid, rep);
                    } catch (Exception e) {
                    }
                }
            }
        } catch (Exception e) {
        }
    }
    
    private void saveReputations() {
        if (cacheManager == null) return;
        
        try {
            File file = cacheManager.getCacheFile("reputations.json");
            JsonObject json = new JsonObject();
            
            for (Map.Entry<UUID, ReporterReputation> entry : reputations.entrySet()) {
                ReporterReputation rep = entry.getValue();
                JsonObject repJson = new JsonObject();
                repJson.addProperty("totalReports", rep.totalReports);
                repJson.addProperty("verifiedReports", rep.verifiedReports);
                repJson.addProperty("falseReports", rep.falseReports);
                repJson.addProperty("trustScore", rep.trustScore);
                repJson.addProperty("lastReportTime", rep.lastReportTime);
                json.add(entry.getKey().toString(), repJson);
            }
            
            try (FileWriter writer = new FileWriter(file)) {
                writer.write(gson.toJson(json));
            }
        } catch (Exception e) {
        }
    }
}

