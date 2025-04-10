package com.ttcs.socialmedia.domain;

import jakarta.persistence.*;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name="post_mentions")
@Getter
@Setter
public class PostMentions {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name="post_id")
    private Post post;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;

    private Instant createdAt;
    @PrePersist
    public void prePersist(){
        setCreatedAt(Instant.now());
    }

}
