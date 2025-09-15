package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * PermissionRepository
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
@Repository
public interface PermissionRepository extends JpaRepository<Permission, String> {
    void deleteByName(String name);
}
