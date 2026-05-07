package com.sr.ecommerce.dto;

public class OrderItemDto {
    private String productName;
    private double productPrice;
    private int Quantity;

    public OrderItemDto(String productName, double productPrice, int quantity) {
        this.productName = productName;
        this.productPrice = productPrice;
        Quantity = quantity;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public double getProductPrice() {
        return productPrice;
    }

    public void setProductPrice(double productPrice) {
        this.productPrice = productPrice;
    }

    public int getQuantity() {
        return Quantity;
    }

    public void setQuantity(int quantity) {
        Quantity = quantity;
    }
}
