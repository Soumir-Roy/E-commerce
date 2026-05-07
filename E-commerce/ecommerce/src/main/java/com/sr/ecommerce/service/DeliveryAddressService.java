package com.sr.ecommerce.service;

import com.sr.ecommerce.model.DeliveryAddress;
import com.sr.ecommerce.model.User;
import com.sr.ecommerce.repo.DeliveryAddressRepository;
import com.sr.ecommerce.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DeliveryAddressService {

    @Autowired
    private DeliveryAddressRepository deliveryAddressRepository;

    @Autowired
    private UserRepository userRepository;

    public DeliveryAddress addAddress(Long userId, DeliveryAddress address) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        address.setUser(user);
        return deliveryAddressRepository.save(address);
    }

    public List<DeliveryAddress> getAddressesByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return deliveryAddressRepository.findByUser(user);
    }

    public void deleteAddress(Long addressId) {
        deliveryAddressRepository.deleteById(addressId);
    }
}