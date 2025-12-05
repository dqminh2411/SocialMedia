package com.ttcs.socialmedia.service;

/**
 * RoleService
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
import com.ttcs.socialmedia.repository.PermissionRepository;
import com.ttcs.socialmedia.repository.RoleRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

/**
 * RoleService
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
@AllArgsConstructor
public class RoleService {
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    public Role createRole(CreateRoleRequest req){
        return roleRepository.save(toRole(req));
    }
    public Role toRole(CreateRoleRequest req){
        Role newRole = new Role();
        newRole.setName(req.getName());
        newRole.setDescription(req.getDescription());
        newRole.setPermissions(new HashSet<>(permissionRepository.findAllById(req.getPermissions())));
        return newRole;
    }
    public List<Role> getAllRoles(){
        return roleRepository.findAll();
    }


    public void deleteRole(String roleName){
        if(roleRepository.existsById(roleName))
            roleRepository.deleteById(roleName);
    }
}
