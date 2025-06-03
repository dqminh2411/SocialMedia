package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.Hashtag;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface HashtagRepository extends JpaRepository<Hashtag, Integer> {
    Hashtag findByName(String name);

    @Query("SELECT h FROM Hashtag h WHERE LOWER(h.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Hashtag> findByNameContainingIgnoreCase(String name, Pageable pageable);

}
