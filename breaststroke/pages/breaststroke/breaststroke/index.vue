<!-- components/times/TheImageCard.vue -->
<template>
  <TheSection background="#ffffff,#ffffff" :narrow="true">
    <TheBreadcrumb :menus="menus" />
  </TheSection>

  <TheSection background="#ffffff,#ffffff" :narrow="true">
		<div class="flex justify-between mb-5">
			<label class="custom-label">내용</label>
			<div class="flex gap-3">
				<label class="cursor-pointer bg-gray-200 hover:bg-gray-300 rounded-sm py-1 px-4"
				  @click="clickHelp">markdown help</label>

				<label class="cursor-pointer bg-gray-200 hover:bg-gray-300 rounded-sm py-1 px-4"
				  @click="clickPreview">내용미리보기</label>

				<label class="cursor-pointer bg-gray-200 hover:bg-gray-300 rounded-sm py-1 px-4"
				  @click="clickAnalysis">anaysis</label>
			</div>
		</div>

		<div>
			<textarea
				id="caption"
				v-model="inputText"
				placeholder="Caption을 입력하세요"
				rows="10"
				class="w-full p-2 border border-gray-300 mb-3" />
		</div>

		<div class="max-w-[1200px]l mx-auto py-4">
			<label class="custom-label">미리보기</label>
			<MarkdownViewer
				:content="markdown"
				:showToc="false"
				:showStats="false" />
         <!-- <div v-html="markdown"></div> -->
		</div>
  </TheSection>
	
</template>


<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<script setup>
import { ref } from 'vue';
import TheSection from '~/components/common/TheSection.vue';
import MarkdownViewer from '~/components/common/MarkdownViewer.vue';
import UtilAnaysis from '~/utils/anaysisLibrary';


