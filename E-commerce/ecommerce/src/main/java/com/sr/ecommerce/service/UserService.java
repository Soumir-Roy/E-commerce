package com.sr.ecommerce.service;

import com.sr.ecommerce.model.User;
import com.sr.ecommerce.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registeruser(User user)
    {
        User newUser=userRepository.save(user);
        System.out.println("User added...");
        return newUser;
    }
    public User loginUser(String email,String password)
    {
        User user=userRepository.findByEmail(email);
        if (user!=null && user.getPassword().equals(password))
        {
            return user;
        }
        return null;
    }
    public List<User> getAllUsers()
    {
        return userRepository.findAll();
    }
}
