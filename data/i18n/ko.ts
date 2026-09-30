/**
 * Korean dictionary. Mirrors data/i18n/en.ts field by field (the Dictionary type keeps the two in sync).
 * Gesture NAMES stay in English on purpose (the catalog's card labels such as "Tilt object up" and the OPS/OC codes are
 * the canonical names experts refer to); only the gesture descriptions, family definitions, commands and UI text are Korean.
 */
import { phaseC } from "@/data/trialQuestions";
import { backgroundQuestionnaire, finalQuestionnaire } from "@/data/questionnaires";
import { gestures } from "@/data/gestures";
import type { CommandId, GestureId } from "@/types/study";
import type { Dictionary } from "@/lib/i18n/types";

const gestureDescriptionKo: Record<GestureId, string> = {
  OPS_TAP: "엄지로 물체 표면을 한 번 두드립니다.",
  OPS_DOUBLE_TAP: "엄지로 물체 표면을 빠르게 두 번 두드립니다.",
  OPS_SWIPE_UP: "엄지를 물체 표면을 따라 위로 밀어 올립니다.",
  OPS_SWIPE_DOWN: "엄지를 물체 표면을 따라 아래로 밀어 내립니다.",
  OPS_SWIPE_LEFT: "엄지를 물체 표면을 따라 왼쪽으로 밉니다.",
  OPS_SWIPE_RIGHT: "엄지를 물체 표면을 따라 오른쪽으로 밉니다.",
  OPS_CIRCLE: "엄지로 물체 표면에 작은 원을 그립니다.",
  OC_TILT_UP: "잡은 물체를 위로 살짝 기울였다가 되돌립니다.",
  OC_TILT_DOWN: "잡은 물체를 아래로 살짝 기울였다가 되돌립니다.",
  OC_TILT_LEFT: "잡은 물체를 왼쪽으로 살짝 기울였다가 되돌립니다.",
  OC_TILT_RIGHT: "잡은 물체를 오른쪽으로 살짝 기울였다가 되돌립니다.",
  OC_TAP: "물체 전체로 짧게 두드리는 듯한 동작을 한 번 하고 되돌립니다.",
  OC_DOUBLE_TAP: "물체 전체로 짧게 두드리는 듯한 동작을 빠르게 두 번 하고 되돌립니다.",
  OC_CIRCLE: "물체 전체를 작은 원을 그리듯 움직였다가 되돌립니다.",
};

const commandKo: Record<CommandId, { label: string; description: string }> = {
  NEXT_STEP: { label: "다음 단계", description: "다음 안내 단계로 이동합니다." },
  PREVIOUS_STEP: { label: "이전 단계", description: "이전 안내 단계로 돌아갑니다." },
  REPLAY_INSTRUCTION: { label: "안내 다시 재생", description: "현재 안내를 다시 재생합니다." },
  CONFIRM_DONE: { label: "완료 확인", description: "현재 단계를 마쳤음을 확인합니다." },
  UNDO_CANCEL: { label: "실행 취소 / 취소", description: "마지막 동작을 되돌리거나 현재 동작을 취소합니다." },
  PAUSE_RESUME: { label: "일시정지 / 재개", description: "안내를 일시정지하거나 재개합니다." },
};

const likertKo: Record<string, { title: string; prompt: string; anchors: [string, string] }> = {
  feasibility: {
    title: "물리적 실행 가능성 및 파지 유지",
    prompt: "추천된 제스처를, 물체를 한 손으로 자연스럽게 잡은 상태를 유지하면서 수행할 수 있다고 생각하십니까?",
    anchors: ["전혀 그렇지 않다", "매우 그렇다"],
  },
  task_compatibility: {
    title: "과제 호환성",
    prompt: "추천된 제스처가 이 물체로 하는 자연스러운 과제 동작을 방해하거나 그 동작과 혼동될 가능성이 낮다고 생각하십니까?",
    anchors: ["전혀 그렇지 않다", "매우 그렇다"],
  },
  safety: {
    title: "안전성",
    prompt: "물체의 상태와 주변 환경을 고려할 때, 추천된 제스처를 안전하게 수행할 수 있다고 생각하십니까?",
    anchors: ["매우 안전하지 않다", "매우 안전하다"],
  },
  semantic_compatibility: {
    title: "의미 호환성",
    prompt: "추천된 제스처가 현재 AR 명령의 의미와 직관적으로 잘 맞는다고 생각하십니까?",
    anchors: ["전혀 아니다", "매우 잘 맞는다"],
  },
};

