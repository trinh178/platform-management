import { v4 as uuidv4 } from 'uuid';
import {
  buildEmployeeDetails,
  buildEmployeePreview,
  createEmployeeFromBody,
  getEmployeeOrNotFound,
  getFullName,
  mergeEmployee,
} from './helpers';
import type {
  EmployeeDocumentMock,
  EmployeeMock,
  EmployeeQualificationMock,
} from './mock-types';
import { documentStore, employeeStore, qualificationStore } from './stores';
import { appfetch } from '@/core/network/appfetch';
import hrmemHttpRequest from '@/core/network/hrmem-http-request';
import {
  MockListFilter,
  buildMockListResponse,
  extractIdFromUrl,
  generateCodeFromStore,
  matchFilterOperator,
  parseBody,
  toUrl,
} from '@/core/network/mock-utils';
import { getCurrentUserId } from '@/mock/mock-context';

function searchEmployee(employee: EmployeeMock, searchTerm: string) {
  return [
    employee.employeeCode,
    employee.firstName,
    employee.lastName,
    getFullName(employee),
    employee.contact?.personalPhoneNumber,
  ]
    .filter(Boolean)
    .some(value => value!.toLowerCase().includes(searchTerm));
}

function filterEmployee(employee: EmployeeMock, filter: MockListFilter) {
  if (filter.field === 'employeeCode')
    return matchFilterOperator(employee.employeeCode, filter);
  if (filter.field === 'gender')
    return matchFilterOperator(employee.gender, filter);
  if (filter.field === 'dateOfBirth')
    return matchFilterOperator(employee.dateOfBirth, filter);
  if (filter.field === 'jobStatus')
    return matchFilterOperator(employee.jobInfo.status, filter);
  if (filter.field === 'organizationUnitCode')
    return matchFilterOperator(employee.jobInfo.organizationUnitCode, filter);
  if (filter.field === 'jobPositionCode')
    return matchFilterOperator(employee.jobInfo.jobPositionCode, filter);
  return true;
}

// ─── EMPLOYEE MODULE: more specific routes first ─────────────────────────────

// ─── GET /profiles/employee/generate-employee-code ───────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/generate-employee-code$/,
  method: 'GET',
  handler: () =>
    appfetch.json({
      employeeCode: generateCodeFromStore(
        employeeStore as unknown as Record<string, unknown>[],
        'employeeCode',
        'EMP-',
        3,
      ),
    }),
});

// ─── GET /profiles/employee/:employeeId/documents/:id ────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+\/documents\/[^/?]+$/,
  method: 'GET',
  handler: input => {
    const employeeId = extractIdFromUrl(toUrl(input), 'employee');
    const id = extractIdFromUrl(toUrl(input), 'documents');
    const document = documentStore.find(
      d => d.employeeId === employeeId && d.id === id,
    );
    if (!document)
      return appfetch.error(
        { code: 'NOT_FOUND', message: 'Không tìm thấy tài liệu' },
        404,
      );
    return appfetch.json(document);
  },
});

// ─── PUT /profiles/employee/:employeeId/documents/:id ────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+\/documents\/[^/?]+$/,
  method: 'PUT',
  handler: async (input, init) => {
    const employeeId = extractIdFromUrl(toUrl(input), 'employee');
    const id = extractIdFromUrl(toUrl(input), 'documents');
    const index = documentStore.findIndex(
      d => d.employeeId === employeeId && d.id === id,
    );
    if (index === -1)
      return appfetch.error(
        { code: 'NOT_FOUND', message: 'Không tìm thấy tài liệu' },
        404,
      );

    const body = await parseBody(input, init);
    documentStore[index] = {
      ...documentStore[index],
      ...(body as Partial<EmployeeDocumentMock>),
      id: documentStore[index].id,
      employeeId: documentStore[index].employeeId,
    };
    return appfetch.json(documentStore[index]);
  },
});

// ─── DELETE /profiles/employee/:employeeId/documents/:id ─────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+\/documents\/[^/?]+$/,
  method: 'DELETE',
  handler: input => {
    const employeeId = extractIdFromUrl(toUrl(input), 'employee');
    const id = extractIdFromUrl(toUrl(input), 'documents');
    const index = documentStore.findIndex(
      d => d.employeeId === employeeId && d.id === id,
    );
    if (index === -1)
      return appfetch.error(
        { code: 'NOT_FOUND', message: 'Không tìm thấy tài liệu' },
        404,
      );
    documentStore.splice(index, 1);
    return appfetch.empty();
  },
});

// ─── GET /documents?filters[...].field=employeeId ────────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/documents(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    return appfetch.json(
      buildMockListResponse({
        sp,
        items: documentStore,
        search: (d, searchTerm) =>
          [d.name, d.fileName, d.note]
            .filter(Boolean)
            .some(value => value!.toLowerCase().includes(searchTerm)),
      }),
    );
  },
});

