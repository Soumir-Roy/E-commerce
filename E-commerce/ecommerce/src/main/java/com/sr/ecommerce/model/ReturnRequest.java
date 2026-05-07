package com.sr.ecommerce.model;

public class ReturnRequest {
    private String reason;
    private String comments;
    private String paymentId;   // Razorpay payment ID e.g. "pay_AbCdXyz"
    private long   amount;      // in rupees (frontend sends rupees, not paise)

    // getters and setters
    public String getReason()   { return reason; }
    public void setReason(String r) { this.reason = r; }

    public String getComments() { return comments; }
    public void setComments(String c) { this.comments = c; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String p) { this.paymentId = p; }

    public long getAmount()     { return amount; }
    public void setAmount(long a) { this.amount = a; }
}