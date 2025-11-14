import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Table,
  Badge,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  Form,
  FormGroup,
  Label,
  Collapse,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { Translate, TextFormat, JhiPagination, JhiItemCount, getSortState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import {
  getEntities,
  searchEntities,
  exportEntities,
  deleteManyEntities,
  deleteEntity,
  getStatistics,
  updateEntity,
  ISearchParams,
  ProductState,
  ExportFormat,
} from './product.reducer';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { getEntities as getCategories } from '../category/category.reducer';
import { IProduct } from 'app/shared/model/product.model';

export const Product = () => {
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
  const [editedProduct, setEditedProduct] = useState<IProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchFilters, setSearchFilters] = useState<ISearchParams>({
    name: '',
    categoryId: '',
    active: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  });

  const productList = useAppSelector(state => state.product.entities);
  const loading = useAppSelector(state => state.product.loading);
  const totalItems = useAppSelector(state => state.product.totalItems);
  const statistics = useAppSelector(state => (state.product as ProductState).statistics);
  const categories = useAppSelector(state => state.category.entities);
  const updateSuccess = useAppSelector(state => state.product.updateSuccess);

  // Load categories and statistics on mount
  useEffect(() => {
    dispatch(getCategories({ page: 0, size: 1000, sort: 'name,asc' }));
    dispatch(getStatistics());
  }, []);

  useEffect(() => {
    if (isSaving && updateSuccess) {
      setEditingId(null);
      setEditedProduct(null);
      setIsSaving(false);
    }
  }, [isSaving, updateSuccess]);

  const getEntitiesFromProps = () => {
    if (
      searchMode &&
      (searchFilters.name ||
        searchFilters.categoryId ||
        searchFilters.active !== undefined ||
        searchFilters.minPrice ||
        searchFilters.maxPrice)
    ) {
      dispatch(
        searchEntities({
          ...searchFilters,
          page: pagination.activePage - 1,
          size: pagination.itemsPerPage,
          sort: `${pagination.sort},${pagination.order}`,
        })
      );
    } else {
      dispatch(
        getEntities({
          page: pagination.activePage - 1,
          size: pagination.itemsPerPage,
          sort: `${pagination.sort},${pagination.order}`,
        })
      );
    }
    const endURL = `?page=${pagination.activePage}&sort=${pagination.sort},${pagination.order}`;
    if (location.search !== endURL) {
      navigate(`${location.pathname}${endURL}`);
    }
  };

  useEffect(() => {
    getEntitiesFromProps();
  }, [pagination.activePage, pagination.order, pagination.sort, searchMode]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = params.get('page');
    const sortParam = params.get(SORT);
    if (page && sortParam) {
      const sortSplit = sortParam.split(',');
      setPagination({
        ...pagination,
        activePage: +page,
        sort: sortSplit[0],
        order: sortSplit[1],
      });
    }
  }, [location.search]);

  const sort = p => () =>
    setPagination({
      ...pagination,
      order: pagination.order === ASC ? DESC : ASC,
      sort: p,
    });

  const handlePagination = currentPage =>
    setPagination({
      ...pagination,
      activePage: currentPage,
    });

  const handleSyncList = () => {
    getEntitiesFromProps();
  };

  const handleSearch = () => {
    setPagination({ ...pagination, activePage: 1 });
    setSearchMode(true);
    getEntitiesFromProps();
  };

  const handleClearFilters = () => {
    setSearchFilters({
      name: '',
      categoryId: '',
      active: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
    setSearchMode(false);
    setPagination({ ...pagination, activePage: 1 });
    setTimeout(() => getEntitiesFromProps(), 100);
  };

  const handleExport = async (format: ExportFormat): Promise<void> => {
    try {
      const action = await dispatch(exportEntities(format));
      if (!exportEntities.fulfilled.match(action)) {
        throw action;
      }

      const blob = action.payload instanceof Blob ? action.payload : new Blob([action.payload]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Products exported as ${format.toUpperCase()} successfully`);
    } catch (error) {
      toast.error('Error exporting products');
    }
  };

  const handleBulkDelete = async (): Promise<void> => {
    if (selectedIds.length === 0) {
      toast.warning('Please select products to delete');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} product(s)?`)) {
      try {
        await dispatch(deleteManyEntities(selectedIds)).unwrap();
        setSelectedIds([]);
        toast.success(`${selectedIds.length} product(s) deleted successfully`);
        getEntitiesFromProps();
        dispatch(getStatistics());
      } catch (error) {
        toast.error('Error deleting products');
      }
    }
  };

  const getProductDisplayName = (product: IProduct) => (product.name ?? product.categoryName ?? '').trim() || 'this product';

  const handleDelete = async (product: IProduct): Promise<void> => {
    if (!product.id) {
      return;
    }
    const displayName = getProductDisplayName(product);
    if (window.confirm(`Are you sure you want to delete "${displayName}"?`)) {
      try {
        await dispatch(deleteEntity(product.id)).unwrap();
        toast.success(`Product "${displayName}" deleted successfully`);
        getEntitiesFromProps();
        dispatch(getStatistics());
      } catch (error) {
        toast.error('Error deleting product');
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(productList.map(p => p.id).filter(Boolean) as string[]);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const formatIndex = (idx: number) => String((pagination.activePage - 1) * pagination.itemsPerPage + idx + 1).padStart(4, '0');

  const startEditing = (product: IProduct) => {
    setEditingId(product.id ?? null);
    setEditedProduct({ ...product });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedProduct(null);
    setIsSaving(false);
  };

  const handleProductFieldChange = (field: keyof IProduct, value: any) => {
    setEditedProduct(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const saveProduct = () => {
    if (!editedProduct || !editedProduct.id) {
      return;
    }

    const payload: IProduct = {
      ...editedProduct,
      price: editedProduct.price !== undefined && editedProduct.price !== null ? Number(editedProduct.price) : undefined,
      stockQuantity:
        editedProduct.stockQuantity !== undefined && editedProduct.stockQuantity !== null ? Number(editedProduct.stockQuantity) : undefined,
      active: !!editedProduct.active,
      categoryId: editedProduct.categoryId === '' ? undefined : editedProduct.categoryId,
    };

    setIsSaving(true);
    dispatch(updateEntity(payload));
  };

  return (
    <div>
      {/* Statistics Cards */}
      {statistics && (
        <Row className="mb-4 g-3">
          <Col md="3">
            <Card
              className="text-center shadow-sm border-0"
              style={{ borderRadius: '12px', transition: 'transform 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-5px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <CardBody className="p-4">
                <div className="mb-2">
                  <FontAwesomeIcon icon="box" size="2x" className="text-primary" />
                </div>
                <h3 className="text-primary mb-1 fw-bold">{statistics.totalProducts}</h3>
                <small className="text-muted fw-medium">Total Products</small>
              </CardBody>
            </Card>
          </Col>
          <Col md="3">
            <Card
              className="text-center shadow-sm border-0"
              style={{ borderRadius: '12px', transition: 'transform 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-5px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <CardBody className="p-4">
                <div className="mb-2">
                  <FontAwesomeIcon icon="check-circle" size="2x" className="text-success" />
                </div>
                <h3 className="text-success mb-1 fw-bold">{statistics.activeProducts}</h3>
                <small className="text-muted fw-medium">Active Products</small>
              </CardBody>
            </Card>
          </Col>
          <Col md="3">
            <Card
              className="text-center shadow-sm border-0"
              style={{ borderRadius: '12px', transition: 'transform 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-5px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <CardBody className="p-4">
                <div className="mb-2">
                  <FontAwesomeIcon icon="dollar-sign" size="2x" className="text-info" />
                </div>
                <h3 className="text-info mb-1 fw-bold">${statistics.averagePrice?.toFixed(2) || '0.00'}</h3>
                <small className="text-muted fw-medium">Average Price</small>
              </CardBody>
            </Card>
          </Col>
          <Col md="3">
            <Card
              className="text-center shadow-sm border-0"
              style={{ borderRadius: '12px', transition: 'transform 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-5px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <CardBody className="p-4">
                <div className="mb-2">
                  <FontAwesomeIcon
                    icon="exclamation-triangle"
                    size="2x"
                    className={statistics.lowStockCount > 0 ? 'text-warning' : 'text-success'}
                  />
                </div>
                <h3 className={statistics.lowStockCount > 0 ? 'text-warning mb-1 fw-bold' : 'text-success mb-1 fw-bold'}>
                  {statistics.lowStockCount}
                </h3>
                <small className="text-muted fw-medium">Low Stock Items</small>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
        <CardBody className="p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h2 id="product-heading" data-cy="ProductHeading" className="mb-0">
              <FontAwesomeIcon icon="box" className="me-2 text-primary" />
              <Translate contentKey="product.home.title">Products</Translate>
            </h2>
            <div className="d-flex justify-content-end gap-2 flex-wrap">
              <Button color="info" onClick={handleSyncList} disabled={loading}>
                <FontAwesomeIcon icon="sync" spin={loading} /> <Translate contentKey="product.home.refreshListLabel">Refresh</Translate>
              </Button>
              <Button color="secondary" onClick={() => setShowFilters(!showFilters)}>
                <FontAwesomeIcon icon="filter" /> <Translate contentKey="product.home.filters">Filters</Translate>
              </Button>
              <UncontrolledDropdown>
                <DropdownToggle color="success" caret disabled={loading}>
                  <FontAwesomeIcon icon="download" /> <Translate contentKey="product.home.export">Export</Translate>
                </DropdownToggle>
                <DropdownMenu end>
                  <DropdownItem onClick={() => void handleExport('txt')}>TXT</DropdownItem>
                  <DropdownItem onClick={() => void handleExport('xlsx')}>Excel (XLSX)</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              {selectedIds.length > 0 && (
                <Button color="danger" onClick={() => void handleBulkDelete()} disabled={loading}>
                  <FontAwesomeIcon icon="trash" /> Delete ({selectedIds.length})
                </Button>
              )}
              <Link to="/product-management/new" className="btn btn-primary jh-create-entity" data-cy="entityCreateButton">
                <FontAwesomeIcon icon="plus" /> <Translate contentKey="product.home.createLabel">Create new Product</Translate>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Search and Filter Form */}
      <Collapse isOpen={showFilters}>
        <Card className="mb-3 shadow-sm border-0" style={{ borderRadius: '12px' }}>
          <CardBody className="p-4">
            <Form>
              <Row>
                <Col md="3">
                  <FormGroup>
                    <Label for="searchName">
                      <Translate contentKey="product.name">Name</Translate>
                    </Label>
                    <Input
                      id="searchName"
                      type="text"
                      value={searchFilters.name || ''}
                      onChange={e => setSearchFilters({ ...searchFilters, name: e.target.value })}
                      placeholder="Search by name..."
                    />
                  </FormGroup>
                </Col>
                <Col md="3">
                  <FormGroup>
                    <Label for="searchCategory">
                      <Translate contentKey="product.category">Category</Translate>
                    </Label>
                    <Input
                      id="searchCategory"
                      type="select"
                      value={searchFilters.categoryId || ''}
                      onChange={e => setSearchFilters({ ...searchFilters, categoryId: e.target.value })}
                    >
                      <option value="">All Categories</option>
                      {categories
                        ?.filter(cat => cat.active !== false)
                        .map(category => (
                          <option value={category.id} key={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="2">
                  <FormGroup>
                    <Label for="searchActive">
                      <Translate contentKey="product.active">Status</Translate>
                    </Label>
                    <Input
                      id="searchActive"
                      type="select"
                      value={searchFilters.active === undefined ? '' : searchFilters.active.toString()}
                      onChange={e =>
                        setSearchFilters({
                          ...searchFilters,
                          active: e.target.value === '' ? undefined : e.target.value === 'true',
                        })
                      }
                    >
                      <option value="">All</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="2">
                  <FormGroup>
                    <Label for="minPrice">Min Price</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      value={searchFilters.minPrice || ''}
                      onChange={e =>
                        setSearchFilters({ ...searchFilters, minPrice: e.target.value ? parseFloat(e.target.value) : undefined })
                      }
                      placeholder="Min"
                    />
                  </FormGroup>
                </Col>
                <Col md="2">
                  <FormGroup>
                    <Label for="maxPrice">Max Price</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={searchFilters.maxPrice || ''}
                      onChange={e =>
                        setSearchFilters({ ...searchFilters, maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })
                      }
                      placeholder="Max"
                    />
                  </FormGroup>
                </Col>
              </Row>
              <div className="d-flex gap-2">
                <Button color="primary" onClick={handleSearch} disabled={loading}>
                  <FontAwesomeIcon icon="search" /> <Translate contentKey="product.home.search">Search</Translate>
                </Button>
                <Button color="secondary" onClick={handleClearFilters}>
                  <FontAwesomeIcon icon="times" /> <Translate contentKey="product.home.clearFilters">Clear</Translate>
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Collapse>

      <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
        <CardBody className="p-0">
          <div className="table-responsive">
            {productList && productList.length > 0 ? (
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>
                      <Input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedIds.length === productList.length && productList.length > 0}
                      />
                    </th>
                    <th className="text-center" style={{ width: '80px' }}>
                      STT
                    </th>
                    <th className="hand" onClick={sort('name')}>
                      <Translate contentKey="product.name">Name</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th className="hand" onClick={sort('description')}>
                      <Translate contentKey="product.description">Description</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th className="hand" onClick={sort('price')}>
                      <Translate contentKey="product.price">Price</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th className="hand" onClick={sort('stockQuantity')}>
                      <Translate contentKey="product.stockQuantity">Stock Quantity</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th className="hand" onClick={sort('categoryId')}>
                      <Translate contentKey="product.category">Category</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th className="hand" onClick={sort('active')}>
                      <Translate contentKey="product.active">Active</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th className="hand" onClick={sort('createdDate')}>
                      <Translate contentKey="product.createdDate">Created Date</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {productList.map((product, i) => {
                    const isEditing = editingId === product.id;
                    return (
                      <tr key={`entity-${i}`} data-cy="entityTable">
                        <td>
                          <Input
                            type="checkbox"
                            checked={selectedIds.includes(product.id as string)}
                            onChange={() => handleSelectOne(product.id as string)}
                            disabled={isEditing}
                          />
                        </td>
                        <td className="text-center">{formatIndex(i)}</td>
                        <td>
                          {isEditing ? (
                            <Input
                              type="text"
                              value={editedProduct?.name ?? ''}
                              onChange={e => handleProductFieldChange('name', e.target.value)}
                              bsSize="sm"
                            />
                          ) : (
                            product.name
                          )}
                        </td>
                        <td className="w-25">
                          {isEditing ? (
                            <Input
                              type="textarea"
                              value={editedProduct?.description ?? ''}
                              onChange={e => handleProductFieldChange('description', e.target.value)}
                              bsSize="sm"
                              rows={2}
                            />
                          ) : (
                            product.description
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <Input
                              type="number"
                              step="0.01"
                              value={editedProduct?.price ?? ''}
                              onChange={e => handleProductFieldChange('price', e.target.value === '' ? undefined : Number(e.target.value))}
                              bsSize="sm"
                            />
                          ) : product.price !== undefined && product.price !== null ? (
                            `$${product.price.toFixed(2)}`
                          ) : null}
                        </td>
                        <td>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editedProduct?.stockQuantity ?? ''}
                              onChange={e =>
                                handleProductFieldChange('stockQuantity', e.target.value === '' ? undefined : Number(e.target.value))
                              }
                              bsSize="sm"
                            />
                          ) : (
                            <Badge color={product.stockQuantity && product.stockQuantity < 10 ? 'warning' : 'success'}>
                              {product.stockQuantity}
                            </Badge>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <Input
                              type="select"
                              value={editedProduct?.categoryId ?? ''}
                              onChange={e => handleProductFieldChange('categoryId', e.target.value)}
                              bsSize="sm"
                            >
                              <option value="">-- Select --</option>
                              {categories
                                ?.filter(cat => cat.active !== false)
                                .map(category => (
                                  <option value={category.id} key={category.id}>
                                    {category.name}
                                  </option>
                                ))}
                            </Input>
                          ) : product.categoryName ? (
                            product.categoryName
                          ) : product.categoryId ? (
                            <Button tag={Link} to={`/category/${product.categoryId}`} color="link" size="sm">
                              <Translate contentKey="product.actions.viewCategory">View Category</Translate>
                            </Button>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <Input
                              type="checkbox"
                              checked={editedProduct?.active ?? false}
                              onChange={e => handleProductFieldChange('active', e.target.checked)}
                            />
                          ) : product.active ? (
                            <Badge color="success">
                              <Translate contentKey="product.active.true">Active</Translate>
                            </Badge>
                          ) : (
                            <Badge color="danger">
                              <Translate contentKey="product.active.false">Inactive</Translate>
                            </Badge>
                          )}
                        </td>
                        <td>
                          {product.createdDate ? <TextFormat type="date" value={product.createdDate} format={APP_DATE_FORMAT} /> : null}
                        </td>
                        <td className="text-end">
                          <div className="btn-group flex-btn-group-container">
                            {isEditing ? (
                              <>
                                <Button color="success" size="sm" onClick={saveProduct} disabled={loading}>
                                  <FontAwesomeIcon icon="save" />
                                  <span className="d-none d-md-inline">
                                    {' '}
                                    <Translate contentKey="entity.action.save">Save</Translate>
                                  </span>
                                </Button>
                                <Button color="secondary" size="sm" onClick={cancelEditing} className="ms-2">
                                  <FontAwesomeIcon icon="times" />
                                  <span className="d-none d-md-inline">
                                    {' '}
                                    <Translate contentKey="entity.action.cancel">Cancel</Translate>
                                  </span>
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  tag={Link}
                                  to={`/product-management/${product.id}`}
                                  color="info"
                                  size="sm"
                                  data-cy="entityDetailsButton"
                                >
                                  <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                                </Button>
                                <Button
                                  color="primary"
                                  size="sm"
                                  className="ms-2"
                                  data-cy="entityInlineEditButton"
                                  onClick={() => startEditing(product)}
                                >
                                  <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                                </Button>
                                <Button
                                  color="danger"
                                  size="sm"
                                  className="ms-2"
                                  data-cy="entityDeleteButton"
                                  onClick={() => void handleDelete(product)}
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
                <div className="alert alert-warning m-4">
                  <Translate contentKey="product.home.notFound">No Products found</Translate>
                </div>
              )
            )}
          </div>
        </CardBody>
      </Card>
      {totalItems ? (
        <div className={productList && productList.length > 0 ? '' : 'd-none'}>
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

export default Product;
