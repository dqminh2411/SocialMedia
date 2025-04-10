package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.PostHashtags;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostHashtagsRepository extends JpaRepository<PostHashtags, Integer> {

}
