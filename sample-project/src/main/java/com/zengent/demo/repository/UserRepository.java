package com.zengent.demo.repository;

import com.zengent.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity operations.
 * Demonstrates Spring Data JPA repository patterns and custom queries.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by username.
     * @param username The username to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByUsername(String username);
    
    /**
     * Find user by email address.
     * @param email The email to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Find all active users.
     * @return List of active users
     */
    List<User> findByIsActiveTrue();
    
    /**
     * Find users by role.
     * @param role The user role to filter by
     * @return List of users with the specified role
     */
    List<User> findByRole(User.UserRole role);
    
    /**
     * Find users created after a specific date.
     * @param date The date threshold
     * @return List of users created after the date
     */
    List<User> findByCreatedAtAfter(LocalDateTime date);
    
    /**
     * Custom query to find users with orders.
     * @return List of users who have placed orders
     */
    @Query("SELECT DISTINCT u FROM User u JOIN u.orders o")
    List<User> findUsersWithOrders();
    
    /**
     * Custom query to count users by role.
     * @param role The role to count
     * @return Number of users with the specified role
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    Long countUsersByRole(@Param("role") User.UserRole role);
    
    /**
     * Find users by name containing specified text (case insensitive).
     * @param firstName First name pattern
     * @param lastName Last name pattern
     * @return List of matching users
     */
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :firstName, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :lastName, '%'))")
    List<User> findByNameContaining(@Param("firstName") String firstName, 
                                   @Param("lastName") String lastName);
    
    /**
     * Check if username exists (case insensitive).
     * @param username Username to check
     * @return True if username exists
     */
    boolean existsByUsernameIgnoreCase(String username);
    
    /**
     * Check if email exists (case insensitive).
     * @param email Email to check
     * @return True if email exists
     */
    boolean existsByEmailIgnoreCase(String email);
}