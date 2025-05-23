package com.ttcs.socialmedia.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HashTagDTO {
    private int id;
    private String name;

    // Add constructor to convert from Hashtag entity to DTO
    public HashTagDTO(com.ttcs.socialmedia.domain.Hashtag hashtag) {
        this.id = hashtag.getId();
        this.name = hashtag.getName();
    }
}
