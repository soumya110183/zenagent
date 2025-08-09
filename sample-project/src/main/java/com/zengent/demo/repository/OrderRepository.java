package com.zengent.demo.repository;

import com.zengent.demo.model.Order;
import com.zengent.demo.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Order entity operations.
 * Demonstrates complex queries and business-specific data access patterns.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /**
     * Find order by order number.
     * @param orderNumber The order number to search for
     * @return Optional containing the order if found
     */
    Optional<Order> findByOrderNumber(String orderNumber);
    
    /**
     * Find orders by user.
     * @param user The user whose orders to find
     * @return List of orders for the user
     */
    List<Order> findByUser(User user);
    
    /**
     * Find orders by user with pagination.
     * @param user The user whose orders to find
     * @param pageable Pagination information
     * @return Page of orders for the user
     */
    Page<Order> findByUser(User user, Pageable pageable);
    
    /**
     * Find orders by status.
     * @param status The order status to filter by
     * @return List of orders with the specified status
     */
    List<Order> findByStatus(Order.OrderStatus status);
    
    /**
     * Find orders within a date range.
     * @param startDate Start date
     * @param endDate End date
     * @return List of orders within the date range
     */
    List<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find orders with total amount greater than specified value.
     * @param amount Minimum total amount
     * @return List of orders with total amount greater than the specified value
     */
    List<Order> findByTotalAmountGreaterThan(BigDecimal amount);
    
    /**
     * Custom query to find recent orders for a user.
     * @param user The user
     * @param days Number of days to look back
     * @return List of recent orders
     */
    @Query("SELECT o FROM Order o WHERE o.user = :user AND o.orderDate >= :since ORDER BY o.orderDate DESC")
    List<Order> findRecentOrdersByUser(@Param("user") User user, @Param("since") LocalDateTime since);
    
    /**
     * Custom query to calculate total sales for a time period.
     * @param startDate Start date
     * @param endDate End date
     * @return Total sales amount
     */
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalSales(@Param("startDate") LocalDateTime startDate, 
                                  @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find top customers by order count.
     * @param limit Number of top customers to return
     * @return List of user IDs and order counts
     */
    @Query("SELECT o.user.id, COUNT(o) as orderCount FROM Order o " +
           "GROUP BY o.user.id ORDER BY orderCount DESC")
    List<Object[]> findTopCustomersByOrderCount(Pageable pageable);
    
    /**
     * Custom query to find orders needing attention (pending for too long).
     * @param threshold Date threshold for pending orders
     * @return List of orders needing attention
     */
    @Query("SELECT o FROM Order o WHERE o.status = 'PENDING' AND o.orderDate < :threshold")
    List<Order> findOrdersNeedingAttention(@Param("threshold") LocalDateTime threshold);
    
    /**
     * Count orders by status.
     * @param status The order status
     * @return Number of orders with the specified status
     */
    Long countByStatus(Order.OrderStatus status);
    
    /**
     * Check if user has any orders.
     * @param user The user to check
     * @return True if user has orders
     */
    boolean existsByUser(User user);
}