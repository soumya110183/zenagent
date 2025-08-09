package com.zengent.demo.model;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Order entity representing customer orders.
 * Demonstrates complex entity relationships and business logic.
 */
@Entity
@Table(name = "orders")
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;
    
    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status;
    
    @Column(name = "shipping_address")
    private String shippingAddress;
    
    @Column(name = "billing_address")
    private String billingAddress;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems;
    
    public enum OrderStatus {
        PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED, RETURNED
    }
    
    // Constructors
    public Order() {}
    
    public Order(String orderNumber, User user, BigDecimal totalAmount) {
        this.orderNumber = orderNumber;
        this.user = user;
        this.totalAmount = totalAmount;
        this.orderDate = LocalDateTime.now();
        this.status = OrderStatus.PENDING;
    }
    
    // Business logic methods
    public void confirmOrder() {
        if (this.status == OrderStatus.PENDING) {
            this.status = OrderStatus.CONFIRMED;
        }
    }
    
    public void shipOrder() {
        if (this.status == OrderStatus.CONFIRMED) {
            this.status = OrderStatus.SHIPPED;
        }
    }
    
    public boolean canBeCancelled() {
        return this.status == OrderStatus.PENDING || this.status == OrderStatus.CONFIRMED;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    
    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
    
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    
    public String getBillingAddress() { return billingAddress; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }
    
    public List<OrderItem> getOrderItems() { return orderItems; }
    public void setOrderItems(List<OrderItem> orderItems) { this.orderItems = orderItems; }
}