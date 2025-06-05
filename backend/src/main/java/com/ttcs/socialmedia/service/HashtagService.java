package com.ttcs.socialmedia.service;

import com.ttcs.socialmedia.domain.Hashtag;
import com.ttcs.socialmedia.domain.dto.HashTagDTO;
import com.ttcs.socialmedia.repository.HashtagRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HashtagService {

    private final HashtagRepository hashtagRepository;

    public HashtagService(HashtagRepository hashtagRepository) {
        this.hashtagRepository = hashtagRepository;
    }

    public List<Hashtag> getAllHashtags() {
        return hashtagRepository.findAll();
    }

    public List<HashTagDTO> getAllHashtagsDTO() {
        return hashtagRepository.findAll().stream()
                .map(HashTagDTO::new)
                .collect(Collectors.toList());
    }

    public Hashtag getHashtagById(Integer id) {
        return hashtagRepository.findById(id).orElse(null);
    }

    public Hashtag getHashtagByName(String name) {
        return hashtagRepository.findByName(name);
    }

    public Page<Hashtag> searchHashtags(String query, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        return hashtagRepository.findByNameContainingIgnoreCase(query, pageable);
    }

    public HashTagDTO hashtagToDTO(Hashtag hashtag) {
        HashTagDTO hashTagDTO = new HashTagDTO();
        hashTagDTO.setId(hashtag.getId());
        hashTagDTO.setName(hashtag.getName());
        return hashTagDTO;
    }

    public int getTotalHashtagsCount() {
        return (int) hashtagRepository.count();
    }
}
