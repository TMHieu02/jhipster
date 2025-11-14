import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Row, Col, FormText } from 'reactstrap';
import { Translate, translate, ValidatedField, ValidatedForm, isEmail } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { getEntity, updateEntity, createEntity, reset } from './product.reducer';
import { getEntities as getCategories } from '../category/category.reducer';
import { useAppDispatch, useAppSelector } from 'app/config/store';

export const ProductUpdate = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const { id } = useParams<'id'>();
  const isNew = id === undefined;

  const productEntity = useAppSelector(state => state.product.entity);
  const loading = useAppSelector(state => state.product.loading);
  const updating = useAppSelector(state => state.product.updating);
  const updateSuccess = useAppSelector(state => state.product.updateSuccess);
  const categories = useAppSelector(state => state.category.entities);

  const handleClose = () => {
    navigate('/product-management');
  };

  useEffect(() => {
    if (isNew) {
      dispatch(reset());
    } else {
      dispatch(getEntity(id));
    }
    // Load categories for dropdown
    dispatch(getCategories({ page: 0, size: 1000, sort: 'name,asc' }));
  }, []);

  useEffect(() => {
    if (updateSuccess) {
      handleClose();
    }
  }, [updateSuccess]);

  const saveEntity = values => {
    if (isNew) {
      // Remove ID and other fields that shouldn't be sent when creating new entity
      const entity = {
        ...productEntity,
        ...values,
        price: values.price !== undefined && values.price !== null ? Number(values.price) : undefined,
        stockQuantity: values.stockQuantity !== undefined && values.stockQuantity !== null ? Number(values.stockQuantity) : undefined,
        active: !!values.active,
      };
      // Remove fields that shouldn't be sent when creating
      delete entity.id;
      delete entity.createdDate;
      delete entity.lastModifiedDate;
      dispatch(createEntity(entity));
    } else {
      const entity = {
        ...productEntity,
        ...values,
        price: values.price !== undefined && values.price !== null ? Number(values.price) : undefined,
        stockQuantity: values.stockQuantity !== undefined && values.stockQuantity !== null ? Number(values.stockQuantity) : undefined,
        active: !!values.active,
      };
      dispatch(updateEntity(entity));
    }
  };

  const defaultValues = () =>
    isNew
      ? {
          active: true,
        }
      : {
          ...productEntity,
        };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="8">
          <h2 id="product-heading" data-cy="ProductCreateUpdateHeading">
            <Translate contentKey="product.home.createOrEditLabel">Create or edit a Product</Translate>
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col md="8">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <ValidatedForm defaultValues={defaultValues()} onSubmit={saveEntity}>
              <ValidatedField
                label={translate('product.name')}
                id="product-name"
                name="name"
                data-cy="name"
                type="text"
                validate={{
                  required: { value: true, message: translate('entity.validation.required') },
                  maxLength: { value: 100, message: translate('entity.validation.maxlength', { max: 100 }) },
                }}
              />
              <ValidatedField
                label={translate('product.description')}
                id="product-description"
                name="description"
                data-cy="description"
                type="textarea"
                validate={{
                  maxLength: { value: 500, message: translate('entity.validation.maxlength', { max: 500 }) },
                }}
              />
              <ValidatedField
                label={translate('product.price')}
                id="product-price"
                name="price"
                data-cy="price"
                type="number"
                step="0.01"
                validate={{
                  required: { value: true, message: translate('entity.validation.required') },
                  min: { value: 0, message: translate('entity.validation.min', { min: 0 }) },
                }}
              />
              <ValidatedField
                label={translate('product.stockQuantity')}
                id="product-stockQuantity"
                name="stockQuantity"
                data-cy="stockQuantity"
                type="number"
                validate={{
                  required: { value: true, message: translate('entity.validation.required') },
                  min: { value: 0, message: translate('entity.validation.min', { min: 0 }) },
                }}
              />
              <ValidatedField type="select" name="categoryId" label={translate('product.category')} data-cy="category">
                <option value="">-- Select Category --</option>
                {categories
                  ?.filter(cat => cat.active !== false)
                  .map(category => (
                    <option value={category.id} key={category.id}>
                      {category.name}
                    </option>
                  ))}
              </ValidatedField>
              <ValidatedField
                label={translate('product.imageUrl')}
                id="product-imageUrl"
                name="imageUrl"
                data-cy="imageUrl"
                type="text"
                validate={{
                  maxLength: { value: 255, message: translate('entity.validation.maxlength', { max: 255 }) },
                }}
              />
              <ValidatedField
                label={translate('product.active')}
                id="product-active"
                name="active"
                data-cy="active"
                check
                type="checkbox"
              />
              <Button tag={Link} id="cancel-save" data-cy="entityCreateCancelButton" to="/product-management" replace color="info">
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

export default ProductUpdate;
