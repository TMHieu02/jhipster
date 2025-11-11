package com.demo.service.mapper;

import com.demo.domain.Customer;
import com.demo.service.dto.CustomerDTO;
import org.springframework.stereotype.Service;

@Service
public class CustomerMapper {
    public CustomerDTO toDto(Customer customer) {
        if (customer == null) return null;
        return new CustomerDTO(customer);
    }

    public Customer toEntity(CustomerDTO dto) {
        if (dto == null) return null;
        Customer customer = new Customer();
        customer.setId(dto.getId());
        customer.setFirstName(dto.getFirstName());
        customer.setLastName(dto.getLastName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setAddress(dto.getAddress());
        customer.setCity(dto.getCity());
        customer.setCountry(dto.getCountry());
        customer.setActive(dto.getActive());
        return customer;
    }

    public void updateEntity(Customer customer, CustomerDTO dto) {
        if (customer == null || dto == null) return;
        customer.setFirstName(dto.getFirstName());
        customer.setLastName(dto.getLastName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setAddress(dto.getAddress());
        customer.setCity(dto.getCity());
        customer.setCountry(dto.getCountry());
        customer.setActive(dto.getActive());
    }

    public void partialUpdate(Customer customer, CustomerDTO dto) {
        if (dto == null) return;
        if (dto.getFirstName() != null) customer.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) customer.setLastName(dto.getLastName());
        if (dto.getEmail() != null) customer.setEmail(dto.getEmail());
        if (dto.getPhone() != null) customer.setPhone(dto.getPhone());
        if (dto.getAddress() != null) customer.setAddress(dto.getAddress());
        if (dto.getCity() != null) customer.setCity(dto.getCity());
        if (dto.getCountry() != null) customer.setCountry(dto.getCountry());
        if (dto.getActive() != null) customer.setActive(dto.getActive());
    }
}

