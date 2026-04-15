package vacademy.io.admin_core_service.features.audience.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import vacademy.io.common.exceptions.VacademyException;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * AES-256-GCM encryption service for OAuth access tokens.
 *
 * Storage format (base64-encoded): [12-byte IV][ciphertext+16-byte GCM auth tag]
 *
 * Key management: set OAUTH_TOKEN_ENCRYPTION_KEY env var to a base64-encoded
 * 32-byte (256-bit) random key. Generate with:
 *   openssl rand -base64 32
 */
@Service
public class TokenEncryptionService {

    private static final Logger log = LoggerFactory.getLogger(TokenEncryptionService.class);

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int IV_LENGTH_BYTES = 12;
    private static final int GCM_TAG_LENGTH_BITS = 128;

    private final SecretKeySpec keySpec;

    public TokenEncryptionService(
            @Value("${oauth.token.encryption.key:}") String base64Key) {
        if (base64Key == null || base64Key.isBlank()) {
            // Deterministic dev-only key (32 zero bytes). Tokens encrypted with this
            // will survive restarts in dev, but provide NO real security.
            // Production MUST set OAUTH_TOKEN_ENCRYPTION_KEY env var.
            log.warn("⚠ OAUTH_TOKEN_ENCRYPTION_KEY is not set — using insecure dev key. "
                    + "Set this env var before deploying to production.");
            this.keySpec = new SecretKeySpec(new byte[32], "AES");
        } else {
            byte[] keyBytes = Base64.getDecoder().decode(base64Key);
            if (keyBytes.length != 32) {
                throw new IllegalArgumentException(
                        "OAUTH_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key");
            }
            this.keySpec = new SecretKeySpec(keyBytes, "AES");
        }
    }

    /**
     * Encrypts a plaintext token using AES-256-GCM.
     *
     * @param plainToken raw OAuth access token
     * @return base64-encoded [IV + ciphertext] string, safe to store in DB
     */
    public String encrypt(String plainToken) {
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));

            byte[] ciphertext = cipher.doFinal(plainToken.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            // Prefix IV to the ciphertext so decrypt can read it back
            byte[] combined = new byte[iv.length + ciphertext.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(ciphertext, 0, combined, iv.length, ciphertext.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new VacademyException("Failed to encrypt token: " + e.getMessage());
        }
    }

    /**
     * Decrypts a previously encrypted token.
     *
     * @param encryptedToken base64-encoded [IV + ciphertext] from the DB
     * @return plaintext OAuth access token
     */
    public String decrypt(String encryptedToken) {
        try {
            byte[] combined = Base64.getDecoder().decode(encryptedToken);

            byte[] iv = new byte[IV_LENGTH_BYTES];
            byte[] ciphertext = new byte[combined.length - IV_LENGTH_BYTES];
            System.arraycopy(combined, 0, iv, 0, IV_LENGTH_BYTES);
            System.arraycopy(combined, IV_LENGTH_BYTES, ciphertext, 0, ciphertext.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));

            byte[] plainBytes = cipher.doFinal(ciphertext);
            return new String(plainBytes, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new VacademyException("Failed to decrypt token: " + e.getMessage());
        }
    }
}
