/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2021 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */

import { computed, observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import styled, { use } from 'reshadow';

import { useStyles } from '@cloudbeaver/core-theming';

import { useObjectRef } from '../../useObjectRef';
import { useObservableRef } from '../../useObservableRef';
import type { ITreeNodeState } from './ITreeNodeState';
import { ITreeNodeContext, TreeNodeContext } from './TreeNodeContext';
import { TREE_NODE_STYLES } from './TreeNodeStyles';

interface Props extends ITreeNodeState {
  className?: string;
  onClick?: (leaf: boolean) => Promise<void> | void;
  onExpand?: () => Promise<void> | void;
  onSelect?: (multiple?: boolean, nested?: boolean) => Promise<void> | void;
  onFilter?: (value: string) => Promise<void> | void;
  onOpen?: () => Promise<void> | void;
}

interface IInnerTreeNodeContext extends ITreeNodeContext {
  inProgress: number;
}

export const TreeNode: React.FC<Props> = observer(function TreeNode({
  group = false,
  loading = false,
  selected = false,
  disabled = false,
  filterValue = '',
  expanded = false,
  externalExpanded,
  leaf = false,
  className,
  children,
  ...handlers
}) {
  const handlersRef = useObjectRef(handlers);

  async function processAction(action: () => Promise<void>) {
    nodeContext.inProgress++;

    try {
      await action();
    } finally {
      nodeContext.inProgress--;
    }
  }

  const nodeContext = useObservableRef<IInnerTreeNodeContext>(() => ({
    get processing() {
      return this.inProgress > 0;
    },
    inProgress: 0,
    async click() {
      await processAction(async () => {
        await handlersRef.onClick?.(this.leaf);
      });
    },
    async expand() {
      await processAction(async () => {
        await handlersRef.onExpand?.();
      });
    },
    async select(multiple?: boolean, nested?: boolean) {
      await processAction(async () => {
        await handlersRef.onSelect?.(multiple, nested);
      });
    },
    async filter(value: string) {
      await processAction(async () => {
        await handlersRef.onFilter?.(value);
      });
    },
    async open() {
      await processAction(async () => {
        await handlersRef.onOpen?.();
      });
    },
  }), {
    group: observable.ref,
    disabled: observable.ref,
    processing: computed,
    inProgress: observable.ref,
    loading: observable.ref,
    selected: observable.ref,
    expanded: observable.ref,
    externalExpanded: observable.ref,
    leaf: observable.ref,
    filterValue: observable.ref,
  }, {
    group,
    disabled,
    loading,
    selected,
    expanded,
    externalExpanded: externalExpanded || false,
    leaf,
    filterValue,
  });

  return styled(useStyles(TREE_NODE_STYLES))(
    <node {...use({ expanded: nodeContext.expanded || nodeContext.externalExpanded })} className={className}>
      <TreeNodeContext.Provider value={nodeContext}>
        {children}
      </TreeNodeContext.Provider>
    </node>
  );
});
