import React, { ReactNode, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Button, Card, CardBody, CardHeader, CardSubtitle, CardTitle, Col, Row } from 'reactstrap';
import { Translate, TextFormat } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntity } from './order.reducer';
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

export const OrderDetail = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<'id'>();

  useEffect(() => {
    dispatch(getEntity(id));
  }, [dispatch, id]);

  const orderEntity = useAppSelector(state => state.order.entity);
  const subtitleValue = orderEntity.customerName || orderEntity.status || orderEntity.paymentMethod || '';

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'warning';
      case 'PROCESSING':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="detail-container">
      <Card className="detail-card shadow-sm">
        <CardHeader className="detail-card__header">
          <div>
            <CardTitle tag="h2" className="mb-1" data-cy="orderDetailsHeading">
              <Translate contentKey="order.detail.title">Order</Translate>
            </CardTitle>
            {subtitleValue && <CardSubtitle className="text-muted small">{subtitleValue}</CardSubtitle>}
          </div>
          <Badge color={getStatusBadgeColor(orderEntity.status)} pill className="text-uppercase">
            {orderEntity.status || <Translate contentKey="order.status.unknown">Unknown</Translate>}
          </Badge>
        </CardHeader>
        <CardBody>
          <Row className="g-4">
            <Col lg="6">
              <div className="detail-section">
                <h5 className="detail-section-title">
                  <Translate contentKey="order.detail.section.summary">Summary</Translate>
                </h5>
                <DetailField label={<Translate contentKey="order.customer">Customer</Translate>}>
                  {orderEntity.customerId ? (
                    <Link to={`/customer/${orderEntity.customerId}`} className="link-underline link-underline-opacity-0">
                      {orderEntity.customerName || <Translate contentKey="order.actions.viewCustomer">View Customer</Translate>}
                    </Link>
                  ) : undefined}
                </DetailField>
                <DetailField label={<Translate contentKey="order.orderDate">Order Date</Translate>}>
                  {orderEntity.orderDate ? <TextFormat value={orderEntity.orderDate} type="date" format={APP_DATE_FORMAT} /> : undefined}
                </DetailField>
                <DetailField label={<Translate contentKey="order.totalAmount">Total Amount</Translate>}>
                  {orderEntity.totalAmount !== null && orderEntity.totalAmount !== undefined
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(orderEntity.totalAmount)
                    : undefined}
                </DetailField>
              </div>
            </Col>
            <Col lg="6">
              <div className="detail-section">
                <h5 className="detail-section-title">
                  <Translate contentKey="order.detail.section.fulfillment">Fulfillment</Translate>
                </h5>
                <DetailField label={<Translate contentKey="order.shippingAddress">Shipping Address</Translate>} value={orderEntity.shippingAddress} />
                <DetailField label={<Translate contentKey="order.paymentMethod">Payment Method</Translate>} value={orderEntity.paymentMethod} />
                <DetailField label={<Translate contentKey="order.notes">Notes</Translate>}>
                  {orderEntity.notes ? <p className="mb-0">{orderEntity.notes}</p> : undefined}
                </DetailField>
              </div>
              <div className="detail-section">
                <h5 className="detail-section-title">
                  <Translate contentKey="order.detail.section.metadata">Metadata</Translate>
                </h5>
                <DetailField label={<Translate contentKey="order.createdBy">Created By</Translate>} value={orderEntity.createdBy} />
                <DetailField label={<Translate contentKey="order.createdDate">Created Date</Translate>}>
                  {orderEntity.createdDate ? <TextFormat value={orderEntity.createdDate} type="date" format={APP_DATE_FORMAT} /> : undefined}
                </DetailField>
              </div>
            </Col>
          </Row>
          <div className="detail-footer-actions mt-4">
            <Button tag={Link} to="/order" replace color="light" className="detail-action-button" data-cy="entityDetailsBackButton">
              <FontAwesomeIcon icon="arrow-left" className="me-2" />
              <Translate contentKey="entity.action.back">Back</Translate>
            </Button>
            <Button tag={Link} to={`/order/${orderEntity.id}/edit`} replace color="primary" className="detail-action-button">
              <FontAwesomeIcon icon="pencil-alt" className="me-2" />
              <Translate contentKey="entity.action.edit">Edit</Translate>
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default OrderDetail;

