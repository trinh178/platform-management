import { appfetch } from '@/core/network/appfetch';
import hrmemHttpRequest from '@/core/network/hrmem-http-request';

const JOB_POSITION_LEVELS = {
  leader: {
    id: 'c3d4e5f6-0001-4a7b-8c8d-100000000001',
    name: 'Lãnh đạo',
    code: 'LEADER',
    level: 1,
  },
  manager: {
    id: 'c3d4e5f6-0002-4a7b-8c8d-100000000002',
    name: 'Quản lý',
    code: 'MANAGER',
    level: 2,
  },
  staff: {
    id: 'c3d4e5f6-0003-4a7b-8c8d-100000000003',
    name: 'Nhân viên',
    code: 'STAFF',
    level: 3,
  },
};

const ORG_UNIT_LEVELS = {
  l1: {
    id: 'd4e5f6a7-0001-4b8c-9d9e-200000000001',
    name: 'Cấp 1',
    code: 'L1',
    level: 1,
  },
  l2: {
    id: 'd4e5f6a7-0002-4b8c-9d9e-200000000002',
    name: 'Cấp 2',
    code: 'L2',
    level: 2,
  },
  l3: {
    id: 'd4e5f6a7-0003-4b8c-9d9e-200000000003',
    name: 'Cấp 3',
    code: 'L3',
    level: 3,
  },
};

const hierarchy = [
  {
    id: 'e5f6a7b8-0001-4c9d-ae1f-300000000001',
    name: 'Ban Giám đốc',
    code: 'BOD',
    level: ORG_UNIT_LEVELS.l1,
    jobPositions: [
      {
        id: 'f6a7b8c9-0001-4d1e-bf2a-400000000001',
        name: 'Giám đốc',
        code: 'DIRECTOR',
        isManager: true,
        level: JOB_POSITION_LEVELS.leader,
      },
    ],
    children: [
      {
        id: 'e5f6a7b8-0002-4c9d-ae1f-300000000002',
        name: 'Phòng Nhân sự',
        code: 'HR',
        level: ORG_UNIT_LEVELS.l2,
        jobPositions: [
          {
            id: 'f6a7b8c9-0002-4d1e-bf2a-400000000002',
            name: 'Trưởng phòng Nhân sự',
            code: 'HR_MANAGER',
            isManager: true,
            level: JOB_POSITION_LEVELS.manager,
          },
          {
            id: 'f6a7b8c9-0003-4d1e-bf2a-400000000003',
            name: 'Nhân viên Nhân sự',
            code: 'HR_STAFF',
            isManager: false,
            level: JOB_POSITION_LEVELS.staff,
          },
        ],
        children: [],
      },
      {
        id: 'e5f6a7b8-0003-4c9d-ae1f-300000000003',
        name: 'Phòng Vận hành',
        code: 'OPS',
        level: ORG_UNIT_LEVELS.l2,
        jobPositions: [
          {
            id: 'f6a7b8c9-0004-4d1e-bf2a-400000000004',
            name: 'Trưởng phòng Vận hành',
            code: 'OPS_MANAGER',
            isManager: true,
            level: JOB_POSITION_LEVELS.manager,
          },
        ],
        children: [
          {
            id: 'e5f6a7b8-0004-4c9d-ae1f-300000000004',
            name: 'Đội xe',
            code: 'FLEET',
            level: ORG_UNIT_LEVELS.l3,
            jobPositions: [
              {
                id: 'f6a7b8c9-0005-4d1e-bf2a-400000000005',
                name: 'Quản lý Đội xe',
                code: 'FLEET_MANAGER',
                isManager: true,
                level: JOB_POSITION_LEVELS.manager,
              },
              {
                id: 'f6a7b8c9-0006-4d1e-bf2a-400000000006',
                name: 'Tài xế',
                code: 'DRIVER',
                isManager: false,
                level: JOB_POSITION_LEVELS.staff,
              },
            ],
            children: [],
          },
        ],
      },
      {
        id: 'e5f6a7b8-0005-4c9d-ae1f-300000000005',
        name: 'Phòng Tài chính',
        code: 'FIN',
        level: ORG_UNIT_LEVELS.l2,
        jobPositions: [
          {
            id: 'f6a7b8c9-0007-4d1e-bf2a-400000000007',
            name: 'Trưởng phòng Tài chính',
            code: 'FIN_MANAGER',
            isManager: true,
            level: JOB_POSITION_LEVELS.manager,
          },
          {
            id: 'f6a7b8c9-0008-4d1e-bf2a-400000000008',
            name: 'Kế toán',
            code: 'ACCOUNTANT',
            isManager: false,
            level: JOB_POSITION_LEVELS.staff,
          },
        ],
        children: [],
      },
    ],
  },
];

// ─── GET /organizations/unit/hierarchy ───────────────────────────────────────
hrmemHttpRequest.addMockRoute({
  url: /\/organizations\/unit\/hierarchy(\?.*)?$/,
  method: 'GET',
  handler: () => appfetch.json(hierarchy),
});
