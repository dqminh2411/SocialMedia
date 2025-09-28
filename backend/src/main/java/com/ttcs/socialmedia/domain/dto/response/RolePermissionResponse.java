package com.ttcs.socialmedia.domain.dto.response;

/**
 * RolePermissionResponse
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

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * RolePermissionResponse
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
@Builder
public class RolePermissionResponse {
    private String roleName;
    private List<String> permissions;
}
