/*
 * CloudBeaver - Cloud Database Manager
 * Copyright (C) 2020-2024 DBeaver Corp and others
 *
 * Licensed under the Apache License, Version 2.0.
 * you may not use this file except in compliance with the License.
 */
import { observer } from 'mobx-react-lite';

import { s } from '../s.js';
import { useS } from '../useS.js';
import style from './OverlayActions.module.css';

interface Props {
  className?: string;
}

export const OverlayActions = observer<React.PropsWithChildren<Props>>(function OverlayActions({ className, children }) {
  const styles = useS(style);

  return <div className={s(styles, { actions: true }, className)}>{children}</div>;
});
