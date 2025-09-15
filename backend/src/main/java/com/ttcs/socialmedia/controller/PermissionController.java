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

import com.ttcs.socialmedia.domain.Permission;
import com.ttcs.socialmedia.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/permissions")
@RequiredArgsConstructor
public class PermissionController {
    private final PermissionService permissionService;
    
    @PostMapping
//    @PreAuthorize("hasRole('ADMIN')")
    public RestResponse<Permission> createPermission(@RequestBody Permission permission){
        return RestResponse.<Permission>builder()
                .statusCode(HttpStatus.CREATED.value())
                .data(permissionService.createPermission(permission))
                .build();
    }

    @GetMapping
    public RestResponse<List<Permission>> getAllPermissions(){
        return RestResponse.<List<Permission>>builder()
                .statusCode(HttpStatus.OK.value())
                .data(permissionService.getAllPermissions())
                .build();
    }

    @DeleteMapping("/{permissionName}")
    public RestResponse<Void> deletePermission(@PathVariable String permissionName){
        permissionService.deletePermission(permissionName);
        return RestResponse.<Void>builder().build();
    }

}
