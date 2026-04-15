package vacademy.io.admin_core_service.features.audience.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Safe representation of a Facebook Page returned to the frontend.
 * Contains only id and name — the page access token is never exposed.
 */
@Data
@Builder
public class MetaPageDTO {
    private String id;
    private String name;
}
