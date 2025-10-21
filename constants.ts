import { ArtStyleOption, QualityOption } from './types';

export const inspirationalPrompts: string[] = [
  "별빛 아래에서 책을 읽는 어린 왕자",
  "미래 도시의 골목길을 탐험하는 고양이",
  "숲 속 오두막의 벽난로 앞",
  "구름 위를 항해하는 비행선",
  "마법의 숲에서 길을 잃은 기사",
  "밤하늘의 은하수를 그리는 여우",
  "수정 동굴 속에서 빛나는 꽃",
  "고대 유적을 지키는 기계 골렘",
  "시간을 여행하는 낡은 기차",
  "바다 깊은 곳의 숨겨진 도시",
];

export const artStyleOptions: ArtStyleOption[] = [
  { id: '클래식', label: '클래식' },
  { id: '모노크롬 잉크', label: '모노크롬 잉크' },
  { id: '파스텔 수채화', label: '파스텔 수채화' },
  { id: '우키요에', label: '우키요에' },
  { id: '아르누보', label: '아르누보' },
  { id: '사이버펑크 글리치', label: '사이버펑크' },
];

export const qualityOptions: QualityOption[] = [
  { id: 'Standard', label: '표준' },
  { id: 'High', label: '고품질' },
];
