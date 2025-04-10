package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.Hashtag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HashtagRepository extends JpaRepository<Hashtag, Integer> {
    Hashtag findByName(String name);
}
