package com.hotshield.util;

import net.minecraft.client.Minecraft;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

public class ConfigEncryption {
    
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/ECB/PKCS5Padding";
    private static final String KEY = "Imacat"; // les remember to change this later on with a proper key
    
    public static Map<String, String> loadEncryptedConfig() {
        Map<String, String> config = new HashMap<>();
        try {
            InputStream is = Minecraft.getMinecraft().getClass().getClassLoader()
                .getResourceAsStream("META-INF/config.txt");
            if (is == null) {
                return config;
            }
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;
                
                String decrypted = decrypt(line);
                if (decrypted != null && decrypted.contains("=")) {
                    int eq = decrypted.indexOf("=");
                    String key = decrypted.substring(0, eq).trim();
                    String value = decrypted.substring(eq + 1).trim();
                    config.put(key, value);
                }
            }
            reader.close();
        } catch (Exception e) {
        }
        return config;
    }
    
    public static String encrypt(String plaintext) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(KEY.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encrypted = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            return plaintext;
        }
    }
    
    public static String decrypt(String encrypted) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(KEY.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decoded = Base64.getDecoder().decode(encrypted);
            byte[] decrypted = cipher.doFinal(decoded);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return encrypted;
        }
    }
}

