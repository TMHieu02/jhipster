import React from 'react';
import { Route } from 'react-router-dom';

import ErrorBoundaryRoutes from 'app/shared/error/error-boundary-routes';

import Category from './category/category';
import CategoryDetail from './category/category-detail';
import CategoryUpdate from './category/category-update';
import CategoryDeleteDialog from './category/category-delete-dialog';
import Customer from './customer/customer';
import CustomerDetail from './customer/customer-detail';
import CustomerUpdate from './customer/customer-update';
import CustomerDeleteDialog from './customer/customer-delete-dialog';
import Order from './order/order';
import OrderDetail from './order/order-detail';
import OrderUpdate from './order/order-update';
import OrderDeleteDialog from './order/order-delete-dialog';

/* jhipster-needle-add-route-import - JHipster will add routes here */

export default () => {
  return (
    <div>
      <ErrorBoundaryRoutes>
        {/* prettier-ignore */}
        <Route path="category/*" element={<Category />} />
        <Route path="category/:id">
          <Route index element={<CategoryDetail />} />
          <Route path="edit" element={<CategoryUpdate />} />
          <Route path="delete" element={<CategoryDeleteDialog />} />
        </Route>
        <Route path="category/new" element={<CategoryUpdate />} />
        <Route path="customer/*" element={<Customer />} />
        <Route path="customer/:id">
          <Route index element={<CustomerDetail />} />
          <Route path="edit" element={<CustomerUpdate />} />
          <Route path="delete" element={<CustomerDeleteDialog />} />
        </Route>
        <Route path="customer/new" element={<CustomerUpdate />} />
        <Route path="order/*" element={<Order />} />
        <Route path="order/:id">
          <Route index element={<OrderDetail />} />
          <Route path="edit" element={<OrderUpdate />} />
          <Route path="delete" element={<OrderDeleteDialog />} />
        </Route>
        <Route path="order/new" element={<OrderUpdate />} />
        {/* jhipster-needle-add-route-path - JHipster will add routes here */}
      </ErrorBoundaryRoutes>
    </div>
  );
};
