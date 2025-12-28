package com.hotshield.gui;

import com.hotshield.HotShield;
import com.hotshield.config.HotShieldConfig;
import com.hotshield.trust.TrustSystem;
import net.minecraft.client.gui.GuiButton;
import net.minecraft.client.gui.GuiScreen;
import net.minecraft.client.gui.GuiTextField;
import net.minecraft.util.EnumChatFormatting;
import org.lwjgl.input.Keyboard;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Executors;

public class FlagGui extends GuiScreen {
    
    private String prefillUsername;
    private GuiTextField usernameField;
    private GuiTextField descriptionField;
    private GuiTextField proofField;
    private GuiButton submitButton;
    private GuiButton cancelButton;
    private int selectedScamType = 0;
    private List<String> scamTypes = new ArrayList<>();
    private String statusMessage = "";
    private EnumChatFormatting statusColor = EnumChatFormatting.WHITE;
    
    public FlagGui(String prefillUsername) {
        this.prefillUsername = prefillUsername;
        
        scamTypes.add("Item Scam");
        scamTypes.add("Coin Scam");
        scamTypes.add("Account Scam");
        scamTypes.add("Middleman Scam");
        scamTypes.add("Fake Middleman");
        scamTypes.add("Chargeback");
        scamTypes.add("Other");
    }
    
    @Override
    public void initGui() {
        Keyboard.enableRepeatEvents(true);
        
        int centerX = width / 2;
        int centerY = height / 2;
        
        usernameField = new GuiTextField(0, fontRendererObj, centerX - 150, centerY - 80, 300, 20);
        usernameField.setMaxStringLength(16);
        if (prefillUsername != null) {
            usernameField.setText(prefillUsername);
        }
        
        descriptionField = new GuiTextField(1, fontRendererObj, centerX - 150, centerY - 30, 300, 60);
        descriptionField.setMaxStringLength(500);
        
        proofField = new GuiTextField(2, fontRendererObj, centerX - 150, centerY + 50, 300, 20);
        proofField.setMaxStringLength(200);
        
        buttonList.add(new GuiButton(0, centerX - 100, centerY + 100, 80, 20, "Scam Type"));
        submitButton = new GuiButton(1, centerX - 50, centerY + 130, 100, 20, "Submit Report");
        cancelButton = new GuiButton(2, centerX + 50, centerY + 130, 80, 20, "Cancel");
        
        buttonList.add(submitButton);
        buttonList.add(cancelButton);
    }
    
    @Override
    public void drawScreen(int mouseX, int mouseY, float partialTicks) {
        drawDefaultBackground();
        
        int centerX = width / 2;
        int centerY = height / 2;
        
        drawCenteredString(fontRendererObj, EnumChatFormatting.AQUA + "HotShield - Report Scammer", centerX, centerY - 120, 0xFFFFFF);
        
        fontRendererObj.drawString("Username:", centerX - 150, centerY - 95, 0xFFFFFF);
        fontRendererObj.drawString("Description:", centerX - 150, centerY - 45, 0xFFFFFF);
        fontRendererObj.drawString("Proof Link (GoFile/MediaFire/Dropbox):", centerX - 150, centerY + 35, 0xFFFFFF);
        
        if (!statusMessage.isEmpty()) {
            drawCenteredString(fontRendererObj, statusColor + statusMessage, centerX, centerY + 160, 0xFFFFFF);
        }
        
        usernameField.drawTextBox();
        descriptionField.drawTextBox();
        proofField.drawTextBox();
        
        GuiButton scamTypeButton = buttonList.get(0);
        scamTypeButton.displayString = "Type: " + scamTypes.get(selectedScamType);
        
        super.drawScreen(mouseX, mouseY, partialTicks);
    }
    
    @Override
    protected void keyTyped(char typedChar, int keyCode) throws IOException {
        if (keyCode == Keyboard.KEY_ESCAPE) {
            mc.displayGuiScreen(null);
            return;
        }
        
        usernameField.textboxKeyTyped(typedChar, keyCode);
        descriptionField.textboxKeyTyped(typedChar, keyCode);
        proofField.textboxKeyTyped(typedChar, keyCode);
        
        super.keyTyped(typedChar, keyCode);
    }
    
