import { Subject, StudyAvailability } from '../types/study';

/**
 * Returns formatted date strings relative to today.
 */
export function getRelativeDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

/**
 * Default subject curriculum topics for realistic timetable generation.
 */
export const SUBJECT_TOPIC_BANK: Record<string, string[]> = {
  DBMS: [
    'ER Modeling & Relational Schema',
    'Functional Dependencies & Normalization (1NF to BCNF)',
    'SQL Queries, Joins & Subqueries',
    'Transaction Management & ACID Properties',
    'Concurrency Control & Two-Phase Locking',
    'Indexing (B-Trees & B+ Trees)',
    'Recovery Techniques & WAL',
    'High-Yield Practice Questions & Past Papers',
  ],
  COA: [
    'Data Representation & Register Transfer',
    'CPU Architecture & Instruction Cycles',
    'Instruction Formats & Addressing Modes',
    'Pipelining & Pipeline Hazards',
    'Cache Memory Organization & Mapping',
    'Virtual Memory & Page Replacement',
    'Interrupts, I/O Organization & DMA',
    'Comprehensive Review & Formula Sheet',
  ],
  Python: [
    'Control Flow, Loops & Comprehensions',
    'Functions, Scope & Lambda Expressions',
    'Object-Oriented Programming (OOP) & Inheritance',
    'Built-in Data Structures (Lists, Dicts, Sets)',
    'Exception Handling & File I/O',
    'Key Modules: math, sys, re & collections',
    'Algorithmic Problem Solving in Python',
    'Mock Coding Test & Syntax Refresher',
  ],
  Mathematics: [
    'Matrices, Determinants & Eigenvalues',
    'Differential Calculus & Partial Derivatives',
    'Integral Calculus & Multiple Integrals',
    'Ordinary Differential Equations (ODEs)',
    'Probability Distributions & Bayes Theorem',
    'Vector Spaces & Linear Transformations',
    'Fourier Series & Laplace Transforms',
    'Formula Drills & Problem Sets',
  ],
};

/**
 * Default Hackathon Demo Dataset matching the user's explicit specification:
 * DBMS (Oct 5 / in 3 days, Hard, 30% prep)
 * COA (Oct 8 / in 6 days, Hard, 50% prep)
 * Python (Oct 12 / in 10 days, Medium, 70% prep)
 * Mathematics (Oct 15 / in 13 days, Easy, 80% prep)
 */
export function getDemoSubjects(): Subject[] {
  return [
    {
      id: 'sub-dbms',
      name: 'DBMS',
      examDate: getRelativeDateString(3),
      difficulty: 'Hard',
      currentPreparation: 30,
      color: '#ef4444', // Red / Rose
      topics: SUBJECT_TOPIC_BANK['DBMS'],
    },
    {
      id: 'sub-coa',
      name: 'COA',
      examDate: getRelativeDateString(6),
      difficulty: 'Hard',
      currentPreparation: 50,
      color: '#f97316', // Orange
      topics: SUBJECT_TOPIC_BANK['COA'],
    },
    {
      id: 'sub-python',
      name: 'Python',
      examDate: getRelativeDateString(10),
      difficulty: 'Medium',
      currentPreparation: 70,
      color: '#10b981', // Green
      topics: SUBJECT_TOPIC_BANK['Python'],
    },
    {
      id: 'sub-math',
      name: 'Mathematics',
      examDate: getRelativeDateString(13),
      difficulty: 'Easy',
      currentPreparation: 80,
      color: '#6366f1', // Indigo / Purple
      topics: SUBJECT_TOPIC_BANK['Mathematics'],
    },
  ];
}

/**
 * Default availability profile:
 * Average daily: 3.5 hours
 * Custom day-of-week breakdown supported.
 */
export const DEFAULT_AVAILABILITY: StudyAvailability = {
  mode: 'uniform',
  dailyHours: 3.5,
  customDays: {
    Monday: 3,
    Tuesday: 2,
    Wednesday: 4,
    Thursday: 3,
    Friday: 2,
    Saturday: 5,
    Sunday: 4,
  },
  preferredStartTime: '17:00', // 5:00 PM
  sessionLengthMinutes: 50,
  breakLengthMinutes: 10,
};
