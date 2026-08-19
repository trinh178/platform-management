'use client';

import React from 'react';
import {
  CircleAlert,
  Eraser,
  Eye,
  Pencil,
  RotateCcw,
  Send,
  SquarePen,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DateRange } from 'react-day-picker';
import { useForm, useWatch } from 'react-hook-form';
import { ConstantBase } from '@/core/constants';
import PageContentHeader from '@/core/layout/page-content-header';
import type { AddressCode } from '@/shared/components/address';
import FieldGroupInlineEdit from '@/shared/components/form/field-group-inline-edit';
import FieldInputAddress from '@/shared/components/form/field-input-address';
import FieldInputAlphaText from '@/shared/components/form/field-input-alpha-text';
import FieldInputArrayTable from '@/shared/components/form/field-input-array-table';
import FieldInputAsyncMultiSelect from '@/shared/components/form/field-input-async-multi-select';
import FieldInputAsyncSelect, {
  FieldInputAsyncSelectOption,
} from '@/shared/components/form/field-input-async-select';
import FieldInputAvatar, {
  FieldInputAvatarValue,
} from '@/shared/components/form/field-input-avatar';
import FieldInputCheckboxGroup from '@/shared/components/form/field-input-checkbox-group';
import FieldInputCombobox from '@/shared/components/form/field-input-combobox';
import FieldInputConstant from '@/shared/components/form/field-input-constant';
import FieldInputCountry from '@/shared/components/form/field-input-country';
import FieldInputCurrency from '@/shared/components/form/field-input-currency';
import FieldInputDate from '@/shared/components/form/field-input-date';
import FieldInputDateRange from '@/shared/components/form/field-input-date-range';
import FieldInputDateTime from '@/shared/components/form/field-input-date-time';
import FieldInputEmail from '@/shared/components/form/field-input-email';
import FieldInputEntityAsyncMultiSelect from '@/shared/components/form/field-input-entity-async-multi-select';
import FieldInputEntityAsyncSelect from '@/shared/components/form/field-input-entity-async-select';
import FieldInputEntityMultiSelect from '@/shared/components/form/field-input-entity-multi-select';
import FieldInputEntitySelect from '@/shared/components/form/field-input-entity-select';
import FieldInputEntityTable from '@/shared/components/form/field-input-entity-table';
import FieldInputFileUpload, {
  FieldInputFileUploadValue,
} from '@/shared/components/form/field-input-file-upload';
import FieldInputGeneratedText from '@/shared/components/form/field-input-generated-text';
import FieldInputJson from '@/shared/components/form/field-input-json';
import FieldInputMasked from '@/shared/components/form/field-input-masked';
import FieldInputMultiCombobox from '@/shared/components/form/field-input-multi-combobox';
import FieldInputMultiSelect from '@/shared/components/form/field-input-multi-select';
import FieldInputNumber from '@/shared/components/form/field-input-number';
import FieldInputNumeric from '@/shared/components/form/field-input-numeric';
import FieldInputPassword from '@/shared/components/form/field-input-password';
import FieldInputPercent from '@/shared/components/form/field-input-percent';
import FieldInputPersonName from '@/shared/components/form/field-input-person-name';
import FieldInputPhoneNumber from '@/shared/components/form/field-input-phone-number';
import FieldInputRadioGroup from '@/shared/components/form/field-input-radio-group';
import FieldInputSelect from '@/shared/components/form/field-input-select';
import FieldInputSliderNumber from '@/shared/components/form/field-input-slider-number';
import FieldInputSwitch from '@/shared/components/form/field-input-switch';
import FieldInputText from '@/shared/components/form/field-input-text';
import FieldInputTextArea from '@/shared/components/form/field-input-textarea';
import FieldInputTime from '@/shared/components/form/field-input-time';
import FieldInputTreeEntitySelect from '@/shared/components/form/field-input-tree-entity-select';
import FieldInputTreeSelect from '@/shared/components/form/field-input-tree-select';
import FieldInputYear from '@/shared/components/form/field-input-year';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@/shared/components/ui/field';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/shared/components/ui/toggle-group';
import { cn } from '@/shared/lib/utils';

type Priority = 'low' | 'medium' | 'high';
type PlaygroundMode = 'view' | 'edit' | 'inline';

type EntityTableRow = {
  id: string;
  name: string;
  qty: number;
};

type ArrayTableRow = {
  name: string;
  note: string;
};

type EmployeeEntityOption = {
  id: string;
  employeeCode: string;
  fullName: string;
  departmentName: string;
};

type TreeEntityNode = {
  code: string;
  name: string;
  children?: TreeEntityNode[];
};

type FieldGuideFormValues = {
  text: string;
  textarea: string;
  number?: number;
  sliderNumber?: number;
  numeric: string;
  masked: string;
  password: string;
  percent?: number;
  year?: number;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  currency?: number;
  date?: Date;
  dateTime?: Date;
  time: string;
  dateRange?: DateRange;
  select: string;
  combobox: string;
  multiCombobox: string[];
  multiSelect: string[];
  radioGroup: Priority;
  checkboxGroup: string[];
  constant: Priority;
  treeSelect: string;
  switch: boolean;
  address?: AddressCode;
  country: string;
  generatedText: string;
  asyncSelect: string;
  asyncMultiSelect: string[];
  entitySelect?: EmployeeEntityOption;
  entityMultiSelect: EmployeeEntityOption[];
  entityAsyncSelect?: EmployeeEntityOption;
  entityAsyncMultiSelect: EmployeeEntityOption[];
  avatar?: FieldInputAvatarValue;
  fileUpload?: FieldInputFileUploadValue;
  fileUploadMultiple: FieldInputFileUploadValue[];
  entityTable: EntityTableRow[];
  arrayTable: ArrayTableRow[];
  groupField1: string;
  groupField2: string;
  alphaText: string;
  personName: string;
  treeEntitySelect?: TreeEntityNode;
  json: string;
};

type GuideRow = {
  component: string;
  valueType: string;
  useCase: string;
  note: string;
};

type GuideRowGroup = {
  name: string;
  rows: GuideRow[];
};

type BasePropRow = {
  name: string;
  type: string;
  defaultValue: string;
  description: string;
};

const CONST_PRIORITY: ConstantBase<Priority>[] = [
  { label: 'formGuide.constants.priority.low', value: 'low' },
  { label: 'formGuide.constants.priority.medium', value: 'medium' },
  { label: 'formGuide.constants.priority.high', value: 'high' },
];

const selectOptions = [
  { label: 'HR Department', value: 'hr' },
  { label: 'IT Department', value: 'it' },
  { label: 'Finance Department', value: 'finance' },
];

const multiSelectOptions = [
  { label: 'Health Insurance', value: 'health-insurance' },
  { label: 'Annual Leave', value: 'annual-leave' },
  { label: 'Training Budget', value: 'training-budget' },
  { label: 'Laptop Allowance', value: 'laptop-allowance' },
  { label: 'Remote Work', value: 'remote-work' },
];

const treeOptions = [
  {
    label: 'Engineering',
    value: 'engineering',
    children: [
      { label: 'Frontend', value: 'engineering-frontend' },
      { label: 'Backend', value: 'engineering-backend' },
    ],
  },
  {
    label: 'Operations',
    value: 'operations',
    children: [
      { label: 'HR', value: 'operations-hr' },
      { label: 'Finance', value: 'operations-finance' },
    ],
  },
];

const treeEntityNodes: TreeEntityNode[] = [
  {
    code: 'engineering',
    name: 'Engineering',
    children: [
      { code: 'engineering-frontend', name: 'Frontend' },
      { code: 'engineering-backend', name: 'Backend' },
    ],
  },
  {
    code: 'operations',
    name: 'Operations',
    children: [
      { code: 'operations-hr', name: 'HR' },
      { code: 'operations-finance', name: 'Finance' },
    ],
  },
];

const asyncOptions = [
  { label: 'Project Management', value: 'pmp' },
  { label: 'Data Analysis', value: 'data-analysis' },
  { label: 'Leadership Training', value: 'leadership' },
  { label: 'English Certificate', value: 'english-cert' },
];

