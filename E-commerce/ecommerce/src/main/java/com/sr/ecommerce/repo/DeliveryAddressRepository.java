package com.sr.ecommerce.repo;

import com.sr.ecommerce.model.DeliveryAddress;
import com.sr.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeliveryAddressRepository extends JpaRepository<DeliveryAddress, Long> {
    List<DeliveryAddress> findByUser(User user);
}