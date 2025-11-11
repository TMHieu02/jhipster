package com.demo.service.core;

import com.demo.domain.Category;
import com.demo.repository.CategoryRepository;
import com.demo.service.dto.CategoryDTO;
import com.demo.service.mapper.CategoryMapper;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Service for managing {@link com.demo.domain.Category}.
 */
@Service
public class CategoryService {

    private final Logger log = LoggerFactory.getLogger(CategoryService.class);

    private final CategoryRepository categoryRepository;

    private final CategoryMapper categoryMapper;

    private final MongoTemplate mongoTemplate;

    public CategoryService(CategoryRepository categoryRepository, CategoryMapper categoryMapper, MongoTemplate mongoTemplate) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
        this.mongoTemplate = mongoTemplate;
    }

    /**
     * Save a category.
     *
     * @param categoryDTO the entity to save.
     * @return the persisted entity.
     */
    public CategoryDTO save(CategoryDTO categoryDTO) {
        log.debug("Request to save Category : {}", categoryDTO);
        Category category = categoryMapper.toEntity(categoryDTO);
        category = categoryRepository.save(category);
        return categoryMapper.toDto(category);
    }

    /**
     * Updates a category.
     *
     * @param categoryDTO the entity to update.
     * @return the persisted entity.
     */
    public CategoryDTO update(CategoryDTO categoryDTO) {
        log.debug("Request to update Category : {}", categoryDTO);
        Category category = categoryRepository
            .findById(categoryDTO.getId())
            .orElseThrow(() -> new IllegalStateException("Category not found with id " + categoryDTO.getId()));
        categoryMapper.updateEntity(category, categoryDTO);
        category = categoryRepository.save(category);
        return categoryMapper.toDto(category);
    }

    /**
     * Partially updates a category.
     *
     * @param categoryDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<CategoryDTO> partialUpdate(CategoryDTO categoryDTO) {
        log.debug("Request to partially update Category : {}", categoryDTO);

        return categoryRepository
            .findById(categoryDTO.getId())
            .map(existingCategory -> {
                categoryMapper.partialUpdate(existingCategory, categoryDTO);
                return existingCategory;
            })
            .map(categoryRepository::save)
            .map(categoryMapper::toDto);
    }

    /**
     * Get all the categories.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<CategoryDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Categories");
        return categoryRepository.findAll(pageable).map(categoryMapper::toDto);
    }

    /**
     * Get all the categories with active status.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<CategoryDTO> findAllActive(Pageable pageable) {
        log.debug("Request to get all active Categories");
        return categoryRepository.findAllByActiveTrue(pageable).map(categoryMapper::toDto);
    }

    /**
     * Search categories with optional filters.
     *
     * @param name the name to search (partial match, case-insensitive).
     * @param slug the slug to filter (partial match, case-insensitive).
     * @param active the active status to filter by.
     * @param pageable pagination info.
     * @return page of categories.
     */
    @Transactional(readOnly = true)
    public Page<CategoryDTO> searchCategories(String name, String slug, Boolean active, Pageable pageable) {
        log.debug("Request to search Categories with filters: name={}, slug={}, active={}", name, slug, active);
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (StringUtils.hasText(name)) {
            criteriaList.add(Criteria.where("name").regex(name.trim(), "i"));
        }

        if (StringUtils.hasText(slug)) {
            criteriaList.add(Criteria.where("slug").regex(slug.trim(), "i"));
        }

        if (active != null) {
            criteriaList.add(Criteria.where("active").is(active));
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Category.class);
        query.with(pageable);
        List<Category> categories = mongoTemplate.find(query, Category.class);
        Page<Category> page = PageableExecutionUtils.getPage(categories, pageable, () -> total);

        return page.map(categoryMapper::toDto);
    }

    /**
     * Get the "id" category.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<CategoryDTO> findOne(String id) {
        log.debug("Request to get Category : {}", id);
        return categoryRepository.findById(id).map(categoryMapper::toDto);
    }

    /**
     * Delete the "id" category.
     *
     * @param id the id of the entity.
     */
    public void delete(String id) {
        log.debug("Request to delete Category : {}", id);
        categoryRepository.deleteById(id);
    }

    /**
     * Delete multiple categories.
     *
     * @param ids list of identifiers.
     */
    @Transactional
    public void deleteMany(List<String> ids) {
        log.debug("Request to bulk delete {} Categories", ids.size());
        categoryRepository.deleteAllById(ids);
    }

    /**
     * Get statistics for categories.
     *
     * @return map containing statistics data.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStatistics() {
        log.debug("Request to get Category statistics");
        List<Category> categories = categoryRepository.findAll();
        long total = categories.size();
        long active = categories.stream().filter(cat -> Boolean.TRUE.equals(cat.getActive())).count();
        long inactive = total - active;
        long withImage = categories.stream().filter(cat -> cat.getImageUrl() != null && !cat.getImageUrl().isBlank()).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCategories", total);
        stats.put("activeCategories", active);
        stats.put("inactiveCategories", inactive);
        stats.put("categoriesWithImage", withImage);
        return stats;
    }
}

