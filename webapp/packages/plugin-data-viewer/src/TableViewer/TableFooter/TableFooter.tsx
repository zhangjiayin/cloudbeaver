/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2024 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef, useState } from 'react';
import styled, { css, use } from 'reshadow';

import { Form, getComputed, ToolsPanel } from '@cloudbeaver/core-blocks';
import type { IDataContext } from '@cloudbeaver/core-data-context';
import { useService } from '@cloudbeaver/core-di';

import type { IDatabaseDataModel } from '../../DatabaseDataModel/IDatabaseDataModel';
import { DataViewerSettingsService } from '../../DataViewerSettingsService';
import { AutoRefreshButton } from './AutoRefresh/AutoRefreshButton';
import { TableFooterMenu } from './TableFooterMenu/TableFooterMenu';
import { TableFooterRowCount } from './TableFooterRowCount';

const tableFooterStyles = css`
  count input,
  count placeholder {
    height: 26px;
    width: 80px;
    box-sizing: border-box;
    padding: 4px 7px;
    font-size: 13px;
    line-height: 24px;
  }
  reload {
    composes: theme-text-primary theme-ripple from global;
    height: 100%;
    display: flex;
    cursor: pointer;
    align-items: center;
    padding: 0 16px;

    & IconOrImage {
      & :global(use) {
        fill: var(--theme-primary) !important;
      }
      width: 24px;
      height: 24px;
    }
  }
  IconButton {
    position: relative;
    height: 24px;
    width: 24px;
    display: block;
  }
  time {
    composes: theme-typography--caption from global;
    white-space: nowrap;
    margin-left: auto;
    margin-right: 16px;
  }
  count {
    padding: 0 4px;
  }
`;

interface Props {
  resultIndex: number;
  model: IDatabaseDataModel<any, any>;
  simple: boolean;
  context?: IDataContext;
}

export const TableFooter = observer<Props>(function TableFooter({ resultIndex, model, simple, context }) {
  const ref = useRef<HTMLInputElement>(null);
  const [limit, setLimit] = useState(model.countGain + '');
  const dataViewerSettingsService = useService(DataViewerSettingsService);

  const handleChange = useCallback(async () => {
    if (!ref.current) {
      return;
    }

    const value = dataViewerSettingsService.getDefaultRowsCount(parseInt(ref.current.value, 10));

    setLimit(value + '');
    if (model.countGain !== value) {
      await model.setCountGain(value).reload();
    }
  }, [model]);

  useEffect(() => {
    if (limit !== model.countGain + '') {
      setLimit(model.countGain + '');
    }
  }, [model.countGain]);

  const disabled = getComputed(() => model.isLoading() || model.isDisabled(resultIndex));

  return styled(tableFooterStyles)(
    <ToolsPanel type="secondary" center>
      {/* <reload aria-disabled={disabled} onClick={() => model.refresh()}>
        <IconOrImage icon='reload' viewBox="0 0 16 16" />
      </reload> */}
      <AutoRefreshButton model={model} disabled={disabled} />
      <count>
        <Form onSubmit={handleChange}>
          <input
            ref={ref}
            type="number"
            value={limit}
            disabled={disabled}
            min={dataViewerSettingsService.minFetchSize}
            max={dataViewerSettingsService.maxFetchSize}
            onChange={e => setLimit(e.target.value)}
            onBlur={handleChange}
            {...use({ mod: 'surface' })}
          />
        </Form>
      </count>
      <TableFooterRowCount model={model} resultIndex={resultIndex} />
      <TableFooterMenu model={model} resultIndex={resultIndex} simple={simple} context={context} />
      {model.source.requestInfo.requestMessage.length > 0 && (
        <time>
          {model.source.requestInfo.requestMessage} - {model.source.requestInfo.requestDuration}ms
        </time>
      )}
    </ToolsPanel>,
  );
});
