package com.sr.ecommerce.dto;

import java.util.Date;
import java.util.List;

public class OrderDto {

    private Long id;
    private double totalAmount;
    private String status;
    private Date orderDate;
    private Date returnedAt;
    private String userName;
    private String email;
    private String paymentId;
    private List<OrderItemDto> orderItems;
    private String razorpayPaymentId;


    // Constructor for placeOrder (no user info yet embedded)
    public OrderDto(Long id, double totalAmount, String status, Date orderDate, List<OrderItemDto> orderItems) {
        this.id = id;
        this.totalAmount = totalAmount;
        this.status = status;
        this.orderDate = orderDate;
        this.orderItems = orderItems;
    }

    // Constructor for getAllOrders / getOrderByUser (full info)
    public OrderDto(Long id, double totalAmount, String status, Date orderDate,
                    String userName, String email, List<OrderItemDto> orderItems) {
        this.id = id;
        this.totalAmount = totalAmount;
        this.status = status;
        this.orderDate = orderDate;
        this.userName = userName;
        this.email = email;
        this.orderItems = orderItems;
    }

    // Full constructor including return info
    public OrderDto(Long id, double totalAmount, String status, Date orderDate,
                    Date returnedAt, String userName, String email,
                    String paymentId, List<OrderItemDto> orderItems) {
        this.id = id;
        this.totalAmount = totalAmount;
        this.status = status;
        this.orderDate = orderDate;
        this.returnedAt = returnedAt;
        this.userName = userName;
        this.email = email;
        this.paymentId = paymentId;
        this.orderItems = orderItems;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Date getOrderDate() { return orderDate; }
    public void setOrderDate(Date orderDate) { this.orderDate = orderDate; }

    public Date getReturnedAt() { return returnedAt; }
    public void setReturnedAt(Date returnedAt) { this.returnedAt = returnedAt; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public List<OrderItemDto> getOrderItems() { return orderItems; }
    public void setOrderItems(List<OrderItemDto> orderItems) { this.orderItems = orderItems; }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }
}