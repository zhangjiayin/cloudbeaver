/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2024 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import { createDataContext } from '@cloudbeaver/core-data-context';

import type { IResultSetElementKey } from './IResultSetDataKey.js';

export const DATA_CONTEXT_DV_RESULT_KEY = createDataContext<IResultSetElementKey>('data-viewer-database-result-key');
