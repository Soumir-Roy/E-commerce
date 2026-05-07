package com.sr.ecommerce.repo;

import com.sr.ecommerce.model.Orders;
import com.sr.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Orders,Long> {

    @Query("SELECT o from Orders o JOIN FETCH o.user")
    List<Orders> findAllOrdersWithUsers();

    List<Orders> findByUser(User user);

    // Used by PaymentService to look up the order after Razorpay callback
    Optional<Orders> findByRazorpayOrderId(String razorpayOrderId);
}