const finalKo: Record<string, { prompt: string; anchors?: [string, string] }> = {
  catalog_clarity: { prompt: "카탈로그의 14개 제스처는 서로 명확하게 구별되었다.", anchors: ["전혀 그렇지 않다", "매우 그렇다"] },
  task_understanding: { prompt: "대상 물체를 한 손으로 잡은 상황을, 제스처를 판단할 수 있을 만큼 충분히 상상할 수 있었다.", anchors: ["전혀 그렇지 않다", "매우 그렇다"] },
  recommendation_quality: { prompt: "전체적으로 시스템 추천은 제시된 상황에 적절했다.", anchors: ["전혀 그렇지 않다", "매우 그렇다"] },
  considerations: { prompt: "모든 시행을 돌아볼 때, 제스처를 고를 때 가장 많이 의지한 고려 사항은 무엇입니까? 본인의 말로 설명해 주세요." },
  missing_gestures: { prompt: "고르고 싶었지만 카탈로그에 없던 제스처가 있었습니까? 어떤 제스처였고, 어떤 상황에서였습니까?" },
  recommendation_feedback: { prompt: "시스템 추천에 대해 바꾸고 싶은 점이 있습니까? (잘 맞춘 점, 놓친 점)" },
  comments: { prompt: "연구나 자료에 대한 그 밖의 의견이 있습니까?" },
};

const roleKo: Record<string, string> = {
  faculty: "교수 / 연구책임자",
  postdoc: "박사후연구원",
  phd_student: "박사과정",
  ms_student: "석사과정",
  industry_researcher: "산업체 연구원",
  designer_engineer: "인터랙션 디자이너 / 엔지니어",
  other: "기타 (직접 입력)",
};

const categoryKo: Record<string, string> = {
  gesture_interaction_design: "제스처 인터랙션 디자인",
  gesture_elicitation: "제스처 유도(elicitation)",
  gesture_recognition: "제스처 인식",
  imu_interaction: "IMU 기반 인터랙션",
  vision_hand_interaction: "비전 기반 손 인터랙션",
  xr_interaction: "XR 인터랙션",
  user_study_evaluation: "사용자 연구 / 평가",
  other: "기타 (직접 입력)",
};

const yearsKo: Record<string, string> = {
  hciYears: "HCI 경력 (년)",
  xrYears: "XR 경력 (년)",
  gestureYears: "제스처 관련 연구 또는 실무 경력 (년)",
};