const times = [   
   {   
      dataID : 181899,
      name : "이은영",
      isMasters : true,
      team : "무대뽀",
      group : "성인부 20대",
      age : "20~29세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "40.89",
      timeStamp : 0.000473263888888889,
      rank : 1,
      competitionName : "제6회 강동구청장배 생활체육 수영대회",
      cid : 428,
      sido : "서울시 강동구",
      pool : "한국체육대학교",
      datetime : "2013-04-21",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 10075,
      name : "이은영",
      isMasters : true,
      team : "스윔몬스터",
      group : "성인부 20대",
      age : "20~29세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "41.34",
      timeStamp : 0.000478472222222222,
      rank : 3,
      competitionName : "제5회 서울특별시연맹회장배 수영대회",
      cid : 71,
      sido : "서울",
      pool : "서울체육고등학교 수영장",
      datetime : "2019-12-07",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 34756,
      name : "이은영",
      isMasters : true,
      team : "노브레싱",
      group : "성인부 1그룹",
      age : "20~29세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "41.53",
      timeStamp : 0.000480671296296296,
      rank : 1,
      competitionName : "제2회 남양주시장배 전국마스터즈 수영대회",
      cid : 132,
      sido : "경기도 남양주시",
      pool : "남양주시체육문화센터 수영장",
      datetime : "2013-12-01",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 69219,
      name : "이은영",
      isMasters : true,
      team : "여주수영연맹",
      group : "성인부 1그룹",
      age : "20~28세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "45.88",
      timeStamp : 0.000531018518518519,
      rank : 2,
      competitionName : "제12회 이천시장배 겸 이천시수영연맹회장배 전국마스터즈 수영대회",
      cid : 181,
      sido : "경기도 이천시",
      pool : "이천스포츠센터 수영장",
      datetime : "2018-09-08",
      dateEnd : "2018-09-09",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 320202,
      name : "이은영",
      isMasters : true,
      team : "SWIM21",
      group : "초등부 4학년",
      age : "11~11세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "46.00",
      timeStamp : 0.000532407407407407,
      rank : 1,
      competitionName : "2025 유소년 기초종목 생활체육 수영대회",
      cid : 1112,
      sido : "경기도 고양시",
      pool : "고양체육관 수영장",
      datetime : "2025-12-06",
      dateEnd : "2025-12-07",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 311247,
      name : "이은영",
      isMasters : true,
      team : "군포시",
      group : "초등부 4학년",
      age : "11~11세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "47.00",
      timeStamp : 0.000543981481481481,
      rank : 4,
      competitionName : "2025 경기도의장배 수영대회",
      cid : 1079,
      sido : "경기도",
      pool : "성남종합스포츠센터",
      datetime : "2025-11-09",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 366430,
      name : "이은영",
      isMasters : true,
      team : "SJL",
      group : "성인부 5그룹",
      age : "56~64세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "47.14",
      timeStamp : 0.000545601851851852,
      rank : 1,
      competitionName : "제1회 전주시수영연맹 회장배 마스터즈 수영대회",
      cid : 1071,
      sido : "전북 전주시",
      pool : "완산실내수영장",
      datetime : "2025-12-07",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 320478,
      name : "이은영",
      isMasters : true,
      team : "크롤스윔",
      group : "성인부 2그룹",
      age : "26~32세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "47.95",
      timeStamp : 0.000554976851851852,
      rank : 3,
      competitionName : "2025 화성특례시 전국마스터즈 수영대회",
      cid : 936,
      sido : "경기도 화성시",
      pool : "유앤아이센터",
      datetime : "2025-07-20",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 279174,
      name : "이은영",
      isMasters : true,
      team : "군포시",
      group : "초등부 4학년",
      age : "11~11세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "49.17",
      timeStamp : 0.000569097222222222,
      rank : 5,
      competitionName : "2025 경기도교육감배 수영대회",
      cid : 979,
      sido : "경기도 고양시",
      pool : "고양체육관 수영장",
      datetime : "2025-07-26",
      dateEnd : "2025-07-27",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 88497,
      name : "이은영",
      isMasters : true,
      team : "더스윔",
      group : "성인부 1그룹",
      age : "20~24세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "49.17",
      timeStamp : 0.000569097222222222,
      rank : 2,
      competitionName : "제18회 충무기 전국마스터즈 수영대회",
      cid : 246,
      sido : "대전광역시",
      pool : "용운국제수영장",
      datetime : "2013-12-21",
      dateEnd : "2013-12-22",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 194652,
      name : "이은영",
      isMasters : true,
      team : "물개군단",
      group : "성인부 6그룹",
      age : "50~54세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "49.26",
      timeStamp : 0.000570138888888889,
      rank : 2,
      competitionName : "2023 전라북도지사배 전국마스터즈 수영대회",
      cid : 483,
      sido : "전북 전주시",
      pool : "완산실내수영장",
      datetime : "2023-11-19",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 357663,
      name : "이은영",
      isMasters : true,
      team : "물개군단",
      group : "성인부 7그룹",
      age : "55~59세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      round : "finals",
      time : "49.34",
      timeStamp : 0.000571064814814815,
      rank : 1,
      competitionName : "2025 전북특별자치도지사배 마스터즈 수영대회",
      cid : 1067,
      sido : "전북 전주시",
      pool : "완산실내수영장",
      datetime : "2025-11-09",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 72487,
      name : "이은영",
      isMasters : true,
      team : "전주클럽",
      group : "성인부 4그룹",
      age : "37~42세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "50.59",
      timeStamp : 0.000585532407407407,
      rank : 3,
      competitionName : "제15회 충무기 전국마스터즈 수영대회",
      cid : 218,
      sido : "대전광역시",
      pool : "용운국제수영장",
      datetime : "2010-12-11",
      dateEnd : "2010-12-12",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 274244,
      name : "이은영",
      isMasters : true,
      team : "swim21",
      group : "초등부 4학년",
      age : "11~11세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "51.34",
      timeStamp : 0.000594212962962963,
      rank : 7,
      competitionName : "제3회 김천 전국 마스터즈 수영대회",
      cid : 933,
      sido : "경북 김천시",
      pool : "김천실내수영장",
      datetime : "2025-07-19",
      dateEnd : "2025-07-20",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 160294,
      name : "이은영",
      isMasters : true,
      team : "물개군단",
      group : "성인부 3그룹",
      age : "40~49세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "52.03",
      timeStamp : 0.000602199074074074,
      rank : 4,
      competitionName : "2017 전라북도지사배 마스터즈 수영대회",
      cid : 375,
      sido : "전북 전주시",
      pool : "완산실내수영장",
      datetime : "2017-11-19",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 9474,
      name : "이은영",
      isMasters : true,
      team : "인스윔",
      group : "성인부 5그룹",
      age : "40~44세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "53.70",
      timeStamp : 0.000621527777777778,
      rank : "",
      competitionName : "제6회 고양 전국 마스터즈 수영대회",
      cid : 80,
      sido : "경기도 고양시",
      pool : "고양체육관 수영장",
      datetime : "2019-02-16",
      dateEnd : "2019-02-17",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 158366,
      name : "이은영",
      isMasters : true,
      team : "물개군단",
      group : "성인부 7그룹",
      age : "50~54세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "53.87",
      timeStamp : 0.00062349537037037,
      rank : 2,
      competitionName : "제19회 전주시장배 수영대회",
      cid : 366,
      sido : "전북 전주시",
      pool : "완산실내수영장",
      datetime : "2023-06-25",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 211183,
      name : "이은영",
      isMasters : true,
      team : "경남패밀리",
      group : "성인부 30세이하",
      age : "20~29세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "54.18",
      timeStamp : 0.000627083333333333,
      rank : 7,
      competitionName : "제1회 영호남 아레나 마스터즈 수영대회",
      cid : 547,
      sido : "부산광역시",
      pool : "사직실내수영장",
      datetime : "2003-02-23",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 143223,
      name : "이은영",
      isMasters : true,
      team : "음파음파",
      group : "성인부 2그룹",
      age : "25~29세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "54.72",
      timeStamp : 0.000633333333333333,
      rank : 7,
      competitionName : "2019 아레나코리아마스터즈대회 수영대회",
      cid : 73,
      sido : "인천광역시",
      pool : "인천 문학박태환수영장",
      datetime : "2019-12-21",
      dateEnd : "2019-12-22",
      hide : false,
      athleteID : 25139
   },   
   {   
      dataID : 241702,
      name : "이은영",
      isMasters : true,
      team : "swim21",
      group : "초등부 4학년",
      age : "11~11세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "56.51",
      timeStamp : 0.000654050925925926,
      rank : 12,
      competitionName : "임금님표이천 배 전국마스터즈 수영대회 겸 2025 전국생활체육대축전 경기도대표 선발전",
      cid : 820,
      sido : "경기도 이천시",
      pool : "이천스포렉스",
      datetime : "2025-03-08",
      dateEnd : "2025-03-09",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 256966,
      name : "이은영",
      isMasters : true,
      team : "세월아네월아",
      group : "성인부 3그룹(중급)",
      age : "0~40세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "1:03.78",
      timeStamp : 0.000738194444444444,
      rank : 4,
      competitionName : "제8회 안성시장배 시민 수영대회",
      cid : 701,
      sido : "경기도 안성시",
      pool : "안성국민체육센터",
      datetime : "2018-09-02",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 356914,
      name : "이은영",
      isMasters : true,
      team : "물개군단",
      group : "성인부 5그룹",
      age : "45~49세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      round : "finals",
      time : "1:04.02",
      timeStamp : 0.000740972222222222,
      rank : 11,
      competitionName : "2025 전북특별자치도지사배 마스터즈 수영대회",
      cid : 1067,
      sido : "전북 전주시",
      pool : "완산실내수영장",
      datetime : "2025-11-09",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 301554,
      name : "이은영",
      isMasters : true,
      team : "",
      group : "초등부 3학년",
      age : "10~10세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "1:07.21",
      timeStamp : 0.000777893518518518,
      rank : 2,
      competitionName : "2024년 군포시장배 유소년 수영대회",
      cid : 1088,
      sido : "경기도 군포시",
      pool : "군포국민체육센터",
      datetime : "2024-06-02",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 282097,
      name : "이은영",
      isMasters : true,
      team : "CLUB NFC",
      group : "성인부 3그룹",
      age : "36~43세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "50M",
      time : "1:15.05",
      timeStamp : 0.000868634259259259,
      rank : 10,
      competitionName : "제5회 충남도지사배 생활체육수영대회",
      cid : 775,
      sido : "충남",
      pool : "한들문화센터 수영장",
      datetime : "2024-11-23",
      dateEnd : "2024-11-24",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 335909,
      name : "이은영",
      isMasters : true,
      team : "TEAM음파",
      group : "성인부 2그룹",
      age : "25~29세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      time : "1:38.56",
      timeStamp : 0.00114074074074074,
      rank : 2,
      competitionName : "제19회 이천시장배 겸 이천시수영연맹회장배 전국마스터즈 수영대회",
      cid : 973,
      sido : "경기도 이천시",
      pool : "이천스포렉스",
      datetime : "2025-09-20",
      dateEnd : "2025-09-21",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 287948,
      name : "이은영",
      isMasters : true,
      team : "크롤스윔",
      group : "성인부 1그룹",
      age : "20~29세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      time : "1:40.44",
      timeStamp : 0.0011625,
      rank : 4,
      competitionName : "임금님표이천 배 전국마스터즈 수영대회 겸 2025 전국생활체육대축전 경기도대표 선발전",
      cid : 820,
      sido : "경기도 이천시",
      pool : "이천스포렉스",
      datetime : "2025-03-08",
      dateEnd : "2025-03-09",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 211286,
      name : "이은영",
      isMasters : true,
      team : "부산정보",
      group : "성인부 대학부",
      age : "20~29세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      time : "1:43.20",
      timeStamp : 0.00119444444444444,
      rank : 1,
      competitionName : "제1회 영호남 아레나 마스터즈 수영대회",
      cid : 547,
      sido : "부산광역시",
      pool : "사직실내수영장",
      datetime : "2003-02-23",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 366429,
      name : "이은영",
      isMasters : true,
      team : "SJL",
      group : "성인부 5그룹",
      age : "56~64세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      time : "1:43.27",
      timeStamp : 0.00119525462962963,
      rank : 1,
      competitionName : "제1회 전주시수영연맹 회장배 마스터즈 수영대회",
      cid : 1071,
      sido : "전북 전주시",
      pool : "완산실내수영장",
      datetime : "2025-12-07",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 272938,
      name : "이은영",
      isMasters : true,
      team : "",
      group : "초등부 4학년",
      age : "11~11세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      time : "1:44.82",
      timeStamp : 0.00121319444444444,
      rank : 1,
      competitionName : "2025년 군포시장배 수영대회",
      cid : 916,
      sido : "경기도 군포시",
      pool : "군포국민체육센터",
      datetime : "2025-06-22",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 311605,
      name : "이은영",
      isMasters : true,
      team : "군포시",
      group : "초등부 4학년",
      age : "11~11세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      time : "1:47.38",
      timeStamp : 0.00124282407407407,
      rank : 3,
      competitionName : "2025 경기도의장배 수영대회",
      cid : 1079,
      sido : "경기도",
      pool : "성남종합스포츠센터",
      datetime : "2025-11-09",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 279701,
      name : "이은영",
      isMasters : true,
      team : "군포시",
      group : "초등부 4학년",
      age : "11~11세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      time : "1:47.86",
      timeStamp : 0.00124837962962963,
      rank : 5,
      competitionName : "2025 경기도교육감배 수영대회",
      cid : 979,
      sido : "경기도 고양시",
      pool : "고양체육관 수영장",
      datetime : "2025-07-26",
      dateEnd : "2025-07-27",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 194987,
      name : "이은영",
      isMasters : true,
      team : "물개군단",
      group : "성인부 6그룹",
      age : "50~54세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      time : "1:47.93",
      timeStamp : 0.00124918981481481,
      rank : 1,
      competitionName : "2023 전라북도지사배 전국마스터즈 수영대회",
      cid : 483,
      sido : "전북 전주시",
      pool : "완산실내수영장",
      datetime : "2023-11-19",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 274618,
      name : "이은영",
      isMasters : true,
      team : "swim21",
      group : "초등부 4학년",
      age : "11~11세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      time : "1:48.36",
      timeStamp : 0.00125416666666667,
      rank : 5,
      competitionName : "제3회 김천 전국 마스터즈 수영대회",
      cid : 933,
      sido : "경북 김천시",
      pool : "김천실내수영장",
      datetime : "2025-07-19",
      dateEnd : "2025-07-20",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 72248,
      name : "이은영",
      isMasters : true,
      team : "전주클럽",
      group : "성인부 4그룹",
      age : "37~42세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      time : "1:49.46",
      timeStamp : 0.00126689814814815,
      rank : 3,
      competitionName : "제15회 충무기 전국마스터즈 수영대회",
      cid : 218,
      sido : "대전광역시",
      pool : "용운국제수영장",
      datetime : "2010-12-11",
      dateEnd : "2010-12-12",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 357106,
      name : "이은영",
      isMasters : true,
      team : "물개군단",
      group : "성인부 7그룹",
      age : "55~59세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      round : "finals",
      time : "1:49.85",
      timeStamp : 0.00127141203703704,
      rank : 1,
      competitionName : "2025 전북특별자치도지사배 마스터즈 수영대회",
      cid : 1067,
      sido : "전북 전주시",
      pool : "완산실내수영장",
      datetime : "2025-11-09",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 88732,
      name : "이은영",
      isMasters : true,
      team : "더스윔",
      group : "성인부 1그룹",
      age : "20~24세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      time : "1:50.11",
      timeStamp : 0.0012744212962963,
      rank : 1,
      competitionName : "제18회 충무기 전국마스터즈 수영대회",
      cid : 246,
      sido : "대전광역시",
      pool : "용운국제수영장",
      datetime : "2013-12-21",
      dateEnd : "2013-12-22",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 158417,
      name : "이은영",
      isMasters : true,
      team : "물개군단",
      group : "성인부 8그룹",
      age : "55세 이상",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      time : "1:50.33",
      timeStamp : 0.00127696759259259,
      rank : 3,
      competitionName : "제19회 전주시장배 수영대회",
      cid : 366,
      sido : "전북 전주시",
      pool : "완산실내수영장",
      datetime : "2023-06-25",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 160300,
      name : "이은영",
      isMasters : true,
      team : "물개군단",
      group : "성인부 3그룹",
      age : "40~49세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      time : "1:50.43",
      timeStamp : 0.001278125,
      rank : 2,
      competitionName : "2017 전라북도지사배 마스터즈 수영대회",
      cid : 375,
      sido : "전북 전주시",
      pool : "완산실내수영장",
      datetime : "2017-11-19",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 98734,
      name : "이은영",
      isMasters : true,
      team : "물개군단",
      group : "성인부 6그룹",
      age : "50~54세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      time : "1:51.98",
      timeStamp : 0.00129606481481481,
      rank : 1,
      competitionName : "2022 전라북도지사배 마스터즈 수영대회",
      cid : 249,
      sido : "전북 전주시",
      pool : "완산실내수영장",
      datetime : "2022-11-13",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 271212,
      name : "이은영",
      isMasters : true,
      team : "용청수",
      group : "성인부 4그룹",
      age : "50~59세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      time : "1:54.38",
      timeStamp : 0.00132384259259259,
      rank : 4,
      competitionName : "제35회 수원특례시장배 수영대회",
      cid : 751,
      sido : "경기도 수원시",
      pool : "광교복합체육센터 수영장",
      datetime : "2024-10-27",
      hide : false,
      athleteID : 25139
   },   
      
   {   
      dataID : 241239,
      name : "이은영",
      isMasters : true,
      team : "swim21",
      group : "초등부 4학년",
      age : "11~11세",
      gender : "women",
      discipline : "BR",course: "LCM",
      distance : "100M",
      time : "1:58.86",
      timeStamp : 0.00137569444444444,
      rank : 4,
      competitionName : "임금님표이천 배 전국마스터즈 수영대회 겸 2025 전국생활체육대축전 경기도대표 선발전",
      cid : 820,
      sido : "경기도 이천시",
      pool : "이천스포렉스",
      datetime : "2025-03-08",
      dateEnd : "2025-03-09",
      hide : false,
      athleteID : 25139
   },   
];
// 반응형 상태 정의
const utilAnaysis = new UtilAnaysis(times);


