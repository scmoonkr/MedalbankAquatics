export const tableColumns = [
  // { key: 'checkbox', label: 'v', width: '50px', }, // checkbox

  // type: checkbox
  { key: 'isMasters', label: 'masters', width: '30px', type: "checkbox", sortable: false },
  { key: 'isAdult', label: 'adult', width: '30px', type: "checkbox", sortable: false },
  { key: 'name', label: '이름', width: '100px', sortable: true },
  { key: 'team', label: '팀명', width: '150px', sortable: true },
  { key: 'ageGroup', label: '연령대', width: '250px', sortable: true },

  // type: select options
  {
    key: 'gender', label: '성별', width: '60px', sortable: true,
    options: gendersTable,
  },
  {
    key: 'discipline', label: '종목', width: '100px', sortable: true,
    options: styleTable,
  },
  {
    key: 'course', label: '코스', width: '40px', sortable: false,
    options: courseTable,
  },
  { key: 'distance', label: '거리', width: '60px', sortable: false, options: distanceTable },
  { key: 'time', label: '기록', width: '60px', sortable: false },
  { key: 'rank', label: 'rank', width: '30px', sortable: false, edit: true },

  // edit: false --> 수정 form에서 edit 안함
  { key: 'status', label: 'status', width: '50px', sortable: false, edit: true },
  { key: 'actions', label: '액션', width: '80px', sortable: false, }, // edit, delete, view button
];
