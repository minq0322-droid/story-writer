// Characters and places: the author's own notes about the people and places of a work.
// Our advantage over Ulysses: each entry knows which chapters it appears in, counted from the manuscript itself.
export const castFields = {
  character: [['role', '역할'], ['age', '나이·시대'], ['look', '외형'], ['nature', '성격'], ['want', '바라는 것'], ['ties', '관계'], ['note', '메모']],
  place: [['kind', '종류'], ['look', '모습'], ['sound', '소리·냄새'], ['history', '내력'], ['note', '메모']]
};
export const cast = [
  { id: 1, type: 'character', name: '소하', aliases: [], line: '사라진 바다의 편지를 모으는 등대지기.', role: '주인공', age: '스물여덟', look: '짧은 머리, 늘 젖지 않는 외투', nature: '조용하지만 고집이 세다', want: '지도에 없는 항구를 찾는 것', ties: '노인에게 편지를 받는다', note: '' },
  { id: 2, type: 'character', name: '노인', aliases: ['수문지기'], line: '마지막 파도 소리를 기억하는 사람.', role: '조력자', age: '알 수 없음', look: '손바닥에 늘 작은 돌', nature: '말보다 손짓이 많다', want: '수문을 다시 여는 것', ties: '소하의 아버지를 안다', note: '' },
  { id: 3, type: 'place', name: '항구', aliases: ['부두'], line: '물이 빠진 뒤 그림자만 남은 곳.', kind: '마을', look: '마른 부두와 기울어진 기둥', sound: '밧줄이 기둥을 두드리는 소리', history: '조수가 멈춘 날부터 비어 있다', note: '' },
  { id: 4, type: 'place', name: '등대', aliases: [], line: '불이 꺼진 시각이 기록된 탑.', kind: '건물', look: '흰 벽, 꼭대기의 깨진 유리', sound: '바람이 계단을 타고 오르는 소리', history: '', note: '' }
];
export function appearances(entry, chapters, bodyOf) {
  const names = [entry.name, ...(entry.aliases || [])].filter(Boolean);
  return chapters.map((chapter, index) => {
    const text = bodyOf(index).replace(/<[^>]+>/g, ' ');
    const count = names.reduce((sum, name) => sum + (text.split(name).length - 1), 0);
    return { index, title: chapter.title, count };
  }).filter(item => item.count > 0);
}
