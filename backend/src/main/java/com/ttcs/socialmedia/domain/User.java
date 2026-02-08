package com.ttcs.socialmedia.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ttcs.socialmedia.util.constants.AuthProvider;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name="users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String fullname;

    private String email;
    private String username;
    private String hashedPassword;
    @Column(columnDefinition = "TEXT")
    private String refreshToken;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss a", timezone = "GMT+7")
    private Instant createdAt;

    @ManyToOne
    @JoinColumn(name = "role_name")
    private Role role;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;
    private String providerId;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Profile profile;

    @OneToMany(mappedBy="creator", cascade=CascadeType.ALL,  orphanRemoval = true, fetch = FetchType.LAZY)
    List<Post> posts;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<LikePost> likePosts;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<LikeComment> likeComments;


    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    List<PostMentions> postMentions;

    @OneToMany(mappedBy = "creator" , cascade = CascadeType.ALL, orphanRemoval = true)
    List<Comment> comments;

    @OneToMany(mappedBy = "followingUser", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Follow> followings;

    @OneToMany(mappedBy = "followedUser", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Follow> followers;

    @OneToMany(mappedBy = "recipient", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Notification> receivedNotifications;

    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)
    List<Notification> sentNotifications;

    @PrePersist
    public void prePersist() {
        this.setCreatedAt(Instant.now());
        this.setUsername(getEmail().substring(0,getEmail().indexOf('@')));
    }


}
