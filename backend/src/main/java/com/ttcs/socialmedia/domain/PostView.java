package com.ttcs.socialmedia.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name="post_view")
@Getter
@Setter
@NoArgsConstructor
public class PostView {
    @EmbeddedId
    private PostViewId id;

    @Column(name="last_seen_at", nullable = false)
    private Instant lastSeenAt;

    public PostView(int  postId, int userId, Instant lastSeenAt) {
        this.id = new PostViewId(postId, userId);
        this.lastSeenAt = lastSeenAt;
    }
}
