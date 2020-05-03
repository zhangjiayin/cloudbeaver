/*
 * cloudbeaver - Cloud Database Manager
 * Copyright (C) 2020 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { NotificationService } from '@dbeaver/core/eventsLog';
import {
  AsyncTaskInfo, GraphQLService, ServerInternalError, DataTransferParameters,
} from '@dbeaver/core/sdk';
import {
  CancellablePromise, cancellableTimeout, Deferred, EDeferredState,
} from '@dbeaver/core/utils';

const DELAY_BETWEEN_TRIES = 1000;

// TODO: seems we need special abstraction over async tasks to manage it
export class ExportFromResultsProcess extends Deferred<string> {

  private taskId?: string;
  private timeout?: CancellablePromise<void>;
  private isCancelConfirmed = false; // true when server successfully executed cancelQueryAsync

  constructor(private graphQLService: GraphQLService,
              private notificationService: NotificationService) {
    super();
  }

  async start(
    connectionId: string,
    contextId: string,
    resultsId: string,
    parameters: DataTransferParameters
  ): Promise<string | undefined> {
    // start async task
    try {
      const { taskInfo } = await this.graphQLService.gql.exportDataFromResults({
        connectionId,
        contextId,
        resultsId,
        parameters,
      });
      this.applyResult(taskInfo);
      this.taskId = taskInfo.id;
      if (this.getState() === EDeferredState.CANCELLING) {
        await this.cancelAsync(this.taskId);
      }
    } catch (e) {
      this.onError(e);
      throw e;
    }

    this.statusUpdateProcess();

    return this.taskId;
  }

  /**
   * this method just mark process as cancelling
   * to avoid racing conditions the server request will be executed in synchronous manner in start method
   */
  cancel() {
    if (this.getState() !== EDeferredState.PENDING) {
      return;
    }
    this.toCancelling();
    if (this.timeout) {
      this.timeout.cancel();
    }
  }

  private async statusUpdateProcess() {
    if (this.isFinished || !this.taskId) {
      return;
    }
    // check async task status until execution finished
    while (this.isInProgress) {
      if (this.getState() === EDeferredState.CANCELLING) {
        await this.cancelAsync(this.taskId);
      }
      // run the first check immediately because usually the query execution is fast
      try {
        const { taskInfo } = await this.graphQLService.gql.asyncExportTaskStatus({ taskId: this.taskId });
        this.applyResult(taskInfo);
        if (this.isFinished) {
          return;
        }
      } catch (e) {
        this.notificationService.logException(e, 'Failed to check async task status');
      }

      try {
        this.timeout = cancellableTimeout(DELAY_BETWEEN_TRIES);
        await this.timeout;
      } catch { }
    }
  }

  private async cancelAsync(taskId: string) {
    if (this.isCancelConfirmed) {
      return;
    }
    try {
      await this.graphQLService.gql.asyncTaskCancel({ taskId });
      this.isCancelConfirmed = true;
    } catch (e) {
      if (this.getState() === EDeferredState.CANCELLING) {
        this.toPending();
        this.notificationService.logException(e, 'Failed to cancel async task');
      }
    }
  }

  private applyResult(taskInfo: AsyncTaskInfo): void {
    // task is running
    if (taskInfo.running) {
      return;
    }
    // task failed to execute
    if (taskInfo.error) {
      const serverError = new ServerInternalError(taskInfo.error);
      this.onError(serverError, taskInfo.status);
      return;
    }
    if (!taskInfo.taskResult) {
      this.onError(new Error('Tasks execution returns no taskResult'), taskInfo.status);
      return;
    }
    // task execution successful
    this.toResolved(taskInfo.taskResult);
  }

  private onError(error: Error, status?: string) {
    // if task failed to execute during cancelling - it means it was cancelled successfully
    if (this.getState() === EDeferredState.CANCELLING) {
      this.toCancelled();
      const message = `Data export has been canceled${status ? `: ${status}` : ''}`;
      this.notificationService.logException(error, message);
    } else {
      this.toRejected(error);
    }
  }
}
