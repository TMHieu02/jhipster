import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Badge, Button, Card, CardBody, Collapse, Col, Input, Row, Table } from 'reactstrap';
import { Translate, JhiItemCount, JhiPagination, getSortState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import {
  getEntities,
  searchEntities,
  updateEntity,
  deleteEntity,
  deleteManyEntities,
  getStatistics,
} from './customer.reducer';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { ICustomer } from 'app/shared/model/customer.model';

interface ICustomerFilters {
  name: string;
  email: string;
  city: string;
  country: string;
  active?: boolean;
}

export const Customer = () => {
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
  const [editedCustomer, setEditedCustomer] = useState<ICustomer | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchFilters, setSearchFilters] = useState<ICustomerFilters>({ name: '', email: '', city: '', country: '', active: undefined });

  const customerList = useAppSelector(state => state.customer.entities);
  const loading = useAppSelector(state => state.customer.loading);
  const totalItems = useAppSelector(state => state.customer.totalItems);
  const updateSuccess = useAppSelector(state => state.customer.updateSuccess);
  const statistics = useAppSelector(state => state.customer.statistics);

  const getEntitiesFromProps = () => {
    const params = {
      page: pagination.activePage - 1,
      size: pagination.itemsPerPage,
      sort: `${pagination.sort},${pagination.order}`,
    };

    if (
      searchMode &&
      (searchFilters.name.trim() !== '' ||
        searchFilters.email.trim() !== '' ||
        searchFilters.city.trim() !== '' ||
        searchFilters.country.trim() !== '' ||
        searchFilters.active !== undefined)
    ) {
      dispatch(
        searchEntities({
          ...params,
          name: searchFilters.name.trim() || undefined,
          email: searchFilters.email.trim() || undefined,
          city: searchFilters.city.trim() || undefined,
          country: searchFilters.country.trim() || undefined,
          active: searchFilters.active,
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
    setSearchFilters({ name: '', email: '', city: '', country: '', active: undefined });
    setSearchMode(false);
    setPagination(prev => ({ ...prev, activePage: 1 }));
    setTimeout(() => getEntitiesFromProps(), 0);
  };

  const formatIndex = (idx: number) => String(((pagination.activePage - 1) * pagination.itemsPerPage) + idx + 1).padStart(4, '0');

  const startEditing = (customer: ICustomer) => {
    setEditingId(customer.id ?? null);
    setEditedCustomer({ ...customer });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedCustomer(null);
    setIsSaving(false);
  };

  const handleFieldChange = (field: keyof ICustomer, value: any) => {
    setEditedCustomer(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const saveCustomer = () => {
    if (!editedCustomer || !editedCustomer.id) {
      return;
    }
    const payload: ICustomer = {
      ...editedCustomer,
      active: !!editedCustomer.active,
    };
    setIsSaving(true);
    dispatch(updateEntity(payload));
  };

  useEffect(() => {
    if (isSaving && updateSuccess) {
      setEditingId(null);
      setEditedCustomer(null);
      setIsSaving(false);
      dispatch(getStatistics());
    }
  }, [isSaving, updateSuccess, dispatch]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(customerList.map(customer => customer.id).filter(Boolean) as string[]);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning('Please select customers to delete');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} customer(s)?`)) {
      try {
        await dispatch(deleteManyEntities(selectedIds)).unwrap();
        setSelectedIds([]);
        toast.success(`${selectedIds.length} customer(s) deleted successfully`);
        getEntitiesFromProps();
        dispatch(getStatistics());
      } catch (error) {
        toast.error('Error deleting customers');
      }
    }
  };

  const getCustomerDisplayName = (customer: ICustomer) =>
    [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim() || customer.email || 'this customer';

  const handleDelete = async (customer: ICustomer) => {
    if (!customer.id) {
      return;
    }
    const displayName = getCustomerDisplayName(customer);
    if (window.confirm(`Are you sure you want to delete "${displayName}"?`)) {
      try {
        await dispatch(deleteEntity(customer.id)).unwrap();
        toast.success(`Customer "${displayName}" deleted successfully`);
        getEntitiesFromProps();
        dispatch(getStatistics());
      } catch (error) {
        toast.error('Error deleting customer');
      }
    }
  };

  return (
    <div>
      {statistics && (
        <Row className="mb-4">
          <Col md="3">
            <Card className="text-center shadow-sm">
              <CardBody>
                <h5 className="text-primary">{statistics.totalCustomers}</h5>
                <small className="text-muted">
                  <Translate contentKey="customer.statistics.total">Total Customers</Translate>
                </small>
              </CardBody>
            </Card>
          </Col>
          <Col md="3">
            <Card className="text-center shadow-sm">
              <CardBody>
                <h5 className="text-success">{statistics.activeCustomers}</h5>
                <small className="text-muted">
                  <Translate contentKey="customer.statistics.active">Active Customers</Translate>
                </small>
              </CardBody>
            </Card>
          </Col>
          <Col md="3">
            <Card className="text-center shadow-sm">
              <CardBody>
                <h5 className="text-danger">{statistics.inactiveCustomers}</h5>
                <small className="text-muted">
                  <Translate contentKey="customer.statistics.inactive">Inactive Customers</Translate>
                </small>
              </CardBody>
            </Card>
          </Col>
          <Col md="3">
            <Card className="text-center shadow-sm">
              <CardBody>
                <h5 className="text-info">{statistics.uniqueCities}</h5>
                <small className="text-muted">
                  <Translate contentKey="customer.statistics.uniqueCities">Unique Cities</Translate>
                </small>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      <h2 id="customer-heading" data-cy="CustomerHeading">
        <Translate contentKey="customer.home.title">Customers</Translate>
        <div className="d-flex justify-content-end gap-2 flex-wrap">
          <Button color="info" onClick={handleSyncList} disabled={loading}>
            <FontAwesomeIcon icon="sync" spin={loading} /> <Translate contentKey="customer.home.refreshListLabel">Refresh List</Translate>
          </Button>
          <Button color="secondary" onClick={() => setShowFilters(!showFilters)}>
            <FontAwesomeIcon icon="filter" /> <Translate contentKey="customer.home.filters">Filters</Translate>
          </Button>
          {selectedIds.length > 0 && (
            <Button color="danger" onClick={() => void handleBulkDelete()} disabled={loading}>
              <FontAwesomeIcon icon="trash" /> <Translate contentKey="customer.home.bulkDelete">Delete</Translate> ({selectedIds.length})
            </Button>
          )}
          <Link to="/customer/new" className="btn btn-primary jh-create-entity" data-cy="entityCreateButton">
            <FontAwesomeIcon icon="plus" /> <Translate contentKey="customer.home.createLabel">Create new Customer</Translate>
          </Link>
        </div>
      </h2>

      <Collapse isOpen={showFilters}>
        <Card className="mb-3">
          <CardBody>
            <Row className="gy-2">
              <Col md="3">
                <label htmlFor="searchName" className="form-label">
                  <Translate contentKey="customer.filters.name">Name</Translate>
                </label>
                <Input
                  id="searchName"
                  type="text"
                  value={searchFilters.name}
                  onChange={e => setSearchFilters(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Search by name..."
                />
              </Col>
              <Col md="3">
                <label htmlFor="searchEmail" className="form-label">
                  <Translate contentKey="customer.filters.email">Email</Translate>
                </label>
                <Input
                  id="searchEmail"
                  type="text"
                  value={searchFilters.email}
                  onChange={e => setSearchFilters(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Search by email..."
                />
              </Col>
              <Col md="3">
                <label htmlFor="searchCity" className="form-label">
                  <Translate contentKey="customer.city">City</Translate>
                </label>
                <Input
                  id="searchCity"
                  type="text"
                  value={searchFilters.city}
                  onChange={e => setSearchFilters(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Search by city..."
                />
              </Col>
              <Col md="3">
                <label htmlFor="searchCountry" className="form-label">
                  <Translate contentKey="customer.country">Country</Translate>
                </label>
                <Input
                  id="searchCountry"
                  type="text"
                  value={searchFilters.country}
                  onChange={e => setSearchFilters(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Search by country..."
                />
              </Col>
              <Col md="3">
                <label htmlFor="searchActive" className="form-label">
                  <Translate contentKey="customer.active">Status</Translate>
                </label>
                <Input
                  id="searchActive"
                  type="select"
                  value={searchFilters.active === undefined ? '' : searchFilters.active.toString()}
                  onChange={e =>
                    setSearchFilters(prev => ({
                      ...prev,
                      active: e.target.value === '' ? undefined : e.target.value === 'true',
                    }))
                  }
                >
                  <option value="">All</option>
                  <option value="true">
                    <Translate contentKey="customer.active.true">Active</Translate>
                  </option>
                  <option value="false">
                    <Translate contentKey="customer.active.false">Inactive</Translate>
                  </option>
                </Input>
              </Col>
            </Row>
            <div className="d-flex gap-2 mt-3">
              <Button color="primary" onClick={handleSearch} disabled={loading}>
                <FontAwesomeIcon icon="search" /> <Translate contentKey="customer.home.search">Search</Translate>
              </Button>
              <Button color="secondary" onClick={handleClearFilters}>
                <FontAwesomeIcon icon="times" /> <Translate contentKey="customer.home.clearFilters">Clear</Translate>
              </Button>
            </div>
          </CardBody>
        </Card>
      </Collapse>

      <div className="table-responsive">
        {customerList && customerList.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>
                  <Input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === customerList.length && customerList.length > 0}
                  />
                </th>
                <th className="text-center" style={{ width: '80px' }}>
                  STT
                </th>
                <th className="hand" onClick={sort('firstName')}>
                  <Translate contentKey="customer.firstName">First Name</Translate> <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('lastName')}>
                  <Translate contentKey="customer.lastName">Last Name</Translate> <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('email')}>
                  <Translate contentKey="customer.email">Email</Translate> <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('phone')}>
                  <Translate contentKey="customer.phone">Phone</Translate> <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('city')}>
                  <Translate contentKey="customer.city">City</Translate> <FontAwesomeIcon icon="sort" />
                </th>
                <th className="hand" onClick={sort('active')}>
                  <Translate contentKey="customer.active">Active</Translate> <FontAwesomeIcon icon="sort" />
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {customerList.map((customer, i) => {
                const isEditing = editingId === customer.id;
                return (
                  <tr key={`entity-${i}`} data-cy="entityTable">
                    <td>
                      <Input
                        type="checkbox"
                        checked={selectedIds.includes(customer.id as string)}
                        onChange={() => handleSelectOne(customer.id as string)}
                        disabled={isEditing}
                      />
                    </td>
                    <td className="text-center">{formatIndex(i)}</td>
                    <td>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editedCustomer?.firstName ?? ''}
                          onChange={e => handleFieldChange('firstName', e.target.value)}
                          bsSize="sm"
                        />
                      ) : (
                        <Button tag={Link} to={`/customer/${customer.id}`} color="link" size="sm">
                          {customer.firstName}
                        </Button>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editedCustomer?.lastName ?? ''}
                          onChange={e => handleFieldChange('lastName', e.target.value)}
                          bsSize="sm"
                        />
                      ) : (
                        customer.lastName
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editedCustomer?.email ?? ''}
                          onChange={e => handleFieldChange('email', e.target.value)}
                          bsSize="sm"
                        />
                      ) : (
                        customer.email
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editedCustomer?.phone ?? ''}
                          onChange={e => handleFieldChange('phone', e.target.value)}
                          bsSize="sm"
                        />
                      ) : (
                        customer.phone
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editedCustomer?.city ?? ''}
                          onChange={e => handleFieldChange('city', e.target.value)}
                          bsSize="sm"
                        />
                      ) : (
                        customer.city
                      )}
                    </td>
                    <td className="text-center">
                      {isEditing ? (
                        <Input
                          type="checkbox"
                          checked={editedCustomer?.active ?? false}
                          onChange={e => handleFieldChange('active', e.target.checked)}
                        />
                      ) : customer.active ? (
                        <Badge color="success">
                          <Translate contentKey="customer.active.true">Active</Translate>
                        </Badge>
                      ) : (
                        <Badge color="danger">
                          <Translate contentKey="customer.active.false">Inactive</Translate>
                        </Badge>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="btn-group flex-btn-group-container">
                        {isEditing ? (
                          <>
                            <Button color="success" size="sm" onClick={saveCustomer} disabled={loading}>
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
                            <Button tag={Link} to={`/customer/${customer.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                              <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                            </Button>
                            <Button
                              color="primary"
                              size="sm"
                              className="ms-2"
                              data-cy="entityInlineEditButton"
                              onClick={() => startEditing(customer)}
                            >
                              <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                            </Button>
                            <Button
                              color="danger"
                              size="sm"
                              className="ms-2"
                              data-cy="entityDeleteButton"
                              onClick={() => void handleDelete(customer)}
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
              <Translate contentKey="customer.home.notFound">No Customers found</Translate>
            </div>
          )
        )}
      </div>

      {totalItems ? (
        <div className={customerList && customerList.length > 0 ? '' : 'd-none'}>
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

export default Customer;
