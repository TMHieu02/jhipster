package com.demo.repository;

import com.demo.domain.Product;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Spring Data MongoDB repository for the {@link Product} entity.
 */
@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    Page<Product> findAllByActiveTrue(Pageable pageable);
    
    Page<Product> findAllByCategoryId(String categoryId, Pageable pageable);
    
    List<Product> findAllByNameContainingIgnoreCase(String name);
    
    @Query("{'name': {$regex: ?0, $options: 'i'}}")
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    @Query("{'name': {$regex: ?0, $options: 'i'}, 'categoryId': ?1}")
    Page<Product> findByNameContainingAndCategoryId(String name, String categoryId, Pageable pageable);
    
    @Query("{'name': {$regex: ?0, $options: 'i'}, 'active': ?1}")
    Page<Product> findByNameContainingAndActive(String name, Boolean active, Pageable pageable);
    
    @Query("{'name': {$regex: ?0, $options: 'i'}, 'categoryId': ?1, 'active': ?2}")
    Page<Product> findByNameContainingAndCategoryIdAndActive(String name, String categoryId, Boolean active, Pageable pageable);
    
    @Query("{'price': {$gte: ?0, $lte: ?1}}")
    Page<Product> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
}

