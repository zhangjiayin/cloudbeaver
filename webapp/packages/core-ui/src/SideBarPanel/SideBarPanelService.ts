/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2024 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import { injectable } from '@cloudbeaver/core-di';

import { TabsContainer } from '../Tabs/TabsContainer/TabsContainer.js';

@injectable()
export class SideBarPanelService {
  readonly tabsContainer: TabsContainer;

  constructor() {
    this.tabsContainer = new TabsContainer('Right Side Bar');
  }
}
