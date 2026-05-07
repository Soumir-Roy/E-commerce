package com.sr.ecommerce.model;

import java.util.Map;

public class PaymentRequest {

    private String razorpayOrderId;   // order_id returned by Razorpay on createOrder
    private String paymentId;         // razorpay_payment_id from frontend callback
    private String signature;         // razorpay_signature from frontend callback

    private Map<Long, Integer> productQuantities;
    private double totalAmount;
    private Long deliveryAddressId;


    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }

    public Map<Long, Integer> getProductQuantities() { return productQuantities; }
    public void setProductQuantities(Map<Long, Integer> productQuantities) { this.productQuantities = productQuantities; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public Long getDeliveryAddressId() {
        return deliveryAddressId;
    }

    public void setDeliveryAddressId(Long deliveryAddressId) {
        this.deliveryAddressId = deliveryAddressId;
    }
}