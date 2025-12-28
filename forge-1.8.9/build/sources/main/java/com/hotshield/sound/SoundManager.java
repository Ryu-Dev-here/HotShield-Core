package com.hotshield.sound;

import com.hotshield.config.HotShieldConfig;
import net.minecraft.client.Minecraft;
import net.minecraft.client.audio.PositionedSoundRecord;
import net.minecraft.util.ResourceLocation;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.fml.common.eventhandler.SubscribeEvent;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public class SoundManager {
    
    private final HotShieldConfig config;
    private final Set<UUID> playedSounds = new HashSet<>();
    
    public SoundManager(HotShieldConfig config) {
        this.config = config;
    }
    
    public void onScammerNearby(UUID uuid) {
        if (!config.enableScammerSound) return;
        
       
        if (playedSounds.contains(uuid)) return;
        
        playedSounds.add(uuid);
        
        Minecraft.getMinecraft().getSoundHandler().playSound(
            PositionedSoundRecord.create(
                new ResourceLocation("note.pling"),
                config.soundVolume
            )
        );
    }
    
    public void reset() {
        playedSounds.clear();
    }
}

