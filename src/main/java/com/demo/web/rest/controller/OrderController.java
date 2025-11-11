package com.demo.web.rest.controller;

import com.demo.service.core.OrderService;
import com.demo.service.dto.OrderDTO;
import com.demo.web.rest.errors.BadRequestAlertException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
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

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final String ENTITY_NAME = "order";
    private static final String X_TOTAL_COUNT_HEADER = "X-Total-Count";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("")
    public ResponseEntity<OrderDTO> createOrder(@Valid @RequestBody OrderDTO dto) throws URISyntaxException {
        log.debug("REST request to save Order : {}", dto);
        if (dto.getId() != null) {
            throw new BadRequestAlertException("A new order cannot already have an ID", ENTITY_NAME, "idexists");
        }
        OrderDTO result = orderService.save(dto);
        return ResponseEntity.created(new URI("/api/orders/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId()))
            .body(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderDTO> updateOrder(
        @PathVariable(value = "id", required = false) final String id,
        @Valid @RequestBody OrderDTO dto
    ) throws URISyntaxException {
        log.debug("REST request to update Order : {}, {}", id, dto);
        if (dto.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, dto.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        OrderDTO result = orderService.update(dto);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, dto.getId()))
            .body(result);
    }

    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<OrderDTO> partialUpdateOrder(
        @PathVariable(value = "id", required = false) final String id,
        @NotNull @RequestBody OrderDTO dto
    ) throws URISyntaxException {
        log.debug("REST request to partial update Order partially : {}, {}", id, dto);
        if (dto.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, dto.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        Optional<OrderDTO> result = orderService.partialUpdate(dto);
        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, dto.getId())
        );
    }

    @GetMapping("")
    public ResponseEntity<List<OrderDTO>> getAllOrders(@org.springdoc.api.annotations.ParameterObject Pageable pageable) {
        log.debug("REST request to get a page of Orders");
        Page<OrderDTO> page = orderService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        headers.add(X_TOTAL_COUNT_HEADER, Long.toString(page.getTotalElements()));
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderDTO>> getOrdersByCustomer(
        @PathVariable String customerId,
        @org.springdoc.api.annotations.ParameterObject Pageable pageable
    ) {
        log.debug("REST request to get Orders for customer : {}", customerId);
        Page<OrderDTO> page = orderService.findByCustomerId(customerId, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        headers.add(X_TOTAL_COUNT_HEADER, Long.toString(page.getTotalElements()));
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/search")
    public ResponseEntity<List<OrderDTO>> searchOrders(
        @RequestParam(required = false) String customerId,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String paymentMethod,
        @RequestParam(required = false) String startDate,
        @RequestParam(required = false) String endDate,
        @RequestParam(required = false) BigDecimal minTotal,
        @RequestParam(required = false) BigDecimal maxTotal,
        @org.springdoc.api.annotations.ParameterObject Pageable pageable
    ) {
        log.debug("REST request to search Orders");
        Instant startInstant = parseDate(startDate, false);
        Instant endInstant = parseDate(endDate, true);
        Page<OrderDTO> page = orderService.searchOrders(customerId, status, paymentMethod, startInstant, endInstant, minTotal, maxTotal, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        headers.add(X_TOTAL_COUNT_HEADER, Long.toString(page.getTotalElements()));
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable String id) {
        log.debug("REST request to get Order : {}", id);
        Optional<OrderDTO> dto = orderService.findOne(id);
        return ResponseUtil.wrapOrNotFound(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String id) {
        log.debug("REST request to delete Order : {}", id);
        orderService.delete(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build();
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<Void> deleteManyOrders(@RequestBody List<String> ids) {
        log.debug("REST request to bulk delete {} Orders", ids.size());
        orderService.deleteMany(ids);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createAlert(applicationName, "Orders deleted successfully", ""))
            .build();
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getOrderStatistics() {
        Map<String, Object> stats = orderService.getStatistics();
        return ResponseEntity.ok(stats);
    }

    private Instant parseDate(String date, boolean endOfDay) {
        if (date == null || date.isBlank()) {
            return null;
        }
        LocalDate localDate = LocalDate.parse(date);
        if (endOfDay) {
            return localDate.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC).minusNanos(1_000_000);
        }
        return localDate.atStartOfDay().toInstant(ZoneOffset.UTC);
    }
}

