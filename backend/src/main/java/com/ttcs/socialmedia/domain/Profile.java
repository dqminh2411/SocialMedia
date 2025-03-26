package com.ttcs.socialmedia.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String avatar;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss a", timezone = "GMT+7")
    private Instant updatedAt;

    @OneToOne
    @JoinColumn(name="user_id")
    private User user;

    @PreUpdate
    public void preUpdate() {
        setUpdatedAt(Instant.now());
    }

}
