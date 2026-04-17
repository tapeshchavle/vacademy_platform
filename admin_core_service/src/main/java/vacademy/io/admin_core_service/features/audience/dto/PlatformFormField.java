package vacademy.io.admin_core_service.features.audience.dto;

import lombok.Builder;
import lombok.Data;

/**
 * A single field from a platform lead form, returned to the UI
 * so admins can build the field mapping configuration.
 */
@Data
@Builder
public class PlatformFormField {
    /** Platform-specific field key (e.g. "full_name", "phone_number") */
    private String key;

    /** Human-readable label from the platform */
    private String label;

    /** Field type hint: TEXT, EMAIL, PHONE, etc. */
    private String type;

    /** Whether this is a platform-standard field (vs. a custom question) */
    private boolean standardField;
}
