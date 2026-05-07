package com.sr.ecommerce.service;

import com.sr.ecommerce.model.Orders;
import com.sr.ecommerce.repo.OrderRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.UUID;

@Service
public class PaymentService {

    @Value("${razorpay.key_id}")
    private String keyId;

    @Value("${razorpay.key_secret}")
    private String keySecret;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Creates a Razorpay order and returns the full Razorpay order JSON string.
     * The caller should persist the razorpay order_id against their own order record.
     */
    public String createRazorpayOrder(double amount) throws RazorpayException {
        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", (int) (amount * 100)); // paise
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "txn_" + UUID.randomUUID());

        Order razorpayOrder = client.orders.create(orderRequest);
        System.out.println("Razorpay order created: " + razorpayOrder);
        return razorpayOrder.toString();
    }

    /**
     * Verifies the HMAC-SHA256 signature returned by Razorpay after payment.
     * MUST be called before marking any order as PAID.
     */
    public boolean verifySignature(String razorpayOrderId, String paymentId, String signature) {
        try {
            String payload = razorpayOrderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes());
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString().equals(signature);
        } catch (Exception e) {
            System.err.println("Signature verification error: " + e.getMessage());
            return false;
        }
    }

    /**
     * Updates order status after payment callback.
     * Sends confirmation email automatically on SUCCESS.
     *
     * @param razorpayOrderId  the order_id from Razorpay (stored on Orders entity)
     * @param paymentId        razorpay_payment_id from the frontend callback
     * @param status           "SUCCESS" or "FAILED"
     */
    public void updateOrderStatus(String razorpayOrderId, String paymentId, String status) {
        Orders order = orderRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Order not found for razorpayOrderId: " + razorpayOrderId));

        order.setPaymentId(paymentId);
        order.setStatus(status);
        orderRepository.save(order);

        if ("SUCCESS".equalsIgnoreCase(status) && order.getUser() != null) {
            // Build a lightweight email — full OrderDto email is sent from OrderController
            emailService.sendEmail(
                    order.getUser().getEmail(),
                    order.getUser().getName(),
                    "Order #" + order.getId(),
                    order.getTotalAmount()
            );
        }
    }
}