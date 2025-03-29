package com.ttcs.socialmedia.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="post_media")
@Getter
@Setter
public class PostMedia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String fileName;
    private int position;

    @ManyToOne
    @JoinColumn(name="post_id")
    private Post post;

}
