package com.hotshield.render;

import com.hotshield.config.HotShieldConfig;
import com.hotshield.database.ScammerDatabase;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiPlayerTabOverlay;
import net.minecraft.entity.player.EntityPlayer;
import net.minecraft.util.EnumChatFormatting;
import net.minecraftforge.client.event.RenderPlayerEvent;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.fml.common.eventhandler.SubscribeEvent;

import java.util.UUID;

public class ScammerRenderer {
    
    private final ScammerDatabase database;
    private final HotShieldConfig config;
    
    public ScammerRenderer(ScammerDatabase database, HotShieldConfig config) {
        this.database = database;
        this.config = config;
    }
    
    @SubscribeEvent
    public void onRenderName(RenderPlayerEvent.Pre event) {
        if (!config.showNametag) return;
        
        EntityPlayer player = event.entityPlayer;
        UUID uuid = player.getUniqueID();
        
        if (database.isScammer(uuid)) {
            String tag = getTagPrefix();
            String name = player.getName();
            
            player.setCustomNameTag(tag + name);
            player.setAlwaysRenderNameTag(true);
        }
    }
    
    private String getTagPrefix() {
        switch (config.tagMode) {
            case SOFT:
                return EnumChatFormatting.YELLOW + "[SCAMMER] " + EnumChatFormatting.RESET;
            case HARD:
                return EnumChatFormatting.RED + "[SCAMMER] " + EnumChatFormatting.RESET;
            case NUCLEAR:
                return EnumChatFormatting.RED + "" + EnumChatFormatting.ITALIC + "[SCAMMER] " + EnumChatFormatting.RESET;
            default:
                return EnumChatFormatting.YELLOW + "[SCAMMER] " + EnumChatFormatting.RESET;
        }
    }
    
    public String formatTablistName(String originalName, UUID uuid) {
        if (!config.showTablistTag || !database.isScammer(uuid)) {
            return originalName;
        }
        
        return getTagPrefix() + originalName;
    }
    
    public String formatChatMessage(String originalMessage, UUID uuid) {
        if (!config.showChatTag || !database.isScammer(uuid)) {
            return originalMessage;
        }
        
        return getTagPrefix() + originalMessage;
    }
    
    public String getHoverText(UUID uuid) {
        if (!config.showHoverInfo) return null;
        
        ScammerDatabase.ScammerInfo info = database.getScammerInfo(uuid);
        if (info == null) return null;
        
        StringBuilder sb = new StringBuilder();
        sb.append(EnumChatFormatting.RED).append("⚠ SCAMMER ⚠\n");
        sb.append(EnumChatFormatting.RESET);
        
        if (info.reportReason != null) {
            sb.append("Reported for: ").append(info.reportReason).append("\n");
        }
        
        sb.append("Proof count: ").append(info.proofCount).append("\n");
        sb.append("Confidence: ").append(String.format("%.0f%%", info.confidence * 100));
        
        return sb.toString();
    }
}

