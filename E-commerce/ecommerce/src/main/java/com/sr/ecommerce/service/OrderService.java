package com.sr.ecommerce.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Refund;
import com.sr.ecommerce.dto.OrderDto;
import com.sr.ecommerce.dto.OrderItemDto;
import com.sr.ecommerce.model.*;
import com.sr.ecommerce.repo.DeliveryAddressRepository;
import com.sr.ecommerce.repo.OrderRepository;
import com.sr.ecommerce.repo.ProductRepository;
import com.sr.ecommerce.repo.UserRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired private UserRepository             userRepository;
    @Autowired private ProductRepository          productRepository;
    @Autowired private OrderRepository            orderRepository;
    @Autowired private DeliveryAddressRepository  deliveryAddressRepository;
    @Autowired private EmailService               emailService;

    @Value("${razorpay.key_id}")
    private String razorpayKeyId;

    @Value("${razorpay.key_secret}")
    private String razorpayKeySecret;
    //private OrderRequest request;

    // ── Place Order ────────────────────────────────────────────────────────────
    /**
     * Single placeOrder used by Razorpay and COD flows.
     * Pass razorpayPaymentId = null for COD orders.
     */
    public OrderDto placeOrder(Long userId,
                               Map<Long, Integer> productQuantities,
                               double totalAmount,
                               String razorpayOrderId,
                               String razorpayPaymentId,   // ← NEW param
                               Long deliveryAddressId,
                               String paymentMethod) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Orders order = new Orders();
        order.setUser(user);
        order.setOrderDate(new Date());
        order.setStatus("COD".equalsIgnoreCase(paymentMethod) ? "CONFIRMED" : "PENDING");
        order.setTotalAmount(totalAmount);
        order.setRazorpayOrderId(razorpayOrderId);
        // After order.setRazorpayOrderId(razorpayOrderId);
        order.setPaymentMethod(paymentMethod != null ? paymentMethod : "ONLINE");
        order.setRazorpayPaymentId(razorpayPaymentId);   // ← SAVE payment ID

        if (deliveryAddressId != null) {
            DeliveryAddress address = deliveryAddressRepository.findById(deliveryAddressId)
                    .orElseThrow(() -> new RuntimeException("Address not found: " + deliveryAddressId));
            order.setDeliveryAddress(address);
        }

        List<OrderItem>    orderItems    = new ArrayList<>();
        List<OrderItemDto> orderItemDtos = new ArrayList<>();

        for (Map.Entry<Long, Integer> entry : productQuantities.entrySet()) {
            Product product = productRepository.findById(entry.getKey())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + entry.getKey()));

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(entry.getValue());
            orderItems.add(item);
            orderItemDtos.add(new OrderItemDto(product.getName(), product.getPrice(), entry.getValue()));
        }

        order.setOrderItems(orderItems);
        Orders saved = orderRepository.save(order);
        return convertToDto(saved);
    }

    // ── Return Order & Razorpay Refund ─────────────────────────────────────────
    /**
     * Flow:
     *  1. Validate order belongs to userId and is DELIVERED
     *  2. Set status → RETURN_REQUESTED and save immediately
     *  3. Call Razorpay refund API using the stored razorpayPaymentId
     *     (or the paymentId passed in req as fallback)
     *  4. On Razorpay success → set status → REFUNDED, save refundId
     *  5. On Razorpay failure → keep RETURN_REQUESTED for manual processing
     *  6. Send confirmation email
     */
    public OrderDto returnOrder(Long orderId, Long userId, ReturnRequest req) {

        // 1. Fetch & validate
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (!order.getUser().getId().equals(userId))
            throw new RuntimeException("Unauthorized: order does not belong to this user");

        if (!"DELIVERED".equalsIgnoreCase(order.getStatus()))
            throw new RuntimeException("Only DELIVERED orders can be returned. Current status: " + order.getStatus());

        // 2. Mark return requested immediately
        order.setStatus("RETURN_REQUESTED");
        orderRepository.save(order);

        // 3. Determine paymentId — prefer the one saved on the order (most reliable)
        String paymentId = (order.getRazorpayPaymentId() != null && !order.getRazorpayPaymentId().isBlank())
                ? order.getRazorpayPaymentId()
                : (req.getPaymentId() != null ? req.getPaymentId().trim() : "");

        // 4. Trigger Razorpay refund
        if (!paymentId.isBlank()) {
            try {
                RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

                JSONObject refundReq = new JSONObject();
                refundReq.put("amount", (long)(req.getAmount() * 100)); // rupees → paise
                refundReq.put("speed", "normal");                        // use "optimum" for instant refund
                refundReq.put("notes", new JSONObject()
                        .put("reason",   req.getReason())
                        .put("comments", req.getComments() != null ? req.getComments() : "")
                        .put("orderId",  orderId.toString())
                );

                Refund refund = razorpay.payments.refund(paymentId, refundReq);

                order.setRazorpayRefundId(refund.get("id"));  // save for records
                order.setStatus("REFUNDED");
                orderRepository.save(order);

                System.out.println("✅ Razorpay refund created: " + refund.get("id"));

            } catch (RazorpayException e) {
                // Keep status as RETURN_REQUESTED — admin can process manually
                System.err.println("❌ Razorpay refund failed for order " + orderId + ": " + e.getMessage());
            }
        } else {
            System.out.println("⚠️ No paymentId available for order " + orderId + " — skipping Razorpay refund");
        }

        // 5. Send email
        if (order.getUser().getEmail() != null) {
            try {
                emailService.sendReturnConfirmation(order.getUser().getEmail(), order, req.getReason());
            } catch (Exception e) {
                System.err.println("Email send failed (non-critical): " + e.getMessage());
            }
        }

        return convertToDto(order);
    }

    // ── Cancel Order ──────────────────────────────────────────────────────────
    public OrderDto cancelOrder(Long orderId, Long userId) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(userId))
            throw new RuntimeException("Unauthorized: Order does not belong to this user");

        String status = order.getStatus();
        if (!status.equalsIgnoreCase("PENDING") && !status.equalsIgnoreCase("PROCESSING")
                && !status.equalsIgnoreCase("CONFIRMED") && !status.equalsIgnoreCase("SUCCESS"))
            throw new RuntimeException("Order cannot be cancelled. Current status: " + status);

        order.setStatus("CANCELLED");
        Orders updated = orderRepository.save(order);
        return convertToDto(updated);
    }

    // ── Get All / By User ─────────────────────────────────────────────────────
    public List<OrderDto> getAllOrders() {
        return orderRepository.findAllOrdersWithUsers()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<OrderDto> getOrderByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepository.findByUser(user)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ── DTO Converter ─────────────────────────────────────────────────────────
    private OrderDto convertToDto(Orders orders) {
        List<OrderItemDto> items = orders.getOrderItems().stream()
                .map(item -> new OrderItemDto(
                        item.getProduct().getName(),
                        item.getProduct().getPrice(),
                        item.getQuantity()))
                .collect(Collectors.toList());

        OrderDto dto = new OrderDto(
                orders.getId(),
                orders.getTotalAmount(),
                orders.getStatus(),
                orders.getOrderDate(),
                orders.getUser() != null ? orders.getUser().getName()  : "unknown",
                orders.getUser() != null ? orders.getUser().getEmail() : "unknown",
                items
        );

        dto.setRazorpayPaymentId(orders.getRazorpayPaymentId()); // ← expose to frontend
        return dto;
    }
}