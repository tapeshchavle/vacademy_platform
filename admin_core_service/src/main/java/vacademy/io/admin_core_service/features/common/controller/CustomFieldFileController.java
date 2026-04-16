package vacademy.io.admin_core_service.features.common.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vacademy.io.admin_core_service.features.common.entity.CustomFields;
import vacademy.io.admin_core_service.features.common.repository.CustomFieldRepository;
import vacademy.io.admin_core_service.features.media_service.service.MediaService;
import vacademy.io.common.media.dto.FileDetailsDTO;

import java.util.*;

@RestController
@RequestMapping("/admin-core-service/common/custom-fields")
public class CustomFieldFileController {

    @Autowired
    private MediaService mediaService;

    @Autowired
    private CustomFieldRepository customFieldRepository;

    @PostMapping("/upload-file")
    public ResponseEntity<Map<String, String>> uploadCustomFieldFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("customFieldId") String customFieldId
    ) {
        try {
            Optional<CustomFields> fieldOpt = customFieldRepository.findById(customFieldId);
            if (fieldOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Custom field not found"));
            }

            CustomFields customField = fieldOpt.get();
            if (!"FILE".equalsIgnoreCase(customField.getFieldType())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Custom field is not a FILE type"));
            }

            String config = customField.getConfig();
            if (config != null && !config.isBlank()) {
                validateFileConstraints(file, config);
            }

            FileDetailsDTO fileDetails = mediaService.uploadFileV2(file);
            if (fileDetails == null || fileDetails.getId() == null) {
                return ResponseEntity.internalServerError().body(Map.of("error", "File upload failed"));
            }

            String fileUrl = mediaService.getFilePublicUrlById(fileDetails.getId());

            Map<String, String> response = new HashMap<>();
            response.put("fileId", fileDetails.getId());
            response.put("fileUrl", fileUrl != null ? fileUrl : fileDetails.getId());
            response.put("fileName", file.getOriginalFilename());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    private void validateFileConstraints(MultipartFile file, String configJson) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> config = mapper.readValue(configJson, Map.class);

            Object allowedTypesObj = config.get("allowedFileTypes");
            if (allowedTypesObj instanceof List<?> allowedTypes && !allowedTypes.isEmpty()) {
                String originalName = file.getOriginalFilename();
                if (originalName != null) {
                    String ext = originalName.contains(".")
                            ? originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase()
                            : "";
                    boolean allowed = allowedTypes.stream()
                            .anyMatch(t -> t.toString().equalsIgnoreCase(ext));
                    if (!allowed) {
                        throw new IllegalArgumentException(
                                "File type '" + ext + "' is not allowed. Allowed: " + allowedTypes);
                    }
                }
            }

            Object maxSizeObj = config.get("maxSizeMB");
            if (maxSizeObj instanceof Number maxSizeMB) {
                long maxBytes = maxSizeMB.longValue() * 1024 * 1024;
                if (file.getSize() > maxBytes) {
                    throw new IllegalArgumentException(
                            "File size exceeds maximum of " + maxSizeMB + "MB");
                }
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            // Config parse error - skip validation
        }
    }
}