// ─── POST /profiles/employee/:employeeId/documents ───────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+\/documents$/,
  method: 'POST',
  handler: async (input, init) => {
    const employeeId = extractIdFromUrl(toUrl(input), 'employee');
    const employee = getEmployeeOrNotFound(employeeId);
    if (employee instanceof Response) return employee;

    const body = await parseBody(input, init);
    const document: EmployeeDocumentMock = {
      ...(body as Partial<EmployeeDocumentMock>),
      id: uuidv4(),
      employeeId: employee.id,
      name:
        typeof body.name === 'string' && body.name
          ? body.name
          : 'Tài liệu nhân viên',
    };
    documentStore.unshift(document);
    return appfetch.json(document);
  },
});

// ─── GET /profiles/employee/:employeeId/qualifications ───────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+\/qualifications$/,
  method: 'GET',
  handler: input => {
    const employeeId = extractIdFromUrl(toUrl(input), 'employee');
    return appfetch.json(
      qualificationStore.filter(q => q.employeeId === employeeId),
    );
  },
});

// ─── POST /profiles/employee/:employeeId/qualifications ──────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+\/qualifications$/,
  method: 'POST',
  handler: async (input, init) => {
    const employeeId = extractIdFromUrl(toUrl(input), 'employee');
    const employee = getEmployeeOrNotFound(employeeId);
    if (employee instanceof Response) return employee;

    const body = await parseBody(input, init);
    const qualification: EmployeeQualificationMock = {
      ...(body as Partial<EmployeeQualificationMock>),
      id: uuidv4(),
      employeeId: employee.id,
    };
    qualificationStore.unshift(qualification);
    return appfetch.json(qualification);
  },
});

// ─── DELETE /profiles/employee/:employeeId/qualifications/:id ────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+\/qualifications\/[^/?]+$/,
  method: 'DELETE',
  handler: input => {
    const employeeId = extractIdFromUrl(toUrl(input), 'employee');
    const id = extractIdFromUrl(toUrl(input), 'qualifications');
    const index = qualificationStore.findIndex(
      q => q.employeeId === employeeId && q.id === id,
    );
    if (index === -1)
      return appfetch.error(
        { code: 'NOT_FOUND', message: 'Không tìm thấy bằng cấp' },
        404,
      );
    qualificationStore.splice(index, 1);
    return appfetch.empty();
  },
});

// ─── PUT /profiles/employee/:employeeId/qualifications/:id ───────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+\/qualifications\/[^/?]+$/,
  method: 'PUT',
  handler: async (input, init) => {
    const id = extractIdFromUrl(toUrl(input), 'qualifications');
    const index = qualificationStore.findIndex(q => q.id === id);
    if (index === -1)
      return appfetch.error(
        { code: 'NOT_FOUND', message: 'Không tìm thấy bằng cấp' },
        404,
      );

    const body = await parseBody(input, init);
    qualificationStore[index] = {
      ...qualificationStore[index],
      ...(body as Partial<EmployeeQualificationMock>),
      id: qualificationStore[index].id,
      employeeId:
        typeof body.employeeId === 'string'
          ? body.employeeId
          : qualificationStore[index].employeeId,
    };
    return appfetch.json(qualificationStore[index]);
  },
});

// ─── GET /profiles/employee/:employeeId/qualifications/:id ───────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+\/qualifications\/[^/?]+$/,
  method: 'GET',
  handler: input => {
    const id = extractIdFromUrl(toUrl(input), 'qualifications');
    const qualification = qualificationStore.find(q => q.id === id);
    if (!qualification)
      return appfetch.error(
        { code: 'NOT_FOUND', message: 'Không tìm thấy bằng cấp' },
        404,
      );
    return appfetch.json(qualification);
  },
});

// const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── GET /profiles/employee/by-users?userIds=a&userIds=b ────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/by-users(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    const userIds = sp
      .getAll('userIds')
      .flatMap(id => id.split(','))
      .map(id => id.trim())
      .filter(Boolean);

    const items = employeeStore
      .filter(e => e.userId && userIds.includes(e.userId))
      .map(buildEmployeePreview);

    return appfetch.json(items);
  },
});

// ─── GET /profiles/employee/preview ─────────────────────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/preview(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    return appfetch.json(
      buildMockListResponse({
        sp,
        items: employeeStore,
        search: searchEmployee,
        filter: filterEmployee,
        mapItem: buildEmployeePreview,
      }),
    );
  },
});

// ─── GET /profiles/employee/:id ──────────────────────────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+$/,
  method: 'GET',
  handler: async input => {
    // await delay(3000);
    const id = extractIdFromUrl(toUrl(input), 'employee');
    const employee = getEmployeeOrNotFound(id);
    if (employee instanceof Response) return employee;
    return appfetch.json(buildEmployeeDetails(employee));
  },
});

