package com.demo.service.mapper;

import com.demo.domain.Category;
import com.demo.service.dto.CategoryDTO;
import org.springframework.stereotype.Service;

/**
 * Mapper for the entity {@link Category} and its DTO {@link CategoryDTO}.
 */
@Service
public class CategoryMapper {

    public CategoryDTO toDto(Category category) {
        if (category == null) {
            return null;
        }
        return new CategoryDTO(category);
    }

    public Category toEntity(CategoryDTO categoryDTO) {
        if (categoryDTO == null) {
            return null;
        }
        Category category = new Category();
        category.setId(categoryDTO.getId());
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setSlug(categoryDTO.getSlug());
        category.setActive(categoryDTO.getActive());
        category.setImageUrl(categoryDTO.getImageUrl());
        return category;
    }

    public void updateEntity(Category category, CategoryDTO categoryDTO) {
        if (categoryDTO == null || category == null) {
            return;
        }
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setSlug(categoryDTO.getSlug());
        category.setActive(categoryDTO.getActive());
        category.setImageUrl(categoryDTO.getImageUrl());
    }

    public void partialUpdate(Category category, CategoryDTO categoryDTO) {
        if (categoryDTO == null) {
            return;
        }
        if (categoryDTO.getName() != null) {
            category.setName(categoryDTO.getName());
        }
        if (categoryDTO.getDescription() != null) {
            category.setDescription(categoryDTO.getDescription());
        }
        if (categoryDTO.getSlug() != null) {
            category.setSlug(categoryDTO.getSlug());
        }
        if (categoryDTO.getActive() != null) {
            category.setActive(categoryDTO.getActive());
        }
        if (categoryDTO.getImageUrl() != null) {
            category.setImageUrl(categoryDTO.getImageUrl());
        }
    }
}

