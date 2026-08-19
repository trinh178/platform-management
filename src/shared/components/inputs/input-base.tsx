'use client';

import React from 'react';
import { Input } from '../ui/input';

export type InputBaseProps = React.ComponentProps<typeof Input> & {
  inputPattern?: RegExp;
};

export default function InputBase({
  inputPattern,
  value,
  onChange,
  ...props
}: InputBaseProps) {
  return (
    <Input
      {...props}
      value={value ?? ''}
      onChange={e => {
        if (
          inputPattern &&
          e.target.value.length > 0 &&
          !inputPattern.test(e.target.value)
        ) {
          return;
        }
        onChange?.(e);
      }}
    />
  );
}
