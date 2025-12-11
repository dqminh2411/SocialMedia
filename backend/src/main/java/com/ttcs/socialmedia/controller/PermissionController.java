package com.ttcs.socialmedia.controller;

/**
 * PermissionController
 * <p>
 * Provides business logic for managing employment details.
 * <p>
 * Version 1.0
 * Date: 9/14/2025
 * <p>
 * Copyright
 * <p>
 * Modification Logs:
 * DATE         AUTHOR       DESCRIPTION
 * -------------------------------------
 * 9/14/2025      doanm      Create
 */

import ch.qos.logback.core.pattern.util.RegularEscapeUtil;
import com.ttcs.socialmedia.domain.Permission;
import com.ttcs.socialmedia.domain.dto.request.RolePermissionRequest;
import com.ttcs.socialmedia.domain.dto.response.RolePermissionResponse;
import com.ttcs.socialmedia.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.autoconfigure.observation.ObservationProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.ttcs.socialmedia.domain.RestResponse;

import java.util.List;

/**
 * PermissionController
 * <p>
 *
 * <p>
 * Version 1.0
 * Date: 9/14/2025
 * <p>
 * Copyright
 * <p>
 * Modification Logs:
 * DATE         AUTHOR       DESCRIPTION
 * -------------------------------------
 * 9/14/2025     doanm      Create
 */
@RestController
@RequestMapping("${apiPrefix}/permissions")
@RequiredArgsConstructor
public class PermissionController {
    private final PermissionService permissionService;
    
    @PostMapping
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RestResponse<Permission>> createPermission(@RequestBody Permission permission){
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(RestResponse.ok("Permission created!", permissionService.createPermission(permission)));
    }

    @GetMapping
    public ResponseEntity<RestResponse<List<Permission>>> getAllPermissions(){
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(RestResponse.ok("Get permissions successfully!", permissionService.getAllPermissions()));
    }

    @DeleteMapping("/{permissionName}")
    public ResponseEntity<RestResponse<Void>> deletePermission(@PathVariable String permissionName){
        permissionService.deletePermission(permissionName);
        return ResponseEntity
                .ok(RestResponse.ok("Delete permissions successfully!"));
    }

    @PutMapping("/grant")
    public ResponseEntity<RestResponse<RolePermissionResponse>> grantPermissions(@RequestBody RolePermissionRequest rolePermissionRequest){
        return ResponseEntity
                .ok(RestResponse.ok("Permissions granted!", permissionService.grantPermissions(rolePermissionRequest)));
    }
}
