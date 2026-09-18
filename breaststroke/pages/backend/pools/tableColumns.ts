export const tableColumns = [
  { key: 'checkbox', label: 'v', width: '50px', edit: false, },
  // { key: 'confirm', label: 'confirm?', width: '50px', visible: true, edit: false, },
  { key: 'sido', label: '시도', options: sidoTable, width: '10%', sortable: false, edit: true },
  { key: 'course', label: '코스', options: courseTable, width: '10%', sortable: false },
  { key: 'name', label: '수영장', width: '40%', sortable: false },
  { key: 'lane', label: '레인', width: '10%', sortable: false },
  { key: 'depthDeepEnd', label: '수심', width: '10%', sortable: false },
  // { key: 'actions', label: '액션', width: '10%', sortable: false, },
];