package com.hotshield.safety;

import com.hotshield.HotShield;
import com.hotshield.database.ScammerDatabase;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Gui;
import net.minecraft.client.gui.GuiButton;
import net.minecraft.client.gui.GuiScreen;
import net.minecraft.entity.player.EntityPlayer;
import net.minecraft.util.EnumChatFormatting;
import net.minecraftforge.client.event.GuiScreenEvent;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.fml.common.eventhandler.SubscribeEvent;

import java.util.UUID;

public class TradeWarning {
    
    private final ScammerDatabase database;
    private UUID lastWarnedUuid = null;
    private long lastWarningTime = 0;
    
    public TradeWarning(ScammerDatabase database) {
        this.database = database;
    }
    
    public boolean shouldWarn(UUID uuid) {
        if (!HotShield.instance.getConfig().showTradeWarning) return false;
        if (!database.isScammer(uuid)) return false;
        
        if (uuid.equals(lastWarnedUuid) && 
            System.currentTimeMillis() - lastWarningTime < 300000) {
            return false;
        }
        
        lastWarnedUuid = uuid;
        lastWarningTime = System.currentTimeMillis();
        return true;
    }
    
    public void showWarning(UUID uuid, String playerName) {
        if (shouldWarn(uuid)) {
            Minecraft.getMinecraft().displayGuiScreen(new TradeWarningGui(uuid, playerName));
        }
    }
    
    private static class TradeWarningGui extends GuiScreen {
        private final UUID uuid;
        private final String playerName;
        
        public TradeWarningGui(UUID uuid, String playerName) {
            this.uuid = uuid;
            this.playerName = playerName;
        }
        
        @Override
        public void initGui() {
            int centerX = width / 2;
            int centerY = height / 2;
            
            buttonList.add(new GuiButton(0, centerX - 100, centerY + 40, 200, 20, "I Understand - Continue"));
            buttonList.add(new GuiButton(1, centerX - 100, centerY + 65, 200, 20, "Cancel"));
        }
        
        @Override
        public void drawScreen(int mouseX, int mouseY, float partialTicks) {
            drawDefaultBackground();
            
            int centerX = width / 2;
            int centerY = height / 2;
            
            drawCenteredString(fontRendererObj, 
                EnumChatFormatting.RED + "⚠ WARNING ⚠", 
                centerX, centerY - 60, 0xFFFFFF);
            
            String[] lines = {
                EnumChatFormatting.YELLOW + "This user is flagged as a SCAMMER!",
                "",
                EnumChatFormatting.WHITE + "Player: " + EnumChatFormatting.RED + playerName,
                "",
                EnumChatFormatting.GRAY + "Proceeding with a trade is not recommended.",
                EnumChatFormatting.GRAY + "You have been warned.",
                "",
                EnumChatFormatting.DARK_RED + "HotShield cannot prevent scams.",
                EnumChatFormatting.DARK_RED + "Trade at your own risk."
            };
            
            int y = centerY - 30;
            for (String line : lines) {
                drawCenteredString(fontRendererObj, line, centerX, y, 0xFFFFFF);
                y += 12;
            }
            
            super.drawScreen(mouseX, mouseY, partialTicks);
        }
        
        @Override
        protected void actionPerformed(GuiButton button) {
            if (button.id == 0 || button.id == 1) {
                mc.displayGuiScreen(null);
            }
        }
        
        @Override
        protected void keyTyped(char typedChar, int keyCode) {
            if (keyCode == 1) {
                mc.displayGuiScreen(null);
            }
        }
    }
}

