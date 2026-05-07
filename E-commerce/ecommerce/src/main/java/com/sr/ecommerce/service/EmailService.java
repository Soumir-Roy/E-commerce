package com.sr.ecommerce.service;

import com.sr.ecommerce.dto.OrderDto;
import com.sr.ecommerce.model.Orders;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    /**
     * Sends a plain confirmation for a single product / course purchase.
     */
    public void sendEmail(String toEmail, String name, String itemName, double amount) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject("Payment Successful - " + itemName);
            helper.setText(
                    "<h2>Hi " + name + ",</h2>" +
                            "<p>Thank you for your purchase of <b>" + itemName + "</b>.</p>" +
                            "<p>Amount paid: <b>&#8377;" + amount + "</b></p>" +
                            "<p>We look forward to seeing you!</p>",
                    true
            );
            javaMailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }

    /**
     * Sends a full order confirmation with all items listed.
     */
    public void sendOrderConfirmation(String toEmail, OrderDto order) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject("Order Confirmed - #" + order.getId());

            StringBuilder body = new StringBuilder();
            body.append("<h2>Thank you for your order, ").append(order.getUserName()).append("!</h2>");
            body.append("<p>Order ID : <b>#").append(order.getId()).append("</b></p>");
            body.append("<p>Status&nbsp;&nbsp; : <b>").append(order.getStatus()).append("</b></p>");
            body.append("<p>Date&nbsp;&nbsp;&nbsp;&nbsp; : ").append(order.getOrderDate()).append("</p>");
            body.append("<h3>Items Ordered</h3><table border='1' cellpadding='6' style='border-collapse:collapse'>");
            body.append("<tr><th>Product</th><th>Qty</th><th>Price</th></tr>");

            order.getOrderItems().forEach(item ->
                    body.append("<tr>")
                            .append("<td>").append(item.getProductName()).append("</td>")
                            .append("<td>").append(item.getQuantity()).append("</td>")
                            .append("<td>&#8377;").append(item.getProductPrice()).append("</td>")
                            .append("</tr>")
            );

            body.append("</table>");
            body.append("<h3>Total: &#8377;").append(order.getTotalAmount()).append("</h3>");

            helper.setText(body.toString(), true);
            javaMailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send order email: " + e.getMessage());
        }
    }
    /** Sent when a return/refund is processed */
    public void sendRefundEmail(String toEmail, String name, String orderRef, double amount) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setTo(toEmail);
        mail.setSubject("Refund Processed – " + orderRef);
        mail.setText("Hi " + name + ",\n\n"
                + "We have processed a refund for " + orderRef + ".\n"
                + "Refund amount: ₹" + String.format("%.2f", amount) + "\n\n"
                + "The amount has been credited to your original payment method "
                + "and your account wallet within 5–7 business days.\n\n"
                + "If you have any questions, please contact our support team.\n\n"
                + "– The Team");
        javaMailSender.send(mail);
    }

    public void sendReturnConfirmation(String email, Orders order, String reason) {

    }
}