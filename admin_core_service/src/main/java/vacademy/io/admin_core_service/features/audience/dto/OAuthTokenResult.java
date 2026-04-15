package vacademy.io.admin_core_service.features.audience.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Result of an OAuth token exchange or refresh operation.
 */
@Data
@Builder
public class OAuthTokenResult {
    /** Short-lived or long-lived access token */
    private String accessToken;

    /** Refresh token (may be null for Meta long-lived tokens) */
    private String refreshToken;

    /** When this token expires; null if unknown or non-expiring */
    private LocalDateTime expiresAt;

    /** Page access token (Meta only — derived from user token + page selection) */
    private String pageAccessToken;

    /** Platform page ID (Meta: Facebook Page ID) */
    private String pageId;

    /** Platform page name for display */
    private String pageName;
}
