package com.ttcs.socialmedia.domain.dto.request;

/**
 * RolePermissionRequest
 * <p>
 * Provides business logic for managing employment details.
 * <p>
 * Version 1.0
 * Date: 9/28/2025
 * <p>
 * Copyright
 * <p>
 * Modification Logs:
 * DATE         AUTHOR       DESCRIPTION
 * -------------------------------------
 * 9/28/2025      doanm      Create
 */

import lombok.Data;

import java.util.List;

/**
 * RolePermissionRequest
 * <p>
 *
 * <p>
 * Version 1.0
 * Date: 9/28/2025
 * <p>
 * Copyright
 * <p>
 * Modification Logs:
 * DATE         AUTHOR       DESCRIPTION
 * -------------------------------------
 * 9/28/2025     doanm      Create
 */
@Data
public class RolePermissionRequest {
    private String roleName;
    private List<String> permissions;
}
