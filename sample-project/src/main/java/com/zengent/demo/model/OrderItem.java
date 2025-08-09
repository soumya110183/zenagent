package com.zengent.demo.model;

import javax.persistence.*;
import java.math.BigDecimal;

/**
 * OrderItem entity representing individual items within an order.
 * Demonstrates many-to-one relationships and composite business logic.
 */
@Entity
@Table(name = "order_items")
public class OrderItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @Column(name = "product_name", nullable = false)
    private String productName;
    
    @Column(name = "product_code")
    private String productCode;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;
    
    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;
    
    @Column(name = "discount_amount")
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    // Constructors
    public OrderItem() {}
    
    public OrderItem(Order order, String productName, Integer quantity, BigDecimal unitPrice) {
        this.order = order;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        calculateTotalPrice();
    }
    
    // Business logic methods
    public void calculateTotalPrice() {
        if (unitPrice != null && quantity != null) {
            this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
            if (discountAmount != null && discountAmount.compareTo(BigDecimal.ZERO) > 0) {
                this.totalPrice = this.totalPrice.subtract(discountAmount);
            }
        }
    }
    
    public void applyDiscount(BigDecimal discount) {
        this.discountAmount = discount;
        calculateTotalPrice();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { 
        this.quantity = quantity;
        calculateTotalPrice();
    }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { 
        this.unitPrice = unitPrice;
        calculateTotalPrice();
    }
    
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { 
        this.discountAmount = discountAmount;
        calculateTotalPrice();
    }
}