const inputText = ref('');
const markdown = ref('');
const markdownHelp = ref(`# 마크다운 미리보기

<span style="background-color:#DCFFE4"> 초록형광펜 </span>
<span style="color:red"> red </span>
<span style="color:#ffd33d"> yellow </span>

### 텍스트 스타일
**굵은 텍스트**
*기울임체*
~~취소선~~
\`inline code\`

# 제목 1(h1)
## 제목 2(h2)
### 제목 3(h3)
#### 제목 4(h4)
##### 제목 5(h5)
###### 제목 6(h6)

### 순서 없는 리스트
- 첫 번째 항목
- 두 번째 항목
  - 중첩된 항목
  - 또 다른 중첩 항목
- 세 번째 항목

### 순서 있는 리스트
1. 첫 번째
2. 두 번째
3. 세 번째

## 링크와 이미지
[교보문고바로가기](https://product.kyobobook.co.kr/detail/S000217556025)

![image](https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791193937990.jpg)

## 인용문
> 마크다운은 간편한 텍스트 포맷팅 문법입니다.
> 마크다운은 간편한 텍스트 포맷팅 문법입니다.

## 테이블
| 이름 | 나이 | 직업 |
|------|------|------|
| 홍길동 | 30 | 개발자 |
| 김영희 | 28 | 디자이너 |
| 이순신 | 35 | 매니저 |

## 수평선
---
`)

