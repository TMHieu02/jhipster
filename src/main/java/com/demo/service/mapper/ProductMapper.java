package com.demo.service.mapper;

import com.demo.domain.Product;
import com.demo.service.dto.ProductDTO;
import org.springframework.stereotype.Service;

/**
 * Mapper for the entity {@link Product} and its DTO {@link ProductDTO}.
 */
@Service
public class ProductMapper {

    public ProductDTO toDto(Product product) {
        if (product == null) {
            return null;
        }
        return new ProductDTO(product);
    }

    public Product toEntity(ProductDTO productDTO) {
        if (productDTO == null) {
            return null;
        }
        Product product = new Product();
        product.setId(productDTO.getId());
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setStockQuantity(productDTO.getStockQuantity());
        product.setCategoryId(productDTO.getCategoryId());
        product.setImageUrl(productDTO.getImageUrl());
        product.setActive(productDTO.getActive());
        return product;
    }

    public void updateEntity(Product product, ProductDTO productDTO) {
        if (productDTO == null || product == null) {
            return;
        }
        product.setName(productDTO.getName());
        product.setDescription(productDTO.getDescription());
        product.setPrice(productDTO.getPrice());
        product.setStockQuantity(productDTO.getStockQuantity());
        product.setCategoryId(productDTO.getCategoryId());
        product.setImageUrl(productDTO.getImageUrl());
        product.setActive(productDTO.getActive());
    }

    public void partialUpdate(Product product, ProductDTO productDTO) {
        if (productDTO == null) {
            return;
        }
        if (productDTO.getName() != null) {
            product.setName(productDTO.getName());
        }
        if (productDTO.getDescription() != null) {
            product.setDescription(productDTO.getDescription());
        }
        if (productDTO.getPrice() != null) {
            product.setPrice(productDTO.getPrice());
        }
        if (productDTO.getStockQuantity() != null) {
            product.setStockQuantity(productDTO.getStockQuantity());
        }
        if (productDTO.getCategoryId() != null) {
            product.setCategoryId(productDTO.getCategoryId());
        }
        if (productDTO.getImageUrl() != null) {
            product.setImageUrl(productDTO.getImageUrl());
        }
        if (productDTO.getActive() != null) {
            product.setActive(productDTO.getActive());
        }
    }
}

