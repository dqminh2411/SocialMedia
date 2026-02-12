package com.ttcs.socialmedia.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class PostViewId implements Serializable {

    @Column(name = "post_id")
    private int postId;

    @Column(name = "user_id")
    private int userId;

    public PostViewId() {}

    public PostViewId( int postId, int userId) {
        this.postId = postId;
        this.userId = userId;
    }

    // getters & setters

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PostViewId)) return false;
        PostViewId that = (PostViewId) o;
        return Objects.equals(postId, that.postId) &&
                Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(postId, userId);
    }
}

