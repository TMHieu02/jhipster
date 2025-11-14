import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Badge, Button, Card, CardBody, Collapse, Col, Input, Row, Table } from 'reactstrap';
import { Translate, TextFormat, JhiItemCount, JhiPagination, getSortState } from 'react-jhipster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

import { APP_DATE_FORMAT } from 'app/config/constants';
import { ASC, DESC, ITEMS_PER_PAGE, SORT } from 'app/shared/util/pagination.constants';
import { overridePaginationStateWithQueryParams } from 'app/shared/util/entity-utils';
import { getEntities, searchEntities, updateEntity, deleteEntity, deleteManyEntities, getStatistics } from './category.reducer';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { ICategory } from 'app/shared/model/category.model';

interface ICategoryFilters {
  name: string;
  slug: string;
  active?: boolean;
}

export const Category = () => {
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
  const [editedCategory, setEditedCategory] = useState<ICategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchFilters, setSearchFilters] = useState<ICategoryFilters>({ name: '', slug: '', active: undefined });

  const categoryList = useAppSelector(state => state.category.entities);
  const loading = useAppSelector(state => state.category.loading);
  const totalItems = useAppSelector(state => state.category.totalItems);
  const updateSuccess = useAppSelector(state => state.category.updateSuccess);
  const statistics = useAppSelector(state => state.category.statistics);

  const getEntitiesFromProps = () => {
    const params = {
      page: pagination.activePage - 1,
      size: pagination.itemsPerPage,
      sort: `${pagination.sort},${pagination.order}`,
    };

    if (searchMode && (searchFilters.name.trim() !== '' || searchFilters.slug.trim() !== '' || searchFilters.active !== undefined)) {
      dispatch(
        searchEntities({
          ...params,
          name: searchFilters.name.trim() || undefined,
          slug: searchFilters.slug.trim() || undefined,
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
    setSearchFilters({ name: '', slug: '', active: undefined });
    setSearchMode(false);
    setPagination(prev => ({ ...prev, activePage: 1 }));
    setTimeout(() => getEntitiesFromProps(), 0);
  };

  const formatIndex = (idx: number) => String((pagination.activePage - 1) * pagination.itemsPerPage + idx + 1).padStart(4, '0');

  const startEditing = (category: ICategory) => {
    setEditingId(category.id ?? null);
    setEditedCategory({ ...category });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedCategory(null);
    setIsSaving(false);
  };

  const handleFieldChange = (field: keyof ICategory, value: any) => {
    setEditedCategory(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const saveCategory = () => {
    if (!editedCategory || !editedCategory.id) {
      return;
    }

    const payload: ICategory = {
      ...editedCategory,
      active: !!editedCategory.active,
    };

    setIsSaving(true);
    dispatch(updateEntity(payload));
  };

  useEffect(() => {
    if (isSaving && updateSuccess) {
      setEditingId(null);
      setEditedCategory(null);
      setIsSaving(false);
      dispatch(getStatistics());
    }
  }, [isSaving, updateSuccess, dispatch]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(categoryList.map(category => category.id).filter(Boolean) as string[]);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]));
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning('Please select categories to delete');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} category(ies)?`)) {
      try {
        await dispatch(deleteManyEntities(selectedIds)).unwrap();
        setSelectedIds([]);
        toast.success(`${selectedIds.length} category(ies) deleted successfully`);
        getEntitiesFromProps();
        dispatch(getStatistics());
      } catch (error) {
        toast.error('Error deleting categories');
      }
    }
  };

  const getCategoryDisplayName = (category: ICategory) => (category.name ?? category.slug ?? '').trim() || 'this category';

  const handleDelete = async (category: ICategory) => {
    if (!category.id) {
      return;
    }
    const displayName = getCategoryDisplayName(category);
    if (window.confirm(`Are you sure you want to delete "${displayName}"?`)) {
      try {
        await dispatch(deleteEntity(category.id)).unwrap();
        toast.success(`Category "${displayName}" deleted successfully`);
        getEntitiesFromProps();
        dispatch(getStatistics());
      } catch (error) {
        toast.error('Error deleting category');
      }
    }
  };

  return (
    <div>
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
                  <FontAwesomeIcon icon="tags" size="2x" className="text-primary" />
                </div>
                <h3 className="text-primary mb-1 fw-bold">{statistics.totalCategories}</h3>
                <small className="text-muted fw-medium">
                  <Translate contentKey="category.statistics.total">Total Categories</Translate>
                </small>
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
                <h3 className="text-success mb-1 fw-bold">{statistics.activeCategories}</h3>
                <small className="text-muted fw-medium">
                  <Translate contentKey="category.statistics.active">Active Categories</Translate>
                </small>
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
                  <FontAwesomeIcon icon="times-circle" size="2x" className="text-danger" />
                </div>
                <h3 className="text-danger mb-1 fw-bold">{statistics.inactiveCategories}</h3>
                <small className="text-muted fw-medium">
                  <Translate contentKey="category.statistics.inactive">Inactive Categories</Translate>
                </small>
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
                  <FontAwesomeIcon icon="image" size="2x" className="text-info" />
                </div>
                <h3 className="text-info mb-1 fw-bold">{statistics.categoriesWithImage}</h3>
                <small className="text-muted fw-medium">
                  <Translate contentKey="category.statistics.withImage">With Image</Translate>
                </small>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '12px' }}>
        <CardBody className="p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h2 id="category-heading" data-cy="CategoryHeading" className="mb-0">
              <FontAwesomeIcon icon="tags" className="me-2 text-primary" />
              <Translate contentKey="category.home.title">Categories</Translate>
            </h2>
            <div className="d-flex justify-content-end gap-2 flex-wrap">
              <Button color="info" onClick={handleSyncList} disabled={loading}>
                <FontAwesomeIcon icon="sync" spin={loading} /> <Translate contentKey="category.home.refreshListLabel">Refresh</Translate>
              </Button>
              <Button color="secondary" onClick={() => setShowFilters(!showFilters)}>
                <FontAwesomeIcon icon="filter" /> <Translate contentKey="category.home.filters">Filters</Translate>
              </Button>
              {selectedIds.length > 0 && (
                <Button color="danger" onClick={() => void handleBulkDelete()} disabled={loading}>
                  <FontAwesomeIcon icon="trash" /> <Translate contentKey="category.home.bulkDelete">Delete</Translate> ({selectedIds.length}
                  )
                </Button>
              )}
              <Link to="/category/new" className="btn btn-primary jh-create-entity" data-cy="entityCreateButton">
                <FontAwesomeIcon icon="plus" /> <Translate contentKey="category.home.createLabel">Create new Category</Translate>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>

      <Collapse isOpen={showFilters}>
        <Card className="mb-3 shadow-sm border-0" style={{ borderRadius: '12px' }}>
          <CardBody className="p-4">
            <Row className="gy-2">
              <Col md="4">
                <label htmlFor="searchName" className="form-label">
                  <Translate contentKey="category.name">Name</Translate>
                </label>
                <Input
                  id="searchName"
                  type="text"
                  value={searchFilters.name}
                  onChange={e => setSearchFilters(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Search by name..."
                />
              </Col>
              <Col md="4">
                <label htmlFor="searchSlug" className="form-label">
                  <Translate contentKey="category.slug">Slug</Translate>
                </label>
                <Input
                  id="searchSlug"
                  type="text"
                  value={searchFilters.slug}
                  onChange={e => setSearchFilters(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="Search by slug..."
                />
              </Col>
              <Col md="4">
                <label htmlFor="searchActive" className="form-label">
                  <Translate contentKey="category.active">Status</Translate>
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
                    <Translate contentKey="category.active.true">Active</Translate>
                  </option>
                  <option value="false">
                    <Translate contentKey="category.active.false">Inactive</Translate>
                  </option>
                </Input>
              </Col>
            </Row>
            <div className="d-flex gap-2 mt-3">
              <Button color="primary" onClick={handleSearch} disabled={loading}>
                <FontAwesomeIcon icon="search" /> <Translate contentKey="category.home.search">Search</Translate>
              </Button>
              <Button color="secondary" onClick={handleClearFilters}>
                <FontAwesomeIcon icon="times" /> <Translate contentKey="category.home.clearFilters">Clear</Translate>
              </Button>
            </div>
          </CardBody>
        </Card>
      </Collapse>

      <Card className="shadow-sm border-0" style={{ borderRadius: '12px' }}>
        <CardBody className="p-0">
          <div className="table-responsive">
            {categoryList && categoryList.length > 0 ? (
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>
                      <Input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedIds.length === categoryList.length && categoryList.length > 0}
                      />
                    </th>
                    <th className="text-center" style={{ width: '80px' }}>
                      STT
                    </th>
                    <th className="hand" onClick={sort('name')}>
                      <Translate contentKey="category.name">Name</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th className="hand" onClick={sort('slug')}>
                      <Translate contentKey="category.slug">Slug</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th>
                      <Translate contentKey="category.description">Description</Translate>
                    </th>
                    <th className="hand" onClick={sort('active')}>
                      <Translate contentKey="category.active">Active</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th className="hand" onClick={sort('createdDate')}>
                      <Translate contentKey="category.createdDate">Created Date</Translate> <FontAwesomeIcon icon="sort" />
                    </th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {categoryList.map((category, i) => {
                    const isEditing = editingId === category.id;
                    return (
                      <tr key={`entity-${i}`} data-cy="entityTable">
                        <td>
                          <Input
                            type="checkbox"
                            checked={selectedIds.includes(category.id as string)}
                            onChange={() => handleSelectOne(category.id as string)}
                            disabled={isEditing}
                          />
                        </td>
                        <td className="text-center">{formatIndex(i)}</td>
                        <td>
                          {isEditing ? (
                            <Input
                              type="text"
                              value={editedCategory?.name ?? ''}
                              onChange={e => handleFieldChange('name', e.target.value)}
                              bsSize="sm"
                            />
                          ) : (
                            <Button tag={Link} to={`/category/${category.id}`} color="link" size="sm">
                              {category.name}
                            </Button>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <Input
                              type="text"
                              value={editedCategory?.slug ?? ''}
                              onChange={e => handleFieldChange('slug', e.target.value)}
                              bsSize="sm"
                            />
                          ) : (
                            category.slug
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <Input
                              type="textarea"
                              rows={2}
                              value={editedCategory?.description ?? ''}
                              onChange={e => handleFieldChange('description', e.target.value)}
                              bsSize="sm"
                            />
                          ) : (
                            category.description
                          )}
                        </td>
                        <td className="text-center">
                          {isEditing ? (
                            <Input
                              type="checkbox"
                              checked={editedCategory?.active ?? false}
                              onChange={e => handleFieldChange('active', e.target.checked)}
                            />
                          ) : category.active ? (
                            <Badge color="success">
                              <Translate contentKey="category.active.true">Active</Translate>
                            </Badge>
                          ) : (
                            <Badge color="danger">
                              <Translate contentKey="category.active.false">Inactive</Translate>
                            </Badge>
                          )}
                        </td>
                        <td>
                          {category.createdDate ? <TextFormat type="date" value={category.createdDate} format={APP_DATE_FORMAT} /> : null}
                        </td>
                        <td className="text-end">
                          <div className="btn-group flex-btn-group-container">
                            {isEditing ? (
                              <>
                                <Button color="success" size="sm" onClick={saveCategory} disabled={loading}>
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
                                <Button tag={Link} to={`/category/${category.id}`} color="info" size="sm" data-cy="entityDetailsButton">
                                  <FontAwesomeIcon icon="eye" /> <span className="d-none d-md-inline">View</span>
                                </Button>
                                <Button
                                  color="primary"
                                  size="sm"
                                  className="ms-2"
                                  data-cy="entityInlineEditButton"
                                  onClick={() => startEditing(category)}
                                >
                                  <FontAwesomeIcon icon="pencil-alt" /> <span className="d-none d-md-inline">Edit</span>
                                </Button>
                                <Button
                                  color="danger"
                                  size="sm"
                                  className="ms-2"
                                  data-cy="entityDeleteButton"
                                  onClick={() => void handleDelete(category)}
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
                  <Translate contentKey="category.home.notFound">No Categories found</Translate>
                </div>
              )
            )}
          </div>
        </CardBody>
      </Card>

      {totalItems ? (
        <div className={categoryList && categoryList.length > 0 ? '' : 'd-none'}>
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

export default Category;
