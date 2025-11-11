package com.demo.service.core;

import com.demo.domain.Product;
import com.demo.repository.CategoryRepository;
import com.demo.repository.ProductRepository;
import com.demo.service.dto.ProductDTO;
import com.demo.service.mapper.ProductMapper;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
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
 * Service for managing {@link com.demo.domain.Product}.
 */
@Service
public class ProductService {

    private final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final MongoTemplate mongoTemplate;

    public ProductService(
        ProductRepository productRepository,
        CategoryRepository categoryRepository,
        ProductMapper productMapper,
        MongoTemplate mongoTemplate
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productMapper = productMapper;
        this.mongoTemplate = mongoTemplate;
    }

    private void populateCategoryName(ProductDTO dto) {
        if (dto.getCategoryId() != null) {
            categoryRepository.findById(dto.getCategoryId()).ifPresent(category -> dto.setCategoryName(category.getName()));
        }
    }

    /**
     * Save a product.
     *
     * @param productDTO the entity to save.
     * @return the persisted entity.
     */
    public ProductDTO save(ProductDTO productDTO) {
        log.debug("Request to save Product : {}", productDTO);
        Product product = productMapper.toEntity(productDTO);
        product = productRepository.save(product);
        ProductDTO result = productMapper.toDto(product);
        populateCategoryName(result);
        return result;
    }

    /**
     * Updates a product.
     *
     * @param productDTO the entity to update.
     * @return the persisted entity.
     */
    public ProductDTO update(ProductDTO productDTO) {
        log.debug("Request to update Product : {}", productDTO);
        Product product = productRepository
            .findById(productDTO.getId())
            .orElseThrow(() -> new IllegalStateException("Product not found with id " + productDTO.getId()));
        productMapper.updateEntity(product, productDTO);
        product = productRepository.save(product);
        ProductDTO result = productMapper.toDto(product);
        populateCategoryName(result);
        return result;
    }

    /**
     * Partially updates a product.
     *
     * @param productDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ProductDTO> partialUpdate(ProductDTO productDTO) {
        log.debug("Request to partially update Product : {}", productDTO);

        return productRepository
            .findById(productDTO.getId())
            .map(existingProduct -> {
                productMapper.partialUpdate(existingProduct, productDTO);
                return existingProduct;
            })
            .map(productRepository::save)
            .map(product -> {
                ProductDTO dto = productMapper.toDto(product);
                populateCategoryName(dto);
                return dto;
            });
    }

    /**
     * Get all the products.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    public Page<ProductDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Products");
        return productRepository.findAll(pageable).map(dto -> {
            ProductDTO productDTO = productMapper.toDto(dto);
            populateCategoryName(productDTO);
            return productDTO;
        });
    }

    /**
     * Get all the products with active status.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    public Page<ProductDTO> findAllActive(Pageable pageable) {
        log.debug("Request to get all active Products");
        return productRepository.findAllByActiveTrue(pageable).map(dto -> {
            ProductDTO productDTO = productMapper.toDto(dto);
            populateCategoryName(productDTO);
            return productDTO;
        });
    }

    /**
     * Get the "id" product.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    public Optional<ProductDTO> findOne(String id) {
        log.debug("Request to get Product : {}", id);
        return productRepository.findById(id).map(product -> {
            ProductDTO dto = productMapper.toDto(product);
            populateCategoryName(dto);
            return dto;
        });
    }

    /**
     * Delete the "id" product.
     *
     * @param id the id of the entity.
     */
    public void delete(String id) {
        log.debug("Request to delete Product : {}", id);
        productRepository.deleteById(id);
    }

    /**
     * Search products with filters.
     *
     * @param name the name to search (partial match, case-insensitive).
     * @param categoryId the category ID to filter by.
     * @param active the active status to filter by.
     * @param minPrice the minimum price.
     * @param maxPrice the maximum price.
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    public Page<ProductDTO> searchProducts(
        String name,
        String categoryId,
        Boolean active,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Pageable pageable
    ) {
        log.debug(
            "Request to search Products with filters: name={}, categoryId={}, active={}, minPrice={}, maxPrice={}",
            name,
            categoryId,
            active,
            minPrice,
            maxPrice
        );
        Query query = new Query();

        if (StringUtils.hasText(name)) {
            query.addCriteria(Criteria.where("name").regex(name.trim(), "i"));
        }

        if (StringUtils.hasText(categoryId)) {
            query.addCriteria(Criteria.where("category_id").is(categoryId.trim()));
        }

        if (active != null) {
            query.addCriteria(Criteria.where("active").is(active));
        }

        if (minPrice != null || maxPrice != null) {
            Criteria priceCriteria = Criteria.where("price");
            if (minPrice != null && maxPrice != null) {
                priceCriteria = priceCriteria.gte(minPrice).lte(maxPrice);
            } else if (minPrice != null) {
                priceCriteria = priceCriteria.gte(minPrice);
            } else {
                priceCriteria = priceCriteria.lte(maxPrice);
            }
            query.addCriteria(priceCriteria);
        }

        long total = mongoTemplate.count(query, Product.class);
        query.with(pageable);
        List<Product> products = mongoTemplate.find(query, Product.class);

        Page<Product> page = PageableExecutionUtils.getPage(products, pageable, () -> total);

        return page.map(product -> {
            ProductDTO dto = productMapper.toDto(product);
            populateCategoryName(dto);
            return dto;
        });
    }

    /**
     * Get all products for export (no pagination).
     *
     * @return the list of all entities.
     */
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllForExport() {
        log.debug("Request to get all Products for export");
        return productRepository
            .findAll()
            .stream()
            .map(product -> {
                ProductDTO dto = productMapper.toDto(product);
                populateCategoryName(dto);
                return dto;
            })
            .collect(Collectors.toList());
    }

    /**
     * Delete multiple products by IDs.
     *
     * @param ids the list of product IDs to delete.
     */
    @Transactional
    public void deleteMany(List<String> ids) {
        log.debug("Request to delete {} Products", ids.size());
        productRepository.deleteAllById(ids);
    }

    /**
     * Get statistics about products.
     *
     * @return a map containing statistics.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStatistics() {
        log.debug("Request to get Product statistics");
        Map<String, Object> stats = new HashMap<>();

        List<Product> allProducts = productRepository.findAll();
        long totalProducts = allProducts.size();
        long activeProducts = allProducts.stream().filter(p -> Boolean.TRUE.equals(p.getActive())).count();
        long inactiveProducts = totalProducts - activeProducts;
        double avgPrice = allProducts
            .stream()
            .filter(p -> p.getPrice() != null)
            .mapToDouble(p -> p.getPrice().doubleValue())
            .average()
            .orElse(0.0);

        int totalStock = allProducts
            .stream()
            .filter(p -> p.getStockQuantity() != null)
            .mapToInt(Product::getStockQuantity)
            .sum();

        int lowStockCount = (int) allProducts
            .stream()
            .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() < 10)
            .count();

        stats.put("totalProducts", totalProducts);
        stats.put("activeProducts", activeProducts);
        stats.put("inactiveProducts", inactiveProducts);
        stats.put("averagePrice", avgPrice);
        stats.put("totalStock", totalStock);
        stats.put("lowStockCount", lowStockCount);

        return stats;
    }

}

