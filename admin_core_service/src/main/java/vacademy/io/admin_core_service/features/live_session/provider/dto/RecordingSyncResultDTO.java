package vacademy.io.admin_core_service.features.live_session.provider.dto;

import vacademy.io.common.meeting.dto.MeetingRecordingDTO;

import java.util.List;

/**
 * Response DTO for the POST /meeting/recordings/sync endpoint.
 *
 * status values:
 *   OK         — all BBB recordings found were synced (or already up to date)
 *   BBB_OFFLINE — BBB server was unreachable; returned current DB state unchanged
 *   PARTIAL    — some recordings synced, others failed (download/upload errors)
 */
public record RecordingSyncResultDTO(
        List<MeetingRecordingDTO> recordings,
        String status,
        String message
) {
    public static RecordingSyncResultDTO ok(List<MeetingRecordingDTO> recordings, int newCount) {
        String msg = newCount == 0
                ? "Already up to date."
                : "Sync complete — found " + newCount + " new recording(s).";
        return new RecordingSyncResultDTO(recordings, "OK", msg);
    }

    public static RecordingSyncResultDTO bbbOffline(List<MeetingRecordingDTO> recordings) {
        return new RecordingSyncResultDTO(recordings, "BBB_OFFLINE",
                "BBB server is currently offline. Recordings will appear once the server is back online.");
    }

    public static RecordingSyncResultDTO partial(List<MeetingRecordingDTO> recordings, int newCount, int failCount) {
        return new RecordingSyncResultDTO(recordings, "PARTIAL",
                "Partially synced — " + newCount + " recording(s) synced, " + failCount + " could not be retrieved.");
    }
}
