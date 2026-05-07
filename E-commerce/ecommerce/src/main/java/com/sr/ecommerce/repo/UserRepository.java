package com.sr.ecommerce.repo;

import com.sr.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User,Long> {


    User findByEmail(String email);
}
