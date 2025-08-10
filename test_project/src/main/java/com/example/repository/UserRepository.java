package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.entity.User;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    List<User> findByEmailContaining(String email);
    
    List<User> findByFirstNameAndLastName(String firstName, String lastName);
    
    User findByEmail(String email);
}