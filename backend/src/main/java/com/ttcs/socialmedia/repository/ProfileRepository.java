package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfileRepository extends JpaRepository<Profile,Integer> {
    Profile findById(int id);
}
