package com.hotshield.commands;

import com.hotshield.HotShield;
import net.minecraft.command.CommandBase;
import net.minecraft.command.ICommandSender;
import net.minecraft.util.EnumChatFormatting;

public class FlagCommand extends CommandBase {
    
    @Override
    public String getCommandName() {
        return "flag";
    }
    
    @Override
    public String getCommandUsage(ICommandSender sender) {
        return "/flag [username]";
    }
    
    @Override
    public void processCommand(ICommandSender sender, String[] args) {
        if (args.length == 0) {
            HotShield.openFlagGui(null);
        } else {
            HotShield.openFlagGui(args[0]);
        }
    }
    
    @Override
    public int getRequiredPermissionLevel() {
        return 0;
    }
}

