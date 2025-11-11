package com.demo.domain;

import javax.validation.constraints.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * A Customer entity.
 */
@Document(collection = "customer")
public class Customer extends AbstractAuditingEntity<String> {

    @Id
    private String id;

    @NotNull
    @Size(min = 1, max = 100)
    @Field("first_name")
    private String firstName;

    @NotNull
    @Size(min = 1, max = 100)
    @Field("last_name")
    private String lastName;

    @NotNull
    @Email
    @Size(max = 100)
    @Field("email")
    private String email;

    @Size(max = 20)
    @Field("phone")
    private String phone;

    @Size(max = 255)
    @Field("address")
    private String address;

    @Size(max = 100)
    @Field("city")
    private String city;

    @Size(max = 50)
    @Field("country")
    private String country;

    @Field("active")
    private Boolean active = true;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Customer)) {
            return false;
        }
        return id != null && id.equals(((Customer) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Customer{" +
            "id='" + id + '\'' +
            ", firstName='" + firstName + '\'' +
            ", lastName='" + lastName + '\'' +
            ", email='" + email + '\'' +
            ", phone='" + phone + '\'' +
            ", address='" + address + '\'' +
            ", city='" + city + '\'' +
            ", country='" + country + '\'' +
            ", active=" + active +
            "}";
    }
}

