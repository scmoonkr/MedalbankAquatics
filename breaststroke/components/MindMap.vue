<!-- components/HierarchicalMindMap.vue -->
<template>
  <div>
    <div class="controls mb-4">
      <button @click="addNode" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
        노드 추가
      </button>
      <button @click="resetMap" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        초기화
      </button>
    </div>
    <div ref="mindmapRef" class="mindmap-container w-full h-[600px] border border-gray-300 rounded overflow-auto"></div>
  </div>
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
import { ref, onMounted, watch, onUnmounted } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      name: 'root',
      children: [
        {
          name: 'child1',
          children: [
            { name: 'child11' },
            { name: 'child12' },
            { name: 'child13' },
            { name: 'child14' }
          ]
        },
        { name: 'child2' },
        { name: 'child3' },
        { name: 'child4' },
        { name: 'child5' },
        { name: 'child6' },
        { name: 'child7' },
        { name: 'child8' }
      ]
    })
  }
});

const mindmapRef = ref(null);
const treeData = ref(JSON.parse(JSON.stringify(props.initialData)));

// 노드 추가 함수
const addNode = () => {
  const randomParent = getRandomNode(treeData.value);
  if (!randomParent.children) {
    randomParent.children = [];
  }
  randomParent.children.push({
    name: `child${Math.floor(Math.random() * 1000)}`,
  });

  // 마인드맵 다시 그리기
  renderMindMap();
};

// 랜덤 노드 가져오기
const getRandomNode = (node) => {
  // 현재 노드를 선택하거나 자식 중 하나를 선택
  if (!node.children || node.children.length === 0 || Math.random() < 0.3) {
    return node;
  }

  const randomChild = node.children[Math.floor(Math.random() * node.children.length)];
  return getRandomNode(randomChild);
};

// 마인드맵 초기화
const resetMap = () => {
  treeData.value = JSON.parse(JSON.stringify(props.initialData));
  renderMindMap();
};

