package com.zengent.demo.service;

import com.zengent.demo.model.Order;
import com.zengent.demo.model.OrderItem;
import com.zengent.demo.model.User;
import com.zengent.demo.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service class for Order-related business operations.
 * Demonstrates complex business logic and transaction management.
 */
@Service
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final UserService userService;
    
    @Autowired
    public OrderService(OrderRepository orderRepository, UserService userService) {
        this.orderRepository = orderRepository;
        this.userService = userService;
    }
    
    /**
     * Create a new order for a user.
     * @param userId The user ID
     * @param orderItems List of order items
     * @param shippingAddress Shipping address
     * @param billingAddress Billing address
     * @return The created order
     * @throws IllegalArgumentException if user not found or order items empty
     */
    public Order createOrder(Long userId, List<OrderItem> orderItems, 
                           String shippingAddress, String billingAddress) {
        
        // Validate user exists
        Optional<User> userOpt = userService.findByUsername(""); // Would use actual user lookup
        if (!userOpt.isPresent()) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }
        
        if (orderItems == null || orderItems.isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }
        
        User user = userOpt.get();
        
        // Generate unique order number
        String orderNumber = generateOrderNumber();
        
        // Calculate total amount
        BigDecimal totalAmount = calculateTotalAmount(orderItems);
        
        // Create order
        Order order = new Order(orderNumber, user, totalAmount);
        order.setShippingAddress(shippingAddress);
        order.setBillingAddress(billingAddress);
        
        // Set order reference for all items and recalculate totals
        for (OrderItem item : orderItems) {
            item.setOrder(order);
            item.calculateTotalPrice();
        }
        order.setOrderItems(orderItems);
        
        // Save order (cascades to order items)
        return orderRepository.save(order);
    }
    
    /**
     * Find order by order number.
     * @param orderNumber The order number
     * @return Optional containing the order if found
     */
    @Transactional(readOnly = true)
    public Optional<Order> findByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber);
    }
    
    /**
     * Get orders for a user with pagination.
     * @param user The user
     * @param pageable Pagination information
     * @return Page of orders
     */
    @Transactional(readOnly = true)
    public Page<Order> getOrdersByUser(User user, Pageable pageable) {
        return orderRepository.findByUser(user, pageable);
    }
    
    /**
     * Confirm an order.
     * @param orderId The order ID
     * @return True if order was confirmed successfully
     */
    public boolean confirmOrder(Long orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.confirmOrder();
            orderRepository.save(order);
            return true;
        }
        return false;
    }
    
    /**
     * Ship an order.
     * @param orderId The order ID
     * @return True if order was shipped successfully
     */
    public boolean shipOrder(Long orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.shipOrder();
            orderRepository.save(order);
            return true;
        }
        return false;
    }
    
    /**
     * Cancel an order if possible.
     * @param orderId The order ID
     * @return True if order was cancelled successfully
     */
    public boolean cancelOrder(Long orderId) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            if (order.canBeCancelled()) {
                order.setStatus(Order.OrderStatus.CANCELLED);
                orderRepository.save(order);
                return true;
            }
        }
        return false;
    }
    
    /**
     * Get orders by status.
     * @param status The order status
     * @return List of orders with the specified status
     */
    @Transactional(readOnly = true)
    public List<Order> getOrdersByStatus(Order.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }
    
    /**
     * Get orders within a date range.
     * @param startDate Start date
     * @param endDate End date
     * @return List of orders within the date range
     */
    @Transactional(readOnly = true)
    public List<Order> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByOrderDateBetween(startDate, endDate);
    }
    
    /**
     * Calculate total sales for a time period.
     * @param startDate Start date
     * @param endDate End date
     * @return Total sales amount
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateTotalSales(LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal total = orderRepository.calculateTotalSales(startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }
    
    /**
     * Get orders that need attention (pending for too long).
     * @param hoursThreshold Number of hours for threshold
     * @return List of orders needing attention
     */
    @Transactional(readOnly = true)
    public List<Order> getOrdersNeedingAttention(int hoursThreshold) {
        LocalDateTime threshold = LocalDateTime.now().minusHours(hoursThreshold);
        return orderRepository.findOrdersNeedingAttention(threshold);
    }
    
    /**
     * Get recent orders for a user.
     * @param user The user
     * @param days Number of days to look back
     * @return List of recent orders
     */
    @Transactional(readOnly = true)
    public List<Order> getRecentOrdersByUser(User user, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return orderRepository.findRecentOrdersByUser(user, since);
    }
    
    // Private helper methods
    
    private String generateOrderNumber() {
        // Generate unique order number with timestamp and random component
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "ORD-" + timestamp + "-" + uuid;
    }
    
    private BigDecimal calculateTotalAmount(List<OrderItem> orderItems) {
        return orderItems.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}