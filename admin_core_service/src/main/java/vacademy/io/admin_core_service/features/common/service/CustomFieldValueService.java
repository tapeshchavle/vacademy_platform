package vacademy.io.admin_core_service.features.common.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import vacademy.io.common.common.dto.CustomFieldValueDTO;
import vacademy.io.admin_core_service.features.common.dto.request.CustomFieldValueDto;
import vacademy.io.admin_core_service.features.common.entity.CustomFields;
import vacademy.io.admin_core_service.features.common.entity.CustomFieldValues;
import vacademy.io.admin_core_service.features.common.repository.CustomFieldRepository;
import vacademy.io.admin_core_service.features.common.repository.CustomFieldValuesRepository;
import vacademy.io.admin_core_service.features.common.util.CustomFieldValidator;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CustomFieldValueService {

    private static final Logger log = LoggerFactory.getLogger(CustomFieldValueService.class);

    @Autowired
    private CustomFieldValuesRepository customFieldValuesRepository;

    @Autowired
    private CustomFieldRepository customFieldRepository;

    public void addCustomFieldValue(List<CustomFieldValueDTO> customFieldValueDTOS,String sourceType,String sourceId) {
        if (customFieldValueDTOS == null || customFieldValueDTOS.isEmpty()) {
            return;
        }

        List<CustomFieldValues> customFieldValues = new ArrayList<>();

        for (CustomFieldValueDTO customFieldValueDTO : customFieldValueDTOS) {
            if (customFieldValueDTO == null) {
                continue;
            }
            customFieldValueDTO.setSourceType(sourceType);
            customFieldValueDTO.setSourceId(sourceId);
            validateFieldValue(customFieldValueDTO.getCustomFieldId(), customFieldValueDTO.getValue());
            customFieldValues.add(new CustomFieldValues(customFieldValueDTO));
        }

        if (!customFieldValues.isEmpty()) {
            customFieldValuesRepository.saveAll(customFieldValues);
        }
    }

    private void validateFieldValue(String customFieldId, String value) {
        if (!StringUtils.hasText(customFieldId) || !StringUtils.hasText(value)) {
            return;
        }
        try {
            Optional<CustomFields> fieldOpt = customFieldRepository.findById(customFieldId);
            if (fieldOpt.isPresent() && fieldOpt.get().getFieldType() != null) {
                boolean valid = CustomFieldValidator.validate(fieldOpt.get().getFieldType(), value);
                if (!valid) {
                    log.warn("Invalid value '{}' for field type '{}' (fieldId={}). Saving anyway.",
                            value, fieldOpt.get().getFieldType(), customFieldId);
                }
            }
        } catch (Exception e) {
            log.debug("Could not validate custom field value: {}", e.getMessage());
        }
    }

    public void shiftCustomField(String source,String previousSourceId,String newSourceId,String type,String typeId){
        List<CustomFieldValues>customFieldValues = customFieldValuesRepository.findBySourceTypeAndSourceIdAndTypeAndTypeId(source,
                previousSourceId,
                type,typeId);
        List<CustomFieldValues>shiftedCustomFiledValues = new ArrayList<>();
        for(CustomFieldValues customFieldValue:customFieldValues){
            CustomFieldValues newCustomFiledValue = new CustomFieldValues();
            newCustomFiledValue.setCustomFieldId(customFieldValue.getCustomFieldId());
            newCustomFiledValue.setSourceType(source);
            newCustomFiledValue.setSourceId(newSourceId);
            newCustomFiledValue.setType(type);
            newCustomFiledValue.setTypeId(typeId);
            newCustomFiledValue.setValue(customFieldValue.getValue());
            shiftedCustomFiledValues.add(newCustomFiledValue);
        }
        customFieldValuesRepository.saveAll(shiftedCustomFiledValues);
    }

    public void upsertCustomFieldValues(List<CustomFieldValueDto> customFieldValueDtos) {
        if (CollectionUtils.isEmpty(customFieldValueDtos)) {
            return;
        }

        customFieldValueDtos.stream()
                .filter(dto -> dto != null && StringUtils.hasText(dto.getCustomFieldId()))
                .forEach(this::upsertCustomFieldValue);
    }

    private void upsertCustomFieldValue(CustomFieldValueDto dto) {
        if (!StringUtils.hasText(dto.getSourceId()) || !StringUtils.hasText(dto.getSourceType())) {
            return;
        }

        Optional<CustomFieldValues> existing =
                (StringUtils.hasText(dto.getType()) && StringUtils.hasText(dto.getTypeId()))
                        ? customFieldValuesRepository
                        .findTopByCustomFieldIdAndSourceTypeAndSourceIdAndTypeAndTypeIdOrderByCreatedAtDesc(
                                dto.getCustomFieldId(),
                                dto.getSourceType(),
                                dto.getSourceId(),
                                dto.getType(),
                                dto.getTypeId())
                        : customFieldValuesRepository
                        .findTopByCustomFieldIdAndSourceTypeAndSourceIdOrderByCreatedAtDesc(
                                dto.getCustomFieldId(),
                                dto.getSourceType(),
                                dto.getSourceId());

        CustomFieldValues target = existing.orElseGet(CustomFieldValues::new);

        // PATCH LOGIC — only update provided (non-null) fields
        if (dto.getCustomFieldId() != null)
            target.setCustomFieldId(dto.getCustomFieldId());

        if (StringUtils.hasText(dto.getSourceId()))
            target.setSourceId(dto.getSourceId());

        if (StringUtils.hasText(dto.getSourceType()))
            target.setSourceType(dto.getSourceType());

        if (StringUtils.hasText(dto.getType()))
            target.setType(dto.getType());

        if (StringUtils.hasText(dto.getTypeId()))
            target.setTypeId(dto.getTypeId());

        if (dto.getValue() != null) {
            validateFieldValue(dto.getCustomFieldId(), dto.getValue());
            target.setValue(dto.getValue());
        }

        customFieldValuesRepository.save(target);
    }
}
