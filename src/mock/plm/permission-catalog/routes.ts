import {
  buildPermissionCatalog,
  parseCodeList,
  validateCodeList,
} from './helpers';
import { appfetch } from '@/core/network/appfetch';
import { toUrl } from '@/core/network/mock-utils';
import plmHttpRequest from '@/core/network/plm-http-request';
import { createDomainFromBody } from '@/mock/plm/domain/helpers';
import { domainStore } from '@/mock/plm/domain/stores';
import {
  addResourceAction,
  createResourceFromBody,
} from '@/mock/plm/resource/helpers';
import { resourceStore } from '@/mock/plm/resource/stores';
import { createServiceFromBody } from '@/mock/plm/service/helpers';
import { serviceStore } from '@/mock/plm/service/stores';

const MAX_IMPORT_FILE_SIZE = 1024 * 1024; // 1 MB

// ─── GET /registry/permission-catalog ─────────────────────────────────────────
// IAM dùng API này để đồng bộ; không truyền serviceCode thì trả toàn bộ.
plmHttpRequest.addMockRoute({
  url: /\/registry\/permission-catalog(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    const serviceCode = sp.get('serviceCode') || undefined;
    return appfetch.json(buildPermissionCatalog(serviceCode));
  },
});

// ─── GET /registry/permissions/export ─────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/permissions\/export(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    const serviceCode = sp.get('serviceCode') || undefined;
    const body = buildPermissionCatalog(serviceCode)
      .map(item => item.code)
      .join('\n');
    const fileName = `permissions-${serviceCode ?? 'all'}.txt`;
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  },
});

// ─── POST /registry/permissions/import ────────────────────────────────────────
// Multipart field `file` (.txt). Chỉ thêm, không sửa/xoá. Có lỗi thì không ghi
// gì (applied = false). Chạy lặp không sinh trùng.
plmHttpRequest.addMockRoute({
  url: /\/registry\/permissions\/import$/,
  method: 'POST',
  handler: async (input, init) => {
    const request = new Request(toUrl(input), init);
    const formData = await request.formData().catch(() => undefined);
    const file = formData?.get('file');

    if (!(file instanceof File) || file.size > MAX_IMPORT_FILE_SIZE) {
      return appfetch.error(
        {
          code: 'FILE_REQUIRED',
          message: 'Thiếu file .txt để import (tối đa 1 MB)',
        },
        400,
      );
    }

    const lines = parseCodeList(await file.text());
    if (!lines.length) {
      return appfetch.error(
        { code: 'FILE_REQUIRED', message: 'File không có mã quyền nào' },
        400,
      );
    }

    const created = { services: 0, domains: 0, resources: 0, actions: 0 };
    const errors = validateCodeList(lines);
    if (errors.length) {
      return appfetch.json({ applied: false, created, skipped: 0, errors });
    }

    let skipped = 0;
    for (const { code } of lines) {
      const [serviceCode, domainCode, resourceCode, action] = code.split('.');

      let service = serviceStore.find(s => s.serviceCode === serviceCode);
      if (!service) {
        service = createServiceFromBody({
          serviceCode,
          name: serviceCode,
          status: 'Active',
        });
        created.services += 1;
      }

      let domain = domainStore.find(
        d => d.serviceId === service.id && d.domainCode === domainCode,
      );
      if (!domain) {
        domain = createDomainFromBody({
          serviceId: service.id,
          domainCode,
          name: domainCode,
        });
        created.domains += 1;
      }

      let resource = resourceStore.find(
        r => r.domainId === domain.id && r.resourceCode === resourceCode,
      );
      if (!resource) {
        resource = createResourceFromBody({
          domainId: domain.id,
          resourceCode,
          name: resourceCode,
          actions: [],
        });
        created.resources += 1;
      }

      if (addResourceAction(resource, action)) created.actions += 1;
      else skipped += 1;
    }

    return appfetch.json({ applied: true, created, skipped, errors: [] });
  },
});