const entityOptions: EmployeeEntityOption[] = [
  {
    id: 'emp-001',
    employeeCode: 'EMP-000001',
    fullName: 'Nguyen Van A',
    departmentName: 'Operations',
  },
  {
    id: 'emp-002',
    employeeCode: 'EMP-000002',
    fullName: 'Tran Thi B',
    departmentName: 'Finance',
  },
  {
    id: 'emp-003',
    employeeCode: 'EMP-000003',
    fullName: 'Le Van C',
    departmentName: 'Engineering',
  },
];

const defaultValues: FieldGuideFormValues = {
  text: 'EMP-000001',
  textarea: 'Employee notes for field guide',
  number: 5,
  sliderNumber: 70,
  numeric: '0123456789',
  masked: '123456789',
  password: 'secret123',
  percent: 80,
  year: 2020,
  email: 'employee@example.com',
  phoneCountryCode: '+84',
  phoneNumber: '0901234567',
  currency: 15000000,
  date: new Date(),
  dateTime: new Date(),
  time: '08:30',
  dateRange: {
    from: new Date(),
    to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  select: 'hr',
  combobox: 'pmp',
  multiCombobox: ['health-insurance', 'remote-work'],
  multiSelect: ['health-insurance', 'annual-leave'],
  radioGroup: 'medium',
  checkboxGroup: ['health-insurance', 'training-budget'],
  constant: 'medium',
  treeSelect: 'engineering-frontend',
  switch: true,
  address: undefined,
  country: 'VN',
  generatedText: '',
  asyncSelect: 'pmp',
  asyncMultiSelect: ['pmp', 'data-analysis'],
  entitySelect: entityOptions[0],
  entityMultiSelect: [entityOptions[0], entityOptions[2]],
  entityAsyncSelect: entityOptions[1],
  entityAsyncMultiSelect: [entityOptions[1], entityOptions[2]],
  avatar: {
    id: 'employee-avatar',
    name: 'employee-avatar.png',
    url: 'https://i.pravatar.cc/160?img=12',
    type: 'image/png',
  },
  fileUpload: {
    id: 'id-card',
    name: 'id-card.pdf',
    size: 245760,
    type: 'application/pdf',
  },
  fileUploadMultiple: [
    {
      id: 'contract',
      name: 'employment-contract.pdf',
      size: 512000,
      type: 'application/pdf',
    },
    {
      id: 'profile-photo',
      name: 'profile-photo.jpg',
      size: 734003,
      type: 'image/jpeg',
    },
  ],
  entityTable: [
    { id: 'skill-001', name: 'Project Management', qty: 2 },
    { id: 'skill-002', name: 'Data Analysis', qty: 1 },
  ],
  arrayTable: [
    { name: 'Bachelor of Computer Science', note: 'Ho Chi Minh University' },
    { name: 'PMP Certificate', note: 'Annual renewal' },
  ],
  groupField1: 'Group value one',
  groupField2: 'Group value two',
  alphaText: 'Nguyen Van A',
  personName: 'Le Thi Bich',
  treeEntitySelect: { code: 'engineering-frontend', name: 'Frontend' },
  json: '{\n  "status": "active",\n  "score": 92\n}',
};

function delay<T>(value: T, ms = 350) {
  return new Promise<T>(resolve => {
    window.setTimeout(() => resolve(value), ms);
  });
}

function filterOptions<TOption extends FieldInputAsyncSelectOption>(
  options: TOption[],
  keyword: string,
) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (!normalizedKeyword) return options;

  return options.filter(option =>
    option.label.toLowerCase().includes(normalizedKeyword),
  );
}

