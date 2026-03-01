import type { MiniApp } from '@/types';

export const expenseTrackerTemplate: Omit<MiniApp, 'createdAt' | 'updatedAt'> = {
  id: 'template-expense',
  name: { en: 'Expense Tracker', uk: 'Трекер витрат', ro: 'Tracker cheltuieli' },
  icon: '💰',
  description: {
    en: 'Track your daily expenses with optional AI categorization',
    uk: 'Відстежуйте щоденні витрати з категоризацією ШІ',
    ro: 'Urmărește cheltuielile zilnice cu categorizare AI',
  },
  version: 1,
  tables: [
    {
      id: 'expenses',
      name: 'Expenses',
      fields: [
        { id: 'amount', name: 'Amount', type: 'number', required: true },
        { id: 'category', name: 'Category', type: 'text' },
        { id: 'date', name: 'Date', type: 'date' },
        { id: 'note', name: 'Note', type: 'text' },
      ],
    },
  ],
  pages: [
    {
      id: 'list',
      name: { en: 'Expenses', uk: 'Витрати', ro: 'Cheltuieli' },
      type: 'list',
      tableId: 'expenses',
      components: [
        {
          id: 'expense-list',
          type: 'List',
          props: {
            tableId: 'expenses',
            columns: ['amount', 'category', 'date', 'note'],
          },
          actions: [{ type: 'navigate', pageId: 'detail' }],
        },
      ],
    },
    {
      id: 'form',
      name: { en: 'Add Expense', uk: 'Додати витрату', ro: 'Adaugă cheltuială' },
      type: 'form',
      tableId: 'expenses',
      components: [
        {
          id: 'amount',
          type: 'Input',
          props: {
            field: 'amount',
            label: { en: 'Amount', uk: 'Сума', ro: 'Sumă' },
            inputType: 'number',
            placeholder: '0.00',
          },
        },
        {
          id: 'category',
          type: 'Select',
          props: {
            field: 'category',
            label: { en: 'Category', uk: 'Категорія', ro: 'Categorie' },
            options: ['Food', 'Transport', 'Shopping', 'Health', 'Other'],
          },
        },
        {
          id: 'date',
          type: 'Input',
          props: {
            field: 'date',
            label: { en: 'Date', uk: 'Дата', ro: 'Dată' },
            inputType: 'date',
          },
        },
        {
          id: 'note',
          type: 'Input',
          props: {
            field: 'note',
            label: { en: 'Note', uk: 'Нотатка', ro: 'Notă' },
            placeholder: { en: 'Optional', uk: 'Необов\'язково', ro: 'Opțional' },
          },
        },
        {
          id: 'submit',
          type: 'Button',
          props: { label: { en: 'Save', uk: 'Зберегти', ro: 'Salvează' } },
          actions: [{ type: 'save_record', tableId: 'expenses' }],
        },
      ],
    },
    {
      id: 'detail',
      name: { en: 'Detail', uk: 'Деталі', ro: 'Detalii' },
      type: 'detail',
      tableId: 'expenses',
      components: [
        {
          id: 'detail-view',
          type: 'RecordDetail',
          props: { tableId: 'expenses' },
        },
      ],
    },
  ],
  workflows: [
    {
      id: 'on-create',
      name: 'On Create',
      trigger: { type: 'data_change', config: { tableId: 'expenses', operation: 'create' } },
      actions: [],
      enabled: true,
    },
  ],
  permissions: [],
  allowExternalApi: false,
};
