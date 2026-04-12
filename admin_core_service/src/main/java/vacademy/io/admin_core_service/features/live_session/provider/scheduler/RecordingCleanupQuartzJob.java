package vacademy.io.admin_core_service.features.live_session.provider.scheduler;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RecordingCleanupQuartzJob implements Job {

    @Autowired
    private RecordingCleanupProcessor processor;

    @Override
    public void execute(JobExecutionContext context) {
        processor.cleanupOldRecordings();
    }
}