export default function FieldInputGuide() {
  const t = useTranslations('formGuide');
  const [playgroundMode, setPlaygroundMode] =
    React.useState<PlaygroundMode>('edit');
  const form = useForm<FieldGuideFormValues>({
    defaultValues,
  });
  const values = useWatch({ control: form.control });
  const fieldModeProps = React.useMemo(
    () => ({
      mode: playgroundMode === 'view' ? ('VIEW' as const) : ('EDIT' as const),
      inlineEdit: playgroundMode === 'inline',
      clearable: true,
      onInlineSave: (name: keyof FieldGuideFormValues, value: unknown) => {
        console.log('Field input guide inline save', { name, value });
      },
    }),
    [playgroundMode],
  );

  const guideRows = React.useMemo<GuideRow[]>(
    () => [
      {
        component: 'FieldInputText',
        valueType: 'string',
        useCase: t('catalog.text.useCase'),
        note: t('catalog.text.note'),
      },
      {
        component: 'FieldInputTextArea',
        valueType: 'string',
        useCase: t('catalog.textarea.useCase'),
        note: t('catalog.textarea.note'),
      },
      {
        component: 'FieldInputNumber',
        valueType: 'number | undefined',
        useCase: t('catalog.number.useCase'),
        note: t('catalog.number.note'),
      },
      {
        component: 'FieldInputSliderNumber',
        valueType: 'number | undefined',
        useCase: t('catalog.sliderNumber.useCase'),
        note: t('catalog.sliderNumber.note'),
      },
      {
        component: 'FieldInputNumeric',
        valueType: 'string',
        useCase: t('catalog.numeric.useCase'),
        note: t('catalog.numeric.note'),
      },
      {
        component: 'FieldInputMasked',
        valueType: 'string',
        useCase: t('catalog.masked.useCase'),
        note: t('catalog.masked.note'),
      },
      {
        component: 'FieldInputPassword',
        valueType: 'string',
        useCase: t('catalog.password.useCase'),
        note: t('catalog.password.note'),
      },
      {
        component: 'FieldInputPercent',
        valueType: 'number | undefined',
        useCase: t('catalog.percent.useCase'),
        note: t('catalog.percent.note'),
      },
      {
        component: 'FieldInputYear',
        valueType: 'number | undefined',
        useCase: t('catalog.year.useCase'),
        note: t('catalog.year.note'),
      },
      {
        component: 'FieldInputEmail',
        valueType: 'string',
        useCase: t('catalog.email.useCase'),
        note: t('catalog.email.note'),
      },
      {
        component: 'FieldInputPhoneNumber',
        valueType: 'string',
        useCase: t('catalog.phone.useCase'),
        note: t('catalog.phone.note'),
      },
      {
        component: 'FieldInputCurrency',
        valueType: 'number | undefined',
        useCase: t('catalog.currency.useCase'),
        note: t('catalog.currency.note'),
      },
      {
        component: 'FieldInputDate',
        valueType: 'Date | undefined',
        useCase: t('catalog.date.useCase'),
        note: t('catalog.date.note'),
      },
      {
        component: 'FieldInputDateTime',
        valueType: 'Date | undefined',
        useCase: t('catalog.dateTime.useCase'),
        note: t('catalog.dateTime.note'),
      },
      {
        component: 'FieldInputTime',
        valueType: 'string',
        useCase: t('catalog.time.useCase'),
        note: t('catalog.time.note'),
      },
      {
        component: 'FieldInputDateRange',
        valueType: '{ from?: Date; to?: Date } | undefined',
        useCase: t('catalog.dateRange.useCase'),
        note: t('catalog.dateRange.note'),
      },
      {
        component: 'FieldInputSelect',
        valueType: 'string',
        useCase: t('catalog.select.useCase'),
        note: t('catalog.select.note'),
      },
      {
        component: 'FieldInputCombobox',
        valueType: 'string',
        useCase: t('catalog.combobox.useCase'),
        note: t('catalog.combobox.note'),
      },
      {
        component: 'FieldInputMultiCombobox',
        valueType: 'string[]',
        useCase: t('catalog.multiCombobox.useCase'),
        note: t('catalog.multiCombobox.note'),
      },
      {
        component: 'FieldInputMultiSelect',
        valueType: 'string[]',
        useCase: t('catalog.multiSelect.useCase'),
        note: t('catalog.multiSelect.note'),
      },
      {
        component: 'FieldInputRadioGroup',
        valueType: 'string',
        useCase: t('catalog.radioGroup.useCase'),
        note: t('catalog.radioGroup.note'),
      },
      {
        component: 'FieldInputCheckboxGroup',
        valueType: 'string[]',
        useCase: t('catalog.checkboxGroup.useCase'),
        note: t('catalog.checkboxGroup.note'),
      },
      {
        component: 'FieldInputConstant',
        valueType: 'string literal',
        useCase: t('catalog.constant.useCase'),
        note: t('catalog.constant.note'),
      },
      {
        component: 'FieldInputTreeSelect',
        valueType: 'string',
        useCase: t('catalog.tree.useCase'),
        note: t('catalog.tree.note'),
      },
      {
        component: 'FieldInputSwitch',
        valueType: 'boolean',
        useCase: t('catalog.switch.useCase'),
        note: t('catalog.switch.note'),
      },
      {
        component: 'FieldInputAddress',
        valueType: 'AddressCode',
        useCase: t('catalog.address.useCase'),
        note: t('catalog.address.note'),
      },
      {
        component: 'FieldInputCountry',
        valueType: 'string',
        useCase: t('catalog.country.useCase'),
        note: t('catalog.country.note'),
      },
      {
        component: 'FieldInputGeneratedText',
        valueType: 'string',
        useCase: t('catalog.generated.useCase'),
        note: t('catalog.generated.note'),
      },
      {
        component: 'FieldInputAsyncSelect',
        valueType: 'string',
        useCase: t('catalog.async.useCase'),
        note: t('catalog.async.note'),
      },
      {
        component: 'FieldInputAsyncMultiSelect',
        valueType: 'string[]',
        useCase: t('catalog.asyncMulti.useCase'),
        note: t('catalog.asyncMulti.note'),
      },
      {
        component: 'FieldInputEntitySelect',
        valueType: 'EmployeeEntityOption | undefined',
        useCase: t('catalog.entity.useCase'),
        note: t('catalog.entity.note'),
      },
      {
        component: 'FieldInputEntityMultiSelect',
        valueType: 'EmployeeEntityOption[]',
        useCase: t('catalog.entityMulti.useCase'),
        note: t('catalog.entityMulti.note'),
      },
      {
        component: 'FieldInputEntityAsyncSelect',
        valueType: 'EmployeeEntityOption | undefined',
        useCase: t('catalog.entityAsync.useCase'),
        note: t('catalog.entityAsync.note'),
      },
      {
        component: 'FieldInputEntityAsyncMultiSelect',
        valueType: 'EmployeeEntityOption[]',
        useCase: t('catalog.entityAsyncMulti.useCase'),
        note: t('catalog.entityAsyncMulti.note'),
      },
      {
        component: 'FieldInputAvatar',
        valueType: 'AvatarValue | undefined',
        useCase: t('catalog.avatar.useCase'),
        note: t('catalog.avatar.note'),
      },
      {
        component: 'FieldInputFileUpload',
        valueType: 'FileUploadValue | FileUploadValue[] | undefined',
        useCase: t('catalog.fileUpload.useCase'),
        note: t('catalog.fileUpload.note'),
      },
      {
        component: 'FieldInputEntityTable',
        valueType: 'TRow[]',
        useCase: t('catalog.entityTable.useCase'),
        note: t('catalog.entityTable.note'),
      },
      {
        component: 'FieldInputArrayTable',
        valueType: 'TRow[]',
        useCase: t('catalog.arrayTable.useCase'),
        note: t('catalog.arrayTable.note'),
      },
      {
        component: 'FieldInputAlphaText',
        valueType: 'string',
        useCase: t('catalog.alphaText.useCase'),
        note: t('catalog.alphaText.note'),
      },
      {
        component: 'FieldInputPersonName',
        valueType: 'string',
        useCase: t('catalog.personName.useCase'),
        note: t('catalog.personName.note'),
      },
      {
        component: 'FieldInputTreeEntitySelect',
        valueType: 'string',
        useCase: t('catalog.treeEntitySelect.useCase'),
        note: t('catalog.treeEntitySelect.note'),
      },
      {
        component: 'FieldInputJson',
        valueType: 'string',
        useCase: t('catalog.json.useCase'),
        note: t('catalog.json.note'),
      },
    ],
    [t],
  );

  const guideRowGroups = React.useMemo<GuideRowGroup[]>(() => {
    const byComponent = new Map(
      guideRows.map(row => [row.component, row] as const),
    );
    const buildGroup = (name: string, components: string[]) => ({
      name,
      rows: components
        .map(component => byComponent.get(component))
        .filter((row): row is GuideRow => Boolean(row)),
    });

    return [
      buildGroup(t('sections.text'), [
        'FieldInputText',
        'FieldInputTextArea',
        'FieldInputAlphaText',
        'FieldInputPersonName',
        'FieldInputJson',
        'FieldInputMasked',
        'FieldInputPassword',
        'FieldInputEmail',
        'FieldInputPhoneNumber',
        'FieldInputGeneratedText',
      ]),
      buildGroup(t('sections.numeric'), [
        'FieldInputNumber',
        'FieldInputSliderNumber',
        'FieldInputNumeric',
        'FieldInputPercent',
        'FieldInputYear',
        'FieldInputCurrency',
      ]),
      buildGroup(t('sections.dateTime'), [
        'FieldInputDate',
        'FieldInputDateTime',
        'FieldInputTime',
        'FieldInputDateRange',
      ]),
      buildGroup(t('sections.choice'), [
        'FieldInputRadioGroup',
        'FieldInputCheckboxGroup',
        'FieldInputConstant',
        'FieldInputSwitch',
      ]),
      buildGroup(t('sections.select'), [
        'FieldInputSelect',
        'FieldInputMultiSelect',
        'FieldInputAsyncSelect',
        'FieldInputAsyncMultiSelect',
      ]),
      buildGroup(t('sections.entitySelect'), [
        'FieldInputEntitySelect',
        'FieldInputEntityMultiSelect',
        'FieldInputEntityAsyncSelect',
        'FieldInputEntityAsyncMultiSelect',
      ]),
      buildGroup(t('sections.comboTree'), [
        'FieldInputCombobox',
        'FieldInputMultiCombobox',
        'FieldInputTreeSelect',
        'FieldInputTreeEntitySelect',
      ]),
      buildGroup(t('sections.location'), [
        'FieldInputAddress',
        'FieldInputCountry',
      ]),
      buildGroup(t('sections.files'), [
        'FieldInputAvatar',
        'FieldInputFileUpload',
      ]),
      buildGroup(t('sections.tables'), [
        'FieldInputEntityTable',
        'FieldInputArrayTable',
      ]),
    ].filter(group => group.rows.length > 0);
  }, [guideRows, t]);

  const basePropsRows = React.useMemo<BasePropRow[]>(
    () => [
      {
        name: 'label',
        type: 'string | undefined',
        defaultValue: 'undefined',
        description: t('base.props.label'),
      },
      {
        name: 'description',
        type: 'string',
        defaultValue: '—',
        description: t('base.props.description'),
      },
      {
        name: 'tooltip',
        type: 'string',
        defaultValue: '—',
        description: t('base.props.tooltip'),
      },
      {
        name: 'required',
        type: 'boolean',
        defaultValue: 'false',
        description: t('base.props.required'),
      },
      {
        name: 'form',
        type: 'UseFormReturn',
        defaultValue: '—',
        description: t('base.props.form'),
      },
      {
        name: 'name',
        type: 'FieldPath<T>',
        defaultValue: '—',
        description: t('base.props.name'),
      },
      {
        name: 'mode',
        type: "'VIEW' | 'EDIT'",
        defaultValue: "'EDIT'",
        description: t('base.props.mode'),
      },
      {
        name: 'inlineEdit',
        type: 'boolean',
        defaultValue: 'false',
        description: t('base.props.inlineEdit'),
      },
      {
        name: 'onInlineSave',
        type: '(name, value) => void',
        defaultValue: '—',
        description: t('base.props.onInlineSave'),
      },
      {
        name: 'loading',
        type: 'boolean',
        defaultValue: 'false',
        description: t('base.props.loading'),
      },
      {
        name: 'disabled',
        type: 'boolean',
        defaultValue: 'false',
        description: t('base.props.disabled'),
      },
      {
        name: 'clearable',
        type: 'boolean',
        defaultValue: 'false',
        description: t('base.props.clearable'),
      },
      {
        name: 'clearValue',
        type: 'T | undefined',
        defaultValue: 'undefined',
        description: t('base.props.clearValue'),
      },
      {
        name: 'isClearableValue',
        type: '(value) => boolean',
        defaultValue: '—',
        description: t('base.props.isClearableValue'),
      },
      {
        name: 'clearButtonPlacement',
        type: "'base' | 'manual'",
        defaultValue: "'base'",
        description: t('base.props.clearButtonPlacement'),
      },
      {
        name: 'resetButtonPlacement',
        type: "'base' | 'manual'",
        defaultValue: "'base'",
        description: t('base.props.resetButtonPlacement'),
      },
      {
        name: 'editButtonPlacement',
        type: "'base' | 'manual'",
        defaultValue: "'base'",
        description: t('base.props.editButtonPlacement'),
      },
      {
        name: 'onValueChange',
        type: '(value, name, form) => void',
        defaultValue: '—',
        description: t('base.props.onValueChange'),
      },
      {
        name: 'placeholder',
        type: 'string',
        defaultValue: '—',
        description: t('base.props.placeholder'),
      },
      {
        name: 'className',
        type: 'string',
        defaultValue: '—',
        description: t('base.props.className'),
      },
      {
        name: 'fieldControlsClassName',
        type: 'string',
        defaultValue: '—',
        description: t('base.props.fieldControlsClassName'),
      },
    ],
    [t],
  );

  const loadAsyncOptions = React.useCallback((keyword: string) => {
    return delay(filterOptions(asyncOptions, keyword));
  }, []);

  const loadAsyncOption = React.useCallback((value: string) => {
    return delay(asyncOptions.find(option => option.value === value));
  }, []);

  const loadEntityAsyncOptions = React.useCallback((keyword: string) => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) return delay(entityOptions);

    return delay(
      entityOptions.filter(entity => {
        const label = `${entity.employeeCode} ${entity.fullName} ${entity.departmentName}`;

        return label.toLowerCase().includes(normalizedKeyword);
      }),
    );
  }, []);

  const loadEntityAsyncOption = React.useCallback((value: string) => {
    return delay(entityOptions.find(entity => entity.id === value));
  }, []);

  const entityTableOptions: EntityTableRow[] = React.useMemo(
    () => [
      { id: 'skill-001', name: 'Project Management', qty: 1 },
      { id: 'skill-002', name: 'Data Analysis', qty: 1 },
      { id: 'skill-003', name: 'Leadership Training', qty: 1 },
      { id: 'skill-004', name: 'English Certificate', qty: 1 },
      { id: 'skill-005', name: 'Agile / Scrum', qty: 1 },
    ],
    [],
  );

  const loadEntityTableOptions = React.useCallback(
    (keyword: string) => {
      const k = keyword.trim().toLowerCase();
      const filtered = k
        ? entityTableOptions.filter(r => r.name.toLowerCase().includes(k))
        : entityTableOptions;
      return delay(filtered);
    },
    [entityTableOptions],
  );

  const handleShowErrors = React.useCallback(() => {
    const errorFields: (keyof FieldGuideFormValues)[] = [
      'text',
      'number',
      'masked',
      'password',
      'percent',
      'phoneNumber',
      'year',
      'date',
      'dateTime',
      'time',
      'dateRange',
      'select',
      'combobox',
      'multiCombobox',
      'multiSelect',
      'radioGroup',
      'checkboxGroup',
      'treeSelect',
      'address',
      'asyncSelect',
      'asyncMultiSelect',
      'entitySelect',
      'entityMultiSelect',
      'entityAsyncSelect',
      'entityAsyncMultiSelect',
      'avatar',
      'fileUpload',
      'fileUploadMultiple',
      'generatedText',
      'entityTable',
      'arrayTable',
      'alphaText',
      'personName',
      'treeEntitySelect',
      'json',
    ];

    errorFields.forEach(fieldName => {
      form.setError(fieldName, {
        type: 'manual',
        message: t('errorShowcase.message'),
      });
    });
  }, [form, t]);

  const handleClearErrors = React.useCallback(() => {
    form.clearErrors();
  }, [form]);

  const handleReset = React.useCallback(() => {
    form.reset(defaultValues);
    form.clearErrors();
  }, [form]);

  const handleSubmit = form.handleSubmit(data => {
    console.log('Field input guide submit', data);
  });

  return (
    <>
      <PageContentHeader
        title="formGuide.title"
        actions={
          <>
            <Button
              variant="outline"
              icon={<CircleAlert />}
              onClick={handleShowErrors}
            >
              {t('control.showErrors')}
            </Button>
            <Button
              variant="outline"
              icon={<Eraser />}
              onClick={handleClearErrors}
            >
              {t('control.clearErrors')}
            </Button>
            <Button
              variant="outline"
              icon={<RotateCcw />}
              onClick={handleReset}
            >
              {t('control.reset')}
            </Button>
            <Button icon={<Send />} onClick={handleSubmit}>
              {t('control.submit')}
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="rounded-md border border-border bg-background px-4 py-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl font-semibold">{t('hero.title')}</h1>
              <p className="mt-1 max-w-4xl text-sm text-muted-foreground">
                {t('hero.description')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{t('hero.badgeLive')}</Badge>
              <Badge variant="outline">{t('hero.badgeInline')}</Badge>
              <Badge variant="outline">{t('hero.badgeAsync')}</Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="playground" className="gap-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="playground">{t('tabs.playground')}</TabsTrigger>
            <TabsTrigger value="catalog">{t('tabs.catalog')}</TabsTrigger>
            <TabsTrigger value="usage">{t('tabs.usage')}</TabsTrigger>
            <TabsTrigger value="base">{t('tabs.base')}</TabsTrigger>
          </TabsList>

          <TabsContent value="playground">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 rounded-md border border-border bg-background p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-sm font-semibold">{t('mode.title')}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`mode.description.${playgroundMode}`)}
                  </p>
                </div>

                <ToggleGroup
                  type="single"
                  value={playgroundMode}
                  variant="outline"
                  onValueChange={value => {
                    if (value) setPlaygroundMode(value as PlaygroundMode);
                  }}
                  className="flex-wrap justify-start"
                >
                  <ToggleGroupItem value="view" aria-label={t('mode.view')}>
                    <Eye />
                    {t('mode.view')}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="edit" aria-label={t('mode.edit')}>
                    <Pencil />
                    {t('mode.edit')}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="inline" aria-label={t('mode.inline')}>
                    <SquarePen />
                    {t('mode.inline')}
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <FieldSet className="rounded-md border border-dashed border-emerald-700 px-4 pb-4">
                    <FieldLegend className="text-sm font-semibold text-emerald-700">
                      {t('sections.text')}
                    </FieldLegend>
                    <FieldGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <FieldInputText
                        label={t('field.text')}
                        form={form}
                        name="text"
                        {...fieldModeProps}
                        placeholder="EMP-000001"
                      />
                      <FieldInputMasked
                        label={t('field.masked')}
                        form={form}
                        name="masked"
                        {...fieldModeProps}
                        mask="###-###-###"
                        placeholder="123-456-789"
                      />
                      <FieldInputPassword
                        label={t('field.password')}
                        form={form}
                        name="password"
                        {...fieldModeProps}
                      />
                      <FieldInputEmail
                        label={t('field.email')}
                        form={form}
                        name="email"
                        {...fieldModeProps}
                      />
                      <FieldInputPhoneNumber
                        label={t('field.phoneNumber')}
                        form={form}
                        name="phoneNumber"
                        {...fieldModeProps}
                        // countryCodeName="phoneCountryCode"
                        maxLength={10}
                      />
                      <FieldInputGeneratedText
                        label={t('field.generatedText')}
                        form={form}
                        name="generatedText"
                        {...fieldModeProps}
                        getGeneratedText={() =>
                          delay(`FG-${String(Date.now()).slice(-5)}`, 250)
                        }
                        autoGenerateIfEmpty
                      />
                      <FieldInputText
                        label={t('field.text')}
                        form={form}
                        name="text"
                        {...fieldModeProps}
                        description={t('field.textDescription')}
                      />
                      <FieldInputText
                        label={t('field.text')}
                        form={form}
                        name="text"
                        {...fieldModeProps}
                        tooltip={t('field.textTooltip')}
                      />
                      <FieldInputText
                        label={t('field.text')}
                        form={form}
                        name="text"
                        {...fieldModeProps}
                        required
                      />
                      <FieldInputTextArea
                        className="md:col-span-2 xl:col-span-3"
                        label={t('field.textarea')}
                        form={form}
                        name="textarea"
                        {...fieldModeProps}
                      />
                      <FieldInputAlphaText
                        label={t('field.alphaText')}
                        form={form}
                        name="alphaText"
                        {...fieldModeProps}
                      />
                      <FieldInputPersonName
                        label={t('field.personName')}
                        form={form}
                        name="personName"
                        {...fieldModeProps}
                      />
                      <FieldInputJson
                        className="md:col-span-2 xl:col-span-3"
                        label={t('field.json')}
                        form={form}
                        name="json"
                        {...fieldModeProps}
                        rows={4}
                      />
                    </FieldGroup>
                  </FieldSet>

                  <FieldSet className="rounded-md border border-dashed border-cyan-700 px-4 pb-4">
                    <FieldLegend className="text-sm font-semibold text-cyan-700">
                      {t('sections.numeric')}
                    </FieldLegend>
                    <FieldGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <FieldInputNumeric
                        label={t('field.numeric')}
                        form={form}
                        name="numeric"
                        {...fieldModeProps}
                        maxLength={12}
                      />
                      <FieldInputNumber
                        label={t('field.number')}
                        form={form}
                        name="number"
                        {...fieldModeProps}
                        min={0}
                        maxFractionDigits={2}
                        suffix="kg"
                      />
                      <FieldInputSliderNumber
                        label={t('field.sliderNumber')}
                        form={form}
                        name="sliderNumber"
                        {...fieldModeProps}
                        min={0}
                        max={100}
                        step={5}
                        suffix="%"
                        showInput
                      />
                      <FieldInputPercent
                        label={t('field.percent')}
                        form={form}
                        name="percent"
                        {...fieldModeProps}
                      />
                      <FieldInputYear
                        label={t('field.year')}
                        form={form}
                        name="year"
                        {...fieldModeProps}
                        minYear={1900}
                        maxYear={2100}
                        placeholder="2026"
                      />
                      <FieldInputCurrency
                        label={t('field.currency')}
                        form={form}
                        name="currency"
                        {...fieldModeProps}
                      />
                    </FieldGroup>
                  </FieldSet>

                  <FieldSet className="rounded-md border border-dashed border-amber-700 px-4 pb-4">
                    <FieldLegend className="text-sm font-semibold text-amber-700">
                      {t('sections.dateTime')}
                    </FieldLegend>
                    <FieldGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <FieldInputDate
                        label={t('field.date')}
                        form={form}
                        name="date"
                        {...fieldModeProps}
                      />
                      <FieldInputDateTime
                        label={t('field.dateTime')}
                        form={form}
                        name="dateTime"
                        {...fieldModeProps}
                      />
                      <FieldInputTime
                        label={t('field.time')}
                        form={form}
                        name="time"
                        {...fieldModeProps}
                      />
                      <FieldInputDateRange
                        label={t('field.dateRange')}
                        form={form}
                        name="dateRange"
                        numberOfMonths={2}
                        {...fieldModeProps}
                      />
                    </FieldGroup>
                  </FieldSet>

                  <FieldSet className="rounded-md border border-dashed border-rose-700 px-4 pb-4">
                    <FieldLegend className="text-sm font-semibold text-rose-700">
                      {t('sections.choice')}
                    </FieldLegend>
                    <FieldGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <FieldInputSwitch
                        label={t('field.switch')}
                        form={form}
                        name="switch"
                        {...fieldModeProps}
                      />
                      <FieldInputRadioGroup
                        label={t('field.radioGroup')}
                        form={form}
                        name="radioGroup"
                        {...fieldModeProps}
                        options={[
                          { label: t('constants.priority.low'), value: 'low' },
                          {
                            label: t('constants.priority.medium'),
                            value: 'medium',
                          },
                          {
                            label: t('constants.priority.high'),
                            value: 'high',
                          },
                        ]}
                      />
                      <FieldInputCheckboxGroup
                        label={t('field.checkboxGroup')}
                        form={form}
                        name="checkboxGroup"
                        {...fieldModeProps}
                        options={multiSelectOptions}
                      />
                      <FieldInputConstant
                        label={t('field.constant')}
                        form={form}
                        name="constant"
                        {...fieldModeProps}
                        constOptions={CONST_PRIORITY}
                      />
                    </FieldGroup>
                  </FieldSet>

                  <FieldSet className="rounded-md border border-dashed border-sky-700 px-4 pb-4">
                    <FieldLegend className="text-sm font-semibold text-sky-700">
                      {t('sections.select')}
                    </FieldLegend>
                    <FieldGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <FieldInputSelect
                        label={t('field.select')}
                        form={form}
                        name="select"
                        {...fieldModeProps}
                        options={selectOptions}
                        searchable
                      />
                      <FieldInputMultiSelect
                        label={t('field.multiSelect')}
                        form={form}
                        name="multiSelect"
                        {...fieldModeProps}
                        options={multiSelectOptions}
                        searchable
                        searchPlaceholder={t('placeholder.searchOption')}
                      />
                      <FieldInputAsyncSelect
                        label={t('field.asyncSelect')}
                        form={form}
                        name="asyncSelect"
                        {...fieldModeProps}
                        loadOptions={loadAsyncOptions}
                        loadOption={loadAsyncOption}
                        searchPlaceholder={t('placeholder.searchOption')}
                      />
                      <FieldInputAsyncMultiSelect
                        label={t('field.asyncMultiSelect')}
                        form={form}
                        name="asyncMultiSelect"
                        {...fieldModeProps}
                        loadOptions={loadAsyncOptions}
                        loadOption={loadAsyncOption}
                        searchPlaceholder={t('placeholder.searchOption')}
                      />
                    </FieldGroup>
                  </FieldSet>

                  <FieldSet className="rounded-md border border-dashed border-indigo-700 px-4 pb-4">
                    <FieldLegend className="text-sm font-semibold text-indigo-700">
                      {t('sections.entitySelect')}
                    </FieldLegend>
                    <FieldGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <FieldInputEntitySelect
                        label={t('field.entitySelect')}
                        form={form}
                        name="entitySelect"
                        {...fieldModeProps}
                        options={entityOptions}
                        getOptionValue={entity => entity.id}
                        getOptionLabel={entity =>
                          `${entity.employeeCode} - ${entity.fullName}`
                        }
                        renderOption={entity => (
                          <span className="flex flex-col text-left">
                            <span>
                              {entity.employeeCode} - {entity.fullName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {entity.departmentName}
                            </span>
                          </span>
                        )}
                        searchPlaceholder={t('placeholder.searchEntity')}
                        searchable
                      />
                      <FieldInputEntityMultiSelect
                        label={t('field.entityMultiSelect')}
                        form={form}
                        name="entityMultiSelect"
                        {...fieldModeProps}
                        options={entityOptions}
                        getOptionValue={entity => entity.id}
                        getOptionLabel={entity =>
                          `${entity.employeeCode} - ${entity.fullName}`
                        }
                        renderOption={entity => (
                          <span className="flex flex-col text-left">
                            <span>
                              {entity.employeeCode} - {entity.fullName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {entity.departmentName}
                            </span>
                          </span>
                        )}
                        searchPlaceholder={t('placeholder.searchEntity')}
                        searchable
                      />
                      <FieldInputEntityAsyncSelect
                        label={t('field.entityAsyncSelect')}
                        form={form}
                        name="entityAsyncSelect"
                        {...fieldModeProps}
                        loadOptions={loadEntityAsyncOptions}
                        loadOption={loadEntityAsyncOption}
                        getOptionValue={entity => entity.id}
                        getOptionLabel={entity =>
                          `${entity.employeeCode} - ${entity.fullName}`
                        }
                        renderOption={entity => (
                          <span className="flex flex-col text-left">
                            <span>
                              {entity.employeeCode} - {entity.fullName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {entity.departmentName}
                            </span>
                          </span>
                        )}
                        searchPlaceholder={t('placeholder.searchEntity')}
                      />
                      <FieldInputEntityAsyncMultiSelect
                        label={t('field.entityAsyncMultiSelect')}
                        form={form}
                        name="entityAsyncMultiSelect"
                        {...fieldModeProps}
                        loadOptions={loadEntityAsyncOptions}
                        loadOption={loadEntityAsyncOption}
                        getOptionValue={entity => entity.id}
                        getOptionLabel={entity =>
                          `${entity.employeeCode} - ${entity.fullName}`
                        }
                        renderOption={entity => (
                          <span className="flex flex-col text-left">
                            <span>
                              {entity.employeeCode} - {entity.fullName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {entity.departmentName}
                            </span>
                          </span>
                        )}
                        searchPlaceholder={t('placeholder.searchEntity')}
                      />
                    </FieldGroup>
                  </FieldSet>

                  <FieldSet className="rounded-md border border-dashed border-violet-700 px-4 pb-4">
                    <FieldLegend className="text-sm font-semibold text-violet-700">
                      {t('sections.comboTree')}
                    </FieldLegend>
                    <FieldGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <FieldInputCombobox
                        label={t('field.combobox')}
                        form={form}
                        name="combobox"
                        {...fieldModeProps}
                        options={multiSelectOptions}
                        placeholder={t('placeholder.combobox')}
                      />
                      <FieldInputMultiCombobox
                        label={t('field.multiCombobox')}
                        form={form}
                        name="multiCombobox"
                        {...fieldModeProps}
                        options={multiSelectOptions}
                        placeholder={t('placeholder.combobox')}
                      />
                      <FieldInputTreeSelect
                        label={t('field.treeSelect')}
                        form={form}
                        name="treeSelect"
                        {...fieldModeProps}
                        options={treeOptions}
                        expandAll
                      />
                      <FieldInputTreeEntitySelect
                        label={t('field.treeEntitySelect')}
                        form={form}
                        name="treeEntitySelect"
                        {...fieldModeProps}
                        options={treeEntityNodes}
                        getOptionValue={node => node.code}
                        getOptionLabel={node => node.name}
                        getOptionChildren={node => node.children}
                        searchable
                      />
                    </FieldGroup>
                  </FieldSet>

                  <FieldSet className="rounded-md border border-dashed border-lime-700 px-4 pb-4">
                    <FieldLegend className="text-sm font-semibold text-lime-700">
                      {t('sections.location')}
                    </FieldLegend>
                    <FieldGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <FieldInputCountry
                        label={t('field.country')}
                        form={form}
                        name="country"
                        {...fieldModeProps}
                      />
                      <FieldInputAddress
                        className="md:col-span-2 xl:col-span-2"
                        label={t('field.address')}
                        form={form}
                        name="address"
                        {...fieldModeProps}
                      />
                    </FieldGroup>
                  </FieldSet>

                  <FieldSet className="rounded-md border border-dashed border-orange-700 px-4 pb-4">
                    <FieldLegend className="text-sm font-semibold text-orange-700">
                      {t('sections.files')}
                    </FieldLegend>
                    <FieldGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <FieldInputAvatar
                        label={t('field.avatar')}
                        form={form}
                        name="avatar"
                        {...fieldModeProps}
                        fallback="OP"
                        browseText={t('control.chooseAvatar')}
                      />
                      <FieldInputFileUpload
                        label={t('field.fileUpload')}
                        form={form}
                        name="fileUpload"
                        {...fieldModeProps}
                        accept=".pdf,.jpg,.jpeg,.png"
                        placeholder={t('placeholder.fileUpload')}
                        browseText={t('control.chooseFile')}
                      />
                      <FieldInputFileUpload
                        label={t('field.fileUploadMultiple')}
                        form={form}
                        name="fileUploadMultiple"
                        {...fieldModeProps}
                        multiple
                        maxFiles={5}
                        accept=".pdf,.jpg,.jpeg,.png"
                        placeholder={t('placeholder.fileUpload')}
                        browseText={t('control.chooseFile')}
                      />
                    </FieldGroup>
                  </FieldSet>

                  <FieldSet className="rounded-md border border-dashed border-fuchsia-700 px-4 pb-4">
                    <FieldLegend className="text-sm font-semibold text-fuchsia-700">
                      {t('sections.tables')}
                    </FieldLegend>
                    <FieldInputArrayTable<
                      ArrayTableRow,
                      FieldGuideFormValues,
                      unknown,
                      FieldGuideFormValues,
                      'arrayTable',
                      ArrayTableRow[]
                    >
                      label={t('field.arrayTable')}
                      form={form}
                      name="arrayTable"
                      {...fieldModeProps}
                      columns={[
                        {
                          key: 'name',
                          header: t('arrayTable.col.name'),
                          render: row => row.name,
                        },
                        {
                          key: 'note',
                          header: t('arrayTable.col.note'),
                          render: row => row.note,
                        },
                      ]}
                      createDefaultRow={() => ({ name: '', note: '' })}
                      renderEditor={({ form: rowForm, mode }) => (
                        <div className="flex flex-col gap-4">
                          <FieldInputText
                            label={t('arrayTable.col.name')}
                            form={rowForm}
                            name="name"
                            mode={mode}
                          />
                          <FieldInputText
                            label={t('arrayTable.col.note')}
                            form={rowForm}
                            name="note"
                            mode={mode}
                          />
                        </div>
                      )}
                    />
                    <FieldInputEntityTable<
                      EntityTableRow,
                      FieldGuideFormValues,
                      unknown,
                      FieldGuideFormValues,
                      'entityTable',
                      EntityTableRow[]
                    >
                      label={t('field.entityTable')}
                      form={form}
                      name="entityTable"
                      {...fieldModeProps}
                      columns={[
                        {
                          key: 'name',
                          header: t('entityTable.col.name'),
                          render: row => row.name,
                        },
                        {
                          key: 'qty',
                          header: t('entityTable.col.qty'),
                          align: 'right',
                          headerClassName: 'w-24',
                          render: row => row.qty,
                        },
                      ]}
                      loadOptions={loadEntityTableOptions}
                      getRowValue={row => row.id}
                      getRowLabel={row => row.name}
                      searchPlaceholder={t('placeholder.searchOption')}
                    />
                  </FieldSet>

                  <FieldSet className="rounded-md border border-dashed border-amber-700 px-4 pb-4">
                    <FieldLegend className="text-sm font-semibold text-amber-700">
                      {t('sections.groupInlineEdit')}
                    </FieldLegend>
                    <FieldGroupInlineEdit
                      form={form}
                      names={['groupField1', 'groupField2']}
                      title="Grouped fields"
                      mode={playgroundMode === 'view' ? 'VIEW' : 'EDIT'}
                      inlineEdit={playgroundMode === 'inline'}
                      clearable
                      resetable
                      onSave={getValue => {
                        console.log('FieldGroupInlineEdit guide save', {
                          groupField1: getValue('groupField1'),
                          groupField2: getValue('groupField2'),
                        });
                      }}
                      onClear={() => {
                        console.log('FieldGroupInlineEdit guide clear');
                      }}
                      onReset={() => {
                        console.log('FieldGroupInlineEdit guide reset');
                      }}
                    >
                      {({ fieldMode }) => (
                        <FieldGroup className="grid gap-4 md:grid-cols-2">
                          <FieldInputText
                            label={t('field.text')}
                            form={form}
                            name="groupField1"
                            mode={fieldMode}
                          />
                          <FieldInputText
                            label={t('field.text')}
                            form={form}
                            name="groupField2"
                            mode={fieldMode}
                          />
                        </FieldGroup>
                      )}
                    </FieldGroupInlineEdit>
                  </FieldSet>
                </form>

                <aside className="rounded-md border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold">
                      {t('preview.title')}
                    </h2>
                    <Badge variant="outline">{t('preview.badge')}</Badge>
                  </div>
                  <pre className="mt-3 max-h-180 overflow-auto rounded-md bg-background p-3 text-xs">
                    {JSON.stringify(values, null, 2)}
                  </pre>
                </aside>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="catalog">
            <div className="overflow-hidden rounded-md border border-border">
              <div className="grid grid-cols-[220px_180px_minmax(0,1fr)_minmax(0,1fr)] bg-muted px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                <div>{t('catalogHeader.component')}</div>
                <div>{t('catalogHeader.valueType')}</div>
                <div>{t('catalogHeader.useCase')}</div>
                <div>{t('catalogHeader.note')}</div>
              </div>
              <div className="divide-y divide-border">
                {guideRowGroups.map(group => (
                  <div key={group.name}>
                    <div className="bg-muted/40 px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                      {group.name}
                    </div>
                    <div className="divide-y divide-border">
                      {group.rows.map(row => (
                        <div
                          key={row.component}
                          className="grid grid-cols-1 gap-2 px-3 py-3 text-sm md:grid-cols-[220px_180px_minmax(0,1fr)_minmax(0,1fr)]"
                        >
                          <div className="font-mono text-xs font-semibold">
                            {row.component}
                          </div>
                          <div className="font-mono text-xs text-muted-foreground">
                            {row.valueType}
                          </div>
                          <div>{row.useCase}</div>
                          <div className="text-muted-foreground">
                            {row.note}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="usage">
            <div className="grid gap-4 lg:grid-cols-2">
              <GuideBlock
                title={t('usage.common.title')}
                description={t('usage.common.description')}
                code={`<FieldInputText
  label={t('employee.field.employeeCode')}
  form={form}
  name="employeeCode"
/>`}
              />
              <GuideBlock
                title={t('usage.number.title')}
                description={t('usage.number.description')}
                code={`<FieldInputNumber
  label={t('employee.field.yearsOfExperience')}
  form={form}
  name="yearsOfExperience"
  min={0}
  maxFractionDigits={0}
  suffix={t('common.unit.year')}
  clearable
/>`}
              />
              <GuideBlock
                title={t('usage.numeric.title')}
                description={t('usage.numeric.description')}
                code={`<FieldInputNumeric
  label={t('employee.field.identityNumber')}
  form={form}
  name="identityNumber"
  maxLength={12}
  clearable
/>`}
              />
              <GuideBlock
                title={t('usage.phone.title')}
                description={t('usage.phone.description')}
                code={`<FieldInputPhoneNumber
  label={t('profile.field.phoneNumber')}
  form={form}
  name="phoneNumber"
  countryCodeName="phoneCountryCode"
  maxLength={10}
  clearable
/>`}
              />
              <GuideBlock
                title={t('usage.inline.title')}
                description={t('usage.inline.description')}
                code={`<FieldInputText
  label={t('employee.field.employeeCode')}
  form={form}
  name="employeeCode"
  mode="EDIT"
  inlineEdit
  loading={updateLoading && editingFieldName === 'employeeCode'}
  onInlineSave={(name, value) => update(name, value)}
/>`}
              />
              <GuideBlock
                title={t('usage.async.title')}
                description={t('usage.async.description')}
                code={`<FieldInputAsyncSelect
  label={t('request.field.assignee')}
  form={form}
  name="assigneeId"
  loadOptions={loadEmployeeOptions}
  loadOption={loadEmployeeOption}
  clearable
/>`}
              />
              <GuideBlock
                title={t('usage.multiSelect.title')}
                description={t('usage.multiSelect.description')}
                code={`<FieldInputMultiSelect
  label={t('employee.field.skills')}
  form={form}
  name="skillIds"
  options={skillOptions}
  searchable
  clearable
/>`}
              />
              <GuideBlock
                title={t('usage.combobox.title')}
                description={t('usage.combobox.description')}
                code={`<FieldInputCombobox
  label={t('employee.field.department')}
  form={form}
  name="department"
  options={departmentOptions}
  placeholder={t('employee.placeholder.department')}
  clearable
/>`}
              />
              <GuideBlock
                title={t('usage.multiCombobox.title')}
                description={t('usage.multiCombobox.description')}
                code={`<FieldInputMultiCombobox
  label={t('employee.field.departments')}
  form={form}
  name="departments"
  options={departmentOptions}
  placeholder={t('employee.placeholder.departments')}
  clearable
/>`}
              />
              <GuideBlock
                title={t('usage.asyncMulti.title')}
                description={t('usage.asyncMulti.description')}
                code={`<FieldInputAsyncMultiSelect
  label={t('employee.field.subordinates')}
  form={form}
  name="subordinateIds"
  loadOptions={loadEmployeeOptions}
  loadOption={loadEmployeeOption}
  searchPlaceholder={t('common.control.search')}
  clearable
/>`}
              />
              <GuideBlock
                title={t('usage.fileUpload.title')}
                description={t('usage.fileUpload.description')}
                code={`<FieldInputFileUpload
  label={t('employee.field.contractFile')}
  form={form}
  name="contractFile"
  accept=".pdf,.jpg,.jpeg,.png"
  clearable
/>`}
              />
              <GuideBlock
                title={t('usage.avatar.title')}
                description={t('usage.avatar.description')}
                code={`<FieldInputAvatar
  label={t('profile.field.avatar')}
  form={form}
  name="avatar"
  fallback={form.watch('fullName')?.[0]}
  clearable
/>`}
              />
              <GuideBlock
                title={t('usage.masked.title')}
                description={t('usage.masked.description')}
                code={`<FieldInputMasked
  label={t('employee.field.taxCode')}
  form={form}
  name="taxCode"
  mask="###-###-###"
  clearable
/>`}
              />
              <GuideBlock
                title={t('usage.choiceGroup.title')}
                description={t('usage.choiceGroup.description')}
                code={`<FieldInputRadioGroup
  label={t('employee.field.jobLevel')}
  form={form}
  name="jobLevel"
  options={jobLevelOptions}
  clearable
/>

<FieldInputCheckboxGroup
  label={t('employee.field.benefits')}
  form={form}
  name="benefitIds"
  options={benefitOptions}
  clearable
/>`}
              />
              <GuideBlock
                title={t('usage.time.title')}
                description={t('usage.time.description')}
                code={`<FieldInputTime
  label={t('employee.field.checkInTime')}
  form={form}
  name="checkInTime"
  clearable
/>`}
              />
              <GuideBlock
                title={t('usage.year.title')}
                description={t('usage.year.description')}
                code={`<FieldInputYear
  label={t('employee.field.hireYear')}
  form={form}
  name="hireYear"
  minYear={1900}
  maxYear={2100}
  clearable
/>`}
              />
              <GuideBlock
                title={t('usage.constant.title')}
                description={t('usage.constant.description')}
                code={`<FieldInputConstant
  label={t('employee.field.status')}
  form={form}
  name="status"
  constOptions={CONST_EMPLOYEE_STATUS}
/>`}
              />
              <GuideBlock
                title={t('usage.arrayTableSection.title')}
                description={t('usage.arrayTableSection.description')}
                code={`import SubSection from '@/shared/components/layout/sub-section';

<SubSection title={t('employee.field.qualifications')}>
  <FieldInputArrayTable<
    QualificationRow,
    EmployeeFormValues,
    unknown,
    EmployeeFormValues,
    'qualifications',
    QualificationRow[]
  >
    {/* no label — SubSection provides the title */}
    form={form}
    name="qualifications"
    columns={[
      { key: 'name', header: t('col.name'), render: row => row.name },
      { key: 'issuedBy', header: t('col.issuedBy'), render: row => row.issuedBy },
    ]}
    createDefaultRow={() => ({ name: '', issuedBy: '', issuedDate: '' })}
    renderEditor={({ form: rowForm, mode }) => (
      <div className="flex flex-col gap-4">
        <FieldInputText label={t('col.name')} form={rowForm} name="name" mode={mode} />
        <FieldInputText label={t('col.issuedBy')} form={rowForm} name="issuedBy" mode={mode} />
      </div>
    )}
    rowFormOptions={{ resolver: qualificationRowResolver }}
  />
</SubSection>`}
              />
              <GuideBlock
                title={t('usage.arrayTable.title')}
                description={t('usage.arrayTable.description')}
                code={`<FieldInputArrayTable<
  QualificationRow,
  EmployeeFormValues,
  unknown,
  EmployeeFormValues,
  'qualifications',
  QualificationRow[]
>
  label={t('employee.field.qualifications')}
  form={form}
  name="qualifications"
  columns={[
    { key: 'name', header: t('col.name'), render: row => row.name },
    { key: 'issuedBy', header: t('col.issuedBy'), render: row => row.issuedBy },
  ]}
  createDefaultRow={() => ({ name: '', issuedBy: '', issuedDate: '' })}
  renderEditor={({ form: rowForm, mode }) => (
    <div className="flex flex-col gap-4">
      <FieldInputText label={t('col.name')} form={rowForm} name="name" mode={mode} />
      <FieldInputText label={t('col.issuedBy')} form={rowForm} name="issuedBy" mode={mode} />
    </div>
  )}
  rowFormOptions={{ resolver: qualificationRowResolver }}
/>`}
              />
              <GuideBlock
                title={t('usage.fieldGroupInlineEdit.title')}
                description={t('usage.fieldGroupInlineEdit.description')}
                className="lg:col-span-2"
                code={`import FieldGroupInlineEdit from '@/shared/components/form/field-group-inline-edit';

<FieldGroupInlineEdit
  form={form}
  names={['jobInfo.organizationUnit', 'jobInfo.jobPosition']}
  title={t('sections.jobInfo.org')}
  mode={fieldMode}
  inlineEdit={isInlineEnabled}
  loading={orgSaving}
  clearable
  resetable
  onSave={getValue => {
    const org = getValue('jobInfo.organizationUnit');
    const pos = getValue('jobInfo.jobPosition');
    update('jobInfo.organizationUnit', org, {
      jobInfo: { organizationUnit: org, jobPosition: pos },
    });
  }}
  onClear={() => {
    update('jobInfo.organizationUnit', undefined, {
      jobInfo: { organizationUnit: undefined, jobPosition: undefined },
    });
  }}
  onReset={() => {
    const org = form.getValues('jobInfo.organizationUnit');
    const pos = form.getValues('jobInfo.jobPosition');
    update('jobInfo.organizationUnit', org, {
      jobInfo: { organizationUnit: org, jobPosition: pos },
    });
  }}
>
  {({ fieldMode }) => (
    <FieldGroup className="grid grid-cols-3">
      <FieldInputTreeEntitySelect
        label={t('fields.jobInfo.organizationUnit')}
        form={form}
        name="jobInfo.organizationUnit"
        mode={fieldMode}
        options={hierarchy.data || []}
        getOptionValue={org => org.id}
        getOptionLabel={org => org.name}
        getOptionChildren={org => org.children}
        onValueChange={() => form.setValue('jobInfo.jobPosition', undefined)}
      />
      <FieldInputEntitySelect
        label={t('fields.jobInfo.jobPosition')}
        form={form}
        name="jobInfo.jobPosition"
        mode={fieldMode}
        options={jobPositionOptions}
        getOptionValue={p => p.id}
        getOptionLabel={p => p.name}
        renderOption={p => p.name}
        disabled={!selectedOrg?.id}
      />
    </FieldGroup>
  )}
</FieldGroupInlineEdit>`}
              />
              <GuideBlock
                title={t('usage.entityTable.title')}
                description={t('usage.entityTable.description')}
                code={`<FieldInputEntityTable
  label={t('employee.field.trainings')}
  form={form}
  name="trainings"
  columns={[
    { key: 'name', header: t('field.name'), render: row => row.name },
    { key: 'qty', header: t('field.qty'), align: 'right', render: row => row.qty },
  ]}
  renderAddButton={addRow => (
    <Button type="button" size="sm" variant="outline" onClick={() => {
      openTrainingPicker(training => addRow(training));
    }}>
      Add training
    </Button>
  )}
  getRowKey={row => row.id}
  clearable
/>`}
              />
            </div>
          </TabsContent>
          <TabsContent value="base">
            <div className="flex flex-col gap-4">
              <div className="rounded-md border border-border bg-background p-4">
                <h2 className="text-sm font-semibold">
                  {t('base.propsTitle')}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('base.propsDescription')}
                </p>
                <div className="mt-3 overflow-hidden rounded-md border border-border">
                  <div className="grid grid-cols-[180px_180px_120px_minmax(0,1fr)] bg-muted px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                    <div>{t('base.propCol.prop')}</div>
                    <div>{t('base.propCol.type')}</div>
                    <div>{t('base.propCol.default')}</div>
                    <div>{t('base.propCol.description')}</div>
                  </div>
                  <div className="divide-y divide-border">
                    {basePropsRows.map(row => (
                      <div
                        key={row.name}
                        className="grid grid-cols-1 gap-1 px-3 py-2 text-sm md:grid-cols-[180px_180px_120px_minmax(0,1fr)]"
                      >
                        <div className="font-mono text-xs font-semibold">
                          {row.name}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {row.type}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {row.defaultValue}
                        </div>
                        <div className="text-sm">{row.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <GuideBlock
                  title={t('base.createMinimalTitle')}
                  description={t('base.createMinimalDescription')}
                  code={`import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import InputBase from '../inputs/input-base';
import FieldInputBase, {
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';

// 1. Extra props specific to this component
interface MyExtendsProps {
  maxLength?: number;
}

// 2. Public props type = base props except RenderComponent
export type FieldInputMyProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  MyExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

// 3. Thin wrapper — just attaches RenderComponent
export default function FieldInputMy<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(props: FieldInputMyProps<TFieldValues, TContext, TTransformedValues, TName, TFieldPathValue>) {
  return <FieldInputBase {...props} RenderComponent={FieldInputMyRender} />;
}

// 4. Pure render function — receives injected field state
function FieldInputMyRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: { maxLength, disabled, placeholder },
  currentValue,
  handleValueChange,
  readOnly,
  isError,
  getInputClassName,
  onEditRef,
}: FieldInputRenderProps<MyExtendsProps, TFieldValues, TContext, TTransformedValues, TName, TFieldPathValue>) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input when the inline-edit Pencil button is clicked
  useFieldEditCallback(onEditRef, () => inputRef.current?.focus());

  return (
    <InputBase
      ref={inputRef}
      type="text"
      value={(currentValue as string | undefined) ?? ''}
      onChange={e => handleValueChange(e.target.value as TFieldPathValue)}
      readOnly={readOnly}
      isError={isError}
      className={getInputClassName()}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
    />
  );
}`}
                />

                <GuideBlock
                  title={t('base.createWithControlTitle')}
                  description={t('base.createWithControlDescription')}
                  code={`// Spread the 3 style props onto the field's own right-side button.
// Base calculates the correct offset and shifts the button left
// when the toolbar overlay appears on hover.

function FieldInputMyRender<...>({
  currentValue,
  handleValueChange,
  readOnly,
  isError,
  getInputClassName,
  onEditRef,
  componentControlStyle,     // position: right offset in rem
  componentControlClassName, // hover transition class
  componentInputStyle,       // right padding for the input
}: FieldInputRenderProps<...>) {
  const [open, setOpen] = React.useState(false);

  useFieldEditCallback(onEditRef, () => setOpen(true));

  return (
    <MyPicker
      value={currentValue}
      onChange={handleValueChange}
      readOnly={readOnly}
      isError={isError}
      // 'pe-0' so MyPicker handles its own right padding
      className={getInputClassName('pe-0')}
      inputStyle={componentInputStyle}
      controlStyle={componentControlStyle}
      controlClassName={componentControlClassName}
      open={open}
      onOpenChange={setOpen}
    />
  );
}

// If the control button is wider than the default 2.5 rem,
// pass componentControlWidthRem in the wrapper:
export default function FieldInputMy(props) {
  return (
    <FieldInputBase
      {...props}
      componentControlWidthRem={5.25} // e.g. for a "Generate" button
      RenderComponent={FieldInputMyRender}
    />
  );
}`}
                />

                <GuideBlock
                  title={t('base.createManualTitle')}
                  description={t('base.createManualDescription')}
                  className="lg:col-span-2"
                  code={`// In the wrapper, set all placements to 'manual'
export default function FieldInputMy(props) {
  return (
    <FieldInputBase
      {...props}
      clearButtonPlacement="manual"
      resetButtonPlacement="manual"
      editButtonPlacement="manual"
      RenderComponent={FieldInputMyRender}
    />
  );
}

// In the render function, call the render helpers wherever needed
function FieldInputMyRender<...>({
  loading,
  isEditable,
  editButtonEditing,
  canClear,
  canReset,
  renderEditButton,
  renderSaveButton,
  renderCancelButton,
  renderClearButton,
  renderResetButton,
}: FieldInputRenderProps<...>) {
  const actions = loading || isEditable || canClear || canReset ? (
    <div className="flex items-center gap-1">
      {loading ? (
        <Spinner />
      ) : (
        <>
          {renderEditButton()}
          {renderSaveButton()}
          {renderCancelButton()}
          {canReset && renderResetButton()}
          {canClear && renderClearButton()}
        </>
      )}
    </div>
  ) : undefined;

  return (
    <SectionPanel actions={actions}>
      {/* field UI */}
    </SectionPanel>
  );
}`}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function GuideBlock({
  title,
  description,
  code,
  className,
}: {
  title: string;
  description: string;
  code: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-md border border-border bg-background p-4',
        className,
      )}
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <pre className="mt-3 overflow-auto rounded-md bg-muted p-3 text-xs">
        {code}
      </pre>
    </section>
  );
}
