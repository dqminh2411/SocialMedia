package com.ttcs.socialmedia.service;

/**
 * PermissionService
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
import com.ttcs.socialmedia.domain.dto.request.RolePermissionRequest;
import com.ttcs.socialmedia.domain.dto.response.RolePermissionResponse;
import com.ttcs.socialmedia.repository.PermissionRepository;
import com.ttcs.socialmedia.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * PermissionService
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
@Service
@RequiredArgsConstructor
@Slf4j
public class PermissionService {
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    public Permission createPermission(Permission permission) {
        return permissionRepository.save(permission);
    }

    public List<Permission> getAllPermissions(){
        return permissionRepository.findAll();
    }

    @Transactional
    public void deletePermission(String name){
        if(permissionRepository.existsById(name))
            permissionRepository.deleteByName(name);
    }

    @Transactional
    public RolePermissionResponse grantPermissions(RolePermissionRequest req){
        Role role = roleRepository.findByName(req.getRoleName());
        if (role == null){
            return null;
        }
        role.getPermissions().clear();
        for (String permissionName : req.getPermissions()){
            Permission permission = permissionRepository.findById(permissionName).orElse(null);
            if(permission == null) continue;
            role.getPermissions().add(permission);
        }
        role = roleRepository.save(role);
        for(Permission permission : role.getPermissions()){
            log.info(String.format("Permission: %s granted to Role: %s", permission.getName(), role.getName()));
        }
        return RolePermissionResponse.builder()
                .roleName(role.getName())
                .permissions(role.getPermissions().stream().map(Permission::getName).toList())
                .build();
    }

}
