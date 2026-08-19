# 09 — ESLint & Import Rules

## Forbidden Imports — CRITICAL (build sẽ FAIL nếu vi phạm)

### 1. useRouter từ next/navigation

```ts
// ❌ FORBIDDEN
import { useRouter } from 'next/navigation';

// ✅ ĐÚNG
import { useAppRouter } from '@/core/router/next';
```

### 2. Link từ next/link

```ts
// ❌ FORBIDDEN
import Link from 'next/link';

// ✅ ĐÚNG
import { AppLink } from '@/core/router/next';
```

### 3. useMutation, useQuery từ @tanstack/react-query

```ts
// ❌ FORBIDDEN
import { useMutation, useQuery } from '@tanstack/react-query';

// ✅ ĐÚNG — dùng factories
import { createUseMutationHrmEm, createUseQueryHrmEm } from '@/core/query/factories';
// Hoặc dùng hooks đã tạo sẵn
import { useEmployees } from '../../services/employee.queries';
```

### 4. toast từ sonner

```ts
// ❌ FORBIDDEN
import { toast } from 'sonner';

// ✅ ĐÚNG
import { notify } from '@/core/notification';
```

### 5. fetch global

```ts
// ❌ FORBIDDEN
const res = await fetch('/api/...');

// ✅ ĐÚNG — dùng HttpRequest instance
import hrmemHttpRequest from '@/core/network/hrmem-http-request';
const data = await hrmemHttpRequest.request({ method: 'GET', url: '/...' });
```

## Import Order Rules (ESLint enforce tự động)

Thứ tự — **không có newline giữa các nhóm**:

1. `react` và react packages — đứng đầu
2. External packages (node_modules)
3. Parent (`../`)
4. Sibling (`./`)
5. Index

```ts
// ✅ ĐÚNG
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import { notify } from '@/core/notification';
import { useEmployees } from '../../services/employee.queries';
import { EmployeeActions } from './actions';

// ❌ SAI — react không đứng đầu
import { Button } from '@/shared/components/ui/button';
import React from 'react';
```

## Sort Imports (Named Imports)

Named imports phải sort alphabetically:

```ts
// ✅
import { Bar, Foo, Zoo } from 'some-module';

// ❌
import { Zoo, Bar, Foo } from 'some-module';
```

## `'use client'` Directive

Bắt buộc với tất cả components dùng:

- React hooks (`useState`, `useEffect`, `useForm`, ...)
- Event handlers
- Browser APIs

```tsx
'use client';

import React from 'react';
```

Server Components (không cần `'use client'`): chỉ render JSX tĩnh, dùng `async/await` server-side, không có hooks.

## TypeScript Strict Mode

```ts
// ❌ — tránh dùng any tùy tiện
const foo: any = something;

// ✅ — dùng unknown khi không biết type
const foo: unknown = something;

// ✅ — cast khi cần, thêm eslint-disable comment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const foo = something as any;
```

## Prettier Config (.prettierrc.json)

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 80,
  "tabWidth": 2
}
```

## Build Pipeline

```bash
# Build = lint + compile
npm run build       # eslint . && next build

# Lint only
npm run lint:all

# Fix lint
npm run lint:fixall

# Type check
npm run type-check
```

## Husky Pre-commit

Trước mỗi commit, tự động chạy ESLint trên files staged:

```json
"lint-staged": {
  "*.{ts,tsx,js,jsx}": ["npm run lint"],
  "*.json": ["npm run prettify"]
}
```
