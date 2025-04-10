package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.PostMentions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostMentionsRepository extends JpaRepository<PostMentions, Integer> {
}
