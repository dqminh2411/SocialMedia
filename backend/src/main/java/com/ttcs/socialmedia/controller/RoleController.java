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
@RequestMapping("/roles")
@RequiredArgsConstructor
public class RoleController {
    private final RoleService roleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public RestResponse<Role> createRole(@RequestBody CreateRoleRequest req){
        return RestResponse.<Role>builder()
                .statusCode(HttpStatus.CREATED.value())
                .data(roleService.createRole(req))
                .build();
    }

    @GetMapping
    public RestResponse<List<Role>> getAllRoles(){
        return RestResponse.<List<Role>>builder()
                .statusCode(HttpStatus.OK.value())
                .data(roleService.getAllRoles())
                .build();
    }

    @DeleteMapping("/{roleName}")
    public RestResponse<Void> deleteRole(@PathVariable String roleName){
        roleService.deleteRole(roleName);
        return RestResponse.<Void>builder().build();
    }

}
