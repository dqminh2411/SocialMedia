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
import com.ttcs.socialmedia.domain.Role;
import com.ttcs.socialmedia.domain.dto.CreateRoleRequest;
import com.ttcs.socialmedia.service.PermissionService;
import com.ttcs.socialmedia.service.RoleService;
import lombok.RequiredArgsConstructor;
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
@RequestMapping("${apiPrefix}/roles")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;

    @PostMapping
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RestResponse<Role>> createRole(@RequestBody CreateRoleRequest req){
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(RestResponse.ok("Role created successfully!", roleService.createRole(req)));
    }

    @GetMapping
    public ResponseEntity<RestResponse<List<Role>>> getAllRoles(){
        return ResponseEntity
                .ok(RestResponse.ok("Get all roles successfully!", roleService.getAllRoles()));
    }
    @DeleteMapping("/{roleName}")
    public ResponseEntity<RestResponse<Void>> deleteRole(@PathVariable String roleName){
        roleService.deleteRole(roleName);
        return ResponseEntity.ok(RestResponse.ok("Role deleted successfully!"));
    }

}
