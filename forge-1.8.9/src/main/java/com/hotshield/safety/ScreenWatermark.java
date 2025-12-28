package com.hotshield.safety;

import com.hotshield.HotShield;
import net.minecraft.client.Minecraft;
import net.minecraft.util.EnumChatFormatting;
import net.minecraftforge.client.event.RenderGameOverlayEvent;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.fml.common.eventhandler.SubscribeEvent;

public class ScreenWatermark {
    
    @SubscribeEvent
    public void onRenderOverlay(RenderGameOverlayEvent.Post event) {
        if (!HotShield.instance.getConfig().enableScreenWatermark) return;
        if (event.type != RenderGameOverlayEvent.ElementType.TEXT) return;
        
        if (Minecraft.getMinecraft().theWorld == null) return;
        
        String watermark = EnumChatFormatting.GRAY + "HotShield v" + HotShield.VERSION;
        int x = event.resolution.getScaledWidth() - 
                Minecraft.getMinecraft().fontRendererObj.getStringWidth(watermark) - 10;
        int y = event.resolution.getScaledHeight() - 20;
        
        Minecraft.getMinecraft().fontRendererObj.drawStringWithShadow(
            watermark, x, y, 0xFFFFFF
        );
    }
}

