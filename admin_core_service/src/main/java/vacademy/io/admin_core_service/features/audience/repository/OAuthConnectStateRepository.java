package vacademy.io.admin_core_service.features.audience.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vacademy.io.admin_core_service.features.audience.entity.OAuthConnectState;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OAuthConnectStateRepository extends JpaRepository<OAuthConnectState, String> {

    /** Find a usable (non-expired, non-consumed) state by its session ID */
    @Query("SELECT s FROM OAuthConnectState s WHERE s.id = :id " +
           "AND s.sessionStatus IN ('PENDING', 'AUTHORIZED') " +
           "AND s.expiresAt > :now")
    Optional<OAuthConnectState> findValidById(
            @Param("id") String id,
            @Param("now") LocalDateTime now);

    /** Bulk-expire sessions that have passed their expiry time */
    @Modifying
    @Query("UPDATE OAuthConnectState s SET s.sessionStatus = 'EXPIRED' " +
           "WHERE s.sessionStatus IN ('PENDING', 'AUTHORIZED') AND s.expiresAt <= :now")
    int expireOldSessions(@Param("now") LocalDateTime now);
}
