import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Row, Col } from 'reactstrap';
import { Translate, translate, ValidatedField, ValidatedForm } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { getEntity, updateEntity, createEntity, reset } from './order.reducer';
import { getEntities as getCustomers } from '../customer/customer.reducer';
import { useAppDispatch, useAppSelector } from 'app/config/store';

export const OrderUpdate = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const orderEntity = useAppSelector(state => state.order.entity);
  const loading = useAppSelector(state => state.order.loading);
  const updating = useAppSelector(state => state.order.updating);
  const updateSuccess = useAppSelector(state => state.order.updateSuccess);
  const customers = useAppSelector(state => state.customer.entities);

  const handleClose = () => {
    navigate('/order');
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }
    // Load customers for dropdown
    dispatch(getCustomers({ page: 0, size: 1000, sort: 'firstName,asc' }));
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    const entity = {
      ...orderEntity,
      ...values,
      totalAmount: values.totalAmount !== undefined && values.totalAmount !== null ? Number(values.totalAmount) : undefined,
      orderDate: values.orderDate ? new Date(`${values.orderDate}T00:00:00.000Z`).toISOString() : null,
    };

    if (isNew) {
      dispatch(createEntity(entity));
    } else {
      dispatch(updateEntity(entity));
    }
  };

  const defaultValues = () =>
    isNew
      ? {
          orderDate: new Date().toISOString().split('T')[0],
          status: 'PENDING',
        }
      : {
          ...orderEntity,
          orderDate: orderEntity.orderDate ? new Date(orderEntity.orderDate).toISOString().split('T')[0] : null,
        };

  const statusOptions = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'SHIPPED'];

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="order-heading" data-cy="OrderCreateUpdateHeading">
            <Translate contentKey="order.home.createOrEditLabel">Create or edit an Order</Translate>
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              <ValidatedField type="select" name="customerId" label={translate('order.customer')} data-cy="customer" validate={{
                required: { value: true, message: translate('entity.validation.required') },
              }}>
                <option value="">-- Select Customer --</option>
                {customers
                  ?.filter(cust => cust.active !== false)
                  .map(customer => (
                    <option value={customer.id} key={customer.id}>
                      {customer.firstName} {customer.lastName} ({customer.email})
                    </option>
                  ))}
              </ValidatedField>
              <ValidatedField
                label={translate('order.orderDate')}
                id="order-orderDate"
                name="orderDate"
                data-cy="orderDate"
                type="date"
                validate={{
                  required: { value: true, message: translate('entity.validation.required') },
                }}
              />
              <ValidatedField
                label={translate('order.totalAmount')}
                id="order-totalAmount"
                name="totalAmount"
                data-cy="totalAmount"
                type="number"
                step="0.01"
                validate={{
                  required: { value: true, message: translate('entity.validation.required') },
                  min: { value: 0, message: translate('entity.validation.min', { min: 0 }) },
                }}
              />
              <ValidatedField type="select" name="status" label={translate('order.status')} data-cy="status" validate={{
                required: { value: true, message: translate('entity.validation.required') },
              }}>
                {statusOptions.map(status => (
                  <option value={status} key={status}>
                    {status}
                  </option>
                ))}
              </ValidatedField>
              <ValidatedField
                label={translate('order.shippingAddress')}
                id="order-shippingAddress"
                name="shippingAddress"
                data-cy="shippingAddress"
                type="textarea"
                validate={{
                  maxLength: { value: 500, message: translate('entity.validation.maxlength', { max: 500 }) },
                }}
              />
              <ValidatedField
                label={translate('order.paymentMethod')}
                id="order-paymentMethod"
                name="paymentMethod"
                data-cy="paymentMethod"
                type="text"
                validate={{
                  maxLength: { value: 100, message: translate('entity.validation.maxlength', { max: 100 }) },
                }}
              />
              <ValidatedField
                label={translate('order.notes')}
                id="order-notes"
                name="notes"
                data-cy="notes"
                type="textarea"
                validate={{
                  maxLength: { value: 500, message: translate('entity.validation.maxlength', { max: 500 }) },
                }}
              />
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/order" replace color="info">
                <FontAwesomeIcon icon="arrow-left" />
                &nbsp;
                <span className="d-none d-md-inline">
                  <Translate contentKey="entity.action.back">Back</Translate>
                </span>
              </Button>
              &nbsp;
              <Button color="primary" id="save-entity" data-cy="entityCreateSaveButton" type="submit" disabled={updating}>
                <FontAwesomeIcon icon="save" />
                &nbsp;
                <Translate contentKey="entity.action.save">Save</Translate>
              </Button>
            </ValidatedForm>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default OrderUpdate;

