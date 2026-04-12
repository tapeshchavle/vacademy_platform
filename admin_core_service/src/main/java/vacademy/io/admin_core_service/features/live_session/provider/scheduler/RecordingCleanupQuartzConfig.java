package vacademy.io.admin_core_service.features.live_session.provider.scheduler;

import org.quartz.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RecordingCleanupQuartzConfig {

    @Bean
    public JobDetail recordingCleanupJobDetail() {
        return JobBuilder.newJob(RecordingCleanupQuartzJob.class)
                .withIdentity("recordingCleanupJob")
                .storeDurably()
                .build();
    }

    @Bean
    public Trigger recordingCleanupTrigger(JobDetail recordingCleanupJobDetail) {
        // Run daily at 2 AM server time
        return TriggerBuilder.newTrigger()
                .forJob(recordingCleanupJobDetail)
                .withIdentity("recordingCleanupTrigger")
                .withSchedule(CronScheduleBuilder.cronSchedule("0 0 2 * * ?"))
                .build();
    }
}
