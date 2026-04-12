package vacademy.io.admin_core_service.features.live_session.provider.scheduler;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import vacademy.io.admin_core_service.features.live_session.entity.SessionSchedule;
import vacademy.io.admin_core_service.features.live_session.provider.manager.BbbMeetingManager;
import vacademy.io.admin_core_service.features.live_session.repository.SessionScheduleRepository;
import vacademy.io.common.meeting.dto.MeetingRecordingDTO;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Daily processor: deletes BBB recordings older than 14 days from the BBB server.
 *
 * Scope: Only the BBB server copy is deleted.
 * S3 / Vacademy file storage is NOT touched — recordings uploaded via the
 * post-publish hook (those with a fileId) remain accessible in Vacademy.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RecordingCleanupProcessor {

    private static final int RETENTION_DAYS = 14;

    private final SessionScheduleRepository scheduleRepository;
    private final BbbMeetingManager bbbMeetingManager;
    private final ObjectMapper objectMapper;

    public void cleanupOldRecordings() {
        Instant cutoff = Instant.now().minus(RETENTION_DAYS, ChronoUnit.DAYS);
        log.info("[RecordingCleanup] Starting cleanup — deleting BBB recordings older than {} days (before {})",
                RETENTION_DAYS, cutoff);

        List<SessionSchedule> schedules = scheduleRepository.findAllWithRecordings();
        log.info("[RecordingCleanup] Found {} schedules with recordings to inspect", schedules.size());

        int totalDeleted = 0;

        for (SessionSchedule schedule : schedules) {
            try {
                totalDeleted += processSchedule(schedule, cutoff);
            } catch (Exception e) {
                log.warn("[RecordingCleanup] Error processing schedule {}: {}", schedule.getId(), e.getMessage());
            }
        }

        log.info("[RecordingCleanup] Done — deleted {} BBB recordings total", totalDeleted);
    }

    private int processSchedule(SessionSchedule schedule, Instant cutoff) throws Exception {
        List<MeetingRecordingDTO> recordings = objectMapper.readValue(
                schedule.getProviderRecordingsJson(),
                objectMapper.getTypeFactory().constructCollectionType(List.class, MeetingRecordingDTO.class));

        List<MeetingRecordingDTO> toKeep = new ArrayList<>();
        int deleted = 0;

        for (MeetingRecordingDTO recording : recordings) {
            if (shouldDelete(recording, cutoff)) {
                boolean success = bbbMeetingManager.deleteRecording(
                        recording.getRecordingId(), schedule.getBbbServerId());
                if (success) {
                    log.info("[RecordingCleanup] Deleted recording {} (type={}) from BBB for schedule {}",
                            recording.getRecordingId(), recording.getType(), schedule.getId());
                    deleted++;
                } else {
                    // Keep in DB if BBB deletion failed — will retry next day
                    log.warn("[RecordingCleanup] Failed to delete recording {} from BBB — keeping for retry",
                            recording.getRecordingId());
                    toKeep.add(recording);
                }
            } else {
                toKeep.add(recording);
            }
        }

        if (deleted > 0) {
            schedule.setProviderRecordingsJson(objectMapper.writeValueAsString(toKeep));
            scheduleRepository.save(schedule);
        }

        return deleted;
    }

    private boolean shouldDelete(MeetingRecordingDTO recording, Instant cutoff) {
        // Must have a BBB recordingId to call deleteRecordings API
        if (recording.getRecordingId() == null || recording.getRecordingId().isBlank()) {
            return false;
        }
        // Must have a known start time to evaluate age
        if (recording.getStartTime() == null || recording.getStartTime().isBlank()) {
            return false;
        }
        try {
            Instant startTime = Instant.parse(recording.getStartTime());
            return startTime.isBefore(cutoff);
        } catch (Exception e) {
            log.warn("[RecordingCleanup] Could not parse startTime '{}' for recording {} — skipping",
                    recording.getStartTime(), recording.getRecordingId());
            return false;
        }
    }
}