// 마인드맵 렌더링 함수
const renderMindMap = () => {
  if (!mindmapRef.value) return;

  // 기존 SVG 제거
  d3.select(mindmapRef.value).select('svg').remove();

  // 컨테이너 크기 가져오기
  const container = mindmapRef.value;
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // 가상의 큰 캔버스 만들기 (스크롤 가능하도록) - 크기 더 줄임
  const width = Math.max(containerWidth, 1000);
  const height = Math.max(containerHeight, 600);

  // SVG 생성
  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // 트리 레이아웃 생성 - 노드 간격 조정
  const tree = d3.tree()
    .size([height - 100, width / 3 - 100]) // 트리 크기 더 작게 조정 - 좌우 간격 축소
    .separation((a, b) => {
      // 노드 간 간격 조정 - 간격 더 줄이기
      return (a.parent === b.parent ? 1 : 1.2) * (a.depth === 0 ? 1.2 : 1);
    });

  // 계층 구조 생성
  const root = d3.hierarchy(treeData.value);

  // 루트 노드 위치 설정
  root.x0 = height / 2;
  root.y0 = 0;

  // 노드 상대적 위치 설정 (왼쪽/오른쪽)
  let i = 0;
  root.descendants().forEach(d => {
    d.id = i++;
    if (d.depth === 1) {
      // 첫 번째 층의 노드를 왼쪽/오른쪽으로 구분
      if (d.id <= root.children.length / 2) {
        d.direction = 'left';
      } else {
        d.direction = 'right';
      }
    } else if (d.depth > 1) {
      // 부모 노드의 방향을 따름
      d.direction = d.parent.direction;
    }
  });

  // 좌표 계산
  const treeRoot = tree(root);

  // 노드 변형 (왼쪽/오른쪽 배치)
  treeRoot.descendants().forEach(d => {
    if (d.direction === 'left') {
      d.y = -d.y; // 왼쪽 방향 노드의 y 좌표 반전
    }
  });

  // 링크 그리기
  svg.selectAll(".link")
    .data(treeRoot.links())
    .join("path")
    .attr("class", "link")
    .attr("d", d => {
      // 링크 커브 조정 - 더 짧고 직접적인 연결
      return `M${d.source.y},${d.source.x}
              C${(d.source.y + d.target.y) / 2},${d.source.x}
               ${(d.source.y + d.target.y) / 2},${d.target.x}
               ${d.target.y},${d.target.x}`;
    })
    .attr("fill", "none")
    .attr("stroke", "#2563eb")
    .attr("stroke-width", 2);

  // 노드 그룹 생성
  const node = svg.selectAll(".node")
    .data(treeRoot.descendants())
    .join("g")
    .attr("class", d => `node ${d.children ? "node--internal" : "node--leaf"}`)
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .attr("cursor", "pointer")
    .on("click", (event, d) => {
      // 노드 클릭 이벤트 - 확장/축소 로직
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else if (d._children) {
        d.children = d._children;
        d._children = null;
      }
      renderMindMap();
    });

  // 노드 크기 조정 - 더 작게
  const nodePadding = 8;
  const nodeHeight = 30;

  // 노드 사각형 그리기
  node.append("rect")
    .attr("width", d => Math.max(d.data.name.length * 7 + 20, 60)) // 너비 조정
    .attr("height", nodeHeight)
    .attr("x", d => d.direction === 'left' ? -(d.data.name.length * 7 + 20) : 0) // 위치 조정
    .attr("y", -nodeHeight / 2) // 중앙 정렬을 위한 위치 조정
    .attr("rx", 8) // 모서리 둥글게
    .attr("ry", 8)
    .attr("fill", "white")
    .attr("stroke", "#2563eb")
    .attr("stroke-width", 1.5);

  // 노드 텍스트 그리기
  node.append("text")
    .attr("dy", ".3em")
    .attr("x", d => d.direction === 'left' ? -((Math.max(d.data.name.length * 7 + 20, 60)) / 2) : (Math.max(d.data.name.length * 7 + 20, 60)) / 2)
    .attr("text-anchor", "middle")
    .text(d => d.data.name)
    .attr("fill", "#333")
    .attr("font-size", "12px"); // 글꼴 크기 조정

  // 초기 위치로 스크롤 (중앙 맞춤)
  container.scrollLeft = (width - containerWidth) / 2;
  container.scrollTop = (height - containerHeight) / 2;

  // 빈 공간 감지하여 중앙에 배치하기 위한 바운딩 박스 계산
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  treeRoot.descendants().forEach(d => {
    const nodeWidth = Math.max(d.data.name.length * 7 + 20, 60);
    const left = d.y - (d.direction === 'left' ? nodeWidth : 0);
    const right = d.y + (d.direction === 'left' ? 0 : nodeWidth);

    minX = Math.min(minX, left);
    maxX = Math.max(maxX, right);
    minY = Math.min(minY, d.x - nodeHeight / 2);
    maxY = Math.max(maxY, d.x + nodeHeight / 2);
  });

  // SVG 크기 조정
  const actualWidth = maxX - minX + 100; // 여백 추가
  const actualHeight = maxY - minY + 100;

  d3.select(container).select('svg')
    .attr("width", Math.max(actualWidth, containerWidth))
    .attr("height", Math.max(actualHeight, containerHeight));

  // 중앙 위치 조정
  svg.attr("transform", `translate(${-minX + 50}, ${-minY + 50})`);
};

// 초기 렌더링
onMounted(() => {
  renderMindMap();

  // 창 크기 변경 시 마인드맵 다시 그리기
  window.addEventListener('resize', renderMindMap);
});

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('resize', renderMindMap);
});

// initialData가 변경되면 마인드맵 다시 그리기
watch(() => props.initialData, (newData) => {
  treeData.value = JSON.parse(JSON.stringify(newData));
  renderMindMap();
}, { deep: true });
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
.mindmap-container {
  overflow: auto;
  /* 스크롤 가능하게 설정 */
  position: relative;
  background-color: #fafafa;
  /* 배경색 추가 */
}

/* 스크롤바 스타일링 */
.mindmap-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.mindmap-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.mindmap-container::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 4px;
}

.mindmap-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>