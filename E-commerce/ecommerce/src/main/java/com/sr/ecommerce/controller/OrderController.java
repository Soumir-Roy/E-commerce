package com.sr.ecommerce.controller;

import com.sr.ecommerce.dto.OrderDto;
import com.sr.ecommerce.model.OrderRequest;
import com.sr.ecommerce.model.PaymentRequest;
import com.sr.ecommerce.model.ReturnRequest;
import com.sr.ecommerce.service.EmailService;
import com.sr.ecommerce.service.OrderService;
import com.sr.ecommerce.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@CrossOrigin("*")
public class OrderController {

    @Autowired private OrderService   orderService;
    @Autowired private PaymentService paymentService;
    @Autowired private EmailService   emailService;

    // ── Get All Orders (admin) ────────────────────────────────────────────────
    @GetMapping("/all-orders")
    public List<OrderDto> getAllOrders() {
        return orderService.getAllOrders();
    }

    // ── Get Orders by User ────────────────────────────────────────────────────
    @GetMapping("/user/{userId}")
    public List<OrderDto> getOrderByUser(@PathVariable long userId) {
        return orderService.getOrderByUser(userId);
    }

    // ── Create Razorpay Payment Order ─────────────────────────────────────────
    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(@RequestBody OrderRequest req) {
        try {
            String razorpayOrderJson = paymentService.createRazorpayOrder(req.getTotalAmount());
            return ResponseEntity.ok(razorpayOrderJson);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating Razorpay order: " + e.getMessage());
        }
    }

    // ── Verify Payment & Place Order ──────────────────────────────────────────
    @PostMapping("/verify-and-place/{userId}")
    public ResponseEntity<?> verifyAndPlace(@PathVariable Long userId,
                                            @RequestBody PaymentRequest paymentRequest) {
        boolean valid = paymentService.verifySignature(
                paymentRequest.getRazorpayOrderId(),
                paymentRequest.getPaymentId(),
                paymentRequest.getSignature()
        );
        if (!valid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Payment verification failed. Order not placed.");
        }

        OrderDto order = orderService.placeOrder(
                userId,
                paymentRequest.getProductQuantities(),
                paymentRequest.getTotalAmount(),
                paymentRequest.getRazorpayOrderId(),
                paymentRequest.getPaymentId(),          // ← pass paymentId so it's saved on Order
                paymentRequest.getDeliveryAddressId(),
                "RAZORPAY"
        );

        paymentService.updateOrderStatus(
                paymentRequest.getRazorpayOrderId(),
                paymentRequest.getPaymentId(),
                "SUCCESS"
        );

        if (order.getEmail() != null) {
            emailService.sendOrderConfirmation(order.getEmail(), order);
        }

        return ResponseEntity.ok(order);
    }

    // ── Update Payment Status (failed/success webhook) ────────────────────────
    @PostMapping("/update-payment")
    public ResponseEntity<String> updatePaymentStatus(
            @RequestParam String razorpayOrderId,
            @RequestParam String paymentId,
            @RequestParam String status) {
        paymentService.updateOrderStatus(razorpayOrderId, paymentId, status);
        return ResponseEntity.ok("Order status updated to: " + status);
    }

    // ── Place COD Order ───────────────────────────────────────────────────────
    @PostMapping("/place/{userId}")
    public ResponseEntity<?> placeOrderDirect(
            @PathVariable Long userId,
            @RequestBody OrderRequest request) {
        try {
            // Create the unique ID once
            String uniqueId = "COD_" + System.currentTimeMillis();
            OrderDto order = orderService.placeOrder(
                    userId,
                    request.getProductQuantities(),
                    request.getTotalAmount(),
                    uniqueId,
                    null,                                // ← no Razorpay paymentId for COD
                    request.getDeliveryAddressId(),
                    "COD"
            );
            paymentService.updateOrderStatus(uniqueId, "COD", "SUCCESS");
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to place order: " + e.getMessage());
        }
    }

    // ── Return Order & Refund ─────────────────────────────────────────────────
    /**
     * POST /orders/return/{orderId}?userId={userId}
     * Body: { reason, comments, paymentId, amount }
     *
     * - Validates order belongs to userId and is DELIVERED
     * - Triggers Razorpay refund using stored razorpayPaymentId
     * - Updates order status to REFUNDED (or RETURN_REQUESTED if refund fails)
     * - Sends confirmation email
     */
    @PostMapping("/return/{orderId}")
    public ResponseEntity<?> returnOrder(
            @PathVariable Long orderId,
            @RequestParam Long userId,
            @RequestBody ReturnRequest req) {
        try {
            OrderDto dto = orderService.returnOrder(orderId, userId, req);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    // ── Cancel Order ──────────────────────────────────────────────────────────
    @PutMapping("/cancel/{orderId}/user/{userId}")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long orderId,
            @PathVariable Long userId) {
        try {
            return ResponseEntity.ok(orderService.cancelOrder(orderId, userId));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}