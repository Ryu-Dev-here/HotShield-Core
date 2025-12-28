package com.hotshield.integration;

import com.hotshield.HotShield;
import com.hotshield.database.ScammerDatabase;
import com.hotshield.render.ScammerRenderer;
import net.minecraft.client.Minecraft;
import net.minecraft.util.ChatComponentText;
import net.minecraft.util.EnumChatFormatting;
import net.minecraftforge.client.event.ClientChatReceivedEvent;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.fml.common.eventhandler.SubscribeEvent;

import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ChatIntegration {
    
    private final ScammerDatabase database;
    private final ScammerRenderer renderer;
    private final Pattern playerNamePattern = Pattern.compile("<(\\w+)>");
    
    public ChatIntegration(ScammerDatabase database, ScammerRenderer renderer) {
        this.database = database;
        this.renderer = renderer;
    }
    
    @SubscribeEvent
    public void onChat(ClientChatReceivedEvent event) {
        if (!HotShield.instance.getConfig().showChatTag) return;
        
        String unformatted = event.message.getUnformattedText();
        
        Matcher matcher = playerNamePattern.matcher(unformatted);
        if (matcher.find()) {
            String playerName = matcher.group(1);
            
            UUID uuid = getUuidFromName(playerName);
            if (uuid != null && database.isScammer(uuid)) {
                String formatted = event.message.getFormattedText();
                String tagged = renderer.formatChatMessage(formatted, uuid);
                event.message = new ChatComponentText(tagged);
            }
        }
    }
    
    private UUID getUuidFromName(String name) {
        if (Minecraft.getMinecraft().theWorld == null) return null;
        
        for (Object entity : Minecraft.getMinecraft().theWorld.loadedEntityList) {
            if (entity instanceof net.minecraft.entity.player.EntityPlayer) {
                net.minecraft.entity.player.EntityPlayer player = (net.minecraft.entity.player.EntityPlayer) entity;
                if (player.getName().equals(name)) {
                    return player.getUniqueID();
                }
            }
        }
        
        return null;
    }
}

