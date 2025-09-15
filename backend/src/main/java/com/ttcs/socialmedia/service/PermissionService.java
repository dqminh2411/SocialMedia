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
import com.ttcs.socialmedia.domain.dto.RolePermissionRequest;
import com.ttcs.socialmedia.repository.PermissionRepository;
import com.ttcs.socialmedia.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
public class PermissionService {
    private final PermissionRepository permissionRepository;
    private RoleRepository roleRepository;

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

    public Role editRolePermission(RolePermissionRequest req){
        Role role = roleRepository.findByName(req.getRoleName());
        if(role == null) return null;
        List<Permission> permissions = permissionRepository.findAllById(req.getPermissions());
        role.setPermissions(permissions);
        return roleRepository.save(role);
    }
}
