package com.hotshield;

import com.hotshield.commands.FlagCommand;
import com.hotshield.commands.HotShieldCommand;
import com.hotshield.config.HotShieldConfig;
import com.hotshield.database.ScammerDatabase;
import com.hotshield.detection.ChatIntelligence;
import com.hotshield.gui.DebugOverlay;
import com.hotshield.gui.FlagGui;
import com.hotshield.integration.ChatIntegration;
import com.hotshield.integration.TablistIntegration;
import com.hotshield.render.ScammerRenderer;
import com.hotshield.safety.ScreenWatermark;
import com.hotshield.safety.TradeWarning;
import com.hotshield.sound.SoundManager;
import com.hotshield.trust.TrustSystem;
import com.hotshield.util.CacheManager;
import net.minecraft.client.Minecraft;
import net.minecraft.entity.player.EntityPlayer;
import net.minecraftforge.client.ClientCommandHandler;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.common.event.FMLInitializationEvent;
import net.minecraftforge.fml.common.event.FMLPreInitializationEvent;
import net.minecraftforge.fml.common.eventhandler.SubscribeEvent;
import net.minecraftforge.fml.common.gameevent.TickEvent;

import java.util.UUID;

@Mod(modid = HotShield.MODID, name = HotShield.NAME, version = HotShield.VERSION, clientSideOnly = true)
public class HotShield {
    
    public static final String MODID = "hotshield";
    public static final String NAME = "HotShield";
    public static final String VERSION = "1.0";
    
    @Mod.Instance(MODID)
    public static HotShield instance;
    
    private ScammerDatabase scammerDatabase;
    private ChatIntelligence chatIntelligence;
    private TrustSystem trustSystem;
    private CacheManager cacheManager;
    private ScammerRenderer scammerRenderer;
    private SoundManager soundManager;
    private HotShieldConfig config;
    private ChatIntegration chatIntegration;
    private TablistIntegration tablistIntegration;
    private DebugOverlay debugOverlay;
    private TradeWarning tradeWarning;
    private ScreenWatermark screenWatermark;
    
    @Mod.EventHandler
    public void preInit(FMLPreInitializationEvent event) {
        config = new HotShieldConfig(event.getSuggestedConfigurationFile());
        config.load();
    }
    
    @Mod.EventHandler
    public void init(FMLInitializationEvent event) {
        cacheManager = new CacheManager();
        scammerDatabase = new ScammerDatabase(cacheManager, config);
        chatIntelligence = new ChatIntelligence(config);
        trustSystem = new TrustSystem();
        trustSystem.setCacheManager(cacheManager);
        scammerRenderer = new ScammerRenderer(scammerDatabase, config);
        soundManager = new SoundManager(config);
        chatIntegration = new ChatIntegration(scammerDatabase, scammerRenderer);
        tablistIntegration = new TablistIntegration(scammerDatabase, scammerRenderer);
        debugOverlay = new DebugOverlay(scammerDatabase);
        tradeWarning = new TradeWarning(scammerDatabase);
        screenWatermark = new ScreenWatermark();
        
        MinecraftForge.EVENT_BUS.register(this);
        MinecraftForge.EVENT_BUS.register(scammerDatabase);
        MinecraftForge.EVENT_BUS.register(chatIntelligence);
        MinecraftForge.EVENT_BUS.register(scammerRenderer);
        MinecraftForge.EVENT_BUS.register(soundManager);
        MinecraftForge.EVENT_BUS.register(chatIntegration);
        MinecraftForge.EVENT_BUS.register(tablistIntegration);
        MinecraftForge.EVENT_BUS.register(debugOverlay);
        MinecraftForge.EVENT_BUS.register(screenWatermark);
        
        ClientCommandHandler.instance.registerCommand(new FlagCommand());
        ClientCommandHandler.instance.registerCommand(new HotShieldCommand());
        
        scammerDatabase.fetchScammersAsync();
    }
    
    @SubscribeEvent
    public void onClientTick(TickEvent.ClientTickEvent event) {
        if (event.phase == TickEvent.Phase.END && Minecraft.getMinecraft().theWorld != null) {
            if (Minecraft.getMinecraft().thePlayer != null) {
                for (Object entity : Minecraft.getMinecraft().theWorld.loadedEntityList) {
                    if (entity instanceof EntityPlayer) {
                        EntityPlayer player = (EntityPlayer) entity;
                        UUID uuid = player.getUniqueID();
                        
                        if (scammerDatabase.isScammer(uuid)) {
                            double distance = Minecraft.getMinecraft().thePlayer.getDistanceToEntity(player);
                            if (distance <= 16.0 && distance > 0) {
                                soundManager.onScammerNearby(uuid);
                            }
                        }
                    }
                }
            }
        }
    }
    
    public ScammerDatabase getScammerDatabase() {
        return scammerDatabase;
    }
    
    public ChatIntelligence getChatIntelligence() {
        return chatIntelligence;
    }
    
    public TrustSystem getTrustSystem() {
        return trustSystem;
    }
    
    public HotShieldConfig getConfig() {
        return config;
    }
    
    public static void openFlagGui(String username) {
        Minecraft.getMinecraft().displayGuiScreen(new FlagGui(username));
    }
    
    public TradeWarning getTradeWarning() {
        return tradeWarning;
    }
}
