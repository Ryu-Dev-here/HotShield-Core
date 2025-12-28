package com.hotshield.commands;

import com.hotshield.HotShield;
import com.hotshield.config.HotShieldConfig;
import com.hotshield.database.ScammerDatabase;
import net.minecraft.command.CommandBase;
import net.minecraft.command.ICommandSender;
import net.minecraft.util.EnumChatFormatting;

public class HotShieldCommand extends CommandBase {
    
    @Override
    public String getCommandName() {
        return "hotshield";
    }
    
    @Override
    public String getCommandUsage(ICommandSender sender) {
        return "/hotshield [stats|help|reload|toggle]";
    }
    
    @Override
    public void processCommand(ICommandSender sender, String[] args) {
        if (args.length == 0) {
            showHelp(sender);
            return;
        }
        
        String subcommand = args[0].toLowerCase();
        
        switch (subcommand) {
            case "stats":
                showStats(sender);
                break;
            case "help":
                showHelp(sender);
                break;
            case "reload":
                HotShield.instance.getScammerDatabase().fetchScammersAsync();
                sender.addChatMessage(new net.minecraft.util.ChatComponentText(
                    EnumChatFormatting.GREEN + "HotShield: Reloading scammer database..."
                ));
                break;
            case "toggle":
                if (args.length > 1) {
                    toggleSetting(sender, args[1]);
                } else {
                    sender.addChatMessage(new net.minecraft.util.ChatComponentText(
                        EnumChatFormatting.RED + "Usage: /hotshield toggle <setting>"
                    ));
                }
                break;
            default:
                showHelp(sender);
                break;
        }
    }
    
    private void showStats(ICommandSender sender) {
        ScammerDatabase db = HotShield.instance.getScammerDatabase();
        HotShieldConfig config = HotShield.instance.getConfig();
        
        sender.addChatMessage(new net.minecraft.util.ChatComponentText(
            EnumChatFormatting.AQUA + "=== HotShield Stats ==="
        ));
        sender.addChatMessage(new net.minecraft.util.ChatComponentText(
            EnumChatFormatting.GRAY + "Known scammers: " + EnumChatFormatting.WHITE + db.getScammerCount()
        ));
        sender.addChatMessage(new net.minecraft.util.ChatComponentText(
            EnumChatFormatting.GRAY + "Tag mode: " + EnumChatFormatting.WHITE + config.tagMode.getDisplayName()
        ));
        sender.addChatMessage(new net.minecraft.util.ChatComponentText(
            EnumChatFormatting.GRAY + "Profile: " + EnumChatFormatting.WHITE + config.profileMode.getDisplayName()
        ));
        sender.addChatMessage(new net.minecraft.util.ChatComponentText(
            EnumChatFormatting.GRAY + "Offline mode: " + EnumChatFormatting.WHITE + (config.enableOfflineMode ? "ON" : "OFF")
        ));
    }
    
    private void showHelp(ICommandSender sender) {
        sender.addChatMessage(new net.minecraft.util.ChatComponentText(
            EnumChatFormatting.AQUA + "=== HotShield Commands ==="
        ));
        sender.addChatMessage(new net.minecraft.util.ChatComponentText(
            EnumChatFormatting.YELLOW + "/flag [username]" + EnumChatFormatting.WHITE + " - Report a scammer"
        ));
        sender.addChatMessage(new net.minecraft.util.ChatComponentText(
            EnumChatFormatting.YELLOW + "/hotshield stats" + EnumChatFormatting.WHITE + " - Show statistics"
        ));
        sender.addChatMessage(new net.minecraft.util.ChatComponentText(
            EnumChatFormatting.YELLOW + "/hotshield reload" + EnumChatFormatting.WHITE + " - Reload database"
        ));
        sender.addChatMessage(new net.minecraft.util.ChatComponentText(
            EnumChatFormatting.YELLOW + "/hotshield toggle <setting>" + EnumChatFormatting.WHITE + " - Toggle settings"
        ));
    }
    
    private void toggleSetting(ICommandSender sender, String setting) {
        HotShieldConfig config = HotShield.instance.getConfig();
        String settingLower = setting.toLowerCase();
        
        switch (settingLower) {
            case "debug":
                config.showDebugOverlay = !config.showDebugOverlay;
                sender.addChatMessage(new net.minecraft.util.ChatComponentText(
                    EnumChatFormatting.GREEN + "Debug overlay: " + (config.showDebugOverlay ? "ON" : "OFF")
                ));
                config.save();
                break;
            case "offline":
                config.enableOfflineMode = !config.enableOfflineMode;
                sender.addChatMessage(new net.minecraft.util.ChatComponentText(
                    EnumChatFormatting.GREEN + "Offline mode: " + (config.enableOfflineMode ? "ON" : "OFF")
                ));
                config.save();
                break;
            default:
                sender.addChatMessage(new net.minecraft.util.ChatComponentText(
                    EnumChatFormatting.RED + "Unknown setting. Available: debug, offline"
                ));
                break;
        }
    }
    
    @Override
    public int getRequiredPermissionLevel() {
        return 0;
    }
}

