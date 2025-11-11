import product from './product/product.reducer';
import category from './category/category.reducer';
import customer from './customer/customer.reducer';
import order from './order/order.reducer';
/* jhipster-needle-add-reducer-import - JHipster will add reducer here */

const entitiesReducers = {
  product,
  category,
  customer,
  order,
  /* jhipster-needle-add-reducer-combine - JHipster will add reducer here */
};

export default entitiesReducers;
