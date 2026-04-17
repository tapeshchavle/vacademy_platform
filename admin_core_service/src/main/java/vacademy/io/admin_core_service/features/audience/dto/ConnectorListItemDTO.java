package vacademy.io.admin_core_service.features.audience.dto;

import lombok.Builder;
import lombok.Data;
import vacademy.io.admin_core_service.features.audience.entity.FormWebhookConnector;

/**
 * Safe DTO for listing connectors. Omits encrypted tokens.
 */
@Data
@Builder
public class ConnectorListItemDTO {
    private String id;
    private String vendor;
    private String audienceId;
    private String platformPageId;
    private String platformFormId;
    private String connectionStatus;
    private String producesSourceType;
    private String createdAt;
    private String tokenExpiresAt;

    public static ConnectorListItemDTO from(FormWebhookConnector c) {
        return ConnectorListItemDTO.builder()
                .id(c.getId())
                .vendor(c.getVendor())
                .audienceId(c.getAudienceId())
                .platformPageId(c.getPlatformPageId())
                .platformFormId(c.getPlatformFormId())
                .connectionStatus(c.getConnectionStatus())
                .producesSourceType(c.getProducesSourceType())
                .createdAt(c.getCreatedAt() != null ? c.getCreatedAt().toString() : null)
                .tokenExpiresAt(c.getOauthTokenExpiresAt() != null
                        ? c.getOauthTokenExpiresAt().toString() : null)
                .build();
    }
}
