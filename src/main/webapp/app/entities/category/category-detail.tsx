import React, { ReactNode, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Button, Card, CardBody, CardHeader, CardSubtitle, CardTitle, Col, Row } from 'reactstrap';
import { Translate, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity } from './category.reducer';
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

export const CategoryDetail = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, [dispatch, id]);

  const categoryEntity = useAppSelector(state => state.category.entity);
  return (
    <div className="detail-container">
      <Card className="detail-card shadow-sm">
        <CardHeader className="detail-card__header">
          <div>
            <CardTitle tag="h2" className="mb-1" data-cy="categoryDetailsHeading">
              <Translate contentKey="category.detail.title">Category</Translate>
            </CardTitle>
            {categoryEntity.name && <CardSubtitle className="text-muted small">{categoryEntity.name}</CardSubtitle>}
          </div>
          <Badge color={categoryEntity.active ? 'success' : 'secondary'} pill className="text-uppercase">
            {categoryEntity.active ? (
              <Translate contentKey="category.active.true">Active</Translate>
            ) : (
              <Translate contentKey="category.active.false">Inactive</Translate>
            )}
          </Badge>
        </CardHeader>
        <CardBody>
          <Row className="g-4">
            <Col lg="7">
              <div className="detail-section">
                <h5 className="detail-section-title">
                  <Translate contentKey="category.detail.section.overview">Overview</Translate>
                </h5>
                <DetailField label={<Translate contentKey="category.name">Name</Translate>} value={categoryEntity.name} />
                <DetailField label={<Translate contentKey="category.slug">Slug</Translate>} value={categoryEntity.slug} />
                <DetailField label={<Translate contentKey="category.description">Description</Translate>}>
                  {categoryEntity.description ? <p className="mb-0">{categoryEntity.description}</p> : undefined}
                </DetailField>
              </div>
            </Col>
            <Col lg="5">
              <div className="detail-section">
                <h5 className="detail-section-title">
                  <Translate contentKey="category.imageUrl">Image URL</Translate>
                </h5>
                {categoryEntity.imageUrl ? (
                  <div className="detail-media-card">
                    <img src={categoryEntity.imageUrl} alt={categoryEntity.name ?? 'Category'} className="img-fluid rounded" />
                    <div className="detail-media-caption text-truncate mt-2">{categoryEntity.imageUrl}</div>
                  </div>
                ) : (
                  <div className="detail-media-placeholder text-muted">
                    <Translate contentKey="category.detail.noImage">No image provided</Translate>
                  </div>
                )}
              </div>
              <div className="detail-section">
                <h5 className="detail-section-title">
                  <Translate contentKey="category.detail.section.metadata">Metadata</Translate>
                </h5>
                <DetailField label={<Translate contentKey="category.createdBy">Created By</Translate>} value={categoryEntity.createdBy} />
                <DetailField label={<Translate contentKey="category.createdDate">Created Date</Translate>}>
                  {categoryEntity.createdDate ? <TextFormat value={categoryEntity.createdDate} type="date" format={APP_DATE_FORMAT} /> : undefined}
                </DetailField>
                <DetailField label={<Translate contentKey="category.lastModifiedBy">Last Modified By</Translate>} value={categoryEntity.lastModifiedBy} />
                <DetailField label={<Translate contentKey="category.lastModifiedDate">Last Modified Date</Translate>}>
                  {categoryEntity.lastModifiedDate ? <TextFormat value={categoryEntity.lastModifiedDate} type="date" format={APP_DATE_FORMAT} /> : undefined}
                </DetailField>
              </div>
            </Col>
          </Row>
          <div className="detail-footer-actions mt-4">
            <Button tag={Link} to="/category" replace color="light" className="detail-action-button" data-cy="entityDetailsBackButton">
              <FontAwesomeIcon icon="arrow-left" className="me-2" />
              <Translate contentKey="entity.action.back">Back</Translate>
            </Button>
            <Button tag={Link} to={`/category/${categoryEntity.id}/edit`} replace color="primary" className="detail-action-button">
              <FontAwesomeIcon icon="pencil-alt" className="me-2" />
              <Translate contentKey="entity.action.edit">Edit</Translate>
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default CategoryDetail;

