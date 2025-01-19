/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2024 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import { observer } from 'mobx-react-lite';

import {
  Button,
  CommonDialogBody,
  CommonDialogFooter,
  CommonDialogHeader,
  CommonDialogWrapper,
  Container,
  Flex,
  useAutoLoad,
  useResource,
  useTranslate,
} from '@cloudbeaver/core-blocks';
import { type ConnectionExecutionContext, ConnectionInfoResource, createConnectionParam } from '@cloudbeaver/core-connections';
import type { DialogComponent } from '@cloudbeaver/core-dialogs';

import { TransactionLogTable } from './TransactionLogTable/TransactionLogTable.js';
import { useTransactionLog } from './useTransactionLog.js';

interface IPayload {
  transaction: ConnectionExecutionContext;
  onCommit: () => void;
  onRollback: () => void;
}

export const TransactionLogDialog: DialogComponent<IPayload> = observer(function TransactionLogDialog(props) {
  const translate = useTranslate();
  const context = props.payload.transaction.context;
  const connectionParam = context ? createConnectionParam(context.projectId, context.connectionId) : null;

  const state = useTransactionLog(props.payload);
  const connectionInfoResource = useResource(useTransactionLog, ConnectionInfoResource, connectionParam);
  let title: string = translate('plugin_datasource_transaction_manager_logs');

  if (connectionInfoResource.data?.name) {
    title = `${title} (${connectionInfoResource.data.name})`;
  }

  useAutoLoad(TransactionLogDialog, state);

  function handleRollback() {
    props.payload.onRollback();
    props.resolveDialog();
  }

  function handleCommit() {
    props.payload.onCommit();
    props.resolveDialog();
  }

  return (
    <CommonDialogWrapper size="large" fixedWidth>
      <CommonDialogHeader title={title} onReject={props.rejectDialog} />
      <CommonDialogBody>
        <TransactionLogTable log={state.log ?? []} />
      </CommonDialogBody>
      <CommonDialogFooter>
        <Flex justify="space-between">
          <Button mod={['outlined']} onClick={props.rejectDialog}>
            {translate('ui_cancel')}
          </Button>
          <Container gap dense noWrap keepSize>
            <Button mod={['outlined']} onClick={handleRollback}>
              {translate('plugin_datasource_transaction_manager_rollback')}
            </Button>
            <Button mod={['unelevated']} onClick={handleCommit}>
              {translate('plugin_datasource_transaction_manager_commit')}
            </Button>
          </Container>
        </Flex>
      </CommonDialogFooter>
    </CommonDialogWrapper>
  );
});
