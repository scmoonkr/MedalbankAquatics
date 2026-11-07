export const UI_CONFIG = {
  rowsPerPage: 10,
  backendRowsLimit: 5000, // backend 목록(records) 조회 시 한 번에 가져오는 최대 행 수 (넘으면 pagination, 서버 상한 MAX_ROWS 와 같다)
  backendTimesLimit: 5000, // backend/times 조회 시 한 번에 가져오는 최대 행 수 (넘으면 pagination, 서버 상한 timsLimit 과 같다)
  paginationSizes: [10, 20, 50, 100],
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss.SS',
  tableClasses: 'w-full border-collapse',
  buttonSizes: {
    xxsmall: { class: 'px-2 py-1 text-sm', height: '2rem' },
    xsmall: { class: 'px-2 py-1 text-sm', height: '2rem' },
    small: { class: 'px-2 py-1 text-sm', height: '2rem' },
    medium: { class: 'px-4 py-2', height: '2.5rem' },
    large: { class: 'px-6 py-3 text-lg', height: '3rem' },
    xlarge: { class: 'px-6 py-3 text-lg', height: '3rem' },
    xxlarge: { class: 'px-6 py-3 text-lg', height: '3rem' },
    xxxlarge: { class: 'px-6 py-3 text-lg', height: '3rem' },
  }
};

export default UI_CONFIG;