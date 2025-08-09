package com.zengent.demo.controller;

import com.zengent.demo.model.Order;
import com.zengent.demo.model.OrderItem;
import com.zengent.demo.model.User;
import com.zengent.demo.service.OrderService;
import com.zengent.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * REST Controller for Order management operations.
 * Demonstrates complex business logic exposure through REST APIs.
 */
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    
    private final OrderService orderService;
    private final UserService userService;
    
    @Autowired
    public OrderController(OrderService orderService, UserService userService) {
        this.orderService = orderService;
        this.userService = userService;
    }
    
    /**
     * Create a new order.
     * @param orderRequest Order creation request
     * @return ResponseEntity with created order or error
     */
    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderCreateRequest orderRequest) {
        try {
            Order createdOrder = orderService.createOrder(
                    orderRequest.getUserId(),
                    orderRequest.getOrderItems(),
                    orderRequest.getShippingAddress(),
                    orderRequest.getBillingAddress()
            );
            return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get order by order number.
     * @param orderNumber Order number
     * @return ResponseEntity with order data or 404
     */
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<Order> getOrderByNumber(@PathVariable String orderNumber) {
        Optional<Order> orderOpt = orderService.findByOrderNumber(orderNumber);
        if (orderOpt.isPresent()) {
            return new ResponseEntity<>(orderOpt.get(), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
    
    /**
     * Get orders for a user with pagination.
     * @param userId User ID
     * @param page Page number (0-based)
     * @param size Page size
     * @param sortBy Sort field
     * @param sortDir Sort direction (asc/desc)
     * @return ResponseEntity with paginated orders
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserOrders(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            // This would typically validate user exists and authorization
            User user = new User(); // Placeholder - would fetch actual user
            user.setId(userId);
            
            Sort sort = Sort.by(sortDir.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<Order> orders = orderService.getOrdersByUser(user, pageable);
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching orders", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Get orders by status.
     * @param status Order status
     * @return ResponseEntity with list of orders
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            List<Order> orders = orderService.getOrdersByStatus(orderStatus);
            return new ResponseEntity<>(orders, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>("Invalid status: " + status, HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * Get orders within a date range.
     * @param startDate Start date
     * @param endDate End date
     * @return ResponseEntity with list of orders
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<Order>> getOrdersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        List<Order> orders = orderService.getOrdersByDateRange(startDate, endDate);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }
    
    /**
     * Confirm an order.
     * @param orderId Order ID
     * @return ResponseEntity with success/failure status
     */
    @PutMapping("/{orderId}/confirm")
    public ResponseEntity<String> confirmOrder(@PathVariable Long orderId) {
        boolean success = orderService.confirmOrder(orderId);
        if (success) {
            return new ResponseEntity<>("Order confirmed successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Order not found or cannot be confirmed", HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * Ship an order.
     * @param orderId Order ID
     * @return ResponseEntity with success/failure status
     */
    @PutMapping("/{orderId}/ship")
    public ResponseEntity<String> shipOrder(@PathVariable Long orderId) {
        boolean success = orderService.shipOrder(orderId);
        if (success) {
            return new ResponseEntity<>("Order shipped successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Order not found or cannot be shipped", HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * Cancel an order.
     * @param orderId Order ID
     * @return ResponseEntity with success/failure status
     */
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable Long orderId) {
        boolean success = orderService.cancelOrder(orderId);
        if (success) {
            return new ResponseEntity<>("Order cancelled successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Order not found or cannot be cancelled", HttpStatus.BAD_REQUEST);
        }
    }
    
    /**
     * Get sales report for a time period.
     * @param startDate Start date
     * @param endDate End date
     * @return ResponseEntity with sales data
     */
    @GetMapping("/sales-report")
    public ResponseEntity<SalesReport> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        BigDecimal totalSales = orderService.calculateTotalSales(startDate, endDate);
        List<Order> orders = orderService.getOrdersByDateRange(startDate, endDate);
        
        SalesReport report = new SalesReport();
        report.setStartDate(startDate);
        report.setEndDate(endDate);
        report.setTotalSales(totalSales);
        report.setOrderCount(orders.size());
        report.setAverageOrderValue(
                orders.size() > 0 ? totalSales.divide(BigDecimal.valueOf(orders.size())) : BigDecimal.ZERO
        );
        
        return new ResponseEntity<>(report, HttpStatus.OK);
    }
    
    /**
     * Get orders needing attention.
     * @param hoursThreshold Hours threshold for pending orders
     * @return ResponseEntity with list of orders needing attention
     */
    @GetMapping("/attention")
    public ResponseEntity<List<Order>> getOrdersNeedingAttention(
            @RequestParam(defaultValue = "24") int hoursThreshold) {
        
        List<Order> orders = orderService.getOrdersNeedingAttention(hoursThreshold);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }
    
    /**
     * Get recent orders for a user.
     * @param userId User ID
     * @param days Number of days to look back
     * @return ResponseEntity with recent orders
     */
    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<Order>> getRecentUserOrders(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "30") int days) {
        
        // This would typically validate user exists
        User user = new User();
        user.setId(userId);
        
        List<Order> recentOrders = orderService.getRecentOrdersByUser(user, days);
        return new ResponseEntity<>(recentOrders, HttpStatus.OK);
    }
    
    // Inner classes for request/response DTOs
    
    public static class OrderCreateRequest {
        private Long userId;
        private List<OrderItem> orderItems;
        private String shippingAddress;
        private String billingAddress;
        
        // Getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public List<OrderItem> getOrderItems() { return orderItems; }
        public void setOrderItems(List<OrderItem> orderItems) { this.orderItems = orderItems; }
        
        public String getShippingAddress() { return shippingAddress; }
        public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
        
        public String getBillingAddress() { return billingAddress; }
        public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }
    }
    
    public static class SalesReport {
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private BigDecimal totalSales;
        private int orderCount;
        private BigDecimal averageOrderValue;
        
        // Getters and setters
        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
        
        public LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
        
        public BigDecimal getTotalSales() { return totalSales; }
        public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }
        
        public int getOrderCount() { return orderCount; }
        public void setOrderCount(int orderCount) { this.orderCount = orderCount; }
        
        public BigDecimal getAverageOrderValue() { return averageOrderValue; }
        public void setAverageOrderValue(BigDecimal averageOrderValue) { this.averageOrderValue = averageOrderValue; }
    }
}