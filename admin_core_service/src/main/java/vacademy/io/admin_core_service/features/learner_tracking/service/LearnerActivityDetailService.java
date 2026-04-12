package vacademy.io.admin_core_service.features.learner_tracking.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vacademy.io.admin_core_service.features.chapter.enums.ChapterStatus;
import vacademy.io.admin_core_service.features.institute_learner.enums.LearnerStatusEnum;
import vacademy.io.admin_core_service.features.learner_tracking.dto.ActivityLogFilterDTO;
import vacademy.io.admin_core_service.features.learner_tracking.dto.DailyTimeSpentProjection;
import vacademy.io.admin_core_service.features.learner_tracking.repository.ActivityLogRepository;
import vacademy.io.admin_core_service.features.module.enums.ModuleStatusEnum;
import vacademy.io.admin_core_service.features.slide.enums.SlideStatus;
import vacademy.io.admin_core_service.features.subject.enums.SubjectStatusEnum;
import vacademy.io.common.auth.model.CustomUserDetails;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LearnerActivityDetailService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public List<DailyTimeSpentProjection> getLearnerAndBatchTimeSpent(ActivityLogFilterDTO activityLogFilterDTO, CustomUserDetails user) {
        List<String> rawIds = activityLogFilterDTO.getPackageSessionIds();
        List<String> validIds = (rawIds == null) ? List.of()
                : rawIds.stream().filter(id -> id != null && !id.isBlank()).collect(Collectors.toList());

        if (validIds.isEmpty()) {
            return List.of();
        }

        return activityLogRepository.getDailyUserAndBatchTimeSpent(
                activityLogFilterDTO.getUserId(),
                validIds,
                activityLogFilterDTO.getStartDate(),
                activityLogFilterDTO.getEndDate(),
                List.of(SlideStatus.PUBLISHED.name(),SlideStatus.UNSYNC.name()),
                List.of(SlideStatus.PUBLISHED.name(),SlideStatus.UNSYNC.name()),
                List.of(ChapterStatus.ACTIVE.name()),
                List.of(ChapterStatus.ACTIVE.name()),
                List.of(ModuleStatusEnum.ACTIVE.name()),
                List.of(SubjectStatusEnum.ACTIVE.name()),
                List.of(LearnerStatusEnum.ACTIVE.name())
        );
    }
}
