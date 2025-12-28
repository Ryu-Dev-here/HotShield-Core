package com.hotshield.integration;

import com.hotshield.HotShield;
import com.hotshield.database.ScammerDatabase;
import com.hotshield.render.ScammerRenderer;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiPlayerTabOverlay;
import net.minecraft.client.network.NetworkPlayerInfo;
import net.minecraftforge.client.event.RenderGameOverlayEvent;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.fml.common.eventhandler.SubscribeEvent;

import java.util.UUID;

public class TablistIntegration {
    
    private final ScammerDatabase database;
    private final ScammerRenderer renderer;
    
    public TablistIntegration(ScammerDatabase database, ScammerRenderer renderer) {
        this.database = database;
        this.renderer = renderer;
    }
    
    @SubscribeEvent
    public void onRenderTablist(RenderGameOverlayEvent.Pre event) {
        if (!HotShield.instance.getConfig().showTablistTag) return;
        if (event.type != RenderGameOverlayEvent.ElementType.PLAYER_LIST) return;
        
        if (Minecraft.getMinecraft().thePlayer != null && 
            Minecraft.getMinecraft().thePlayer.sendQueue != null) {
        }
    }
}

