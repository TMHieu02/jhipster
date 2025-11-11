package com.demo.service.core;

import com.demo.domain.Customer;
import com.demo.repository.CustomerRepository;
import com.demo.service.dto.CustomerDTO;
import com.demo.service.mapper.CustomerMapper;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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

@Service
public class CustomerService {

    private final Logger log = LoggerFactory.getLogger(CustomerService.class);

    private final CustomerRepository repository;

    private final CustomerMapper mapper;

    private final MongoTemplate mongoTemplate;

    public CustomerService(CustomerRepository repository, CustomerMapper mapper, MongoTemplate mongoTemplate) {
        this.repository = repository;
        this.mapper = mapper;
        this.mongoTemplate = mongoTemplate;
    }

    public CustomerDTO save(CustomerDTO dto) {
        log.debug("Request to save Customer : {}", dto);
        Customer entity = mapper.toEntity(dto);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    public CustomerDTO update(CustomerDTO dto) {
        log.debug("Request to update Customer : {}", dto);
        Customer entity = repository
            .findById(dto.getId())
            .orElseThrow(() -> new IllegalStateException("Customer not found with id " + dto.getId()));
        mapper.updateEntity(entity, dto);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    public Optional<CustomerDTO> partialUpdate(CustomerDTO dto) {
        log.debug("Request to partially update Customer : {}", dto);
        return repository
            .findById(dto.getId())
            .map(existing -> {
                mapper.partialUpdate(existing, dto);
                return existing;
            })
            .map(repository::save)
            .map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<CustomerDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Customers");
        return repository.findAll(pageable).map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<CustomerDTO> findAllActive(Pageable pageable) {
        log.debug("Request to get all active Customers");
        return repository.findAllByActiveTrue(pageable).map(mapper::toDto);
    }

    /**
     * Search customers with optional filters.
     *
     * @param name name fragment (matches first or last name).
     * @param email email fragment.
     * @param city city fragment.
     * @param country country fragment.
     * @param active active filter.
     * @param pageable pagination data.
     * @return page of customer DTOs.
     */
    @Transactional(readOnly = true)
    public Page<CustomerDTO> searchCustomers(String name, String email, String city, String country, Boolean active, Pageable pageable) {
        log.debug("Request to search Customers");
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        if (StringUtils.hasText(name)) {
            Criteria nameCriteria = new Criteria().orOperator(
                Criteria.where("first_name").regex(name.trim(), "i"),
                Criteria.where("last_name").regex(name.trim(), "i")
            );
            criteriaList.add(nameCriteria);
        }

        if (StringUtils.hasText(email)) {
            criteriaList.add(Criteria.where("email").regex(email.trim(), "i"));
        }

        if (StringUtils.hasText(city)) {
            criteriaList.add(Criteria.where("city").regex(city.trim(), "i"));
        }

        if (StringUtils.hasText(country)) {
            criteriaList.add(Criteria.where("country").regex(country.trim(), "i"));
        }

        if (active != null) {
            criteriaList.add(Criteria.where("active").is(active));
        }

        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, Customer.class);
        query.with(pageable);
        List<Customer> customers = mongoTemplate.find(query, Customer.class);
        Page<Customer> page = PageableExecutionUtils.getPage(customers, pageable, () -> total);

        return page.map(mapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<CustomerDTO> findOne(String id) {
        log.debug("Request to get Customer : {}", id);
        return repository.findById(id).map(mapper::toDto);
    }

    public void delete(String id) {
        log.debug("Request to delete Customer : {}", id);
        repository.deleteById(id);
    }

    @Transactional
    public void deleteMany(List<String> ids) {
        log.debug("Request to bulk delete {} Customers", ids.size());
        repository.deleteAllById(ids);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStatistics() {
        log.debug("Request to get Customer statistics");
        List<Customer> customers = repository.findAll();
        long total = customers.size();
        long active = customers.stream().filter(customer -> Boolean.TRUE.equals(customer.getActive())).count();
        long inactive = total - active;
        long withPhone = customers.stream().filter(customer -> customer.getPhone() != null && !customer.getPhone().isBlank()).count();
        Set<String> uniqueCities = customers
            .stream()
            .map(Customer::getCity)
            .filter(city -> city != null && !city.isBlank())
            .collect(Collectors.toSet());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCustomers", total);
        stats.put("activeCustomers", active);
        stats.put("inactiveCustomers", inactive);
        stats.put("customersWithPhone", withPhone);
        stats.put("uniqueCities", uniqueCities.size());
        return stats;
    }
}

