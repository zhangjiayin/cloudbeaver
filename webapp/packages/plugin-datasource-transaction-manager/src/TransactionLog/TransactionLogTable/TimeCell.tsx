/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2024 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import { observer } from 'mobx-react-lite';

import type { TransactionLogInfoItem } from '@cloudbeaver/core-sdk';
import { isSameDay } from '@cloudbeaver/core-utils';
import { type RenderCellProps } from '@cloudbeaver/plugin-data-grid';

export const TimeCell = observer<RenderCellProps<TransactionLogInfoItem>>(function TimeCell(props) {
  const date = new Date(props.row.time);
  const fullTime = date.toLocaleString();
  const displayTime = isSameDay(date, new Date()) ? date.toLocaleTimeString() : fullTime;

  return <div>{displayTime}</div>;
});
