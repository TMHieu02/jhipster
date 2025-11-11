import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { isPending, isFulfilled } from '@reduxjs/toolkit';

import { IOrder, defaultValue } from 'app/shared/model/order.model';
import { IQueryParams, createEntitySlice, EntityState, serializeAxiosError } from 'app/shared/reducers/reducer.utils';

export interface OrderState extends EntityState<IOrder> {
  statistics: Record<string, any> | null;
}

const initialState: OrderState = {
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

const apiUrl = 'api/orders';

export const getEntities = createAsyncThunk(
  'order/fetch_entity_list',
  async ({ page, size, sort }: IQueryParams) => {
    const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
    return axios.get<IOrder[]>(requestUrl);
  },
  { serializeError: serializeAxiosError }
);

export const getEntity = createAsyncThunk(
  'order/fetch_entity',
  async (id: string | number) => {
    const requestUrl = `${apiUrl}/${id}`;
    return axios.get<IOrder>(requestUrl);
  },
  { serializeError: serializeAxiosError }
);

export interface ISearchParams {
  page?: number;
  size?: number;
  sort?: string;
  customerId?: string;
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  minTotal?: number;
  maxTotal?: number;
}

export const searchEntities = createAsyncThunk(
  'order/search_entity_list',
  async (params: ISearchParams) => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.customerId) queryParams.append('customerId', params.customerId);
    if (params.status) queryParams.append('status', params.status);
    if (params.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.minTotal !== undefined) queryParams.append('minTotal', params.minTotal.toString());
    if (params.maxTotal !== undefined) queryParams.append('maxTotal', params.maxTotal.toString());
    const requestUrl = `${apiUrl}/search?${queryParams.toString()}`;
    return axios.get<IOrder[]>(requestUrl);
  },
  { serializeError: serializeAxiosError }
);

export const createEntity = createAsyncThunk(
  'order/create_entity',
  async (entity: IOrder, thunkAPI) => {
    const result = await axios.post<IOrder>(apiUrl, entity);
    thunkAPI.dispatch(getEntities({}));
    thunkAPI.dispatch(getStatistics());
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const updateEntity = createAsyncThunk(
  'order/update_entity',
  async (entity: IOrder, thunkAPI) => {
    const result = await axios.put<IOrder>(`${apiUrl}/${entity.id}`, entity);
    thunkAPI.dispatch(getEntities({}));
    thunkAPI.dispatch(getStatistics());
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const partialUpdateEntity = createAsyncThunk(
  'order/partial_update_entity',
  async (entity: IOrder, thunkAPI) => {
    const result = await axios.patch<IOrder>(`${apiUrl}/${entity.id}`, entity);
    thunkAPI.dispatch(getEntities({}));
    thunkAPI.dispatch(getStatistics());
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const deleteEntity = createAsyncThunk(
  'order/delete_entity',
  async (id: string | number, thunkAPI) => {
    const requestUrl = `${apiUrl}/${id}`;
    const result = await axios.delete<IOrder>(requestUrl);
    thunkAPI.dispatch(getEntities({}));
    thunkAPI.dispatch(getStatistics());
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const deleteManyEntities = createAsyncThunk(
  'order/delete_many_entity',
  async (ids: string[], thunkAPI) => {
    const result = await axios.delete(`${apiUrl}/bulk`, { data: ids });
    thunkAPI.dispatch(getEntities({}));
    thunkAPI.dispatch(getStatistics());
    return result;
  },
  { serializeError: serializeAxiosError }
);

export const getStatistics = createAsyncThunk(
  'order/get_statistics',
  async () => {
    const requestUrl = `${apiUrl}/statistics`;
    return axios.get<Record<string, any>>(requestUrl);
  },
  { serializeError: serializeAxiosError }
);

export const OrderSlice = createEntitySlice({
  name: 'order',
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
        (state as unknown as OrderState).statistics = action.payload.data;
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

export const { reset } = OrderSlice.actions;
export default OrderSlice.reducer;

