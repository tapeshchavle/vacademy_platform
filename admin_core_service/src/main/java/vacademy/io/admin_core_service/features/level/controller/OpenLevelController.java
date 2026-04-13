package vacademy.io.admin_core_service.features.level.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vacademy.io.admin_core_service.config.cache.CacheScope;
import vacademy.io.admin_core_service.config.cache.ClientCacheable;
import vacademy.io.admin_core_service.features.level.service.LevelService;
import vacademy.io.common.institute.dto.LevelDTO;

import java.util.List;

@RestController
@RequestMapping("/admin-core-service/open/level/v1")
@RequiredArgsConstructor
public class OpenLevelController {

    private final LevelService levelService;

    @GetMapping("/get-levels")
    @ClientCacheable(maxAgeSeconds = 300, scope = CacheScope.PUBLIC)
    public ResponseEntity<List<LevelDTO>> getLevelsByInstitute(
            @RequestParam("instituteId") String instituteId) {
        return ResponseEntity.ok(levelService.getLevelsByInstituteId(instituteId));
    }
}
