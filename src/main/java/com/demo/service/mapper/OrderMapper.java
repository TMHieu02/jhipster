package com.demo.service.mapper;

import com.demo.domain.Order;
import com.demo.service.dto.OrderDTO;
import org.springframework.stereotype.Service;

@Service
public class OrderMapper {
    public OrderDTO toDto(Order order) {
        if (order == null) return null;
        return new OrderDTO(order);
    }

    public Order toEntity(OrderDTO dto) {
        if (dto == null) return null;
        Order order = new Order();
        order.setId(dto.getId());
        order.setCustomerId(dto.getCustomerId());
        order.setOrderDate(dto.getOrderDate());
        order.setTotalAmount(dto.getTotalAmount());
        order.setStatus(dto.getStatus());
        order.setShippingAddress(dto.getShippingAddress());
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setNotes(dto.getNotes());
        return order;
    }

    public void updateEntity(Order order, OrderDTO dto) {
        if (order == null || dto == null) return;
        order.setCustomerId(dto.getCustomerId());
        order.setOrderDate(dto.getOrderDate());
        order.setTotalAmount(dto.getTotalAmount());
        order.setStatus(dto.getStatus());
        order.setShippingAddress(dto.getShippingAddress());
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setNotes(dto.getNotes());
    }

    public void partialUpdate(Order order, OrderDTO dto) {
        if (dto == null) return;
        if (dto.getCustomerId() != null) order.setCustomerId(dto.getCustomerId());
        if (dto.getOrderDate() != null) order.setOrderDate(dto.getOrderDate());
        if (dto.getTotalAmount() != null) order.setTotalAmount(dto.getTotalAmount());
        if (dto.getStatus() != null) order.setStatus(dto.getStatus());
        if (dto.getShippingAddress() != null) order.setShippingAddress(dto.getShippingAddress());
        if (dto.getPaymentMethod() != null) order.setPaymentMethod(dto.getPaymentMethod());
        if (dto.getNotes() != null) order.setNotes(dto.getNotes());
    }
}

