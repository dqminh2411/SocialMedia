package com.ttcs.socialmedia.domain;

/**
 * Role
 * <p>
 * Provides business logic for managing employment details.
 * <p>
 * Version 1.0
 * Date: 9/11/2025
 * <p>
 * Copyright
 * <p>
 * Modification Logs:
 * DATE         AUTHOR       DESCRIPTION
 * -------------------------------------
 * 9/11/2025      doanm      Create
 */

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Role
 * <p>
 *
 * <p>
 * Version 1.0
 * Date: 9/11/2025
 * <p>
 * Copyright
 * <p>
 * Modification Logs:
 * DATE         AUTHOR       DESCRIPTION
 * -------------------------------------
 * 9/11/2025     doanm      Create
 */
@Entity
@Table(name="roles")
@Getter
@Setter
@Builder
@AllArgsConstructor
public class Role {
    @Id
    private String name;
    private String description;

    @ManyToMany
    Set<Permission> permissions;

    public Role() {
        this.name = "";
        this.permissions = new HashSet<>();
    }

    public Role(String name) {
        this.name = name;
        this.permissions = new HashSet<>();
    }

}