    @Override
    protected void mouseClicked(int mouseX, int mouseY, int mouseButton) throws IOException {
        usernameField.mouseClicked(mouseX, mouseY, mouseButton);
        descriptionField.mouseClicked(mouseX, mouseY, mouseButton);
        proofField.mouseClicked(mouseX, mouseY, mouseButton);
        
        super.mouseClicked(mouseX, mouseY, mouseButton);
    }
    
    @Override
    protected void actionPerformed(GuiButton button) throws IOException {
        if (button.id == 0) {
            selectedScamType = (selectedScamType + 1) % scamTypes.size();
        } else if (button.id == 1) {
            submitReport();
        } else if (button.id == 2) {
            mc.displayGuiScreen(null);
        }
    }
    
    private void submitReport() {
        String username = usernameField.getText().trim();
        String description = descriptionField.getText().trim();
        String proof = proofField.getText().trim();
        
        if (username.isEmpty()) {
            statusMessage = "Username cannot be empty!";
            statusColor = EnumChatFormatting.RED;
            return;
        }
        
        if (description.isEmpty()) {
            statusMessage = "Description cannot be empty!";
            statusColor = EnumChatFormatting.RED;
            return;
        }
        
        if (proof.isEmpty() || !isValidProofLink(proof)) {
            statusMessage = "Please provide a valid proof link (GoFile/MediaFire/Dropbox)";
            statusColor = EnumChatFormatting.RED;
            return;
        }
        
        TrustSystem trustSystem = HotShield.instance.getTrustSystem();
        UUID playerUuid = mc.thePlayer.getUniqueID();
        if (!trustSystem.canReport(playerUuid, 60000)) {
            statusMessage = "Please wait before submitting another report!";
            statusColor = EnumChatFormatting.YELLOW;
            return;
        }
        
        statusMessage = "Submitting report...";
        statusColor = EnumChatFormatting.YELLOW;
        submitButton.enabled = false;
        
        Executors.newSingleThreadExecutor().execute(() -> {
            try {
                submitToAPI(username, description, proof, scamTypes.get(selectedScamType));
                
                trustSystem.recordReport(playerUuid);
                
                mc.addScheduledTask(() -> {
                    statusMessage = "Report submitted successfully!";
                    statusColor = EnumChatFormatting.GREEN;
                    submitButton.enabled = true;
                });
            } catch (Exception e) {
                mc.addScheduledTask(() -> {
                    statusMessage = "Failed to submit report. Check your connection.";
                    statusColor = EnumChatFormatting.RED;
                    submitButton.enabled = true;
                });
            }
        });
    }
    
    private boolean isValidProofLink(String link) {
        link = link.toLowerCase();
        return link.contains("gofile.io") || 
               link.contains("mediafire.com") || 
               link.contains("dropbox.com") ||
               link.contains("drive.google.com") ||
               link.startsWith("http://") || 
               link.startsWith("https://");
    }
    
    private void submitToAPI(String username, String description, String proof, String scamType) throws IOException {
        HotShieldConfig config = HotShield.instance.getConfig();
        HttpURLConnection con = (HttpURLConnection) new URL(config.flagApiUrl).openConnection();
        
        con.setRequestMethod("POST");
        con.setDoOutput(true);
        con.setRequestProperty("Content-Type", "application/json");
        con.setRequestProperty("User-Agent", "HotShield/1.0");
        con.setConnectTimeout(5000);
        con.setReadTimeout(10000);
        
        String json = String.format(
            "{\"user\":\"%s\",\"description\":\"%s\",\"proof\":\"%s\",\"scamType\":\"%s\"}",
            escapeJson(username),
            escapeJson(description),
            escapeJson(proof),
            escapeJson(scamType)
        );
        
        try (java.io.OutputStream os = con.getOutputStream()) {
            os.write(json.getBytes("UTF-8"));
        }
        
        try (java.io.InputStream is = con.getInputStream()) {
        }
    }
    
    private String escapeJson(String str) {
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
    
    @Override
    public void onGuiClosed() {
        Keyboard.enableRepeatEvents(false);
    }
}

