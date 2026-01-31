const custom_qtn = [
    'Mennyi a testsúlyod? (kg)',
    'Hány éves vagy?',
    'Mekkora a testmagasságod? (cm)'
];

const ans_qtn = [
    'Mi a nemed?',
    'Mi a fő célod az edzéssel?',
    'Milyen az edzettségi szinted?',
    'Hetente hány napot tudsz edzésre szánni?',
    'Hol edzel leggyakrabban?',
    'Milyen étrendet követsz?',
    'Naponta általában hányszor étkezel?'
];

const ans = [
    [
        "férfi",
        "nő"
    ],

    [
        "tömegnövelés",
        "zálkásítás",
        "szintentartás"
    ],

    [
        "kezdő (0–6 hónap)",
        "középhaladó (6–24 hónap)",
        "haladó (2+ év)"
    ],

    [
        "2–3 nap",
        "4 nap",
        "5–6 nap"
    ],

    [
        "konditeremben",
        "otthon, súlyzókkal",
        "otthon, saját testsúllyal"
    ],

    [
        "mindenevő",
        "vegetáriánus",
        "vegán"
    ],

    [
        "2–3 alkalom",
        "4–5 alkalom",
        "6 vagy több alkalom"
    ]
];

const userProfile = {
    weight: null,
    age: null,
    height: null,
    gender: null,
    goal: null,
    experienceLevel: null,
    trainingDays: null,
    trainingLocation: null,
    dietType: null,
    mealsPerDay: null
};
