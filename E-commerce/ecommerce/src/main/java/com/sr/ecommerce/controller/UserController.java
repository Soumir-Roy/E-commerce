package com.sr.ecommerce.controller;

import com.sr.ecommerce.model.User;
import com.sr.ecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Users")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User registeruser(@RequestBody User user)
    {
        return  userService.registeruser(user);
    }

    @PostMapping("/login")
    public  User loginService(@RequestBody User user)
    {
        return userService.loginUser(user.getEmail(),user.getPassword());
    }

    @GetMapping
    public List<User>getAllUsers()
    {
        return userService.getAllUsers();
    }
}
