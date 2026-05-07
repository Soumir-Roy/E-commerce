package com.sr.ecommerce.controller;

import com.sr.ecommerce.model.DeliveryAddress;
import com.sr.ecommerce.service.DeliveryAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/address")
@CrossOrigin("*")
public class DeliveryAddressController {

    @Autowired
    private DeliveryAddressService deliveryAddressService;

    @PostMapping("/add/{userId}")
    public DeliveryAddress addAddress(@PathVariable Long userId,
                                      @RequestBody DeliveryAddress address) {
        return deliveryAddressService.addAddress(userId, address);
    }

    @GetMapping("/user/{userId}")
    public List<DeliveryAddress> getAddresses(@PathVariable Long userId) {
        return deliveryAddressService.getAddressesByUser(userId);
    }

    @DeleteMapping("/{addressId}")
    public void deleteAddress(@PathVariable Long addressId) {
        deliveryAddressService.deleteAddress(addressId);
    }
}