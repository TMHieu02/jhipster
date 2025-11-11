import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { isPending, isFulfilled } from '@reduxjs/toolkit';

import { IProduct, defaultValue } from 'app/shared/model/product.model';
import { IQueryParams, createEntitySlice, EntityState, serializeAxiosError } from 'app/shared/reducers/reducer.utils';

export interface ProductState extends EntityState<IProduct> {
  statistics: Record<string, any> | null;
}

const initialState: ProductState = {
  loading: false,
  errorMessage: null,
  entities: [],
  entity: defaultValue,
  links: { next: 0 },
  updating: false,
  totalItems: 0,
  updateSuccess: false,
  statistics: null,
};

const apiUrl = 'api/products';

// Async Actions

export const getEntities = createAsyncThunk(
  'product/fetch_entity_list',
  async ({ page, size, sort }: IQueryParams) => {
    const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
    return axios.get<IProduct[]>(requestUrl);
  },
  { serializeError: serializeAxiosError }
);

export const getEntity = createAsyncThunk(
  'product/fetch_entity',
  async (id: string | number) => {
    const requestUrl = `${apiUrl}/${id}`;
    return axios.get<IProduct>(requestUrl);
  },
  { serializeError: serializeAxiosError }
);

export const createEntity = createAsyncThunk(
  'product/create_entity',
  async (entity: IProduct, thunkAPI) => {
    const result = await axios.post<IProduct>(apiUrl, entity);
    thunkAPI.dispatch(getEntities({}));
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const updateEntity = createAsyncThunk(
  'product/update_entity',
  async (entity: IProduct, thunkAPI) => {
    const result = await axios.put<IProduct>(`${apiUrl}/${entity.id}`, entity);
    thunkAPI.dispatch(getEntities({}));
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const partialUpdateEntity = createAsyncThunk(
  'product/partial_update_entity',
  async (entity: IProduct, thunkAPI) => {
    const result = await axios.patch<IProduct>(`${apiUrl}/${entity.id}`, entity);
    thunkAPI.dispatch(getEntities({}));
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const deleteEntity = createAsyncThunk(
  'product/delete_entity',
  async (id: string | number, thunkAPI) => {
    const requestUrl = `${apiUrl}/${id}`;
    const result = await axios.delete<IProduct>(requestUrl);
    thunkAPI.dispatch(getEntities({}));
    return result;
  },
  { serializeError: serializeAxiosError }
);

export interface ISearchParams {
  page?: number;
  size?: number;
  sort?: string;
  name?: string;
  categoryId?: string;
  active?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export const searchEntities = createAsyncThunk(
  'product/search_entities',
  async (params: ISearchParams) => {
    const { page, size, sort, ...filters } = params;
    const queryParams = new URLSearchParams();
    if (page !== undefined) queryParams.append('page', page.toString());
    if (size !== undefined) queryParams.append('size', size.toString());
    if (sort) queryParams.append('sort', sort);
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
    if (filters.active !== undefined) queryParams.append('active', filters.active.toString());
    if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
    
    const requestUrl = `${apiUrl}/search?${queryParams.toString()}`;
    return axios.get<IProduct[]>(requestUrl);
  },
  { serializeError: serializeAxiosError }
);

export type ExportFormat = 'txt' | 'xlsx';

export const exportEntities = createAsyncThunk(
  'product/export_entities',
  async (format: ExportFormat = 'txt') => {
    const query = `?format=${format}`;
    const requestUrl = `${apiUrl}/export${query}`;
    const response = await axios.get<Blob>(requestUrl, { responseType: 'blob' });
    return response.data;
  },
  { serializeError: serializeAxiosError }
);

export const deleteManyEntities = createAsyncThunk(
  'product/delete_many_entities',
  async (ids: string[], thunkAPI) => {
    const result = await axios.delete(`${apiUrl}/bulk`, { data: ids });
    thunkAPI.dispatch(getEntities({}));
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const getStatistics = createAsyncThunk(
  'product/get_statistics',
  async () => {
    const requestUrl = `${apiUrl}/statistics`;
    return axios.get<Record<string, any>>(requestUrl);
  },
  { serializeError: serializeAxiosError }
);

// slice

export const ProductSlice = createEntitySlice({
  name: 'product',
  initialState: initialState as EntityState<IProduct>,
  extraReducers(builder) {
    builder
      .addCase(getEntity.fulfilled, (state, action) => {
        state.loading = false;
        state.entity = action.payload.data;
      })
      .addCase(deleteEntity.fulfilled, state => {
        state.updating = false;
        state.updateSuccess = true;
        state.entity = defaultValue;
      })
      .addMatcher(isPending(getEntities, getEntity), state => {
        state.errorMessage = null;
        state.updateSuccess = false;
        state.loading = true;
      })
      .addMatcher(isFulfilled(getEntities, searchEntities), (state, action) => {
        state.loading = false;
        state.entities = action.payload.data;
        const totalCountHeader = action.payload.headers['x-total-count'];
        if (totalCountHeader) {
          state.totalItems = parseInt(totalCountHeader, 10);
        } else {
          // Fallback: if header not present, use array length
          state.totalItems = action.payload.data ? action.payload.data.length : 0;
        }
      })
      .addMatcher(isFulfilled(getStatistics), (state: any, action) => {
        state.statistics = action.payload.data;
      })
      .addMatcher(isPending(searchEntities, exportEntities, deleteManyEntities), state => {
        state.loading = true;
      })
      .addMatcher(isFulfilled(deleteManyEntities), state => {
        state.loading = false;
        state.updateSuccess = true;
      })
      .addMatcher(isFulfilled(exportEntities), state => {
        state.loading = false;
      })
      .addMatcher(isPending(getStatistics), state => {
        // Statistics loading doesn't affect main loading state
      })
      .addMatcher(isFulfilled(createEntity, updateEntity, partialUpdateEntity), (state, action) => {
        state.updating = false;
        state.updateSuccess = true;
        state.entity = action.payload.data;
      })
      .addMatcher(isPending(createEntity, updateEntity, partialUpdateEntity, deleteEntity), state => {
        state.errorMessage = null;
        state.updateSuccess = false;
        state.updating = true;
      });
  },
});

export const { reset } = ProductSlice.actions;

// Reducer
export default ProductSlice.reducer;

