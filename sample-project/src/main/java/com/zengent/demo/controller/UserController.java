package com.zengent.demo.controller;

import com.zengent.demo.model.User;
import com.zengent.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Optional;

/**
 * REST Controller for User management operations.
 * Demonstrates Spring MVC patterns and RESTful API design.
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    
    private final UserService userService;
    
    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    /**
     * Create a new user.
     * @param user User data from request body
     * @return ResponseEntity with created user or error message
     */
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody User user) {
        try {
            User createdUser = userService.createUser(user);
            // Don't return password in response
            createdUser.setPassword(null);
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get user by ID.
     * @param id User ID
     * @return ResponseEntity with user data or 404
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        // This would typically use userService.findById(id)
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);
    }
    
    /**
     * Get user by username.
     * @param username Username to search for
     * @return ResponseEntity with user data or 404
     */
    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(null); // Don't expose password
            return new ResponseEntity<>(user, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    
    /**
     * Get all active users.
     * @return ResponseEntity with list of active users
     */
    @GetMapping("/active")
    public ResponseEntity<List<User>> getActiveUsers() {
        List<User> activeUsers = userService.getActiveUsers();
        // Remove passwords from all users
        activeUsers.forEach(user -> user.setPassword(null));
        return new ResponseEntity<>(activeUsers, HttpStatus.OK);
    }
    
    /**
     * Get users by role.
     * @param role User role to filter by
     * @return ResponseEntity with list of users
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable String role) {
        try {
            User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
            List<User> users = userService.getUsersByRole(userRole);
            users.forEach(user -> user.setPassword(null));
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * Search users by name.
     * @param firstName First name pattern (optional)
     * @param lastName Last name pattern (optional)
     * @return ResponseEntity with list of matching users
     */
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(
            @RequestParam(required = false, defaultValue = "") String firstName,
            @RequestParam(required = false, defaultValue = "") String lastName) {
        
        List<User> users = userService.searchUsersByName(firstName, lastName);
        users.forEach(user -> user.setPassword(null));
        return new ResponseEntity<>(users, HttpStatus.OK);
    }
    
    /**
     * Update user profile.
     * @param id User ID
     * @param updateRequest Update request data
     * @return ResponseEntity with updated user or error
     */
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable Long id,
            @RequestBody UserProfileUpdateRequest updateRequest) {
        
        try {
            Optional<User> updatedUserOpt = userService.updateUserProfile(
                    id,
                    updateRequest.getFirstName(),
                    updateRequest.getLastName(),
                    updateRequest.getEmail()
            );
            
            if (updatedUserOpt.isPresent()) {
                User user = updatedUserOpt.get();
                user.setPassword(null);
                return new ResponseEntity<>(user, HttpStatus.OK);
            } else {
                return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
            }
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * Change user password.
     * @param id User ID
     * @param passwordChangeRequest Password change request
     * @return ResponseEntity with success/failure status
     */
    @PutMapping("/{id}/password")
    public ResponseEntity<String> changePassword(
            @PathVariable Long id,
            @RequestBody PasswordChangeRequest passwordChangeRequest) {
        
        boolean success = userService.changePassword(
                id,
                passwordChangeRequest.getOldPassword(),
                passwordChangeRequest.getNewPassword()
        );
        
        if (success) {
            return new ResponseEntity<>("Password changed successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Invalid current password or user not found", HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * Deactivate user account.
     * @param id User ID
     * @return ResponseEntity with success/failure status
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<String> deactivateUser(@PathVariable Long id) {
        boolean success = userService.deactivateUser(id);
        if (success) {
            return new ResponseEntity<>("User deactivated successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
    }
    
    /**
     * Authenticate user (login).
     * @param loginRequest Login credentials
     * @return ResponseEntity with user data or error
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userService.authenticateUser(
                loginRequest.getUsername(),
                loginRequest.getPassword()
        );
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(null);
            
            // Update last login
            userService.updateLastLogin(user.getId());
            
            return new ResponseEntity<>(user, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }
    }
    
    // Inner classes for request DTOs
    
    public static class UserProfileUpdateRequest {
        private String firstName;
        private String lastName;
        private String email;
        
        // Getters and setters
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
    
    public static class PasswordChangeRequest {
        private String oldPassword;
        private String newPassword;
        
        // Getters and setters
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
        
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
    
    public static class LoginRequest {
        private String username;
        private String password;
        
        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}