const clickHelp = () => {
	markdown.value = markdownHelp.value;
}
const clickPreview = () => {
	markdown.value = inputText.value;
}
const clickAnalysis = () => {

	const today = "2026-01-01";

	const statistics = {
		count: times.length,
		first: utilAnaysis.first,
		latest: utilAnaysis.latest,
    bestAverage: utilAnaysis.setBestAverage(times),
		seasons: utilAnaysis.getSeasonBestAverage("2025-01-01"),
		months: utilAnaysis.getTimesBestByMonth(),
		quaters: {
			quater3: utilAnaysis.getQuaterBestAverage(today, 3),
			quater6: utilAnaysis.getQuaterBestAverage(today, 6),
			quater9: utilAnaysis.getQuaterBestAverage(today, 9),
			quater12: utilAnaysis.getQuaterBestAverage(today, 12),
		},
		// discipline 별 times
		times: utilAnaysis.disciplineTimes,
	};

	console.log(statistics);
	
	let str = '';
	
	str += `| 구분 | 기록 | 일자 |\n`;
	str += `|-|-|-|\n`;
	str += `|최초기록|${statistics.first.time}|${statistics.first.datetime}|\n`;
	str += `|최근기록|${statistics.latest.time}|${statistics.latest.datetime}|\n`;
	str += '  '

	str += "#### 최고/평균 기록\n"
	str += `| 구분 | 최초 | 최근 | 최고기록 | 평균 | time수 |\n`;
	str += `|---|---|---|---|---|---|\n`;
	//--------------------------------------------------
	for (const round of Object.keys(statistics.times)) { // R_LCM_50M
		const [ discipline, course, distance] = round.split('_');
		if (!discipline || !course || !distance) continue;

		const bestAverage = utilAnaysis.setBestAverage(statistics.times[round]);
		const arr = [];
		arr.push(`${discipline} ${course} ${distance}`);
		arr.push(`${statistics.first.time}<br />${statistics.first.datetime}`);
		arr.push(`${statistics.latest.time}<br />${statistics.latest.datetime}`);
		arr.push(`${bestAverage.besttime}<br />${bestAverage.datetime}`);
		arr.push(`${bestAverage.average}`);
		arr.push(`${bestAverage.count}`);
		str += `|${arr.join('|')}|\n`;
	}
	
	str += '  '
	str += "#### 시즌 기록\n"
	str += `| 구분 | 최고기록 | 일자 | 평균 | time수 |\n`;
	str += `|---|---|---|---|---|\n`;
	//--------------------------------------------------
	for (const round of Object.keys(statistics.seasons)) { // R_LCM_50M
		const [ discipline, course, distance] = round.split('_');
		if (!discipline || !course || !distance) continue;
		
		const arr = [];
		arr.push(`${discipline} ${course} ${distance}`);
		arr.push(`${statistics.seasons[round].besttime}`);
		arr.push(`${statistics.seasons[round].datetime}`);
		arr.push(`${statistics.seasons[round].average}`);
		arr.push(`${statistics.seasons[round].count}`);
		str += `|${arr.join('|')}|\n`;
	}
	
	str += '  '
	str += "#### 월별 기록\n"
	str += `| 구분 | 최고기록 | 일자 | 평균 | time수 |\n`;
	str += `|---|---|---|---|---|\n`;
	//--------------------------------------------------
	for (const round of Object.keys(statistics.months)) { // R_LCM_50M
		const [ discipline, course, distance, date] = round.split('_');
		if (!discipline || !course || !distance) continue;
		
		const arr = [];
		arr.push(`${discipline} ${course} ${distance} ${date}`);
		arr.push(`${statistics.months[round].besttime}`);
		arr.push(`${statistics.months[round].datetime}`);
		arr.push(`${statistics.months[round].average}`);
		arr.push(`${statistics.months[round].count}`);
		str += `|${arr.join('|')}|\n`;
	}
	
	str += '  '
	str += "#### 분기별 기록\n"
	str += `| 구분 | 최고기록 | 일자 | 평균 | time수 |\n`;
	str += `|---|---|---|---|---|\n`;
	//--------------------------------------------------
	for (const quater of Object.keys(statistics.quaters)) { // R_LCM_50M
		const quaterInfo = statistics.quaters[quater];
		for (const round of Object.keys(quaterInfo)) { // R_LCM_50M
			const [ discipline, course, distance] = round.split('_');
			if (!discipline || !course || !distance) continue;
			
			const arr = [];
			arr.push(`${quater} ${discipline} ${course} ${distance}`);
			arr.push(`${quaterInfo[round].besttime}`);
			arr.push(`${quaterInfo[round].datetime}`);
			arr.push(`${quaterInfo[round].average}`);
			arr.push(`${quaterInfo[round].count}`);
			str += `|${arr.join('|')}|\n`;
		}
	}
	
	str += '  '
	str += "#### Time\n"
	str += `| group | 구분 | time | rank | datetime | 대회\n`;
	str += `|---|---|---|---|---|---|\n`;
	//--------------------------------------------------
	for (const time of times) { // R_LCM_50M
		
		const arr = [];
		// arr.push(`${time.name}`);
		arr.push(`${time.group}`);
		arr.push(`${time.discipline} ${time.course} ${time.distance}`);
		arr.push(`${time.time}`);
		arr.push(`${time.rank}`);
		arr.push(`${time.datetime}`);
		arr.push(`${time.competitionName}`);
		// arr.push(`${time.name}`);
		str += `|${arr.join('|')}|\n`;
	}
	str += '\n\n'

	console.log("labels=", statistics.times["BR_LCM_50M"]);
	const labels = statistics.times["BR_LCM_50M"].map(t => {
    const date = new Date(t.datetime);
	console.log(`----->${date.getMonth() + 1}, ${date.getDate()}`);
    return "11"; `${date.getMonth() + 1}/${date.getDate()}`;
  });
	console.log("labels=", labels);

  const data = statistics.times["BR_LCM_50M"].map(t => (t.timeStamp*24*60*60).toFixed(2));


// 	str += "Line graph\n";
//   // X축 레이블 (날짜)
//   const xLabels = statistics.times["BR_LCM_50M"].map(t => {
//     const date = new Date(t.datetime);
//     return `${date.getMonth() + 1}/${date.getDate()}`;
//   }).join(',');
// 	console.log("xLabels=", xLabels);

//   // Y축 데이터 (timeStamp를 적절한 값으로 변환)
//   const yData = statistics.times["BR_LCM_50M"].filter(el => el.time).map(t => {
//     // timeStamp를 초 단위로 변환
//     return (Number(t.timeStamp*24*60*60)).toFixed(2);
//   }).join(',');
// 	console.log("yData=", yData);

//   str += `xychart-beta
//     title "기록 변화"
//     x-axis [${xLabels}]
//     y-axis "기록(초)" 0 --> 100
//     line [${yData}]`;

		str += "\n"
	
      str +=
`# 수영 기록 분석 보고서

## 선수 정보
- **이름**: 홍길동
- **종목**: 자유형 100M
- **분석 기간**: 2025년 1월 ~ 3월

## 훈련 내용
지속적인 **인터벌 트레이닝**과 **기술 향상 훈련**을 통해 
기록이 꾸준히 개선되고 있습니다.
`;
	markdown.value = str;
}
onMounted(() => {
  if (process.client) {
    import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({ 
        startOnLoad: true,
        theme: 'default'
      });
      mermaid.contentLoaded();
    });
  }
});
</script>


<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<!-- ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ -->
<style scoped>
</style>