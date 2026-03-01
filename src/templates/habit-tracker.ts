import type { MiniApp } from '@/types';

export const habitTrackerTemplate: Omit<MiniApp, 'createdAt' | 'updatedAt'> = {
  id: 'template-habit',
  name: { en: 'Habit Tracker', uk: 'Трекер звичок', ro: 'Tracker obiceiuri' },
  icon: '✅',
  description: {
    en: 'Track habits and build streaks',
    uk: 'Відстежуйте звички та накопичуйте серії',
    ro: 'Urmărește obiceiurile și construiește serii',
  },
  version: 1,
  tables: [
    {
      id: 'habits',
      name: 'Habits',
      fields: [
        { id: 'name', name: 'Habit', type: 'text', required: true },
        { id: 'done', name: 'Done', type: 'boolean' },
        { id: 'date', name: 'Date', type: 'date' },
      ],
    },
  ],
  pages: [
    {
      id: 'list',
      name: { en: 'Habits', uk: 'Звички', ro: 'Obiceiuri' },
      type: 'list',
      tableId: 'habits',
      components: [
        {
          id: 'habit-list',
          type: 'List',
          props: {
            tableId: 'habits',
            columns: ['name', 'done', 'date'],
          },
          actions: [{ type: 'navigate', pageId: 'detail' }],
        },
      ],
    },
    {
      id: 'form',
      name: { en: 'Add Habit', uk: 'Додати звичку', ro: 'Adaugă obicei' },
      type: 'form',
      tableId: 'habits',
      components: [
        {
          id: 'name',
          type: 'Input',
          props: {
            field: 'name',
            label: { en: 'Habit name', uk: 'Назва звички', ro: 'Numele obiceiului' },
            placeholder: { en: 'e.g. Morning run', uk: 'напр. Ранкова пробіжка', ro: 'ex. Alergare matinală' },
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
          id: 'done',
          type: 'Checkbox',
          props: {
            field: 'done',
            label: { en: 'Completed today', uk: 'Виконано сьогодні', ro: 'Finalizat azi' },
          },
        },
        {
          id: 'submit',
          type: 'Button',
          props: { label: { en: 'Save', uk: 'Зберегти', ro: 'Salvează' } },
          actions: [{ type: 'save_record', tableId: 'habits' }],
        },
      ],
    },
    {
      id: 'detail',
      name: { en: 'Detail', uk: 'Деталі', ro: 'Detalii' },
      type: 'detail',
      tableId: 'habits',
      components: [
        {
          id: 'detail-view',
          type: 'RecordDetail',
          props: { tableId: 'habits' },
        },
      ],
    },
  ],
  workflows: [],
  permissions: [],
  allowExternalApi: false,
};
