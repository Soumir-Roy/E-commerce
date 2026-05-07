package com.sr.ecommerce.model;

import java.util.Map;

public class OrderRequest {

    private Map<Long,Integer> productQuantities;
    private double totalAmount;
    private Long deliveryAddressId;
    private String paymentMethod;

    public Long getDeliveryAddressId() { return deliveryAddressId; }
    public void setDeliveryAddressId(Long deliveryAddressId) { this.deliveryAddressId = deliveryAddressId; }

    public Map<Long,Integer> getProductQuantities() {
        return productQuantities;
    }

    public void setProductQuantities(Map<Long,Integer> productQuantities) {
        this.productQuantities = productQuantities;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
