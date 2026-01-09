// 50 CMR Students - Pre-seeded Biometric Profiles
export const CLASSROOM_FACES = Array.from({ length: 50 }, (_, i) => ({
    student_id: `STU${String(i + 1).padStart(3, '0')}`,
    name: i === 0 ? 'Rahul' : i === 1 ? 'Priya' : i === 2 ? 'Arjun' : `Student ${i + 1}`,
    roll_number: `22K61A0${501 + i}`,
    embedding: Array(128).fill(0).map(() => Math.random()), // Mock 128D vectors
    class_id: "CS101",
    status: 'ENROLLED'
}));
