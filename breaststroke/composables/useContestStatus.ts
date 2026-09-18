// composables/useContestStatus.ts
export function useContestStatus() {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '예정된 공모전';
      case 'ongoing':
        return '진행중';
      case 'closed':
        return '마감됨';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return '';
    }
  };

  return {
    getStatusLabel,
    getStatusClass
  };
}