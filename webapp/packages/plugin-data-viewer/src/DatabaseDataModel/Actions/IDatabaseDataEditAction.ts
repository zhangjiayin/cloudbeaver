/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import type { IExecutor } from '@cloudbeaver/core-executor';

import type { IDatabaseDataAction } from '../IDatabaseDataAction';
import type { IDatabaseDataResult } from '../IDatabaseDataResult';

// order is matter, used for sorting and changes diff
export enum DatabaseEditChangeType {
  update,
  add,
  delete
}

export interface IDatabaseDataEditActionValue<TKey, TValue> {
  key: TKey;
  nextKey?: TKey;
  value?: TValue;
  prevValue?: TValue;
}

export interface IDatabaseDataEditActionData<TKey, TValue> {
  revert: boolean;
  type?: DatabaseEditChangeType;
  resultId: string;
  value?: Array<IDatabaseDataEditActionValue<TKey, TValue>>;
}

export interface IDatabaseDataEditAction<TKey, TValue, TResult extends IDatabaseDataResult>
  extends IDatabaseDataAction<any, TResult> {
  readonly action: IExecutor<IDatabaseDataEditActionData<TKey, TValue>>;
  isEdited: () => boolean;
  isElementEdited: (key: TKey) => boolean;
  hasFeature: (feature: keyof this) => boolean;
  getElementState: (key: TKey) => DatabaseEditChangeType | null;
  get: (key: TKey) => TValue | undefined;
  set: (key: TKey, value: TValue) => void;
  add: (key?: TKey) => void;
  delete: (key: TKey) => void;
  applyUpdate: (result: TResult) => void;
  revert: (key: TKey) => void;
  clear: () => void;
}
