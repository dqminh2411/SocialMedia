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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
        Set<String> newPermissions = new HashSet<>(req.getPermissions());
        Set<String> curPermissions = new HashSet<>(role.getPermissions().stream().map(Permission::getName).toList());
        newPermissions.removeAll(curPermissions);
        req.getPermissions().forEach(curPermissions::remove);
        // add new permissions
        for (String permissionName : newPermissions){
            Permission permission = permissionRepository.findById(permissionName).orElse(null);
            if(permission == null) continue;
            role.getPermissions().add(permission);
        }

        // remove old permissions
        for (String permissionName : curPermissions){
            Permission permission = permissionRepository.findById(permissionName).orElse(null);
            if(permission == null) continue;
            role.getPermissions().remove(permission);
//            log.info(String.format("Permission: %s revoked from Role: %s", permission.getName(), role.getName()));
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
