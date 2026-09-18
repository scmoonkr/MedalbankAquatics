/**
 * 
 * @param {*} times 
 */
exports.findMissingTimes = (existingTimes, newTimes) => {
  // 비교를 위한 키 생성 함수
  const createKey = (record) => {
    // return `${record.name}_${record.gender}_${record.style}_${record.course}_${record.distance}_${record.time}`;
    return `${record.name}_${record.gender}_${record.style}_${record.distance}_${record.time}`;
  };

  // 기존 기록들을 Set으로 변환 (빠른 검색을 위해)
  const existingKeys = new Set(existingTimes.map(createKey));

  // 새로운 기록 중에서 기존에 없는 기록만 필터링
  const missingTimes = newTimes.filter(newRecord => {
    const newKey = createKey(newRecord);
    return !existingKeys.has(newKey);
  });

  return missingTimes;
}

// 중복된 기록을 찾는 함수
exports.findDuplicateTimes = (times) => {
  // 비교를 위한 키 생성 함수
  const createKey = (record) => {
    return `${record.name}_${record.gender}_${record.style}_${record.distance}_${record.time}`;
  };

  // 키별로 기록들을 그룹화
  const recordGroups = {};
  
  times.forEach((record, index) => {
    const key = createKey(record);
    if (!recordGroups[key]) {
      recordGroups[key] = [];
    }
    recordGroups[key].push({ ...record, originalIndex: index });
  });

  // 중복된 그룹만 필터링 (2개 이상인 그룹)
  const duplicateGroups = Object.entries(recordGroups)
    .filter(([key, records]) => records.length > 1)
    .map(([key, records]) => records);

  return duplicateGroups;
}

// 중복된 모든 기록을 평면 배열로 반환하는 함수
exports.findAllDuplicateRecords = (times) => {
  const duplicateGroups = this.findDuplicateTimes(times);
  return duplicateGroups.flat();
}
const times = [
  { 
    name: "김철수", 
    gender: "M", 
    style: "자유형", 
    course: "LC", 
    distance: "100", 
    time: "52.30", 
    competitionName: "전국수영대회" 
  },
  { 
    name: "김철수", 
    gender: "M", 
    style: "자유형", 
    course: "LC", 
    distance: "100", 
    time: "52.30", 
    competitionName: "시도대회" // 같은 기록, 다른 대회
  },
  { 
    name: "이영희", 
    gender: "F", 
    style: "접영", 
    course: "SC", 
    distance: "50", 
    time: "28.45", 
    competitionName: "지역대회" 
  },
  { 
    name: "박민수", 
    gender: "M", 
    style: "배영", 
    course: "LC", 
    distance: "200", 
    time: "2:15.67", 
    competitionName: "신인대회" 
  },
  { 
    name: "김철수", 
    gender: "M", 
    style: "자유형", 
    course: "LC", 
    distance: "100", 
    time: "52.30", 
    competitionName: "전국수영대회" // 완전히 동일한 기록
  },
  { 
    name: "이영희", 
    gender: "F", 
    style: "접영", 
    course: "SC", 
    distance: "50", 
    time: "28.45", 
    competitionName: "전국대회" // 같은 기록, 다른 대회
  }
];

// console.log("=== 중복된 기록 그룹별 조회 ===");
// const duplicateGroups = this.findDuplicateTimes(times);
// // const res = this.findAllDuplicateRecords(times);
// console.log(duplicateGroups);


// const duplicateGroups = this.findMissingTimes(times);
// // const res = this.findAllDuplicateRecords(times);
// console.log(duplicateGroups);