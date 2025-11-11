import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Badge, Button, Card, CardBody, Collapse, Col, Input, Row, Table } from 'reactstrap';
import { Translate, TextFormat, JhiItemCount, JhiPagination, getSortState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import {
  getEntities,
  searchEntities,
  updateEntity,
  deleteEntity,
  deleteManyEntities,
  getStatistics,
} from './order.reducer';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { IOrder } from 'app/shared/model/order.model';

type EditableOrder = Omit<IOrder, 'orderDate' | 'totalAmount'> & {
  orderDate?: string | Date | null;
  totalAmount?: number | string | null;
};

interface IOrderFilters {
  customerId: string;
  status: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  minTotal?: number;
  maxTotal?: number;
}

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'SHIPPED'];

export const Order = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [pagination, setPagination] = useState(
    overridePaginationStateWithQueryParams(getSortState(location, ITEMS_PER_PAGE, 'id'), location.search)
  );
  const [searchMode, setSearchMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedOrder, setEditedOrder] = useState<EditableOrder | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchFilters, setSearchFilters] = useState<IOrderFilters>({
    customerId: '',
    status: '',
    paymentMethod: '',
    startDate: '',
    endDate: '',
    minTotal: undefined,
    maxTotal: undefined,
  });

  const orderList = useAppSelector(state => state.order.entities);
  const loading = useAppSelector(state => state.order.loading);
  const totalItems = useAppSelector(state => state.order.totalItems);
  const updateSuccess = useAppSelector(state => state.order.updateSuccess);
  const statistics = useAppSelector(state => state.order.statistics);

  const getEntitiesFromProps = () => {
    const params = {
      page: pagination.activePage - 1,
      size: pagination.itemsPerPage,
      sort: `${pagination.sort},${pagination.order}`,
    };

    if (
      searchMode &&
      (searchFilters.customerId.trim() !== '' ||
        searchFilters.status.trim() !== '' ||
        searchFilters.paymentMethod.trim() !== '' ||
        searchFilters.startDate !== '' ||
        searchFilters.endDate !== '' ||
        searchFilters.minTotal !== undefined ||
        searchFilters.maxTotal !== undefined)
    ) {
      dispatch(
        searchEntities({
          ...params,
          customerId: searchFilters.customerId.trim() || undefined,
          status: searchFilters.status.trim() || undefined,
          paymentMethod: searchFilters.paymentMethod.trim() || undefined,
          startDate: searchFilters.startDate || undefined,
          endDate: searchFilters.endDate || undefined,
          minTotal: searchFilters.minTotal,
          maxTotal: searchFilters.maxTotal,
        })
      );
    } else {
      dispatch(getEntities(params));
    }

    const endURL = `?page=${pagination.activePage}&sort=${pagination.sort},${pagination.order}`;
    if (location.search !== endURL) {
      navigate(`${location.pathname}${endURL}`);
    }
  };

  useEffect(() => {
    dispatch(getStatistics());
  }, []);

  useEffect(() => {
    getEntitiesFromProps();
  }, [pagination.activePage, pagination.order, pagination.sort, searchMode]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = params.get('page');
    const sortParam = params.get(SORT);
    if (page && sortParam) {
      const sortSplit = sortParam.split(',');
      setPagination(prev => ({
        ...prev,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      }));
    }
  }, [location.search]);

  const sort = p => () =>
    setPagination(prev => ({
      ...prev,
      order: prev.order === ASC ? DESC : ASC,
      sort: p,
    }));

  const handlePagination = currentPage =>
    setPagination(prev => ({
      ...prev,
      activePage: currentPage,
    }));

  const handleSyncList = () => {
    getEntitiesFromProps();
    dispatch(getStatistics());
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, activePage: 1 }));
    setSearchMode(true);
    getEntitiesFromProps();
  };

  const handleClearFilters = () => {
    setSearchFilters({ customerId: '', status: '', paymentMethod: '', startDate: '', endDate: '', minTotal: undefined, maxTotal: undefined });
    setSearchMode(false);
    setPagination(prev => ({ ...prev, activePage: 1 }));
    setTimeout(() => getEntitiesFromProps(), 0);
  };

  const formatIndex = (idx: number) => String(((pagination.activePage - 1) * pagination.itemsPerPage) + idx + 1).padStart(4, '0');

  const startEditing = (order: IOrder) => {
    setEditingId(order.id ?? null);
    setEditedOrder({ ...order });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedOrder(null);
    setIsSaving(false);
  };

  const handleFieldChange = (field: keyof EditableOrder, value: any) => {
    setEditedOrder(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const formatDateForInput = (value: EditableOrder['orderDate']) => {
    if (!value) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString().split('T')[0];
  };

  const normalizeOrderDate = (value: EditableOrder['orderDate']) => {
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      if (value.includes('T')) {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
      }
      const parsed = new Date(`${value}T00:00:00.000Z`);
      return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
    }
    return null;
  };

  const saveOrder = () => {
    if (!editedOrder || !editedOrder.id) {
      return;
    }

    const payload: IOrder = {
      ...editedOrder,
      totalAmount:
        editedOrder.totalAmount !== undefined && editedOrder.totalAmount !== null && editedOrder.totalAmount !== ''
          ? Number(editedOrder.totalAmount)
          : undefined,
      orderDate: normalizeOrderDate(editedOrder.orderDate),
    };

    setIsSaving(true);
    dispatch(updateEntity(payload));
  };

  useEffect(() => {
    if (isSaving && updateSuccess) {
      setEditingId(null);
      setEditedOrder(null);
      setIsSaving(false);
      dispatch(getStatistics());
    }
  }, [isSaving, updateSuccess, dispatch]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(orderList.map(order => order.id).filter(Boolean) as string[]);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning('Please select orders to delete');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} order(s)?`)) {
      try {
        await dispatch(deleteManyEntities(selectedIds)).unwrap();
        setSelectedIds([]);
        toast.success(`${selectedIds.length} order(s) deleted successfully`);
        getEntitiesFromProps();
        dispatch(getStatistics());
      } catch (error) {
        toast.error('Error deleting orders');
      }
    }
  };

  const getOrderDisplayName = (order: IOrder) =>
    [order.customerName, order.paymentMethod, order.status].filter(Boolean).join(' • ').trim() || 'this order';

  const handleDelete = async (order: IOrder) => {
    if (!order.id) {
      return;
    }
    const displayName = getOrderDisplayName(order);
    if (window.confirm(`Are you sure you want to delete "${displayName}"?`)) {
      try {
        await dispatch(deleteEntity(order.id)).unwrap();
        toast.success(`Order "${displayName}" deleted successfully`);
        getEntitiesFromProps();
        dispatch(getStatistics());
      } catch (error) {
        toast.error('Error deleting order');
      }
    }
  };

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
    <div>
      {statistics && (
        <Row className="mb-4">
          <Col md="3">
            <Card className="text-center shadow-sm">
              <CardBody>
                <h5 className="text-primary">{statistics.totalOrders}</h5>
                <small className="text-muted">
                  <Translate contentKey="order.statistics.total">Total Orders</Translate>
                </small>
              </CardBody>
            </Card>
          </Col>
          <Col md="3">
            <Card className="text-center shadow-sm">
              <CardBody>
                <h5 className="text-success">{statistics.completedOrders}</h5>
                <small className="text-muted">
                  <Translate contentKey="order.statistics.completed">Completed Orders</Translate>
                </small>
              </CardBody>
            </Card>
          </Col>
          <Col md="3">
            <Card className="text-center shadow-sm">
              <CardBody>
                <h5 className="text-warning">{statistics.pendingOrders}</h5>
                <small className="text-muted">
                  <Translate contentKey="order.statistics.pending">Pending Orders</Translate>
                </small>
              </CardBody>
            </Card>
          </Col>
          <Col md="3">
            <Card className="text-center shadow-sm">
              <CardBody>
                <h5 className="text-info">${Number(statistics.totalRevenue || 0).toFixed(2)}</h5>
                <small className="text-muted">
                  <Translate contentKey="order.statistics.revenue">Total Revenue</Translate>
                </small>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      <h2 id="order-heading" data-cy="OrderHeading">
        <Translate contentKey="order.home.title">Orders</Translate>
        <div className="d-flex justify-content-end gap-2 flex-wrap">
          <Button color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> <Translate contentKey="order.home.refreshListLabel">Refresh List</Translate>
          </Button>
          <Button color="secondary" onClick={() => setShowFilters(!showFilters)}>
            <FontAwesomeIcon icon="filter" /> <Translate contentKey="order.home.filters">Filters</Translate>
          </Button>
          {selectedIds.length > 0 && (
            <Button color="danger" onClick={() => void handleBulkDelete()} disabled={loading}>
              <FontAwesomeIcon icon="trash" /> <Translate contentKey="order.home.bulkDelete">Delete</Translate> ({selectedIds.length})
            </Button>
          )}
          <Link to="/order/new" className="btn btn-primary jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" /> <Translate contentKey="order.home.createLabel">Create new Order</Translate>
          </Link>
        </div>
      </h2>

      <Collapse isOpen={showFilters}>
        <Card className="mb-3">
          <CardBody>
            <Row className="gy-2">
              <Col md="4">
                <label htmlFor="searchCustomer" className="form-label">
                  <Translate contentKey="order.filters.customer">Customer ID</Translate>
                </label>
                <Input
                  id="searchCustomer"
                  type="text"
                  value={searchFilters.customerId}
                  onChange={e => setSearchFilters(prev => ({ ...prev, customerId: e.target.value }))}
                  placeholder="Search by customer ID..."
                />
              </Col>
              <Col md="4">
                <label htmlFor="searchStatus" className="form-label">
                  <Translate contentKey="order.status">Status</Translate>
                </label>
                <Input
                  id="searchStatus"
                  type="select"
                  value={searchFilters.status}
                  onChange={e => setSearchFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">
                    <Translate contentKey="order.filters.status.all">All</Translate>
                  </option>
                  {ORDER_STATUSES.map(status => (
                    <option value={status} key={status}>
                      {status}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col md="4">
                <label htmlFor="searchPayment" className="form-label">
                  <Translate contentKey="order.paymentMethod">Payment Method</Translate>
                </label>
                <Input
                  id="searchPayment"
                  type="text"
                  value={searchFilters.paymentMethod}
                  onChange={e => setSearchFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  placeholder="Search by payment method..."
                />
              </Col>
              <Col md="4">
                <label htmlFor="searchStartDate" className="form-label">
                  <Translate contentKey="order.filters.startDate">Start Date</Translate>
                </label>
                <Input
                  id="searchStartDate"
                  type="date"
                  value={searchFilters.startDate}
                  onChange={e => setSearchFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </Col>
              <Col md="4">
                <label htmlFor="searchEndDate" className="form-label">
                  <Translate contentKey="order.filters.endDate">End Date</Translate>
                </label>
                <Input
                  id="searchEndDate"
                  type="date"
                  value={searchFilters.endDate}
                  onChange={e => setSearchFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </Col>
              <Col md="2">
                <label htmlFor="minTotal" className="form-label">
                  <Translate contentKey="order.filters.minTotal">Min Total</Translate>
                </label>
                <Input
                  id="minTotal"
                  type="number"
                  value={searchFilters.minTotal ?? ''}
                  onChange={e =>
                    setSearchFilters(prev => ({ ...prev, minTotal: e.target.value ? Number(e.target.value) : undefined }))
                  }
                  placeholder="Min"
                />
              </Col>
              <Col md="2">
                <label htmlFor="maxTotal" className="form-label">
                  <Translate contentKey="order.filters.maxTotal">Max Total</Translate>
                </label>
                <Input
                  id="maxTotal"
                  type="number"
                  value={searchFilters.maxTotal ?? ''}
                  onChange={e =>
                    setSearchFilters(prev => ({ ...prev, maxTotal: e.target.value ? Number(e.target.value) : undefined }))
                  }
                  placeholder="Max"
                />
              </Col>
            </Row>
            <div className="d-flex gap-2 mt-3">
              <Button color="primary" onClick={handleSearch} disabled={loading}>
                <FontAwesomeIcon icon="search" /> <Translate contentKey="order.home.search">Search</Translate>
              </Button>
              <Button color="secondary" onClick={handleClearFilters}>
                <FontAwesomeIcon icon="times" /> <Translate contentKey="order.home.clearFilters">Clear</Translate>
              </Button>
            </div>
          </CardBody>
        </Card>
      </Collapse>

      <div className="table-responsive">
        {orderList && orderList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>
                  <Input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === orderList.length && orderList.length > 0}
                  />
                </th>
                <th className="text-center" style={{ width: '80px' }}>
                  STT
                </th>
                <th className="hand" onClick={sort('customerId')}>
                  <Translate contentKey="order.customer">Customer</Translate> <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('orderDate')}>
                  <Translate contentKey="order.orderDate">Order Date</Translate> <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('totalAmount')}>
                  <Translate contentKey="order.totalAmount">Total Amount</Translate> <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('status')}>
                  <Translate contentKey="order.status">Status</Translate> <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('paymentMethod')}>
                  <Translate contentKey="order.paymentMethod">Payment Method</Translate> <FontAwesomeIcon icon="sort" />
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orderList.map((order, i) => {
                const isEditing = editingId === order.id;
                return (
                  <tr key={`entity-${i}`} data-cy="entityTable">
                    <td>
                      <Input
                        type="checkbox"
                        checked={selectedIds.includes(order.id as string)}
                        onChange={() => handleSelectOne(order.id as string)}
                        disabled={isEditing}
                      />
                    </td>
                    <td className="text-center">{formatIndex(i)}</td>
                    <td>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editedOrder?.customerId ?? ''}
                          onChange={e => handleFieldChange('customerId', e.target.value)}
                          bsSize="sm"
                        />
                      ) : order.customerName ? (
                        <Button tag={Link} to={`/customer/${order.customerId}`} color="link" size="sm">
                          {order.customerName}
                        </Button>
                      ) : order.customerId ? (
                        <Button tag={Link} to={`/customer/${order.customerId}`} color="link" size="sm">
                          <Translate contentKey="order.actions.viewCustomer">View Customer</Translate>
                        </Button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={formatDateForInput(editedOrder?.orderDate ?? null)}
                          onChange={e => handleFieldChange('orderDate', e.target.value)}
                          bsSize="sm"
                        />
                      ) : order.orderDate ? (
                        <TextFormat type="date" value={order.orderDate} format={APP_DATE_FORMAT} />
                      ) : null}
                    </td>
                    <td>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editedOrder?.totalAmount ?? ''}
                          onChange={e => handleFieldChange('totalAmount', e.target.value === '' ? undefined : Number(e.target.value))}
                          bsSize="sm"
                        />
                      ) : order.totalAmount !== undefined && order.totalAmount !== null ? (
                        `$${order.totalAmount.toFixed(2)}`
                      ) : null}
                    </td>
                    <td>
                      {isEditing ? (
                        <Input
                          type="select"
                          value={editedOrder?.status ?? ''}
                          onChange={e => handleFieldChange('status', e.target.value)}
                          bsSize="sm"
                        >
                          {ORDER_STATUSES.map(status => (
                            <option value={status} key={status}>
                              {status}
                            </option>
                          ))}
                        </Input>
                      ) : (
                        <Badge color={getStatusBadgeColor(order.status)}>{order.status}</Badge>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editedOrder?.paymentMethod ?? ''}
                          onChange={e => handleFieldChange('paymentMethod', e.target.value)}
                          bsSize="sm"
                        />
                      ) : (
                        order.paymentMethod
                      )}
                    </td>
                    <td className="text-end">
                      <div className="btn-group flex-btn-group-container">
                        {isEditing ? (
                          <>
                            <Button color="success" size="sm" onClick={saveOrder} disabled={loading}>
                              <FontAwesomeIcon icon="save" />
                              <span className="d-none d-md-inline"> <Translate contentKey="entity.action.save">Save</Translate></span>
                            </Button>
                            <Button color="secondary" size="sm" onClick={cancelEditing} className="ms-2">
                              <FontAwesomeIcon icon="times" />
                              <span className="d-none d-md-inline"> <Translate contentKey="entity.action.cancel">Cancel</Translate></span>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button tag={Link} to={`/order/${order.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                              <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                            </Button>
                            <Button
                              color="primary"
                              size="sm"
                              className="ms-2"
                              data-cy="entityInlineEditButton"
                              onClick={() => startEditing(order)}
                            >
                              <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                            </Button>
                            <Button
                              color="danger"
                              size="sm"
                              className="ms-2"
                              data-cy="entityDeleteButton"
                              onClick={() => void handleDelete(order)}
                            >
                              <FontAwesomeIcon icon="trash" /> <span className="d-none d-md-inline">Delete</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          !loading && (
            <div className="alert alert-warning">
              <Translate contentKey="order.home.notFound">No Orders found</Translate>
            </div>
          )
        )}
      </div>

      {totalItems ? (
        <div className={orderList && orderList.length > 0 ? '' : 'd-none'}>
          <div className="justify-content-center d-flex">
            <JhiItemCount page={pagination.activePage} total={totalItems} itemsPerPage={pagination.itemsPerPage} i18nEnabled />
          </div>
          <div className="justify-content-center d-flex">
            <JhiPagination
              activePage={pagination.activePage}
              onSelect={handlePagination}
              maxButtons={5}
              itemsPerPage={pagination.itemsPerPage}
              totalItems={totalItems}
            />
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default Order;
