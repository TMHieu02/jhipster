import React, { ReactNode, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Button, Card, CardBody, CardHeader, CardSubtitle, CardTitle, Col, Row } from 'reactstrap';
import { Translate, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';

import { getEntity } from './product.reducer';
import 'app/shared/layout/detail/detail-view.scss';

interface DetailFieldProps {
  label: ReactNode;
  value?: ReactNode;
  className?: string;
  children?: ReactNode;
}

const DetailField = ({ label, value, className, children }: DetailFieldProps) => (
  <div className={`detail-info-row ${className ?? ''}`}>
    <div className="detail-info-label text-uppercase">
      <small>{label}</small>
    </div>
    <div className="detail-info-value">{value ?? children ?? <span className="text-muted">—</span>}</div>
  </div>
);

export const ProductDetail = () => {
  const dispatch = useAppDispatch();

  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, [dispatch, id]);

  const productEntity = useAppSelector(state => state.product.entity);
  const subtitleValue = productEntity.name || productEntity.categoryName || '';

  const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined) {
      return undefined;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const renderCategory = () => {
    if (!productEntity.categoryId) {
      return undefined;
    }

    return (
      <Link to={`/category/${productEntity.categoryId}`} className="link-underline link-underline-opacity-0">
        {productEntity.categoryName || <Translate contentKey="product.actions.viewCategory">View Category</Translate>}
      </Link>
    );
  };

  return (
    <div className="detail-container">
      <Card className="detail-card shadow-sm">
        <CardHeader className="detail-card__header">
          <div>
            <CardTitle tag="h2" className="mb-1" data-cy="productDetailsHeading">
              <Translate contentKey="product.detail.title">Product</Translate>
            </CardTitle>
            {subtitleValue && <CardSubtitle className="text-muted small">{subtitleValue}</CardSubtitle>}
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Badge color={productEntity.active ? 'success' : 'secondary'} pill className="text-uppercase">
              {productEntity.active ? (
                <Translate contentKey="product.active.true">Active</Translate>
              ) : (
                <Translate contentKey="product.active.false">Inactive</Translate>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardBody>
          <Row className="g-4">
            <Col lg="7">
              <div className="detail-section">
                <h5 className="detail-section-title">
                  <Translate contentKey="product.detail.section.overview">Overview</Translate>
                </h5>
                <DetailField label={<Translate contentKey="product.name">Name</Translate>} value={productEntity.name} />
                <DetailField label={<Translate contentKey="product.description">Description</Translate>}>
                  {productEntity.description ? <p className="mb-0">{productEntity.description}</p> : undefined}
                </DetailField>
                <DetailField label={<Translate contentKey="product.category">Category</Translate>} value={renderCategory()} />
                <DetailField label={<Translate contentKey="product.price">Price</Translate>} value={formatCurrency(productEntity.price)} />
                <DetailField
                  label={<Translate contentKey="product.stockQuantity">Stock Quantity</Translate>}
                  value={productEntity.stockQuantity !== undefined && productEntity.stockQuantity !== null ? productEntity.stockQuantity.toLocaleString() : undefined}
                />
              </div>
            </Col>
            <Col lg="5">
              <div className="detail-section">
                <h5 className="detail-section-title">
                  <Translate contentKey="product.detail.section.metadata">Metadata</Translate>
                </h5>
                <DetailField label={<Translate contentKey="product.createdBy">Created By</Translate>} value={productEntity.createdBy} />
                <DetailField label={<Translate contentKey="product.createdDate">Created Date</Translate>}>
                  {productEntity.createdDate ? <TextFormat value={productEntity.createdDate} type="date" format={APP_DATE_FORMAT} /> : undefined}
                </DetailField>
                <DetailField label={<Translate contentKey="product.lastModifiedBy">Last Modified By</Translate>} value={productEntity.lastModifiedBy} />
                <DetailField label={<Translate contentKey="product.lastModifiedDate">Last Modified Date</Translate>}>
                  {productEntity.lastModifiedDate ? <TextFormat value={productEntity.lastModifiedDate} type="date" format={APP_DATE_FORMAT} /> : undefined}
                </DetailField>
              </div>
              <div className="detail-section">
                <h5 className="detail-section-title">
                  <Translate contentKey="product.imageUrl">Image Url</Translate>
                </h5>
                {productEntity.imageUrl ? (
                  <div className="detail-media-card">
                    <img src={productEntity.imageUrl} alt={productEntity.name ?? 'Product'} className="img-fluid rounded" />
                    <div className="detail-media-caption text-truncate mt-2">{productEntity.imageUrl}</div>
                  </div>
                ) : (
                  <div className="detail-media-placeholder text-muted">
                    <Translate contentKey="product.detail.noImage">No image provided</Translate>
                  </div>
                )}
              </div>
            </Col>
          </Row>
          <div className="detail-footer-actions mt-4">
            <Button tag={Link} to="/product-management" replace color="light" className="detail-action-button" data-cy="entityDetailsBackButton">
              <FontAwesomeIcon icon="arrow-left" className="me-2" />
              <Translate contentKey="entity.action.back">Back</Translate>
            </Button>
            <Button tag={Link} to={`/product-management/${productEntity.id}/edit`} replace color="primary" className="detail-action-button">
              <FontAwesomeIcon icon="pencil-alt" className="me-2" />
              <Translate contentKey="entity.action.edit">Edit</Translate>
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProductDetail;

