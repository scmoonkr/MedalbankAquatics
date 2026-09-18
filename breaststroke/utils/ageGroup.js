// ageGroup.js

// 연령대 테이블 정의
export const ageGroupTable = [
  { 'ageFrom': 0, 'ageTo': 19, 'group': "09", 'groupName': '학생 전체' },
  { 'ageFrom': 20, 'ageTo': 200, 'group': "10", 'groupName': '성인 전체' },
  { 'ageFrom': 10, 'ageTo': 13, 'group': "01", 'groupName': '학생1그룹(10-13)' },
  { 'ageFrom': 14, 'ageTo': 16, 'group': "03", 'groupName': '학생2그룹(14-16)' },
  { 'ageFrom': 17, 'ageTo': 19, 'group': "05", 'groupName': '학생3그룹(17-19)' },
  { 'ageFrom': 20, 'ageTo': 24, 'group': "11", 'groupName': '1그룹(20-24)' },
  { 'ageFrom': 25, 'ageTo': 29, 'group': "13", 'groupName': '2그룹(25-29)' },
  { 'ageFrom': 30, 'ageTo': 34, 'group': "15", 'groupName': '3그룹(30-34)' },
  { 'ageFrom': 35, 'ageTo': 39, 'group': "17", 'groupName': '4그룹(35-39)' },
  { 'ageFrom': 40, 'ageTo': 44, 'group': "19", 'groupName': '5그룹(40-44)' },
  { 'ageFrom': 45, 'ageTo': 49, 'group': "21", 'groupName': '6그룹(45-49)' },
  { 'ageFrom': 50, 'ageTo': 54, 'group': "23", 'groupName': '7그룹(50-54)' },
  { 'ageFrom': 55, 'ageTo': 59, 'group': "25", 'groupName': '8그룹(55-59)' },
  { 'ageFrom': 60, 'ageTo': 64, 'group': "27", 'groupName': '9그룹(60-64)' },
  { 'ageFrom': 65, 'ageTo': 69, 'group': "29", 'groupName': '10그룹(65-69)' },
  { 'ageFrom': 70, 'ageTo': 74, 'group': "31", 'groupName': '11그룹(70-74)' },
  { 'ageFrom': 75, 'ageTo': 79, 'group': "33", 'groupName': '12그룹(75-79)' },
  { 'ageFrom': 80, 'ageTo': 84, 'group': "35", 'groupName': '13그룹(80-84)' },
  { 'ageFrom': 85, 'ageTo': 89, 'group': "37", 'groupName': '14그룹(85-89)' },
  { 'ageFrom': 90, 'ageTo': 94, 'group': "39", 'groupName': '15그룹(90-94)' },
  { 'ageFrom': 95, 'ageTo': 99, 'group': "41", 'groupName': '16그룹(95-99)' },
  { 'ageFrom': 100, 'ageTo': 200, 'group': "43", 'groupName': '17그룹(100+)' }
];

/**
 * group 코드로 groupName을 가져오는 함수
 * @param {string} group - 그룹 코드
 * @returns {string} 해당 그룹의 이름, 그룹이 없을 경우 빈 문자열 반환
 */
export function getGroupNameByGroup(group) {
  const foundGroup = ageGroupTable.find(item => item.group === group);
  return foundGroup ? foundGroup.groupName : '';
}
export function getGroupByName(groupName) {
  const foundGroup = ageGroupTable.find(item => item.groupName === groupName);
  return foundGroup ? foundGroup.group : '10';
}

/**
 * 나이로 해당하는 그룹 코드를 가져오는 함수
 * @param {number} age - 나이
 * @param {boolean} useGeneralGroups - 일반 그룹(학생 전체, 성인 전체) 사용 여부
 * @returns {string} 해당 나이의 그룹 코드, 해당 나이의 그룹이 없을 경우 빈 문자열 반환
 */
export function getGroupByAge(age, useGeneralGroups = false) {
  // 일반 그룹 사용 안 함 (세부 그룹만 사용)
  if (!useGeneralGroups) {
    const foundGroup = ageGroupTable.find(item =>
      age >= item.ageFrom && age <= item.ageTo &&
      item.group !== "09" && item.group !== "10" // 학생 전체, 성인 전체 제외
    );
    return foundGroup ? foundGroup.group : '';
  }

  // 일반 그룹 포함
  const foundGroup = ageGroupTable.find(item =>
    age >= item.ageFrom && age <= item.ageTo
  );
  return foundGroup ? foundGroup.group : '';
}

/**
 * 나이로 해당하는 그룹 이름을 가져오는 함수
 * @param {number} age - 나이
 * @param {boolean} useGeneralGroups - 일반 그룹(학생 전체, 성인 전체) 사용 여부
 * @returns {string} 해당 나이의 그룹 이름, 해당 나이의 그룹이 없을 경우 빈 문자열 반환
 */
export function getGroupNameByAge(age, useGeneralGroups = false) {
  const group = getGroupByAge(age, useGeneralGroups);
  return getGroupNameByGroup(group);
}

// 내보내기
// module.exports = {
//   ageGroupTable,
//   getGroupNameByGroup,
//   getGroupByAge,
//   getGroupNameByAge
// };