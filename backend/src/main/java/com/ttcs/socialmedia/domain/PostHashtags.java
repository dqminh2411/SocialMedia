package com.ttcs.socialmedia.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name="post_hashtags")
@Getter
@Setter
public class PostHashtags {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;


    @ManyToOne
    @JoinColumn(name="post_id")
    private Post post;

    @ManyToOne
    @JoinColumn(name="hashtag_id")
    private Hashtag hashtag;

    private Instant taggedAt;

    @PrePersist
    public void prePersist(){
        setTaggedAt(Instant.now());
    }

}
