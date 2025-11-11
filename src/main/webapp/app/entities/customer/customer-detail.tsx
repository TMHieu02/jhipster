import React, { ReactNode, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Button, Card, CardBody, CardHeader, CardSubtitle, CardTitle, Col, Row } from 'reactstrap';
import { Translate, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity } from './customer.reducer';
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

export const CustomerDetail = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, [dispatch, id]);

  const customerEntity = useAppSelector(state => state.customer.entity);
  const fullName = [customerEntity.firstName, customerEntity.lastName].filter(Boolean).join(' ').trim();
  const subtitleValue = fullName || customerEntity.email || customerEntity.phone || '';
  return (
    <div className="detail-container">
      <Card className="detail-card shadow-sm">
        <CardHeader className="detail-card__header">
          <div>
            <CardTitle tag="h2" className="mb-1" data-cy="customerDetailsHeading">
              <Translate contentKey="customer.detail.title">Customer</Translate>
            </CardTitle>
            <CardSubtitle className="text-muted small">
              {subtitleValue ? (
                subtitleValue
              ) : (
                <Translate contentKey="entity.detail.loading">Loading...</Translate>
              )}
            </CardSubtitle>
          </div>
          <Badge color={customerEntity.active ? 'success' : 'secondary'} pill className="text-uppercase">
            {customerEntity.active ? (
              <Translate contentKey="customer.active.true">Active</Translate>
            ) : (
              <Translate contentKey="customer.active.false">Inactive</Translate>
            )}
          </Badge>
        </CardHeader>
        <CardBody>
          <Row className="g-4">
            <Col lg="6">
              <div className="detail-section">
                <h5 className="detail-section-title">
                  <Translate contentKey="customer.detail.section.profile">Profile</Translate>
                </h5>
                <DetailField label={<Translate contentKey="customer.firstName">First Name</Translate>} value={customerEntity.firstName} />
                <DetailField label={<Translate contentKey="customer.lastName">Last Name</Translate>} value={customerEntity.lastName} />
                <DetailField label={<Translate contentKey="customer.email">Email</Translate>}>
                  {customerEntity.email ? (
                    <a href={`mailto:${customerEntity.email}`} className="link-underline link-underline-opacity-0">
                      {customerEntity.email}
                    </a>
                  ) : undefined}
                </DetailField>
                <DetailField label={<Translate contentKey="customer.phone">Phone</Translate>}>
                  {customerEntity.phone ? (
                    <a href={`tel:${customerEntity.phone}`} className="link-underline link-underline-opacity-0">
                      {customerEntity.phone}
                    </a>
                  ) : undefined}
                </DetailField>
              </div>
            </Col>
            <Col lg="6">
              <div className="detail-section">
                <h5 className="detail-section-title">
                  <Translate contentKey="customer.detail.section.address">Address</Translate>
                </h5>
                <DetailField label={<Translate contentKey="customer.address">Address</Translate>} value={customerEntity.address} />
                <DetailField label={<Translate contentKey="customer.city">City</Translate>} value={customerEntity.city} />
                <DetailField label={<Translate contentKey="customer.country">Country</Translate>} value={customerEntity.country} />
              </div>
              <div className="detail-section">
                <h5 className="detail-section-title">
                  <Translate contentKey="customer.detail.section.metadata">Metadata</Translate>
                </h5>
                <DetailField label={<Translate contentKey="customer.createdBy">Created By</Translate>} value={customerEntity.createdBy} />
                <DetailField label={<Translate contentKey="customer.createdDate">Created Date</Translate>}>
                  {customerEntity.createdDate ? <TextFormat value={customerEntity.createdDate} type="date" format={APP_DATE_FORMAT} /> : undefined}
                </DetailField>
              </div>
            </Col>
          </Row>
          <div className="detail-footer-actions mt-4">
            <Button tag={Link} to="/customer" replace color="light" className="detail-action-button" data-cy="entityDetailsBackButton">
              <FontAwesomeIcon icon="arrow-left" className="me-2" />
              <Translate contentKey="entity.action.back">Back</Translate>
            </Button>
            <Button tag={Link} to={`/customer/${customerEntity.id}/edit`} replace color="primary" className="detail-action-button">
              <FontAwesomeIcon icon="pencil-alt" className="me-2" />
              <Translate contentKey="entity.action.edit">Edit</Translate>
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default CustomerDetail;

