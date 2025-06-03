package com.ttcs.socialmedia.repository;

import com.ttcs.socialmedia.domain.Profile;
import com.ttcs.socialmedia.domain.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Integer> {
    Profile findById(int id);

    Profile findByUser(User user);

    @Query("SELECT p FROM Profile p WHERE p.user.username = :username")
    Profile findByUsername(@Param("username") String username);
}
