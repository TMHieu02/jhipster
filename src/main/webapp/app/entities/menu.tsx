import React from 'react';
import { Translate } from 'react-jhipster';

import MenuItem from 'app/shared/layout/menus/menu-item';

const EntitiesMenu = () => {
  return (
    <>
      {/* prettier-ignore */}
      <MenuItem icon="tags" to="/category">
        <Translate contentKey="global.menu.entities.category">Category</Translate>
      </MenuItem>
      <MenuItem icon="user-friends" to="/customer">
        <Translate contentKey="global.menu.entities.customer">Customer</Translate>
      </MenuItem>
      <MenuItem icon="shopping-cart" to="/order">
        <Translate contentKey="global.menu.entities.order">Order</Translate>
      </MenuItem>
      {/* jhipster-needle-add-entity-to-menu - JHipster will add entities to the menu here */}
    </>
  );
};

export default EntitiesMenu;
