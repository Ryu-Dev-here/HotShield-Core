package com.hotshield.gui;

import com.hotshield.HotShield;
import com.hotshield.database.ScammerDatabase;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Gui;
import net.minecraft.entity.player.EntityPlayer;
import net.minecraft.util.EnumChatFormatting;
import net.minecraftforge.client.event.RenderGameOverlayEvent;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.fml.common.eventhandler.SubscribeEvent;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class DebugOverlay {
    
    private final ScammerDatabase database;
    
    public DebugOverlay(ScammerDatabase database) {
        this.database = database;
    }
    
    @SubscribeEvent
    public void onRenderOverlay(RenderGameOverlayEvent.Post event) {
        if (!HotShield.instance.getConfig().showDebugOverlay) return;
        if (event.type != RenderGameOverlayEvent.ElementType.TEXT) return;
        
        if (Minecraft.getMinecraft().theWorld == null || 
            Minecraft.getMinecraft().thePlayer == null) {
            return;
        }
        
        List<String> debugInfo = new ArrayList<>();
        debugInfo.add(EnumChatFormatting.AQUA + "=== HotShield Debug ===");
        debugInfo.add(EnumChatFormatting.GRAY + "Total scammers: " + 
                     EnumChatFormatting.WHITE + database.getScammerCount());
        
        List<EntityPlayer> nearbyScammers = new ArrayList<>();
        for (Object entity : Minecraft.getMinecraft().theWorld.loadedEntityList) {
            if (entity instanceof EntityPlayer) {
                EntityPlayer player = (EntityPlayer) entity;
                if (player == Minecraft.getMinecraft().thePlayer) continue;
                
                UUID uuid = player.getUniqueID();
                if (database.isScammer(uuid)) {
                    double distance = Minecraft.getMinecraft().thePlayer.getDistanceToEntity(player);
                    if (distance <= 64.0) {
                        nearbyScammers.add(player);
                    }
                }
            }
        }
        
        debugInfo.add(EnumChatFormatting.GRAY + "Nearby scammers: " + 
                     EnumChatFormatting.RED + nearbyScammers.size());
        
        for (EntityPlayer scammer : nearbyScammers) {
            ScammerDatabase.ScammerInfo info = database.getScammerInfo(scammer.getUniqueID());
            double distance = Minecraft.getMinecraft().thePlayer.getDistanceToEntity(scammer);
            String line = EnumChatFormatting.RED + scammer.getName() + 
                         EnumChatFormatting.GRAY + " (" + String.format("%.1f", distance) + "m)";
            if (info != null && info.confidence > 0) {
                line += EnumChatFormatting.GRAY + " [" + 
                       String.format("%.0f%%", info.confidence * 100) + "]";
            }
            debugInfo.add(line);
        }
        
        int y = 10;
        for (String line : debugInfo) {
            Minecraft.getMinecraft().fontRendererObj.drawStringWithShadow(line, 10, y, 0xFFFFFF);
            y += 10;
        }
    }
}

