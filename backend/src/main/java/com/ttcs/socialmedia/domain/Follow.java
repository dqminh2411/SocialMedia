package com.ttcs.socialmedia.domain;

import com.ttcs.socialmedia.util.constants.FollowStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name="follows")
@Setter
@Getter
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name="following_user_id")
    private User followingUser;

    @ManyToOne
    @JoinColumn(name="followed_user_id")
    private User followedUser;

    @Enumerated(EnumType.STRING)
    private FollowStatus status;
    private Instant followAt;

    @PrePersist
    protected void onCreate() {
        setFollowAt(Instant.now());
        setStatus(FollowStatus.PENDING);
    }
}
