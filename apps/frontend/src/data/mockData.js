export const RECIPE = {
    title: "Chickpea & Feta Salad",
    tags: ["Vegetarian", "Mediterranean"],
    time: "20 min",
    cal: "340 cal",
    photo: "https://images.unsplash.com/photo-1614548540093-6f7dfceed46b?w=600&q=80?w=900&q=80",
    ingredients: [
        { id: 1, name: "Baby spinach", qty: "3 cups" },
        { id: 2, name: "Cherry tomatoes, halved", qty: "1 cup" },
        { id: 3, name: "Feta, crumbled", qty: "1/2 cup" },
        { id: 4, name: "Chickpeas, drained", qty: "1 can" },
        { id: 5, name: "Red onion, thin sliced", qty: "1/4 cup" },
        { id: 6, name: "Lemon, juiced", qty: "1" },
    ],
    steps: [
        "Rinse and drain the chickpeas, then pat dry with a towel.",
        "Whisk lemon juice, olive oil, salt and pepper in a small bowl for the dressing.",
        "Combine spinach, tomatoes, onion and chickpeas in a large bowl. Toss with dressing.",
        "Top with crumbled feta and serve immediately.",
    ],
};

export const WEEK = [
    { day: "MON", meals: [{ title: "Chickpea & Feta Salad", photo: RECIPE.photo }] },
    { day: "TUE", meals: [] },
    {
        day: "WED",
        meals: [
            { title: "Miso Glazed Salmon", photo: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80" },
            { title: "Garlic Noodles", photo: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80" },
        ],
    },
    { day: "THU", meals: [] },
    { day: "FRI", meals: [{ title: "Sheet-Pan Fajitas", photo: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80" }] },
    { day: "SAT", meals: [{ title: "Weekend Pancakes", photo: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80" }] },
    { day: "SUN", meals: [] },
];