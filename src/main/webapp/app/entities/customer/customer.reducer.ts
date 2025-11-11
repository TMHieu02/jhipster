import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { isPending, isFulfilled } from '@reduxjs/toolkit';

import { ICustomer, defaultValue } from 'app/shared/model/customer.model';
import { IQueryParams, createEntitySlice, EntityState, serializeAxiosError } from 'app/shared/reducers/reducer.utils';

export interface CustomerState extends EntityState<ICustomer> {
  statistics: Record<string, any> | null;
}

const initialState: CustomerState = {
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

const apiUrl = 'api/customers';

export const getEntities = createAsyncThunk(
  'customer/fetch_entity_list',
  async ({ page, size, sort }: IQueryParams) => {
    const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
    return axios.get<ICustomer[]>(requestUrl);
  },
  { serializeError: serializeAxiosError }
);

export const getEntity = createAsyncThunk(
  'customer/fetch_entity',
  async (id: string | number) => {
    const requestUrl = `${apiUrl}/${id}`;
    return axios.get<ICustomer>(requestUrl);
  },
  { serializeError: serializeAxiosError }
);

export interface ISearchParams {
  page?: number;
  size?: number;
  sort?: string;
  name?: string;
  email?: string;
  city?: string;
  country?: string;
  active?: boolean;
}

export const searchEntities = createAsyncThunk(
  'customer/search_entity_list',
  async (params: ISearchParams) => {
    const { page, size, sort, name, email, city, country, active } = params;
    const queryParams = new URLSearchParams();
    if (page !== undefined) queryParams.append('page', page.toString());
    if (size !== undefined) queryParams.append('size', size.toString());
    if (sort) queryParams.append('sort', sort);
    if (name) queryParams.append('name', name);
    if (email) queryParams.append('email', email);
    if (city) queryParams.append('city', city);
    if (country) queryParams.append('country', country);
    if (active !== undefined) queryParams.append('active', active.toString());
    const requestUrl = `${apiUrl}/search?${queryParams.toString()}`;
    return axios.get<ICustomer[]>(requestUrl);
  },
  { serializeError: serializeAxiosError }
);

export const createEntity = createAsyncThunk(
  'customer/create_entity',
  async (entity: ICustomer, thunkAPI) => {
    const result = await axios.post<ICustomer>(apiUrl, entity);
    thunkAPI.dispatch(getEntities({}));
    thunkAPI.dispatch(getStatistics());
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const updateEntity = createAsyncThunk(
  'customer/update_entity',
  async (entity: ICustomer, thunkAPI) => {
    const result = await axios.put<ICustomer>(`${apiUrl}/${entity.id}`, entity);
    thunkAPI.dispatch(getEntities({}));
    thunkAPI.dispatch(getStatistics());
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const partialUpdateEntity = createAsyncThunk(
  'customer/partial_update_entity',
  async (entity: ICustomer, thunkAPI) => {
    const result = await axios.patch<ICustomer>(`${apiUrl}/${entity.id}`, entity);
    thunkAPI.dispatch(getEntities({}));
    thunkAPI.dispatch(getStatistics());
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const deleteEntity = createAsyncThunk(
  'customer/delete_entity',
  async (id: string | number, thunkAPI) => {
    const requestUrl = `${apiUrl}/${id}`;
    const result = await axios.delete<ICustomer>(requestUrl);
    thunkAPI.dispatch(getEntities({}));
    thunkAPI.dispatch(getStatistics());
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const deleteManyEntities = createAsyncThunk(
  'customer/delete_many_entity',
  async (ids: string[], thunkAPI) => {
    const result = await axios.delete(`${apiUrl}/bulk`, { data: ids });
    thunkAPI.dispatch(getEntities({}));
    thunkAPI.dispatch(getStatistics());
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const getStatistics = createAsyncThunk(
  'customer/get_statistics',
  async () => {
    const requestUrl = `${apiUrl}/statistics`;
    return axios.get<Record<string, any>>(requestUrl);
  },
  { serializeError: serializeAxiosError }
);

export const CustomerSlice = createEntitySlice({
  name: 'customer',
  initialState,
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
      .addMatcher(isPending(getEntities, getEntity, searchEntities), state => {
        state.errorMessage = null;
        state.updateSuccess = false;
        state.loading = true;
      })
      .addMatcher(isFulfilled(getEntities, searchEntities), (state, action) => {
        state.loading = false;
        state.entities = action.payload.data;
        const totalCountHeader = action.payload.headers['x-total-count'];
        state.totalItems = totalCountHeader ? parseInt(totalCountHeader, 10) : action.payload.data?.length ?? 0;
      })
      .addMatcher(isFulfilled(deleteManyEntities), state => {
        state.loading = false;
        state.updateSuccess = true;
      })
      .addMatcher(isFulfilled(createEntity, updateEntity, partialUpdateEntity), (state, action) => {
        state.updating = false;
        state.updateSuccess = true;
        state.entity = action.payload.data;
      })
      .addMatcher(isFulfilled(getStatistics), (state, action) => {
        (state as unknown as CustomerState).statistics = action.payload.data;
      })
      .addMatcher(isPending(deleteManyEntities, getStatistics), state => {
        state.errorMessage = null;
      })
      .addMatcher(isPending(createEntity, updateEntity, partialUpdateEntity, deleteEntity), state => {
        state.errorMessage = null;
        state.updateSuccess = false;
        state.updating = true;
      });
  },
});

export const { reset } = CustomerSlice.actions;
export default CustomerSlice.reducer;

