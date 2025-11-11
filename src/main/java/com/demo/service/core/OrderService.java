package com.demo.service.core;

import com.demo.domain.Order;
import com.demo.repository.CustomerRepository;
import com.demo.repository.OrderRepository;
import com.demo.service.dto.OrderDTO;
import com.demo.service.mapper.OrderMapper;
import java.math.BigDecimal;
import java.time.Instant;
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

@Service
public class OrderService {
    private final Logger log = LoggerFactory.getLogger(OrderService.class);
    private final OrderRepository repository;
    private final CustomerRepository customerRepository;
    private final OrderMapper mapper;
    private final MongoTemplate mongoTemplate;

    public OrderService(
        OrderRepository repository,
        CustomerRepository customerRepository,
        OrderMapper mapper,
        MongoTemplate mongoTemplate
    ) {
        this.repository = repository;
        this.customerRepository = customerRepository;
        this.mapper = mapper;
        this.mongoTemplate = mongoTemplate;
    }

    private void populateCustomerName(OrderDTO dto) {
        if (dto.getCustomerId() != null) {
            customerRepository
                .findById(dto.getCustomerId())
                .ifPresent(customer -> dto.setCustomerName(customer.getFirstName() + " " + customer.getLastName()));
        }
    }

    public OrderDTO save(OrderDTO dto) {
        log.debug("Request to save Order : {}", dto);
        Order entity = mapper.toEntity(dto);
        entity = repository.save(entity);
        OrderDTO result = mapper.toDto(entity);
        populateCustomerName(result);
        return result;
    }

    public OrderDTO update(OrderDTO dto) {
        log.debug("Request to update Order : {}", dto);
        Order entity = repository
            .findById(dto.getId())
            .orElseThrow(() -> new IllegalStateException("Order not found with id " + dto.getId()));
        mapper.updateEntity(entity, dto);
        entity = repository.save(entity);
        OrderDTO result = mapper.toDto(entity);
        populateCustomerName(result);
        return result;
    }

    public Optional<OrderDTO> partialUpdate(OrderDTO dto) {
        log.debug("Request to partially update Order : {}", dto);
        return repository
            .findById(dto.getId())
            .map(existing -> {
                mapper.partialUpdate(existing, dto);
                return existing;
            })
            .map(repository::save)
            .map(order -> {
                OrderDTO result = mapper.toDto(order);
                populateCustomerName(result);
                return result;
            });
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Orders");
        return repository.findAll(pageable).map(order -> {
            OrderDTO dto = mapper.toDto(order);
            populateCustomerName(dto);
            return dto;
        });
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> findByCustomerId(String customerId, Pageable pageable) {
        log.debug("Request to get Orders for customer : {}", customerId);
        return repository.findAllByCustomerId(customerId, pageable).map(order -> {
            OrderDTO dto = mapper.toDto(order);
            populateCustomerName(dto);
            return dto;
        });
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> searchOrders(
        String customerId,
        String status,
        String paymentMethod,
        Instant startDate,
        Instant endDate,
        BigDecimal minTotal,
        BigDecimal maxTotal,
        Pageable pageable
    ) {
        log.debug("Request to search Orders");
        Query query = new Query();

        if (StringUtils.hasText(customerId)) {
            query.addCriteria(Criteria.where("customer_id").is(customerId.trim()));
        }

        if (StringUtils.hasText(status)) {
            query.addCriteria(Criteria.where("status").regex(status.trim(), "i"));
        }

        if (StringUtils.hasText(paymentMethod)) {
            query.addCriteria(Criteria.where("payment_method").regex(paymentMethod.trim(), "i"));
        }

        if (startDate != null || endDate != null) {
            Criteria dateCriteria = Criteria.where("order_date");
            if (startDate != null && endDate != null) {
                dateCriteria = dateCriteria.gte(startDate).lte(endDate);
            } else if (startDate != null) {
                dateCriteria = dateCriteria.gte(startDate);
            } else {
                dateCriteria = dateCriteria.lte(endDate);
            }
            query.addCriteria(dateCriteria);
        }

        if (minTotal != null || maxTotal != null) {
            Criteria totalCriteria = Criteria.where("total_amount");
            if (minTotal != null && maxTotal != null) {
                totalCriteria = totalCriteria.gte(minTotal).lte(maxTotal);
            } else if (minTotal != null) {
                totalCriteria = totalCriteria.gte(minTotal);
            } else {
                totalCriteria = totalCriteria.lte(maxTotal);
            }
            query.addCriteria(totalCriteria);
        }

        long total = mongoTemplate.count(query, Order.class);
        query.with(pageable);
        List<Order> orders = mongoTemplate.find(query, Order.class);

        Page<Order> page = PageableExecutionUtils.getPage(orders, pageable, () -> total);

        return page.map(order -> {
            OrderDTO dto = mapper.toDto(order);
            populateCustomerName(dto);
            return dto;
        });
    }

    public Optional<OrderDTO> findOne(String id) {
        log.debug("Request to get Order : {}", id);
        return repository.findById(id).map(order -> {
            OrderDTO dto = mapper.toDto(order);
            populateCustomerName(dto);
            return dto;
        });
    }

    public void delete(String id) {
        log.debug("Request to delete Order : {}", id);
        repository.deleteById(id);
    }

    public void deleteMany(List<String> ids) {
        log.debug("Request to bulk delete {} Orders", ids.size());
        repository.deleteAllById(ids);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStatistics() {
        log.debug("Request to get Order statistics");
        List<Order> orders = repository.findAll();
        long totalOrders = orders.size();
        long completedOrders = orders.stream().filter(order -> "COMPLETED".equalsIgnoreCase(order.getStatus())).count();
        long pendingOrders = orders.stream().filter(order -> "PENDING".equalsIgnoreCase(order.getStatus())).count();
        long cancelledOrders = orders.stream().filter(order -> "CANCELLED".equalsIgnoreCase(order.getStatus())).count();
        double totalRevenue = orders
            .stream()
            .map(Order::getTotalAmount)
            .filter(amount -> amount != null)
            .mapToDouble(BigDecimal::doubleValue)
            .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("completedOrders", completedOrders);
        stats.put("pendingOrders", pendingOrders);
        stats.put("cancelledOrders", cancelledOrders);
        stats.put("totalRevenue", totalRevenue);
        return stats;
    }
}

