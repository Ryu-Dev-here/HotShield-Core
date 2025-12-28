package com.hotshield.detection;

import com.hotshield.HotShield;
import com.hotshield.config.HotShieldConfig;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Gui;
import net.minecraft.util.EnumChatFormatting;
import net.minecraftforge.client.event.ClientChatReceivedEvent;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.fml.common.eventhandler.SubscribeEvent;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public class ChatIntelligence {
    
    private final HotShieldConfig config;
    private final List<Pattern> scamPatterns;
    private final List<String> suspiciousMessages = new ArrayList<>();
    
    public ChatIntelligence(HotShieldConfig config) {
        this.config = config;
        this.scamPatterns = initializePatterns();
    }
    
    private List<Pattern> initializePatterns() {
        List<Pattern> patterns = new ArrayList<>();
        
        patterns.add(Pattern.compile("(?i).*cheap\\s+coins.*"));
        patterns.add(Pattern.compile("(?i).*trust\\s+me\\s+bro.*"));
        patterns.add(Pattern.compile("(?i).*middleman\\s+not\\s+needed.*"));
        patterns.add(Pattern.compile("(?i).*no\\s+middleman.*"));
        patterns.add(Pattern.compile("(?i).*quick\\s+trade.*"));
        patterns.add(Pattern.compile("(?i).*discord.*"));
        patterns.add(Pattern.compile("(?i).*selling.*cheap.*"));
        patterns.add(Pattern.compile("(?i).*buying.*bulk.*"));
        patterns.add(Pattern.compile("(?i).*dm\\s+me.*"));
        patterns.add(Pattern.compile("(?i).*private\\s+message.*"));
        patterns.add(Pattern.compile("(?i).*i['']?m\\s+quitting.*"));
        patterns.add(Pattern.compile("(?i).*quitting\\s+game.*"));
        patterns.add(Pattern.compile("(?i).*free+!+.*"));
        patterns.add(Pattern.compile("(?i).*free\\s+stuff.*"));
        patterns.add(Pattern.compile("(?i).*giving\\s+away.*"));
        patterns.add(Pattern.compile("(?i).*http://.*"));
        patterns.add(Pattern.compile("(?i).*https://.*"));
        patterns.add(Pattern.compile("(?i).*www\\..*"));
        patterns.add(Pattern.compile("(?i).*\\.com.*"));
        patterns.add(Pattern.compile("(?i).*\\.net.*"));
        patterns.add(Pattern.compile("(?i).*\\.org.*"));
        patterns.add(Pattern.compile("(?i).*\\.io.*"));
        patterns.add(Pattern.compile("(?i).*\\.gg.*"));
        patterns.add(Pattern.compile("(?i).*\\.xyz.*"));
        
        return patterns;
    }
    
    @SubscribeEvent
    public void onChat(ClientChatReceivedEvent event) {
        if (!config.enablePhraseDetection) return;
        String unformatted = event.message.getUnformattedText();
        boolean isSuspicious = false;
        for (Pattern pattern : scamPatterns) {
            if (pattern.matcher(unformatted).matches()) {
                isSuspicious = true;
                break;
            }
        }
        if (isSuspicious) {
            if (config.showWarningOverlay) {
                suspiciousMessages.add(unformatted);
                if (suspiciousMessages.size() > 5) suspiciousMessages.remove(0);
            }
            if (config.autoHighlightSuspicious) {
                String formatted = event.message.getFormattedText();
                event.message = new net.minecraft.util.ChatComponentText(
                    EnumChatFormatting.YELLOW + "[⚠ PROBABLY A SCAM] " + 
                    EnumChatFormatting.RESET + formatted
                );
            }
        }
    }
    
    public List<String> getSuspiciousMessages() {
        return new ArrayList<>(suspiciousMessages);
    }
    
    public void clearSuspiciousMessages() {
        suspiciousMessages.clear();
    }
}

