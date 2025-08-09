package com.zengent.demo.service;

import com.zengent.demo.model.User;
import com.zengent.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for User-related business operations.
 * Demonstrates service layer patterns and business logic encapsulation.
 */
@Service
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    /**
     * Create a new user with encrypted password.
     * @param user The user to create
     * @return The created user
     * @throws IllegalArgumentException if username or email already exists
     */
    public User createUser(User user) {
        // Validate unique constraints
        if (userRepository.existsByUsernameIgnoreCase(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + user.getUsername());
        }
        
        if (userRepository.existsByEmailIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
        
        // Encrypt password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Set creation timestamp
        user.setCreatedAt(LocalDateTime.now());
        
        // Set default role if not specified
        if (user.getRole() == null) {
            user.setRole(User.UserRole.USER);
        }
        
        return userRepository.save(user);
    }
    
    /**
     * Find user by username.
     * @param username The username to search for
     * @return Optional containing the user if found
     */
    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * Find user by email.
     * @param email The email to search for
     * @return Optional containing the user if found
     */
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    /**
     * Authenticate user with username and password.
     * @param username The username
     * @param password The raw password
     * @return Optional containing the user if authentication successful
     */
    @Transactional(readOnly = true)
    public Optional<User> authenticateUser(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getIsActive() && passwordEncoder.matches(password, user.getPassword())) {
                return userOpt;
            }
        }
        
        return Optional.empty();
    }
    
    /**
     * Update user's last login timestamp.
     * @param userId The user ID
     */
    public void updateLastLogin(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        }
    }
    
    /**
     * Deactivate a user account.
     * @param userId The user ID
     * @return True if user was deactivated successfully
     */
    public boolean deactivateUser(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsActive(false);
            userRepository.save(user);
            return true;
        }
        return false;
    }
    
    /**
     * Get all active users.
     * @return List of active users
     */
    @Transactional(readOnly = true)
    public List<User> getActiveUsers() {
        return userRepository.findByIsActiveTrue();
    }
    
    /**
     * Get users by role.
     * @param role The user role
     * @return List of users with the specified role
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(User.UserRole role) {
        return userRepository.findByRole(role);
    }
    
    /**
     * Search users by name.
     * @param firstName First name pattern
     * @param lastName Last name pattern
     * @return List of matching users
     */
    @Transactional(readOnly = true)
    public List<User> searchUsersByName(String firstName, String lastName) {
        return userRepository.findByNameContaining(firstName, lastName);
    }
    
    /**
     * Update user profile information.
     * @param userId The user ID
     * @param firstName New first name
     * @param lastName New last name
     * @param email New email
     * @return Updated user if successful
     */
    public Optional<User> updateUserProfile(Long userId, String firstName, String lastName, String email) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Check email uniqueness if email is being changed
            if (!user.getEmail().equals(email) && userRepository.existsByEmailIgnoreCase(email)) {
                throw new IllegalArgumentException("Email already exists: " + email);
            }
            
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            
            return Optional.of(userRepository.save(user));
        }
        
        return Optional.empty();
    }
    
    /**
     * Change user password.
     * @param userId The user ID
     * @param oldPassword The current password
     * @param newPassword The new password
     * @return True if password was changed successfully
     */
    public boolean changePassword(Long userId, String oldPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Verify current password
            if (passwordEncoder.matches(oldPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return true;
            }
        }
        
        return false;
    }
}