// ─── PUT /profiles/employee/:id ──────────────────────────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+$/,
  method: 'PUT',
  handler: async (input, init) => {
    const id = extractIdFromUrl(toUrl(input), 'employee');
    const employee = getEmployeeOrNotFound(id);
    if (employee instanceof Response) return employee;

    const body = await parseBody(input, init);
    mergeEmployee(employee, body);
    return appfetch.json(buildEmployeeDetails(employee));
  },
});

// ─── DELETE /profiles/employee/:id ───────────────────────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+$/,
  method: 'DELETE',
  handler: input => {
    const id = extractIdFromUrl(toUrl(input), 'employee');
    const index = employeeStore.findIndex(e => e.id === id);
    if (index === -1)
      return appfetch.error(
        { code: 'NOT_FOUND', message: 'Không tìm thấy nhân viên' },
        404,
      );
    employeeStore.splice(index, 1);
    for (let i = qualificationStore.length - 1; i >= 0; i--) {
      if (qualificationStore[i].employeeId === id)
        qualificationStore.splice(i, 1);
    }
    for (let i = documentStore.length - 1; i >= 0; i--) {
      if (documentStore[i].employeeId === id) documentStore.splice(i, 1);
    }
    return appfetch.empty();
  },
});

// ─── POST /profiles/employee ─────────────────────────────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee$/,
  method: 'POST',
  handler: async (input, init) => {
    const body = await parseBody(input, init);
    const employee = createEmployeeFromBody(body);
    return appfetch.json(buildEmployeePreview(employee));
  },
});

// ─── GET /profiles/employees/filter-options ──────────────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employees\/filter-options(\?.*)?$/,
  method: 'GET',
  handler: () => {
    const dedupe = (pairs: { code: string; name: string }[]) =>
      Array.from(new Map(pairs.map(p => [p.code, p])).values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      );

    return appfetch.json({
      organizationUnits: dedupe(
        employeeStore.map(e => ({
          code: e.jobInfo.organizationUnitCode,
          name: e.jobInfo.organizationUnitName,
        })),
      ),
      jobPositions: dedupe(
        employeeStore.map(e => ({
          code: e.jobInfo.jobPositionCode,
          name: e.jobInfo.jobPositionName,
        })),
      ),
    });
  },
});

// ─── GET /profiles/employees ─────────────────────────────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employees(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    return appfetch.json(
      buildMockListResponse({
        sp,
        items: employeeStore,
        search: searchEmployee,
        filter: filterEmployee,
        mapItem: buildEmployeePreview,
      }),
    );
  },
});

// ─── GET /profiles/me ────────────────────────────────────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/me$/,
  method: 'GET',
  handler: () => {
    const e = employeeStore.find(emp => emp.userId === getCurrentUserId());
    if (!e)
      return appfetch.error(
        { code: 'NOT_FOUND', message: 'Không tìm thấy thông tin nhân viên' },
        404,
      );
    return appfetch.json(buildEmployeeDetails(e));
  },
});

// ─── GET /profiles/employees/by-organization-and-position ────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employees\/by-organization-and-position(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    const orgCode = sp.get('organizationUnitCode');
    const posCode = sp.get('jobPositionCode');

    const items = employeeStore
      .filter(e => {
        if (orgCode && e.jobInfo.organizationUnitCode !== orgCode) return false;
        if (posCode && e.jobInfo.jobPositionCode !== posCode) return false;
        return true;
      })
      .map(buildEmployeePreview);

    return appfetch.json(items);
  },
});

// ─── GET /profiles/employee/:id/managers ────────────────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+\/managers(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const employeeId = extractIdFromUrl(toUrl(input), 'employee');
    const employee = employeeStore.find(e => e.id === employeeId);
    if (!employee)
      return appfetch.error(
        { code: 'NOT_FOUND', message: 'Không tìm thấy nhân viên' },
        404,
      );

    if (!employee.jobInfo.managerId) return appfetch.json(null);

    const manager = employeeStore.find(
      e => e.id === employee.jobInfo.managerId,
    );
    if (!manager) return appfetch.json(null);

    return appfetch.json(buildEmployeePreview(manager));
  },
});

// ─── GET /profiles/employee/:id/preview ─────────────────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/profiles\/employee\/[^/?]+\/preview$/,
  method: 'GET',
  handler: input => {
    const urlStr = toUrl(input);
    const segments = urlStr.split('/');
    const id = segments[segments.length - 2];
    const e = employeeStore.find(emp => emp.id === id);
    if (!e)
      return appfetch.error(
        { code: 'NOT_FOUND', message: 'Không tìm thấy nhân viên' },
        404,
      );
    return appfetch.json(buildEmployeePreview(e));
  },
});
