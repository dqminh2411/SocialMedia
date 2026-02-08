package com.ttcs.socialmedia.domain.dto.response;

import com.ttcs.socialmedia.domain.dto.DetailPostDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
@Builder
@AllArgsConstructor
public class PostListResponse {
    private List<DetailPostDTO> posts;
    private long totalPages, currentPage, totalElements;
}