export const ko: Dictionary = {
  locale: "ko",
  languageName: "한국어",
  studyName: "손이 바쁜 AR 상호작용을 위한 제스처 선택",
  landing: {
    subtitle: "전문가 스터디",
    title: "손이 바쁜 AR 상호작용을 위한 제스처 선택",
    body: [
      "참여해 주셔서 감사합니다. 이 세션에서는 짧은 1인칭 영상을 보고, 강조된 물체를 한 손으로 잡고 있다고 상상한 뒤, AR 명령에 알맞은 제스처를 고르게 됩니다.",
      "실험자가 알려 드린 참가자 ID를 입력해 주세요. 이미 시작하셨다면 같은 ID를 입력하면 중단한 지점부터 이어집니다.",
    ],
    idLabel: "참가자 ID",
    idPlaceholder: "예: E01",
    start: "시작 / 이어하기",
    starting: "시작하는 중…",
    resumeBefore: "이 브라우저에 ",
    resumeAfter: " 세션이 있습니다. 시작을 누르면 이어서 진행됩니다.",
    experimenterInterface: "실험자 인터페이스",
  },
  blockChoice: {
    legend: "이번 세션에서 사용할 명령 집합",
    help: "실험자가 어느 쪽으로 진행할지 알려 드립니다. 어느 쪽이든 18개 상황을 모두 보며, AR 명령 세 가지만 달라집니다.",
    blockBody: {
      NAV: "설명을 넘기는 명령: 다음 단계, 이전 단계, 설명 다시 듣기.",
      CTRL: "현재 단계를 제어하는 명령: 완료 확인, 실행 취소, 일시정지/재개.",
    },
  },
  exportPanel: {
    title: "응답 저장하기",
    body: [
      "응답은 이 브라우저에만 저장되어 있습니다. 지금 내려받아 실험자에게 파일을 보내 주세요. 자동으로 전송되는 것은 없습니다.",
      "파일이 저장될 때까지 이 페이지를 닫지 마세요. 브라우저의 사이트 데이터를 지우면 응답도 사라집니다.",
    ],
    downloadCsv: "응답 내려받기 (CSV)",
    downloadJson: "전체 기록 내려받기 (JSON)",
    sendTo: "파일 보낼 곳",
    downloaded: "내려받았습니다. 파일을 보내신 뒤 이 페이지를 닫으셔도 됩니다.",
    nothingToExport: "이 브라우저에 저장된 응답이 없습니다.",
  },
  consent: {
    title: "연구 참여 동의",
    sections: [
      { heading: "목적", body: "이 연구는 일상 물체를 손에 든 상태에서 증강현실(AR) 안내 시스템을 조작할 때 어떤 손 제스처 또는 물체 제스처가 적절한지에 대한 전문가의 판단을 수집합니다." },
      { heading: "절차", body: "짧은 배경 설문에 답한 뒤 제스처 카탈로그를 살펴보고, 연습 시행 1회를 거쳐 본 시행을 진행합니다. 각 시행에서는 짧은 영상을 보고, AR 명령 하나에 대한 제스처를 고른 다음, 시스템이 생성한 추천을 검토하고 평가합니다. 마지막에 짧은 설문으로 세션을 마칩니다. 세션은 약 90~120분이 소요됩니다." },
      { heading: "데이터", body: "응답, 타임스탬프, 배경 정보는 참가자 ID로 저장됩니다. 참가자의 영상이나 음성은 녹화하지 않습니다. 데이터는 집계 또는 익명화된 형태로 분석·보고됩니다." },
      { heading: "자발적 참여", body: "참여는 자발적입니다. 이유를 밝히지 않고 언제든 중단할 수 있습니다. 이미 저장된 응답은 삭제를 요청하지 않는 한 보관됩니다." },
      { heading: "문의", body: "연구에 대해 궁금한 점이 있으면 언제든 실험자에게 물어봐 주세요." },
    ],
    checkbox: "위 내용을 읽었으며 이 연구에 참여하는 데 동의합니다.",
    agree: "동의하고 계속",
  },
  introduction: {
    title: "연구 소개",
    bullets: [
      "이 연구는 기존 기본 과제의 영상 18개를 사용합니다. 각 영상은 사람이 특정 물체를 막 집으려는 상황을 보여 줍니다.",
      "각 시행에서는 상황이 암시하는 방식대로 대상 물체를 한 손으로 자연스럽게 잡고 있다고 상상해 주세요.",
      "제시된 AR 명령에 대해 14개 제스처로 이루어진 고정 카탈로그에서 제스처를 고릅니다. 정답이 하나로 정해져 있지는 않습니다.",
      "본인이 중요하다고 생각하는 고려 사항을 자유롭게 적용해 주세요. 저희는 참가자 본인의 판단과 그 이유에 관심이 있습니다.",
      "본인의 선택을 제출한 뒤에는 같은 명령에 대한 시스템 추천이 표시되며, 이를 검토해 주시게 됩니다.",
      "선택을 제출하면 되돌릴 수 없습니다. 제출 전에 충분히 시간을 들여 주세요.",
      "답변은 자동으로 저장됩니다. 브라우저가 닫혀도 참가자 ID를 다시 입력하면 이어서 진행할 수 있습니다.",
    ],
    continue: "제스처 카탈로그로 계속",
  },
  tutorial: {
    title: "제스처 카탈로그",
    body: [
      "카탈로그에는 두 그룹, 총 14개 제스처가 있습니다. 카드는 모든 시행에서 같은 순서로 나타납니다.",
      "각 카드를 읽어 주세요. 시연이 있는 경우 카드 안에서 재생됩니다.",
    ],
    acknowledge: "14개 제스처를 모두 살펴보았고 두 그룹을 이해했습니다.",
    continue: "연습 시행으로 계속",
  },
  practice: {
    banner: "연습 시행입니다. 화면에 익숙해지기 위한 것으로, 이 시행의 답변은 연구 데이터에 포함되지 않습니다.",
    done: "연습이 끝났습니다. 다음은 본 시행입니다.",
    continue: "본 시행 시작",
  },
  background: {
    title: "배경 정보",
    intro: "경험에 관한 몇 가지 질문입니다.",
    participantId: "참가자 ID",
    role: "역할",
    selectPlaceholder: "선택…",
    roleOther: "역할을 적어 주세요",
    categoriesLegend: "제스처 관련 경험 분야",
    selectAll: "해당하는 항목을 모두 선택하세요.",
    otherCategory: "기타 분야",
    continue: "계속",
    roles: backgroundQuestionnaire.roles.map((r) => ({ value: r.value, label: roleKo[r.value] ?? r.label })),
    categories: backgroundQuestionnaire.categories.map((c) => ({ value: c.value, label: categoryKo[c.value] ?? c.label })),
    years: backgroundQuestionnaire.years.map((y) => ({ key: y.key, label: yearsKo[y.key] ?? y.label })),
    expertisePrompt: "관련 전문성(프로젝트, 시스템, 연구, 방법 등)을 간략히 설명해 주세요.",
  },
  trial: {
    imagine: "이 물체를 한 손으로 자연스럽게 잡고 있다고 상상해 주세요.",
    commandLabel: "AR 명령",
    targetLabel: "대상 물체",
    locked: "선택이 제출되어 더 이상 변경할 수 없습니다.",
    awaiting: "이 시행의 시스템 추천이 아직 준비되지 않았습니다. 실험자에게 알려 주세요. 선택은 저장되었습니다.",
    retry: "다시 확인",
    checking: "확인 중",
    nextTrial: "다음 시행",
    yourBest: "내가 고른 가장 적절한 제스처",
    systemGesture: "시스템 추천",
    replayVideo: "영상 다시 보기",
    videoAria: (target) => `상황 영상, 대상 물체: ${target}`,
    practiceTitle: "연습 시행",
    trialTitle: (index, total) => `시행 ${index} / ${total}`,
    progress: (done, total) => `${total}개 중 ${done}개 완료`,
    phaseLabel: { elicitation: "나의 선택", awaiting_recommendation: "나의 선택 (제출됨)", evaluation: "시스템 추천", reflection: "나의 의견", completed: "완료" },
    submittedReadonly: "제출한 선택 (읽기 전용)",
    completed: "시행이 완료되었습니다.",
    chips: { system: "시스템", best: "최적", selected: "선택", excluded: "제외" },
    demonstration: (label) => `${label} 시연`,
  },
  phaseA: {
    q1: "이 물체를 한 손으로 자연스럽게 잡은 상태에서 이 명령을 실행하기에 적절하다고 생각하는 제스처를 모두 선택해 주세요.",
    q2: "그중 가장 적절한 제스처는 무엇입니까?",
    q2Help: "위에서 선택한 제스처 중에서 고르세요.",
    q3: "이렇게 선택한 가장 중요한 이유는 무엇입니까? 판단에 영향을 준 현재 장면의 정보가 있다면 함께 적어 주세요.",
    q4: "고려했지만 결국 제외한 제스처가 있습니까?",
    q4Help: "선택 사항입니다. 고려했다가 제외한 제스처가 있으면 선택하세요.",
    q4Why: "왜 제외했습니까?",
    submit: "선택 제출",
    confirmTitle: "선택을 제출할까요?",
    confirmBody: "제출하면 시스템 추천이 공개되며, 선택 응답은 더 이상 수정할 수 없습니다.",
    confirmYes: "제출하고 추천 보기",
    confirmNo: "돌아가기",
    selectInQ1First: "먼저 Q1에서 제스처를 선택하세요.",
    completeRequired: "위의 필수 항목을 완료해 주세요.",
    submitting: "제출하는 중…",
    summaryBefore: "가장 적절한 제스처: ",
    summaryAfter: (n) => ` (${n}개 선택).`,
    errors: {
      selectAtLeastOne: "제스처를 하나 이상 선택하세요.",
      chooseBest: "선택한 제스처 중에서 가장 적절한 것을 고르세요.",
      giveReason: "이유를 적어 주세요.",
      whyExcluded: "이 제스처들을 제외한 이유를 적어 주세요.",
      couldNotSubmit: "제출하지 못했습니다. 다시 시도해 주세요.",
    },
  },
  phaseC: {
    intro: "시스템이 이 명령에 대해 아래 제스처를 추천했습니다. 추천을 평가해 주세요.",
    likert: phaseC.likert.map((q) => ({ key: q.key, ...(likertKo[q.key] ?? { title: q.title, prompt: q.prompt, anchors: q.anchors }) })),
    verdictPrompt: "전체적으로 시스템 추천을 어떻게 판단하십니까?",
    verdicts: [
      { value: "accept_as_is", label: "그대로 수용" },
      { value: "usable_with_modification", label: "수정하면 사용 가능" },
      { value: "reject", label: "사용하기 어려움 / 거부" },
    ],
    submit: "계속",
    answerAll: "다섯 문항에 모두 답하면 계속할 수 있습니다.",
    couldNotContinue: "계속 진행하지 못했습니다",
  },
  phaseD: {
    title: "나의 의견",
    titles: { q10: "추천 평가의 근거", q11: "장면 단서", q12: "본인 선택과 시스템 추천의 비교", q13: "일반화" },
    q10: "시스템의 추천 결과를 그렇게 평가한 가장 중요한 이유는 무엇입니까?",
    q11: "현재 장면에서 어떤 정보가 위 판단에 가장 큰 영향을 주었습니까?",
    q12: "처음 본인이 선택한 제스처와 시스템이 추천한 제스처를 비교했을 때, 두 선택의 관계를 어떻게 생각하십니까? 그 이유를 설명해 주세요.",
    q13: "위에서 설명한 판단 기준이 다른 물체나 장면에도 적용될 수 있다고 생각하십니까? 그렇다면 어떤 상황에 적용될 수 있으며, 적용되지 않는 예외가 있다면 설명해 주세요.",
    submit: "이 시행 완료",
    backToRatings: "평가로 돌아가기",
    answerAll: "모든 문항에 답하면 시행을 완료할 수 있습니다.",
    couldNotComplete: "시행을 완료하지 못했습니다",
  },
  final: {
    title: "최종 설문",
    body: "세션 전체에 대한 몇 가지 마무리 질문입니다.",
    submit: "제출하고 마치기",
    items: finalQuestionnaire.map((it) => ({
      ...it,
      prompt: finalKo[it.key]?.prompt ?? it.prompt,
      anchors: it.anchors ? finalKo[it.key]?.anchors ?? it.anchors : undefined,
    })),
    defaultAnchors: ["전혀 그렇지 않다", "매우 그렇다"],
  },
  completion: {
    title: "감사합니다",
    body: [
      "모든 시행과 최종 설문을 완료하셨습니다. 응답이 저장되었습니다.",
      "실험자에게 완료했다고 알려 주세요.",
    ],
    participantId: "참가자 ID",
    completedAt: "완료",
  },
  ui: {
    saving: "저장 중…",
    saved: "저장됨",
    notSaved: (err) => `저장되지 않음 (${err}) – 재시도 중`,
    retrying: "재시도 중",
    loading: "불러오는 중",
    somethingWrong: "문제가 발생했습니다",
    couldNotCheck: "확인하지 못했습니다",
    couldNotGoBack: "돌아가지 못했습니다",
  },
  header: {
    participant: "참가자",
    stages: { consent: "동의", background: "배경 정보", introduction: "소개", tutorial: "제스처 카탈로그", practice: "연습", trials: "본 시행", final: "최종 설문", complete: "완료" },
  },
  errors: {
    noPractice: "이 참가자의 연습 시행이 생성되지 않았습니다. 실험자에게 알려 주세요.",
    trialNotFound: (order) => `시행 ${order}을(를) 찾을 수 없습니다. 실험자에게 알려 주세요.`,
  },
  families: {
    OPS: { label: "물체 위 엄지 제스처 (OPS)", definition: "잡은 물체의 표면 위에서 엄지가 움직이며, 물체는 그대로 있습니다." },
    OC: { label: "물체 움직임 제스처 (OC)", definition: "잡은 물체 전체가 살짝 움직였다가 되돌아오며, 파지는 바뀌지 않습니다." },
  },
  // gesture names stay English (see the header comment); only the description is Korean
  gestures: Object.fromEntries(gestures.map((g) => [g.id, { label: g.label, description: gestureDescriptionKo[g.id] }])) as Dictionary["gestures"],
  commands: commandKo,
  blocks: { NAV: "탐색", CTRL: "제어" },
  objects: {
    knife: "칼",
    dumbbell: "아령",
    "vacuum handle": "청소기 손잡이",
    toy: "장난감",
    "soccer ball": "축구공",
    "tennis ball": "테니스공",
    phone: "휴대폰",
    "baking tray": "베이킹 트레이",
    "whiteboard eraser": "화이트보드 지우개",
    bag: "가방",
    pitcher: "물병(피처)",
    bucket: "양동이",
    screw: "나사",
    needle: "바늘",
    toothbrush: "칫솔",
    lighter: "라이터",
    "playing cards": "카드",
    ruler: "자",
    mug: "머그컵",
  },
};
