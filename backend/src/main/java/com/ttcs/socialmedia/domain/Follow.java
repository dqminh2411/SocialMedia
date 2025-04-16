package com.ttcs.socialmedia.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CollectionIdJdbcTypeCode;

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

    private Instant followAt;

}
