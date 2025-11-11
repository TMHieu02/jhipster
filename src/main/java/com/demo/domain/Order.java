package com.demo.domain;

import java.math.BigDecimal;
import java.time.Instant;
import javax.validation.constraints.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * A Order entity.
 */
@Document(collection = "order")
public class Order extends AbstractAuditingEntity<String> {

    @Id
    private String id;

    @Field("customer_id")
    private String customerId;

    @NotNull
    @Field("order_date")
    private Instant orderDate = Instant.now();

    @NotNull
    @DecimalMin(value = "0")
    @Field("total_amount")
    private BigDecimal totalAmount;

    @Size(max = 50)
    @Field("status")
    private String status = "PENDING";

    @Size(max = 500)
    @Field("shipping_address")
    private String shippingAddress;

    @Size(max = 100)
    @Field("payment_method")
    private String paymentMethod;

    @Size(max = 500)
    @Field("notes")
    private String notes;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public Instant getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Instant orderDate) {
        this.orderDate = orderDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Order)) {
            return false;
        }
        return id != null && id.equals(((Order) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Order{" +
            "id='" + id + '\'' +
            ", customerId='" + customerId + '\'' +
            ", orderDate=" + orderDate +
            ", totalAmount=" + totalAmount +
            ", status='" + status + '\'' +
            ", shippingAddress='" + shippingAddress + '\'' +
            ", paymentMethod='" + paymentMethod + '\'' +
            ", notes='" + notes + '\'' +
            "}";
    }
}

