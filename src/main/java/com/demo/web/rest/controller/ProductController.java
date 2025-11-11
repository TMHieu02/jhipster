package com.demo.web.rest.controller;

import com.demo.service.core.ExcelExportService;
import com.demo.service.core.ProductService;
import com.demo.service.dto.ProductDTO;
import com.demo.web.rest.errors.BadRequestAlertException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.demo.domain.Product}.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final String ENTITY_NAME = "product";
    private static final String X_TOTAL_COUNT_HEADER = "X-Total-Count";
    private static final DateTimeFormatter EXPORT_DATE_FORMATTER = DateTimeFormatter
        .ofPattern("HH:mm dd-MM-yyyy")
        .withZone(ZoneId.systemDefault());

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final Logger log = LoggerFactory.getLogger(ProductController.class);

    private final ProductService productService;
    private final ExcelExportService excelExportService;

    public ProductController(ProductService productService, ExcelExportService excelExportService) {
        this.productService = productService;
        this.excelExportService = excelExportService;
    }

    /**
     * {@code POST  /products} : Create a new product.
     *
     * @param productDTO the productDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new productDTO, or with status {@code 400 (Bad Request)} if the product has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductDTO productDTO) throws URISyntaxException {
        log.debug("REST request to save Product : {}", productDTO);
        if (productDTO.getId() != null) {
            throw new BadRequestAlertException("A new product cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ProductDTO result = productService.save(productDTO);
        return ResponseEntity
            .created(new URI("/api/products/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId()))
            .body(result);
    }

    /**
     * {@code PUT  /products/:id} : Updates an existing product.
     *
     * @param id the id of the productDTO to save.
     * @param productDTO the productDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated productDTO,
     * or with status {@code 400 (Bad Request)} if the productDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the productDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
        @PathVariable(value = "id", required = false) final String id,
        @Valid @RequestBody ProductDTO productDTO
    ) throws URISyntaxException {
        log.debug("REST request to update Product : {}, {}", id, productDTO);
        if (productDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, productDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        ProductDTO result = productService.update(productDTO);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, productDTO.getId()))
            .body(result);
    }

    /**
     * {@code PATCH  /products/:id} : Partial updates given fields of an existing product, field will be ignored if it is null
     *
     * @param id the id of the productDTO to save.
     * @param productDTO the productDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated productDTO,
     * or with status {@code 400 (Bad Request)} if the productDTO is not valid,
     * or with status {@code 404 (Not Found)} if the productDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the productDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<ProductDTO> partialUpdateProduct(
        @PathVariable(value = "id", required = false) final String id,
        @NotNull @RequestBody ProductDTO productDTO
    ) throws URISyntaxException {
        log.debug("REST request to partial update Product partially : {}, {}", id, productDTO);
        if (productDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, productDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        Optional<ProductDTO> result = productService.partialUpdate(productDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, productDTO.getId())
        );
    }

    /**
     * {@code GET  /products} : get all the products.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of products in body.
     */
    @GetMapping("")
    public ResponseEntity<List<ProductDTO>> getAllProducts(@org.springdoc.api.annotations.ParameterObject Pageable pageable) {
        log.debug("REST request to get a page of Products");
        Page<ProductDTO> page = productService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        headers.add(X_TOTAL_COUNT_HEADER, Long.toString(page.getTotalElements()));
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /products/active} : get all the active products.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of active products in body.
     */
    @GetMapping("/active")
    public ResponseEntity<List<ProductDTO>> getAllActiveProducts(@org.springdoc.api.annotations.ParameterObject Pageable pageable) {
        log.debug("REST request to get a page of active Products");
        Page<ProductDTO> page = productService.findAllActive(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        headers.add(X_TOTAL_COUNT_HEADER, Long.toString(page.getTotalElements()));
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /products/:id} : get the "id" product.
     *
     * @param id the id of the productDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the productDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable String id) {
        log.debug("REST request to get Product : {}", id);
        Optional<ProductDTO> productDTO = productService.findOne(id);
        return ResponseUtil.wrapOrNotFound(productDTO);
    }

    /**
     * {@code DELETE  /products/:id} : delete the "id" product.
     *
     * @param id the id of the productDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        log.debug("REST request to delete Product : {}", id);
        productService.delete(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build();
    }

    /**
     * {@code GET  /products/search} : search products with filters.
     *
     * @param name the name to search (partial match, case-insensitive).
     * @param categoryId the category ID to filter by.
     * @param active the active status to filter by.
     * @param minPrice the minimum price.
     * @param maxPrice the maximum price.
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of products in body.
     */
    @GetMapping("/search")
    public ResponseEntity<List<ProductDTO>> searchProducts(
        @RequestParam(required = false) String name,
        @RequestParam(required = false) String categoryId,
        @RequestParam(required = false) Boolean active,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @org.springdoc.api.annotations.ParameterObject Pageable pageable
    ) {
        log.debug("REST request to search Products with filters");
        Page<ProductDTO> page = productService.searchProducts(name, categoryId, active, minPrice, maxPrice, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        headers.add(X_TOTAL_COUNT_HEADER, Long.toString(page.getTotalElements()));
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /products/export} : export all products to CSV.
     *
     * @param response the HTTP response.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)}.
     */
    @GetMapping("/export")
    public void exportProducts(@RequestParam(defaultValue = "txt") String format, HttpServletResponse response) {
        String normalizedFormat = format.toLowerCase(Locale.ROOT);
        log.debug("REST request to export Products in format {}", normalizedFormat);

        try {
            if ("xlsx".equals(normalizedFormat)) {
                byte[] data = excelExportService.exportProducts(productService.getAllForExport());
                response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=products.xlsx");
                response.getOutputStream().write(data);
                response.getOutputStream().flush();
                return;
            }

            // default TXT export (tab-separated)
            List<ProductDTO> products = productService.getAllForExport();
            response.setContentType("text/plain");
            response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=products.txt");

            var outputStream = response.getOutputStream();
            String header = String.join(
                "\t",
                "STT",
                "Name",
                "Description",
                "Price",
                "Stock Quantity",
                "Category",
                "Active",
                "Created Date"
            );
            outputStream.write((header + "\n").getBytes(StandardCharsets.UTF_8));

            int counter = 1;
            for (ProductDTO product : products) {
                String line = String.join(
                    "\t",
                    formatCounter(counter++),
                    sanitize(product.getName()),
                    sanitize(product.getDescription()),
                    product.getPrice() != null ? product.getPrice().toString() : "",
                    product.getStockQuantity() != null ? product.getStockQuantity().toString() : "",
                    sanitize(product.getCategoryName() != null ? product.getCategoryName() : product.getCategoryId()),
                    product.getActive() != null ? product.getActive().toString() : "",
                    product.getCreatedDate() != null ? formatDate(product.getCreatedDate()) : ""
                );
                outputStream.write((line + "\n").getBytes(StandardCharsets.UTF_8));
            }
            outputStream.flush();
        } catch (Exception e) {
            log.error("Error exporting products", e);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * {@code DELETE  /products/bulk} : delete multiple products.
     *
     * @param ids the list of product IDs to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/bulk")
    public ResponseEntity<Void> deleteManyProducts(@RequestBody List<String> ids) {
        log.debug("REST request to delete {} Products", ids.size());
        productService.deleteMany(ids);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createAlert(applicationName, "Products deleted successfully", ""))
            .build();
    }

    /**
     * {@code GET  /products/statistics} : get product statistics.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and statistics in body.
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        log.debug("REST request to get Product statistics");
        Map<String, Object> statistics = productService.getStatistics();
        return ResponseEntity.ok().body(statistics);
    }

    private String sanitize(String value) {
        if (value == null) {
            return "";
        }
        return value.replace('\t', ' ').replace("\r", " ").replace("\n", " ");
    }

    private String formatCounter(int value) {
        return String.format("%04d", value);
    }

    private String formatDate(Instant value) {
        return EXPORT_DATE_FORMATTER.format(value);
    }
}

