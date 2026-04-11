import React, { useState, useMemo, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import DecisionCoachAdapter from './components/DecisionCoachAdapter';

// Feature flag for Decision Coach Engine
const USE_DECISION_COACH = true; // Set to true to test Decision Coach

// ============================================================================
// ILLINOIS TECH ACADEMIC SKILL TREE - FULL CATALOG EDITION
// Mandala-style course planning visualization with Major + Minor pathways
// ============================================================================

// Color palette by college (primary = active, INACTIVE_NODE_COLORS = when not selected/hovered)
const COLLEGE_COLORS = {
  computing: '#E8356E',
  engineering_ece: '#E87B35',
  engineering_mmae: '#E8C435',
  engineering_civil: '#C3FB7A',
  engineering_chbe: '#7AFBAA',
  science_bio: '#8CFFFF',
  science_phys: '#8CBEFF',
  psychology: '#BA8CFF',
  humanities: '#F07AFB',
  business: '#FF8CB5',
  architecture: '#FB7A7C',
  design: '#E8356E',
  core: '#E8356E',
};

const INACTIVE_NODE_COLORS = {
  '#E8356E': '#F8C2D3',
  '#E87B35': '#F8D7C2',
  '#E8C435': '#F8EDC2',
  '#C3FB7A': '#EDFED7',
  '#7AFBAA': '#D7FEE5',
  '#8CFFFF': '#DDFFFF',
  '#8CBEFF': '#DDECFF',
  '#BA8CFF': '#EADDFF',
  '#F07AFB': '#FBD7FE',
  '#FF8CB5': '#FFDDE9',
  '#FB7A7C': '#FED7D8',
};

// Career outcomes with BLS/industry data
const CAREER_OUTCOMES = {
  'software-dev': { title: 'Software Developer', salary: '$130,160', growth: '+17%', outlook: 'Much faster than average', source: 'BLS 2024' },
  'ml-engineer': { title: 'Machine Learning Engineer', salary: '$157,000', growth: '+40%', outlook: 'Exceptional demand', source: 'Industry 2024' },
  'data-scientist': { title: 'Data Scientist', salary: '$108,020', growth: '+35%', outlook: 'Much faster than average', source: 'BLS 2024' },
  'security-analyst': { title: 'Information Security Analyst', salary: '$120,360', growth: '+33%', outlook: 'Much faster than average', source: 'BLS 2024' },
  'electrical-engineer': { title: 'Electrical Engineer', salary: '$106,950', growth: '+5%', outlook: 'Average', source: 'BLS 2024' },
  'computer-hardware': { title: 'Computer Hardware Engineer', salary: '$136,230', growth: '+5%', outlook: 'Average', source: 'BLS 2024' },
  'mechanical-engineer': { title: 'Mechanical Engineer', salary: '$99,510', growth: '+10%', outlook: 'Faster than average', source: 'BLS 2024' },
  'aerospace-engineer': { title: 'Aerospace Engineer', salary: '$130,720', growth: '+6%', outlook: 'Average', source: 'BLS 2024' },
  'civil-engineer': { title: 'Civil Engineer', salary: '$95,890', growth: '+5%', outlook: 'Average', source: 'BLS 2024' },
  'chemical-engineer': { title: 'Chemical Engineer', salary: '$106,260', growth: '+8%', outlook: 'Average', source: 'BLS 2024' },
  'biomedical-engineer': { title: 'Biomedical Engineer', salary: '$100,730', growth: '+5%', outlook: 'Average', source: 'BLS 2024' },
  'architect': { title: 'Architect', salary: '$93,310', growth: '+5%', outlook: 'Average', source: 'BLS 2024' },
  'financial-analyst': { title: 'Financial Analyst', salary: '$99,890', growth: '+8%', outlook: 'Faster than average', source: 'BLS 2024' },
  'data-analyst': { title: 'Data Analyst', salary: '$83,640', growth: '+23%', outlook: 'Much faster than average', source: 'BLS 2024' },
  'game-designer': { title: 'Game Designer', salary: '$85,000', growth: '+17%', outlook: 'Faster than average', source: 'Industry 2024' },
  'ux-designer': { title: 'UX Designer', salary: '$105,000', growth: '+15%', outlook: 'Faster than average', source: 'Industry 2024' },
  'psychologist': { title: 'Psychologist', salary: '$92,740', growth: '+6%', outlook: 'Average', source: 'BLS 2024' },
  'physicist': { title: 'Physicist', salary: '$152,430', growth: '+5%', outlook: 'Average', source: 'BLS 2024' },
  'biologist': { title: 'Biologist', salary: '$85,290', growth: '+5%', outlook: 'Average', source: 'BLS 2024' },
  'chemist': { title: 'Chemist', salary: '$84,680', growth: '+6%', outlook: 'Average', source: 'BLS 2024' },
  'technical-writer': { title: 'Technical Writer', salary: '$80,050', growth: '+4%', outlook: 'Average', source: 'BLS 2024' },
  'materials-scientist': { title: 'Materials Scientist', salary: '$103,720', growth: '+5%', outlook: 'Average', source: 'BLS 2024' },
  'network-admin': { title: 'Network Administrator', salary: '$95,360', growth: '+3%', outlook: 'Average', source: 'BLS 2024' },
  'project-manager': { title: 'Project Manager', salary: '$98,580', growth: '+6%', outlook: 'Average', source: 'BLS 2024' },
};

// ============================================================================
// SUGGESTED PATHWAYS - Recommended course sequences for each major
// ============================================================================

const MAJOR_PATHWAYS = {
  'cs': {
    name: 'Computer Science',
    color: '#00D4FF',
    courses: ['START', 'CS-100', 'MATH-151', 'CS-115', 'CS-116', 'MATH-152', 'CS-330', 'CS-331', 'CS-350', 'MATH-251', 'CS-351', 'CS-430', 'CS-440', 'CS-450', 'CS-487', 'BS-CS']
  },
  'ai': {
    name: 'Artificial Intelligence',
    color: '#00D4FF',
    courses: ['START', 'CS-100', 'MATH-151', 'CS-115', 'CS-116', 'MATH-152', 'CS-330', 'CS-331', 'MATH-251', 'MATH-333', 'CS-480', 'CS-484', 'MATH-474', 'CS-482', 'BS-AI']
  },
  'ds': {
    name: 'Data Science',
    color: '#00D4FF',
    courses: ['START', 'MATH-151', 'CS-100', 'CS-115', 'CS-116', 'MATH-152', 'MATH-251', 'CS-331', 'MATH-333', 'MATH-474', 'CS-425', 'MATH-481', 'MATH-485', 'BS-DS']
  },
  'ee': {
    name: 'Electrical Engineering',
    color: '#8B5CF6',
    courses: ['START', 'ECE-100', 'MATH-151', 'PHYS-123', 'MATH-152', 'PHYS-221', 'ECE-211', 'ECE-213', 'MATH-252', 'ECE-218', 'ECE-307', 'ECE-308', 'ECE-311', 'ECE-418', 'ECE-443', 'BS-EE']
  },
  'cpe': {
    name: 'Computer Engineering',
    color: '#8B5CF6',
    courses: ['START', 'ECE-100', 'CS-100', 'MATH-151', 'CS-115', 'CS-116', 'PHYS-123', 'ECE-218', 'ECE-242', 'CS-331', 'ECE-319', 'ECE-441', 'BS-CPE']
  },
  'me': {
    name: 'Mechanical Engineering',
    color: '#F97316',
    courses: ['START', 'MMAE-100', 'MATH-151', 'PHYS-123', 'MATH-152', 'MMAE-200', 'MATH-252', 'MMAE-205', 'MMAE-232', 'MMAE-312', 'MMAE-305', 'MMAE-320', 'MMAE-350', 'MMAE-370', 'MMAE-451', 'MMAE-495', 'BS-ME']
  },
  'ae': {
    name: 'Aerospace Engineering',
    color: '#F97316',
    courses: ['START', 'MMAE-100', 'MATH-151', 'PHYS-123', 'MATH-152', 'MMAE-200', 'MATH-252', 'MMAE-205', 'MMAE-232', 'MMAE-305', 'MMAE-320', 'MMAE-443', 'MMAE-454', 'BS-AE']
  },
  'ce': {
    name: 'Civil Engineering',
    color: '#84CC16',
    courses: ['START', 'CAEE-100', 'MATH-151', 'PHYS-123', 'CHEM-122', 'MATH-152', 'MMAE-200', 'CAEE-213', 'MMAE-232', 'CAEE-310', 'CAEE-330', 'CAEE-351', 'CAEE-410', 'CAEE-420', 'CAEE-450', 'BS-CE']
  },
  'che': {
    name: 'Chemical Engineering',
    color: '#14B8A6',
    courses: ['START', 'CHBE-100', 'MATH-151', 'CHEM-122', 'MATH-152', 'CHEM-124', 'CHBE-201', 'MMAE-312', 'MMAE-320', 'CHBE-302', 'CHBE-310', 'CHBE-401', 'CHBE-410', 'CHBE-485', 'BS-CHE']
  },
  'bme': {
    name: 'Biomedical Engineering',
    color: '#14B8A6',
    courses: ['START', 'BME-100', 'MATH-151', 'CHEM-122', 'PHYS-123', 'MATH-152', 'PHYS-221', 'MATH-252', 'BME-301', 'BME-401', 'BME-450', 'BS-BME']
  },
  'bio': {
    name: 'Biology',
    color: '#22C55E',
    courses: ['START', 'BIOL-105', 'CHEM-122', 'MATH-151', 'BIOL-115', 'BIOL-206', 'CHEM-124', 'CHEM-237', 'BIOL-351', 'CHEM-238', 'BIOL-352', 'BIOL-401', 'BS-BIO']
  },
  'chem': {
    name: 'Chemistry',
    color: '#3B82F6',
    courses: ['START', 'CHEM-122', 'MATH-151', 'CHEM-124', 'MATH-152', 'CHEM-237', 'PHYS-123', 'CHEM-238', 'PHYS-221', 'MATH-251', 'CHEM-343', 'CHEM-344', 'BS-CHEM']
  },
  'phys': {
    name: 'Physics',
    color: '#3B82F6',
    courses: ['START', 'PHYS-123', 'MATH-151', 'MATH-152', 'PHYS-221', 'PHYS-223', 'MATH-251', 'PHYS-224', 'MATH-333', 'PHYS-301', 'PHYS-302', 'PHYS-401', 'BS-PHYS']
  },
  'psych': {
    name: 'Psychological Science',
    color: '#EC4899',
    courses: ['START', 'PSYC-101', 'MATH-151', 'PSYC-203', 'PSYC-204', 'PSYC-311', 'PSYC-321', 'PSYC-350', 'PSYC-424', 'BS-PSYC']
  },
  'gem': {
    name: 'Game Design',
    color: '#A855F7',
    courses: ['START', 'GEM-100', 'CS-100', 'CS-115', 'HUM-371', 'HUM-372', 'CS-116', 'ITMD-361', 'HUM-374', 'HUM-400', 'HUM-401', 'BS-GEM']
  },
  'arch': {
    name: 'Architecture',
    color: '#F59E0B',
    courses: ['START', 'ARCH-100', 'ARCH-107', 'ARCH-201', 'ARCH-202', 'ARCH-311', 'ARCH-312', 'ARCH-401', 'ARCH-402', 'BARCH']
  },
  'fin': {
    name: 'Finance',
    color: '#EAB308',
    courses: ['START', 'BUS-101', 'MATH-151', 'ECON-101', 'ECON-102', 'FIN-301', 'FIN-380', 'FIN-420', 'BS-FIN']
  }
};

// Ring labels for course levels
const RING_LABELS = [
  { ring: 1, label: 'GATEWAY (100)', description: 'Introductory courses' },
  { ring: 2, label: 'FOUNDATION (100-200)', description: 'Core prerequisites' },
  { ring: 3, label: 'CORE (200-300)', description: 'Major requirements' },
  { ring: 4, label: 'ADVANCED (300-400)', description: 'Specialization' },
  { ring: 5, label: 'CAPSTONE (400+)', description: 'Senior courses' },
  { ring: 6, label: 'DEGREE', description: 'Graduation' },
];

const COURSES = [
  // ========== START NODE ==========
  { id: 'START', code: 'START', title: 'Begin Your Journey', credits: 0, college: 'core', department: 'Core',
    type: 'start', ring: 0, angle: 0, prerequisites: [], 
    description: 'Welcome to Illinois Tech! Choose your path through Computing, Engineering, Science, Business, Design, or Architecture.',
    careers: [] },

  // ========== CORE CURRICULUM (Inner Ring) ==========
  // Math Foundation - spreads across multiple sectors
  { id: 'MATH-151', code: 'MATH 151', title: 'Calculus I', credits: 5, college: 'core', department: 'Mathematics',
    type: 'gateway', ring: 1, angle: 15, prerequisites: ['START'],
    description: 'Limits, continuity, differentiation, applications of derivatives, introduction to integration.',
    semesters: ['Fall', 'Spring', 'Summer'], careers: ['data-scientist', 'software-dev'] },
  { id: 'MATH-152', code: 'MATH 152', title: 'Calculus II', credits: 5, college: 'core', department: 'Mathematics',
    type: 'required', ring: 2, angle: 15, prerequisites: ['MATH-151'],
    description: 'Integration techniques, applications, sequences, series, Taylor polynomials.',
    semesters: ['Fall', 'Spring', 'Summer'], careers: ['data-scientist', 'mechanical-engineer'] },
  { id: 'MATH-251', code: 'MATH 251', title: 'Multivariate Calculus', credits: 4, college: 'core', department: 'Mathematics',
    type: 'required', ring: 3, angle: 20, prerequisites: ['MATH-152'],
    description: 'Vectors, partial derivatives, multiple integrals, vector calculus.',
    semesters: ['Fall', 'Spring'], careers: ['mechanical-engineer', 'physicist'] },
  { id: 'MATH-252', code: 'MATH 252', title: 'Differential Equations', credits: 4, college: 'core', department: 'Mathematics',
    type: 'required', ring: 3, angle: 10, prerequisites: ['MATH-152'],
    description: 'First and second order ODEs, systems, Laplace transforms, applications.',
    semesters: ['Fall', 'Spring'], careers: ['electrical-engineer', 'mechanical-engineer'] },

  // Physics Foundation
  { id: 'PHYS-123', code: 'PHYS 123', title: 'General Physics I: Mechanics', credits: 4, college: 'science_phys', department: 'Physics',
    type: 'gateway', ring: 1, angle: 210, prerequisites: ['START'],
    description: 'Kinematics, dynamics, energy, momentum, rotational motion, oscillations.',
    semesters: ['Fall', 'Spring'], careers: ['mechanical-engineer', 'physicist'] },
  { id: 'PHYS-221', code: 'PHYS 221', title: 'General Physics II: E&M', credits: 4, college: 'science_phys', department: 'Physics',
    type: 'required', ring: 2, angle: 210, prerequisites: ['PHYS-123', 'MATH-152'],
    description: 'Electricity, magnetism, circuits, electromagnetic waves, optics.',
    semesters: ['Fall', 'Spring'], careers: ['electrical-engineer', 'physicist'] },
  { id: 'PHYS-223', code: 'PHYS 223', title: 'General Physics III: Waves & Quantum', credits: 3, college: 'science_phys', department: 'Physics',
    type: 'required', ring: 3, angle: 210, prerequisites: ['PHYS-221'],
    description: 'Waves, special relativity, quantum mechanics introduction, atomic physics.',
    semesters: ['Fall', 'Spring'], careers: ['physicist'] },

  // Chemistry Foundation
  { id: 'CHEM-122', code: 'CHEM 122', title: 'General Chemistry I', credits: 3, college: 'science_phys', department: 'Chemistry',
    type: 'gateway', ring: 1, angle: 195, prerequisites: ['START'],
    description: 'Atomic structure, bonding, stoichiometry, states of matter, solutions.',
    semesters: ['Fall', 'Spring'], careers: ['chemical-engineer', 'chemist'] },
  { id: 'CHEM-124', code: 'CHEM 124', title: 'General Chemistry II', credits: 3, college: 'science_phys', department: 'Chemistry',
    type: 'required', ring: 2, angle: 195, prerequisites: ['CHEM-122'],
    description: 'Thermodynamics, kinetics, equilibrium, electrochemistry, nuclear chemistry.',
    semesters: ['Fall', 'Spring'], careers: ['chemical-engineer', 'chemist'] },

  // ========== COMPUTING - Computer Science (Angle: 0°) ==========
  { id: 'CS-100', code: 'CS 100', title: 'Intro to the Profession', credits: 2, college: 'computing', department: 'CS',
    type: 'gateway', ring: 1, angle: 0, prerequisites: ['START'],
    description: 'Overview of computing fields, career paths, ethics, and professional development.',
    semesters: ['Fall', 'Spring'], careers: ['software-dev'] },
  { id: 'CS-115', code: 'CS 115', title: 'Object-Oriented Programming I', credits: 2, college: 'computing', department: 'CS',
    type: 'required', ring: 2, angle: -8, prerequisites: ['CS-100'],
    description: 'Introduction to programming using Python. Variables, control structures, functions, basic OOP.',
    semesters: ['Fall', 'Spring', 'Summer'], careers: ['software-dev'] },
  { id: 'CS-116', code: 'CS 116', title: 'Object-Oriented Programming II', credits: 2, college: 'computing', department: 'CS',
    type: 'required', ring: 2, angle: 8, prerequisites: ['CS-115'],
    description: 'Advanced OOP concepts: inheritance, polymorphism, exception handling, file I/O.',
    semesters: ['Fall', 'Spring', 'Summer'], careers: ['software-dev'] },
  { id: 'CS-201', code: 'CS 201', title: 'Accelerated Intro to CS', credits: 4, college: 'computing', department: 'CS',
    type: 'notable', ring: 2, angle: 0, prerequisites: ['CS-100'],
    description: 'Accelerated combination of CS 115 and CS 116 for students with prior programming experience.',
    semesters: ['Fall'], careers: ['software-dev'] },
  { id: 'CS-330', code: 'CS 330', title: 'Discrete Structures', credits: 3, college: 'computing', department: 'CS',
    type: 'required', ring: 3, angle: -10, prerequisites: ['CS-116', 'MATH-151'],
    description: 'Logic, sets, functions, relations, combinatorics, graph theory, proof techniques.',
    semesters: ['Fall', 'Spring'], careers: ['software-dev', 'data-scientist'] },
  { id: 'CS-331', code: 'CS 331', title: 'Data Structures & Algorithms', credits: 3, college: 'computing', department: 'CS',
    type: 'notable', ring: 3, angle: 0, prerequisites: ['CS-116', 'CS-330'],
    description: 'Arrays, linked lists, trees, graphs, sorting, searching, algorithm analysis.',
    semesters: ['Fall', 'Spring'], careers: ['software-dev', 'ml-engineer'] },
  { id: 'CS-350', code: 'CS 350', title: 'Computer Organization', credits: 3, college: 'computing', department: 'CS',
    type: 'required', ring: 3, angle: 10, prerequisites: ['CS-116'],
    description: 'Computer architecture, assembly language, memory hierarchy, I/O systems.',
    semesters: ['Fall', 'Spring'], careers: ['software-dev', 'computer-hardware'] },
  { id: 'CS-351', code: 'CS 351', title: 'Systems Programming', credits: 3, college: 'computing', department: 'CS',
    type: 'required', ring: 4, angle: 12, prerequisites: ['CS-331', 'CS-350'],
    description: 'C programming, memory management, system calls, processes, threads.',
    semesters: ['Fall', 'Spring'], careers: ['software-dev'] },
  { id: 'CS-425', code: 'CS 425', title: 'Database Organization', credits: 3, college: 'computing', department: 'CS',
    type: 'notable', ring: 4, angle: -12, prerequisites: ['CS-331'],
    description: 'Relational model, SQL, query optimization, transactions, database design.',
    semesters: ['Fall', 'Spring'], careers: ['software-dev', 'data-scientist'] },
  { id: 'CS-430', code: 'CS 430', title: 'Intro to Algorithms', credits: 3, college: 'computing', department: 'CS',
    type: 'notable', ring: 4, angle: -4, prerequisites: ['CS-331'],
    description: 'Algorithm design paradigms, complexity analysis, NP-completeness.',
    semesters: ['Fall', 'Spring'], careers: ['software-dev', 'ml-engineer'] },
  { id: 'CS-440', code: 'CS 440', title: 'Programming Languages', credits: 3, college: 'computing', department: 'CS',
    type: 'required', ring: 4, angle: 4, prerequisites: ['CS-331'],
    description: 'Language paradigms: functional, logic, object-oriented. Type systems, semantics.',
    semesters: ['Fall', 'Spring'], careers: ['software-dev'] },
  { id: 'CS-450', code: 'CS 450', title: 'Operating Systems', credits: 3, college: 'computing', department: 'CS',
    type: 'notable', ring: 5, angle: 8, prerequisites: ['CS-351'],
    description: 'Process management, memory management, file systems, concurrency.',
    semesters: ['Fall', 'Spring'], careers: ['software-dev'] },
  { id: 'CS-480', code: 'CS 480', title: 'Artificial Intelligence', credits: 3, college: 'computing', department: 'CS',
    type: 'notable', ring: 5, angle: -14, prerequisites: ['CS-331'],
    description: 'Search algorithms, knowledge representation, machine learning fundamentals.',
    semesters: ['Fall', 'Spring'], careers: ['ml-engineer', 'data-scientist'] },
  { id: 'CS-484', code: 'CS 484', title: 'Machine Learning', credits: 3, college: 'computing', department: 'CS',
    type: 'notable', ring: 5, angle: -6, prerequisites: ['CS-331', 'MATH-251'],
    description: 'Supervised and unsupervised learning, neural networks, deep learning.',
    semesters: ['Fall', 'Spring'], careers: ['ml-engineer', 'data-scientist'] },
  { id: 'CS-487', code: 'CS 487', title: 'Software Engineering', credits: 3, college: 'computing', department: 'CS',
    type: 'notable', ring: 5, angle: 0, prerequisites: ['CS-331'],
    description: 'Software development lifecycle, design patterns, testing, agile methods.',
    semesters: ['Fall', 'Spring'], careers: ['software-dev', 'project-manager'] },
  { id: 'CS-458', code: 'CS 458', title: 'Computer Security', credits: 3, college: 'computing', department: 'CS',
    type: 'notable', ring: 5, angle: 14, prerequisites: ['CS-351'],
    description: 'Cryptography, network security, software security, ethical hacking.',
    semesters: ['Fall', 'Spring'], careers: ['security-analyst'] },
  { id: 'BS-CS', code: 'B.S. CS', title: 'Computer Science Degree', credits: 127, college: 'computing', department: 'CS',
    type: 'keystone', ring: 6, angle: 0, prerequisites: ['CS-450', 'CS-430', 'CS-487'],
    description: 'Bachelor of Science in Computer Science. Prepares graduates for software development, AI, and computing careers.',
    careers: ['software-dev', 'ml-engineer', 'data-scientist'] },

  // ========== COMPUTING - Artificial Intelligence (Angle: 345°) ==========
  { id: 'AI-100', code: 'AI 100', title: 'Intro to AI & Society', credits: 3, college: 'computing', department: 'AI',
    type: 'gateway', ring: 1, angle: 345, prerequisites: ['START'],
    description: 'Overview of AI technologies, applications, ethics, and societal impact.',
    semesters: ['Fall', 'Spring'], careers: ['ml-engineer'] },
  { id: 'CS-482', code: 'CS 482', title: 'Computer Vision', credits: 3, college: 'computing', department: 'CS',
    type: 'notable', ring: 5, angle: 345, prerequisites: ['CS-484'],
    description: 'Image processing, feature detection, object recognition, deep learning for vision.',
    semesters: ['Fall'], careers: ['ml-engineer'] },
  { id: 'CS-486', code: 'CS 486', title: 'Natural Language Processing', credits: 3, college: 'computing', department: 'CS',
    type: 'notable', ring: 5, angle: 340, prerequisites: ['CS-484'],
    description: 'Text processing, language models, transformers, sentiment analysis.',
    semesters: ['Spring'], careers: ['ml-engineer', 'data-scientist'] },
  { id: 'BS-AI', code: 'B.S. AI', title: 'Artificial Intelligence Degree', credits: 127, college: 'computing', department: 'AI',
    type: 'keystone', ring: 6, angle: 345, prerequisites: ['CS-484', 'CS-482'],
    description: 'Bachelor of Science in Artificial Intelligence. Focus on machine learning, vision, and NLP.',
    careers: ['ml-engineer', 'data-scientist'] },

  // ========== COMPUTING - Data Science (Angle: 30°) ==========
  { id: 'MATH-333', code: 'MATH 333', title: 'Linear Algebra', credits: 3, college: 'computing', department: 'Applied Math',
    type: 'required', ring: 3, angle: 30, prerequisites: ['MATH-152'],
    description: 'Vectors, matrices, linear transformations, eigenvalues, applications.',
    semesters: ['Fall', 'Spring'], careers: ['data-scientist', 'ml-engineer'] },
  { id: 'MATH-474', code: 'MATH 474', title: 'Probability & Statistics', credits: 3, college: 'computing', department: 'Applied Math',
    type: 'notable', ring: 4, angle: 30, prerequisites: ['MATH-251'],
    description: 'Probability theory, random variables, distributions, statistical inference.',
    semesters: ['Fall', 'Spring'], careers: ['data-scientist', 'data-analyst'] },
  { id: 'MATH-481', code: 'MATH 481', title: 'Statistical Methods', credits: 3, college: 'computing', department: 'Applied Math',
    type: 'notable', ring: 5, angle: 25, prerequisites: ['MATH-474'],
    description: 'Regression analysis, ANOVA, experimental design, statistical computing.',
    semesters: ['Fall', 'Spring'], careers: ['data-scientist', 'data-analyst'] },
  { id: 'MATH-485', code: 'MATH 485', title: 'Statistical Learning', credits: 3, college: 'computing', department: 'Applied Math',
    type: 'notable', ring: 5, angle: 35, prerequisites: ['MATH-474', 'CS-331'],
    description: 'Modern statistical learning methods, model selection, regularization.',
    semesters: ['Fall'], careers: ['data-scientist', 'ml-engineer'] },
  { id: 'BS-DS', code: 'B.S. Data Science', title: 'Data Science Degree', credits: 120, college: 'computing', department: 'Applied Math',
    type: 'keystone', ring: 6, angle: 30, prerequisites: ['MATH-485', 'CS-425'],
    description: 'Bachelor of Science in Data Science. Combines statistics, computing, and domain expertise.',
    careers: ['data-scientist', 'data-analyst', 'ml-engineer'] },

  // ========== COMPUTING - Information Technology & Management (Angle: 15°) ==========
  { id: 'ITM-100', code: 'ITM 100', title: 'Intro to IT & Management', credits: 3, college: 'computing', department: 'ITM',
    type: 'gateway', ring: 1, angle: 50, prerequisites: ['START'],
    description: 'Overview of information systems, technology management, and IT careers.',
    semesters: ['Fall', 'Spring'], careers: ['network-admin', 'project-manager'] },
  { id: 'ITM-301', code: 'ITM 301', title: 'Systems Analysis & Design', credits: 3, college: 'computing', department: 'ITM',
    type: 'notable', ring: 4, angle: 45, prerequisites: ['CS-116'],
    description: 'Requirements gathering, system modeling, design methodologies.',
    semesters: ['Fall', 'Spring'], careers: ['project-manager'] },
  { id: 'ITM-311', code: 'ITM 311', title: 'IT Project Management', credits: 3, college: 'computing', department: 'ITM',
    type: 'notable', ring: 4, angle: 55, prerequisites: ['ITM-301'],
    description: 'Project planning, scheduling, risk management, agile frameworks.',
    semesters: ['Fall', 'Spring'], careers: ['project-manager'] },
  { id: 'ITMD-361', code: 'ITMD 361', title: 'Fundamentals of Web Dev', credits: 3, college: 'computing', department: 'ITM',
    type: 'required', ring: 3, angle: 50, prerequisites: ['CS-116'],
    description: 'HTML, CSS, JavaScript fundamentals for web development.',
    semesters: ['Fall', 'Spring'], careers: ['software-dev', 'ux-designer'] },
  { id: 'ITMD-362', code: 'ITMD 362', title: 'Human-Computer Interaction', credits: 3, college: 'computing', department: 'ITM',
    type: 'notable', ring: 4, angle: 50, prerequisites: ['ITMD-361'],
    description: 'User interface design, usability testing, accessibility.',
    semesters: ['Fall', 'Spring'], careers: ['ux-designer'] },
  { id: 'ITMS-428', code: 'ITMS 428', title: 'Database Security', credits: 3, college: 'computing', department: 'ITM',
    type: 'notable', ring: 5, angle: 55, prerequisites: ['CS-425'],
    description: 'Database access control, encryption, security policies, compliance.',
    semesters: ['Fall'], careers: ['security-analyst'] },
  { id: 'BS-ITM', code: 'B.ITM', title: 'Info Tech & Management Degree', credits: 120, college: 'computing', department: 'ITM',
    type: 'keystone', ring: 6, angle: 50, prerequisites: ['ITM-311', 'ITMD-362'],
    description: 'Bachelor of Information Technology and Management. Bridges technology and business.',
    careers: ['project-manager', 'network-admin'] },

  // ========== ENGINEERING - ECE (Angle: 70°) ==========
  { id: 'ECE-100', code: 'ECE 100', title: 'Intro to ECE Profession', credits: 3, college: 'engineering_ece', department: 'ECE',
    type: 'gateway', ring: 1, angle: 70, prerequisites: ['START'],
    description: 'Overview of electrical and computer engineering through hands-on projects.',
    semesters: ['Fall', 'Spring'], careers: ['electrical-engineer', 'computer-hardware'] },
  { id: 'ECE-211', code: 'ECE 211', title: 'Circuit Analysis I', credits: 3, college: 'engineering_ece', department: 'ECE',
    type: 'required', ring: 2, angle: 62, prerequisites: ['ECE-100', 'PHYS-221'],
    description: 'DC circuit analysis, Kirchhoff\'s laws, network theorems, transient analysis.',
    semesters: ['Fall', 'Spring'], careers: ['electrical-engineer'] },
  { id: 'ECE-213', code: 'ECE 213', title: 'Circuit Analysis II', credits: 4, college: 'engineering_ece', department: 'ECE',
    type: 'required', ring: 2, angle: 78, prerequisites: ['ECE-211', 'MATH-252'],
    description: 'AC circuit analysis, phasors, frequency response, filters, resonance.',
    semesters: ['Fall', 'Spring'], careers: ['electrical-engineer'] },
  { id: 'ECE-218', code: 'ECE 218', title: 'Digital Systems', credits: 4, college: 'engineering_ece', department: 'ECE',
    type: 'notable', ring: 3, angle: 70, prerequisites: ['ECE-100'],
    description: 'Boolean algebra, combinational and sequential logic, HDL, FPGA.',
    semesters: ['Fall', 'Spring'], careers: ['computer-hardware', 'electrical-engineer'] },
  { id: 'ECE-242', code: 'ECE 242', title: 'Digital Computers & Computing', credits: 3, college: 'engineering_ece', department: 'ECE',
    type: 'required', ring: 3, angle: 82, prerequisites: ['ECE-218'],
    description: 'Computer organization, assembly programming, memory systems.',
    semesters: ['Fall', 'Spring'], careers: ['computer-hardware'] },
  { id: 'ECE-307', code: 'ECE 307', title: 'Electromagnetic Fields', credits: 4, college: 'engineering_ece', department: 'ECE',
    type: 'required', ring: 4, angle: 58, prerequisites: ['ECE-213', 'PHYS-221', 'MATH-251'],
    description: 'Static and time-varying fields, Maxwell\'s equations, wave propagation.',
    semesters: ['Fall', 'Spring'], careers: ['electrical-engineer'] },
  { id: 'ECE-308', code: 'ECE 308', title: 'Signals & Systems', credits: 3, college: 'engineering_ece', department: 'ECE',
    type: 'notable', ring: 4, angle: 66, prerequisites: ['ECE-213', 'MATH-252'],
    description: 'Continuous and discrete signals, Fourier and Laplace transforms, filtering.',
    semesters: ['Fall', 'Spring'], careers: ['electrical-engineer'] },
  { id: 'ECE-311', code: 'ECE 311', title: 'Electronics I', credits: 4, college: 'engineering_ece', department: 'ECE',
    type: 'required', ring: 4, angle: 74, prerequisites: ['ECE-213'],
    description: 'Semiconductor physics, diodes, BJT and FET amplifiers.',
    semesters: ['Fall', 'Spring'], careers: ['electrical-engineer'] },
  { id: 'ECE-319', code: 'ECE 319', title: 'Computer Architecture', credits: 4, college: 'engineering_ece', department: 'ECE',
    type: 'notable', ring: 4, angle: 84, prerequisites: ['ECE-242'],
    description: 'Processor design, pipelining, caches, memory hierarchy.',
    semesters: ['Fall', 'Spring'], careers: ['computer-hardware'] },
  { id: 'ECE-417', code: 'ECE 417', title: 'Power Electronics', credits: 3, college: 'engineering_ece', department: 'ECE',
    type: 'notable', ring: 5, angle: 54, prerequisites: ['ECE-311'],
    description: 'DC-DC converters, inverters, motor drives, power semiconductor devices.',
    semesters: ['Fall'], careers: ['electrical-engineer'] },
  { id: 'ECE-418', code: 'ECE 418', title: 'Power System Analysis', credits: 3, college: 'engineering_ece', department: 'ECE',
    type: 'notable', ring: 5, angle: 62, prerequisites: ['ECE-307'],
    description: 'Power flow analysis, fault analysis, stability, transmission systems.',
    semesters: ['Spring'], careers: ['electrical-engineer'] },
  { id: 'ECE-441', code: 'ECE 441', title: 'Smart & Connected Systems', credits: 3, college: 'engineering_ece', department: 'ECE',
    type: 'notable', ring: 5, angle: 78, prerequisites: ['ECE-319'],
    description: 'IoT systems, embedded computing, sensor networks, smart grid.',
    semesters: ['Fall', 'Spring'], careers: ['electrical-engineer', 'computer-hardware'] },
  { id: 'ECE-443', code: 'ECE 443', title: 'Digital Signal Processing', credits: 3, college: 'engineering_ece', department: 'ECE',
    type: 'notable', ring: 5, angle: 70, prerequisites: ['ECE-308'],
    description: 'Discrete-time signals, DFT, FFT, digital filter design.',
    semesters: ['Fall', 'Spring'], careers: ['electrical-engineer'] },
  { id: 'BS-EE', code: 'B.S. EE', title: 'Electrical Engineering Degree', credits: 130, college: 'engineering_ece', department: 'ECE',
    type: 'keystone', ring: 6, angle: 62, prerequisites: ['ECE-441', 'ECE-307'],
    description: 'Bachelor of Science in Electrical Engineering. Accredited by ABET.',
    careers: ['electrical-engineer'] },
  { id: 'BS-CPE', code: 'B.S. CpE', title: 'Computer Engineering Degree', credits: 130, college: 'engineering_ece', department: 'ECE',
    type: 'keystone', ring: 6, angle: 82, prerequisites: ['ECE-441', 'ECE-319', 'CS-331'],
    description: 'Bachelor of Science in Computer Engineering. Hardware-software integration.',
    careers: ['computer-hardware', 'software-dev'] },

  // ========== ENGINEERING - MMAE (Angle: 100°) ==========
  { id: 'MMAE-100', code: 'MMAE 100', title: 'Intro to Engineering', credits: 3, college: 'engineering_mmae', department: 'MMAE',
    type: 'gateway', ring: 1, angle: 105, prerequisites: ['START'],
    description: 'Overview of mechanical, materials, and aerospace engineering.',
    semesters: ['Fall', 'Spring'], careers: ['mechanical-engineer', 'aerospace-engineer'] },
  { id: 'MMAE-200', code: 'MMAE 200', title: 'Statics', credits: 3, college: 'engineering_mmae', department: 'MMAE',
    type: 'required', ring: 2, angle: 97, prerequisites: ['PHYS-123', 'MATH-152'],
    description: 'Force systems, equilibrium, structures, friction, centroids.',
    semesters: ['Fall', 'Spring'], careers: ['mechanical-engineer', 'civil-engineer'] },
  { id: 'MMAE-205', code: 'MMAE 205', title: 'Dynamics', credits: 3, college: 'engineering_mmae', department: 'MMAE',
    type: 'required', ring: 2, angle: 113, prerequisites: ['MMAE-200', 'MATH-252'],
    description: 'Kinematics and kinetics of particles and rigid bodies.',
    semesters: ['Fall', 'Spring'], careers: ['mechanical-engineer', 'aerospace-engineer'] },
  { id: 'MMAE-232', code: 'MMAE 232', title: 'Mechanics of Materials', credits: 3, college: 'engineering_mmae', department: 'MMAE',
    type: 'required', ring: 3, angle: 93, prerequisites: ['MMAE-200'],
    description: 'Stress, strain, axial loading, torsion, bending, deflection.',
    semesters: ['Fall', 'Spring'], careers: ['mechanical-engineer', 'aerospace-engineer'] },
  { id: 'MMAE-305', code: 'MMAE 305', title: 'Advanced Dynamics', credits: 3, college: 'engineering_mmae', department: 'MMAE',
    type: 'required', ring: 3, angle: 117, prerequisites: ['MMAE-205', 'MATH-252'],
    description: 'Vibrations, rotating coordinate systems, Lagrangian mechanics.',
    semesters: ['Fall', 'Spring'], careers: ['mechanical-engineer', 'aerospace-engineer'] },
  { id: 'MMAE-312', code: 'MMAE 312', title: 'Thermodynamics', credits: 3, college: 'engineering_mmae', department: 'MMAE',
    type: 'notable', ring: 3, angle: 105, prerequisites: ['PHYS-123', 'MATH-251'],
    description: 'First and second laws, entropy, power cycles, refrigeration.',
    semesters: ['Fall', 'Spring'], careers: ['mechanical-engineer', 'chemical-engineer'] },
  { id: 'MMAE-320', code: 'MMAE 320', title: 'Fluid Mechanics', credits: 3, college: 'engineering_mmae', department: 'MMAE',
    type: 'notable', ring: 4, angle: 93, prerequisites: ['MMAE-200', 'MATH-251'],
    description: 'Fluid statics, conservation laws, Navier-Stokes, pipe flow, lift and drag.',
    semesters: ['Fall', 'Spring'], careers: ['mechanical-engineer', 'aerospace-engineer'] },
  { id: 'MMAE-350', code: 'MMAE 350', title: 'Control Systems', credits: 3, college: 'engineering_mmae', department: 'MMAE',
    type: 'notable', ring: 4, angle: 105, prerequisites: ['MMAE-305', 'MATH-252'],
    description: 'Transfer functions, feedback control, stability, root locus, frequency response.',
    semesters: ['Fall', 'Spring'], careers: ['mechanical-engineer', 'electrical-engineer'] },
  { id: 'MMAE-370', code: 'MMAE 370', title: 'Heat Transfer', credits: 3, college: 'engineering_mmae', department: 'MMAE',
    type: 'required', ring: 4, angle: 117, prerequisites: ['MMAE-312', 'MMAE-320'],
    description: 'Conduction, convection, radiation, heat exchangers.',
    semesters: ['Fall', 'Spring'], careers: ['mechanical-engineer'] },
  { id: 'MMAE-443', code: 'MMAE 443', title: 'Aerospace Structures', credits: 3, college: 'engineering_mmae', department: 'MMAE',
    type: 'notable', ring: 5, angle: 120, prerequisites: ['MMAE-232'],
    description: 'Thin-walled structures, shear flow, buckling, composite materials.',
    semesters: ['Fall'], careers: ['aerospace-engineer'] },
  { id: 'MMAE-451', code: 'MMAE 451', title: 'Finite Element Methods', credits: 3, college: 'engineering_mmae', department: 'MMAE',
    type: 'notable', ring: 5, angle: 93, prerequisites: ['MMAE-232', 'MATH-251'],
    description: 'FEM theory and application for structural analysis.',
    semesters: ['Fall', 'Spring'], careers: ['mechanical-engineer', 'aerospace-engineer'] },
  { id: 'MMAE-454', code: 'MMAE 454', title: 'Aerodynamics', credits: 3, college: 'engineering_mmae', department: 'MMAE',
    type: 'notable', ring: 5, angle: 112, prerequisites: ['MMAE-320'],
    description: 'Potential flow, thin airfoil theory, finite wings, compressible flow.',
    semesters: ['Fall'], careers: ['aerospace-engineer'] },
  { id: 'MMAE-495', code: 'MMAE 495', title: 'Senior Design Project', credits: 3, college: 'engineering_mmae', department: 'MMAE',
    type: 'notable', ring: 5, angle: 101, prerequisites: ['MMAE-350', 'MMAE-370'],
    description: 'Capstone design project applying engineering principles.',
    semesters: ['Fall', 'Spring'], careers: ['mechanical-engineer', 'aerospace-engineer'] },
  { id: 'BS-ME', code: 'B.S. ME', title: 'Mechanical Engineering Degree', credits: 130, college: 'engineering_mmae', department: 'MMAE',
    type: 'keystone', ring: 6, angle: 97, prerequisites: ['MMAE-495', 'MMAE-451'],
    description: 'Bachelor of Science in Mechanical Engineering. ABET accredited.',
    careers: ['mechanical-engineer'] },
  { id: 'BS-AE', code: 'B.S. AE', title: 'Aerospace Engineering Degree', credits: 130, college: 'engineering_mmae', department: 'MMAE',
    type: 'keystone', ring: 6, angle: 116, prerequisites: ['MMAE-454', 'MMAE-443'],
    description: 'Bachelor of Science in Aerospace Engineering. ABET accredited.',
    careers: ['aerospace-engineer'] },

  // ========== ENGINEERING - Civil & Architectural Engineering (Angle: 125°) ==========
  { id: 'CAEE-100', code: 'CAEE 100', title: 'Intro to Civil Engineering', credits: 3, college: 'engineering_civil', department: 'CAEE',
    type: 'gateway', ring: 1, angle: 125, prerequisites: ['START'],
    description: 'Overview of civil engineering fields: structural, environmental, transportation, construction.',
    semesters: ['Fall', 'Spring'], careers: ['civil-engineer'] },
  { id: 'CAEE-213', code: 'CAEE 213', title: 'Engineering Materials', credits: 3, college: 'engineering_civil', department: 'CAEE',
    type: 'required', ring: 2, angle: 125, prerequisites: ['CHEM-122'],
    description: 'Properties and behavior of steel, concrete, wood, and composites.',
    semesters: ['Fall', 'Spring'], careers: ['civil-engineer'] },
  { id: 'CAEE-310', code: 'CAEE 310', title: 'Structural Analysis I', credits: 3, college: 'engineering_civil', department: 'CAEE',
    type: 'required', ring: 3, angle: 120, prerequisites: ['MMAE-232'],
    description: 'Analysis of determinate and indeterminate structures.',
    semesters: ['Fall', 'Spring'], careers: ['civil-engineer'] },
  { id: 'CAEE-330', code: 'CAEE 330', title: 'Soil Mechanics', credits: 3, college: 'engineering_civil', department: 'CAEE',
    type: 'required', ring: 3, angle: 130, prerequisites: ['MMAE-232'],
    description: 'Soil properties, classification, compaction, seepage, consolidation.',
    semesters: ['Fall', 'Spring'], careers: ['civil-engineer'] },
  { id: 'CAEE-351', code: 'CAEE 351', title: 'Environmental Engineering', credits: 3, college: 'engineering_civil', department: 'CAEE',
    type: 'notable', ring: 4, angle: 130, prerequisites: ['CHEM-122', 'MMAE-320'],
    description: 'Water quality, treatment processes, environmental regulations.',
    semesters: ['Fall', 'Spring'], careers: ['civil-engineer'] },
  { id: 'CAEE-410', code: 'CAEE 410', title: 'Steel Design', credits: 3, college: 'engineering_civil', department: 'CAEE',
    type: 'notable', ring: 5, angle: 120, prerequisites: ['CAEE-310'],
    description: 'Design of steel members and connections using AISC specifications.',
    semesters: ['Fall'], careers: ['civil-engineer'] },
  { id: 'CAEE-420', code: 'CAEE 420', title: 'Reinforced Concrete Design', credits: 3, college: 'engineering_civil', department: 'CAEE',
    type: 'notable', ring: 5, angle: 125, prerequisites: ['CAEE-310'],
    description: 'Design of reinforced concrete beams, columns, slabs using ACI code.',
    semesters: ['Spring'], careers: ['civil-engineer'] },
  { id: 'CAEE-450', code: 'CAEE 450', title: 'Foundation Engineering', credits: 3, college: 'engineering_civil', department: 'CAEE',
    type: 'notable', ring: 5, angle: 130, prerequisites: ['CAEE-330'],
    description: 'Design of shallow and deep foundations, earth retaining structures.',
    semesters: ['Fall'], careers: ['civil-engineer'] },
  { id: 'BS-CE', code: 'B.S. CE', title: 'Civil Engineering Degree', credits: 130, college: 'engineering_civil', department: 'CAEE',
    type: 'keystone', ring: 6, angle: 125, prerequisites: ['CAEE-410', 'CAEE-450'],
    description: 'Bachelor of Science in Civil Engineering. ABET accredited.',
    careers: ['civil-engineer'] },

  // ========== ENGINEERING - Chemical & Biomedical (Angle: 150°) ==========
  { id: 'CHBE-100', code: 'CHBE 100', title: 'Intro to Chemical Engineering', credits: 3, college: 'engineering_chbe', department: 'CHBE',
    type: 'gateway', ring: 1, angle: 143, prerequisites: ['START'],
    description: 'Overview of chemical engineering: processes, industries, career paths.',
    semesters: ['Fall', 'Spring'], careers: ['chemical-engineer'] },
  { id: 'CHBE-201', code: 'CHBE 201', title: 'Material & Energy Balances', credits: 3, college: 'engineering_chbe', department: 'CHBE',
    type: 'required', ring: 2, angle: 150, prerequisites: ['CHEM-124', 'MATH-152'],
    description: 'Conservation laws applied to chemical processes.',
    semesters: ['Fall', 'Spring'], careers: ['chemical-engineer'] },
  { id: 'CHBE-302', code: 'CHBE 302', title: 'Thermodynamics II', credits: 3, college: 'engineering_chbe', department: 'CHBE',
    type: 'required', ring: 3, angle: 145, prerequisites: ['MMAE-312', 'CHBE-201'],
    description: 'Chemical equilibrium, phase equilibrium, equations of state.',
    semesters: ['Fall', 'Spring'], careers: ['chemical-engineer'] },
  { id: 'CHBE-310', code: 'CHBE 310', title: 'Transport Phenomena', credits: 3, college: 'engineering_chbe', department: 'CHBE',
    type: 'notable', ring: 3, angle: 150, prerequisites: ['MMAE-320', 'MATH-252'],
    description: 'Momentum, heat, and mass transfer in chemical systems.',
    semesters: ['Fall', 'Spring'], careers: ['chemical-engineer'] },
  { id: 'CHBE-401', code: 'CHBE 401', title: 'Reaction Engineering', credits: 3, college: 'engineering_chbe', department: 'CHBE',
    type: 'notable', ring: 4, angle: 145, prerequisites: ['CHBE-302', 'CHBE-310'],
    description: 'Reactor design, kinetics, catalysis, industrial applications.',
    semesters: ['Fall'], careers: ['chemical-engineer'] },
  { id: 'CHBE-410', code: 'CHBE 410', title: 'Separation Processes', credits: 3, college: 'engineering_chbe', department: 'CHBE',
    type: 'notable', ring: 4, angle: 150, prerequisites: ['CHBE-310'],
    description: 'Distillation, absorption, extraction, membrane separations.',
    semesters: ['Spring'], careers: ['chemical-engineer'] },
  { id: 'CHBE-485', code: 'CHBE 485', title: 'Process Design', credits: 3, college: 'engineering_chbe', department: 'CHBE',
    type: 'notable', ring: 5, angle: 148, prerequisites: ['CHBE-401', 'CHBE-410'],
    description: 'Capstone design of chemical plants with economics.',
    semesters: ['Fall', 'Spring'], careers: ['chemical-engineer'] },
  { id: 'BS-CHE', code: 'B.S. ChE', title: 'Chemical Engineering Degree', credits: 130, college: 'engineering_chbe', department: 'CHBE',
    type: 'keystone', ring: 6, angle: 148, prerequisites: ['CHBE-485'],
    description: 'Bachelor of Science in Chemical Engineering. ABET accredited.',
    careers: ['chemical-engineer'] },

  // Biomedical Engineering
  { id: 'BME-100', code: 'BME 100', title: 'Intro to Biomedical Engineering', credits: 3, college: 'engineering_chbe', department: 'BME',
    type: 'gateway', ring: 1, angle: 168, prerequisites: ['START'],
    description: 'Overview of biomedical engineering: medical devices, imaging, tissue engineering.',
    semesters: ['Fall', 'Spring'], careers: ['biomedical-engineer'] },
  { id: 'BME-301', code: 'BME 301', title: 'Biomedical Systems', credits: 3, college: 'engineering_chbe', department: 'BME',
    type: 'required', ring: 3, angle: 160, prerequisites: ['PHYS-221', 'MATH-252'],
    description: 'Signal processing for biomedical applications, physiological modeling.',
    semesters: ['Fall', 'Spring'], careers: ['biomedical-engineer'] },
  { id: 'BME-401', code: 'BME 401', title: 'Biomaterials', credits: 3, college: 'engineering_chbe', department: 'BME',
    type: 'notable', ring: 4, angle: 160, prerequisites: ['CHEM-124'],
    description: 'Materials for medical implants, biocompatibility, tissue engineering.',
    semesters: ['Fall'], careers: ['biomedical-engineer'] },
  { id: 'BME-450', code: 'BME 450', title: 'Medical Imaging', credits: 3, college: 'engineering_chbe', department: 'BME',
    type: 'notable', ring: 5, angle: 160, prerequisites: ['BME-301'],
    description: 'X-ray, CT, MRI, ultrasound imaging principles and applications.',
    semesters: ['Spring'], careers: ['biomedical-engineer'] },
  { id: 'BS-BME', code: 'B.S. BME', title: 'Biomedical Engineering Degree', credits: 130, college: 'engineering_chbe', department: 'BME',
    type: 'keystone', ring: 6, angle: 160, prerequisites: ['BME-450', 'BME-401'],
    description: 'Bachelor of Science in Biomedical Engineering. ABET accredited.',
    careers: ['biomedical-engineer'] },

  // ========== SCIENCE - Biology (Angle: 180°) ==========
  { id: 'BIOL-105', code: 'BIOL 105', title: 'Intro to Biology', credits: 3, college: 'science_bio', department: 'Biology',
    type: 'gateway', ring: 1, angle: 180, prerequisites: ['START'],
    description: 'Cell biology, genetics, evolution, ecology fundamentals.',
    semesters: ['Fall', 'Spring'], careers: ['biologist'] },
  { id: 'BIOL-115', code: 'BIOL 115', title: 'Cell & Molecular Biology', credits: 4, college: 'science_bio', department: 'Biology',
    type: 'required', ring: 2, angle: 175, prerequisites: ['BIOL-105', 'CHEM-122'],
    description: 'Cellular structure, metabolism, gene expression, signal transduction.',
    semesters: ['Fall', 'Spring'], careers: ['biologist'] },
  { id: 'BIOL-206', code: 'BIOL 206', title: 'Genetics', credits: 3, college: 'science_bio', department: 'Biology',
    type: 'required', ring: 2, angle: 185, prerequisites: ['BIOL-105'],
    description: 'Mendelian genetics, molecular genetics, population genetics.',
    semesters: ['Fall', 'Spring'], careers: ['biologist'] },
  { id: 'BIOL-351', code: 'BIOL 351', title: 'Biochemistry I', credits: 3, college: 'science_bio', department: 'Biology',
    type: 'notable', ring: 3, angle: 175, prerequisites: ['BIOL-115', 'CHEM-237'],
    description: 'Protein structure, enzyme kinetics, metabolism.',
    semesters: ['Fall'], careers: ['biologist', 'chemist'] },
  { id: 'BIOL-352', code: 'BIOL 352', title: 'Biochemistry II', credits: 3, college: 'science_bio', department: 'Biology',
    type: 'notable', ring: 4, angle: 175, prerequisites: ['BIOL-351'],
    description: 'Nucleic acids, gene expression, signal transduction.',
    semesters: ['Spring'], careers: ['biologist'] },
  { id: 'BIOL-401', code: 'BIOL 401', title: 'Molecular Biology', credits: 3, college: 'science_bio', department: 'Biology',
    type: 'notable', ring: 5, angle: 175, prerequisites: ['BIOL-352'],
    description: 'DNA replication, transcription, translation, gene regulation.',
    semesters: ['Fall'], careers: ['biologist'] },
  { id: 'BS-BIO', code: 'B.S. Biology', title: 'Biology Degree', credits: 120, college: 'science_bio', department: 'Biology',
    type: 'keystone', ring: 6, angle: 180, prerequisites: ['BIOL-401'],
    description: 'Bachelor of Science in Biology. Preparation for research or health professions.',
    careers: ['biologist'] },

  // ========== SCIENCE - Chemistry (Angle: 200°) ==========
  { id: 'CHEM-237', code: 'CHEM 237', title: 'Organic Chemistry I', credits: 4, college: 'science_phys', department: 'Chemistry',
    type: 'required', ring: 2, angle: 200, prerequisites: ['CHEM-124'],
    description: 'Structure, bonding, stereochemistry, reactions of organic compounds.',
    semesters: ['Fall', 'Spring'], careers: ['chemist', 'chemical-engineer'] },
  { id: 'CHEM-238', code: 'CHEM 238', title: 'Organic Chemistry II', credits: 4, college: 'science_phys', department: 'Chemistry',
    type: 'required', ring: 3, angle: 200, prerequisites: ['CHEM-237'],
    description: 'Advanced organic reactions, synthesis, spectroscopy.',
    semesters: ['Fall', 'Spring'], careers: ['chemist'] },
  { id: 'CHEM-343', code: 'CHEM 343', title: 'Physical Chemistry I', credits: 3, college: 'science_phys', department: 'Chemistry',
    type: 'notable', ring: 4, angle: 200, prerequisites: ['CHEM-124', 'MATH-251', 'PHYS-221'],
    description: 'Thermodynamics, kinetics, statistical mechanics.',
    semesters: ['Fall'], careers: ['chemist', 'physicist'] },
  { id: 'CHEM-344', code: 'CHEM 344', title: 'Physical Chemistry II', credits: 3, college: 'science_phys', department: 'Chemistry',
    type: 'notable', ring: 5, angle: 200, prerequisites: ['CHEM-343'],
    description: 'Quantum mechanics, spectroscopy, molecular structure.',
    semesters: ['Spring'], careers: ['chemist', 'physicist'] },
  { id: 'BS-CHEM', code: 'B.S. Chemistry', title: 'Chemistry Degree', credits: 120, college: 'science_phys', department: 'Chemistry',
    type: 'keystone', ring: 6, angle: 200, prerequisites: ['CHEM-344', 'CHEM-238'],
    description: 'Bachelor of Science in Chemistry. ACS certified.',
    careers: ['chemist'] },

  // ========== SCIENCE - Physics (Angle: 220°) ==========
  { id: 'PHYS-301', code: 'PHYS 301', title: 'Classical Mechanics', credits: 3, college: 'science_phys', department: 'Physics',
    type: 'required', ring: 4, angle: 220, prerequisites: ['PHYS-223', 'MATH-251'],
    description: 'Lagrangian and Hamiltonian mechanics, oscillations, central forces.',
    semesters: ['Fall'], careers: ['physicist'] },
  { id: 'PHYS-302', code: 'PHYS 302', title: 'Electricity & Magnetism', credits: 3, college: 'science_phys', department: 'Physics',
    type: 'required', ring: 4, angle: 215, prerequisites: ['PHYS-223', 'MATH-251'],
    description: 'Electrostatics, magnetostatics, Maxwell\'s equations, electromagnetic waves.',
    semesters: ['Spring'], careers: ['physicist'] },
  { id: 'PHYS-401', code: 'PHYS 401', title: 'Quantum Mechanics I', credits: 3, college: 'science_phys', department: 'Physics',
    type: 'notable', ring: 5, angle: 220, prerequisites: ['PHYS-301', 'MATH-333'],
    description: 'Wave functions, Schrödinger equation, hydrogen atom, angular momentum.',
    semesters: ['Fall'], careers: ['physicist'] },
  { id: 'PHYS-437', code: 'PHYS 437', title: 'Solid State Physics', credits: 3, college: 'science_phys', department: 'Physics',
    type: 'notable', ring: 5, angle: 215, prerequisites: ['PHYS-401'],
    description: 'Crystal structure, band theory, semiconductors, superconductivity.',
    semesters: ['Spring'], careers: ['physicist', 'materials-scientist'] },
  { id: 'BS-PHYS', code: 'B.S. Physics', title: 'Physics Degree', credits: 120, college: 'science_phys', department: 'Physics',
    type: 'keystone', ring: 6, angle: 218, prerequisites: ['PHYS-401', 'PHYS-302'],
    description: 'Bachelor of Science in Physics. Preparation for research or industry.',
    careers: ['physicist'] },

  // ========== PSYCHOLOGY (Angle: 240°) ==========
  { id: 'PSYC-101', code: 'PSYC 101', title: 'Intro to Psychology', credits: 3, college: 'psychology', department: 'Psychology',
    type: 'gateway', ring: 1, angle: 240, prerequisites: ['START'],
    description: 'Survey of psychology: biological bases, cognition, development, social behavior.',
    semesters: ['Fall', 'Spring'], careers: ['psychologist'] },
  { id: 'PSYC-203', code: 'PSYC 203', title: 'Research Methods', credits: 3, college: 'psychology', department: 'Psychology',
    type: 'required', ring: 2, angle: 235, prerequisites: ['PSYC-101'],
    description: 'Experimental design, data collection, statistical analysis.',
    semesters: ['Fall', 'Spring'], careers: ['psychologist'] },
  { id: 'PSYC-204', code: 'PSYC 204', title: 'Psychological Statistics', credits: 3, college: 'psychology', department: 'Psychology',
    type: 'required', ring: 2, angle: 245, prerequisites: ['PSYC-101', 'MATH-151'],
    description: 'Statistical methods for psychological research.',
    semesters: ['Fall', 'Spring'], careers: ['psychologist', 'data-analyst'] },
  { id: 'PSYC-311', code: 'PSYC 311', title: 'Cognitive Psychology', credits: 3, college: 'psychology', department: 'Psychology',
    type: 'notable', ring: 3, angle: 235, prerequisites: ['PSYC-203'],
    description: 'Perception, attention, memory, language, problem-solving.',
    semesters: ['Fall'], careers: ['psychologist', 'ux-designer'] },
  { id: 'PSYC-321', code: 'PSYC 321', title: 'Social Psychology', credits: 3, college: 'psychology', department: 'Psychology',
    type: 'notable', ring: 3, angle: 245, prerequisites: ['PSYC-203'],
    description: 'Social cognition, attitudes, group dynamics, intergroup relations.',
    semesters: ['Spring'], careers: ['psychologist'] },
  { id: 'PSYC-350', code: 'PSYC 350', title: 'Industrial-Organizational Psych', credits: 3, college: 'psychology', department: 'Psychology',
    type: 'notable', ring: 4, angle: 240, prerequisites: ['PSYC-204'],
    description: 'Workplace psychology: selection, motivation, leadership, teams.',
    semesters: ['Fall', 'Spring'], careers: ['psychologist', 'project-manager'] },
  { id: 'PSYC-424', code: 'PSYC 424', title: 'Abnormal Psychology', credits: 3, college: 'psychology', department: 'Psychology',
    type: 'notable', ring: 5, angle: 240, prerequisites: ['PSYC-311'],
    description: 'Psychological disorders: diagnosis, etiology, treatment.',
    semesters: ['Fall', 'Spring'], careers: ['psychologist'] },
  { id: 'BS-PSYC', code: 'B.S. Psych Science', title: 'Psychological Science Degree', credits: 120, college: 'psychology', department: 'Psychology',
    type: 'keystone', ring: 6, angle: 240, prerequisites: ['PSYC-424', 'PSYC-350'],
    description: 'Bachelor of Science in Psychological Science. Research-focused preparation.',
    careers: ['psychologist'] },

  // ========== HUMANITIES & GAME DESIGN (Angle: 265°) ==========
  { id: 'GEM-100', code: 'GEM 100', title: 'Intro to Game Studies', credits: 3, college: 'humanities', department: 'Humanities',
    type: 'gateway', ring: 1, angle: 265, prerequisites: ['START'],
    description: 'History and theory of games, game design principles, player psychology.',
    semesters: ['Fall', 'Spring'], careers: ['game-designer'] },
  { id: 'HUM-371', code: 'HUM 371', title: 'Game Design Fundamentals', credits: 3, college: 'humanities', department: 'Humanities',
    type: 'required', ring: 2, angle: 260, prerequisites: ['GEM-100'],
    description: 'Game mechanics, level design, playtesting, documentation.',
    semesters: ['Fall', 'Spring'], careers: ['game-designer'] },
  { id: 'HUM-372', code: 'HUM 372', title: 'Narrative Design', credits: 3, college: 'humanities', department: 'Humanities',
    type: 'required', ring: 2, angle: 270, prerequisites: ['GEM-100'],
    description: 'Storytelling in games, dialogue systems, world-building.',
    semesters: ['Fall', 'Spring'], careers: ['game-designer', 'technical-writer'] },
  { id: 'HUM-374', code: 'HUM 374', title: 'Game Production', credits: 3, college: 'humanities', department: 'Humanities',
    type: 'notable', ring: 3, angle: 265, prerequisites: ['HUM-371'],
    description: 'Project management, team collaboration, game industry practices.',
    semesters: ['Fall', 'Spring'], careers: ['game-designer', 'project-manager'] },
  { id: 'HUM-400', code: 'HUM 400', title: 'Senior Game Project I', credits: 3, college: 'humanities', department: 'Humanities',
    type: 'notable', ring: 4, angle: 265, prerequisites: ['HUM-374', 'ITMD-361'],
    description: 'Capstone game development: pre-production and prototyping.',
    semesters: ['Fall'], careers: ['game-designer'] },
  { id: 'HUM-401', code: 'HUM 401', title: 'Senior Game Project II', credits: 3, college: 'humanities', department: 'Humanities',
    type: 'notable', ring: 5, angle: 265, prerequisites: ['HUM-400'],
    description: 'Capstone game development: production and release.',
    semesters: ['Spring'], careers: ['game-designer'] },
  { id: 'BS-GEM', code: 'B.S. GEM', title: 'Game Design Degree', credits: 120, college: 'humanities', department: 'Humanities',
    type: 'keystone', ring: 6, angle: 265, prerequisites: ['HUM-401'],
    description: 'Bachelor of Science in Game Design & Experiential Media.',
    careers: ['game-designer', 'ux-designer'] },

  // Communication
  { id: 'COM-101', code: 'COM 101', title: 'Intro to Communication', credits: 3, college: 'humanities', department: 'Communication',
    type: 'gateway', ring: 1, angle: 280, prerequisites: ['START'],
    description: 'Communication theory, public speaking, interpersonal communication.',
    semesters: ['Fall', 'Spring'], careers: ['technical-writer'] },
  { id: 'COM-372', code: 'COM 372', title: 'Digital Storytelling', credits: 3, college: 'humanities', department: 'Communication',
    type: 'notable', ring: 3, angle: 280, prerequisites: ['COM-101'],
    description: 'Multimedia narrative, video production, interactive media.',
    semesters: ['Fall', 'Spring'], careers: ['technical-writer', 'ux-designer'] },
  { id: 'COM-421', code: 'COM 421', title: 'Technical Communication', credits: 3, college: 'humanities', department: 'Communication',
    type: 'notable', ring: 4, angle: 280, prerequisites: ['COM-101'],
    description: 'Technical writing, documentation, information design.',
    semesters: ['Fall', 'Spring'], careers: ['technical-writer'] },

  // ========== BUSINESS (Angle: 305°) ==========
  { id: 'BUS-101', code: 'BUS 101', title: 'Intro to Business', credits: 3, college: 'business', department: 'Business',
    type: 'gateway', ring: 1, angle: 305, prerequisites: ['START'],
    description: 'Overview of business functions: management, marketing, finance, operations.',
    semesters: ['Fall', 'Spring'], careers: ['financial-analyst', 'project-manager'] },
  { id: 'ECON-101', code: 'ECON 101', title: 'Microeconomics', credits: 3, college: 'business', department: 'Economics',
    type: 'required', ring: 2, angle: 300, prerequisites: ['MATH-151'],
    description: 'Supply and demand, market structures, consumer and producer behavior.',
    semesters: ['Fall', 'Spring'], careers: ['financial-analyst', 'data-analyst'] },
  { id: 'ECON-102', code: 'ECON 102', title: 'Macroeconomics', credits: 3, college: 'business', department: 'Economics',
    type: 'required', ring: 2, angle: 310, prerequisites: ['ECON-101'],
    description: 'GDP, inflation, unemployment, monetary and fiscal policy.',
    semesters: ['Fall', 'Spring'], careers: ['financial-analyst'] },
  { id: 'FIN-301', code: 'FIN 301', title: 'Financial Management', credits: 3, college: 'business', department: 'Finance',
    type: 'required', ring: 3, angle: 300, prerequisites: ['ECON-101', 'MATH-151'],
    description: 'Time value of money, capital budgeting, risk and return.',
    semesters: ['Fall', 'Spring'], careers: ['financial-analyst'] },
  { id: 'FIN-380', code: 'FIN 380', title: 'Investments', credits: 3, college: 'business', department: 'Finance',
    type: 'notable', ring: 4, angle: 298, prerequisites: ['FIN-301'],
    description: 'Portfolio theory, asset pricing, securities analysis.',
    semesters: ['Fall', 'Spring'], careers: ['financial-analyst'] },
  { id: 'FIN-420', code: 'FIN 420', title: 'Financial Modeling', credits: 3, college: 'business', department: 'Finance',
    type: 'notable', ring: 5, angle: 298, prerequisites: ['FIN-380'],
    description: 'Excel-based financial modeling, valuation, forecasting.',
    semesters: ['Fall', 'Spring'], careers: ['financial-analyst', 'data-analyst'] },
  { id: 'BS-FIN', code: 'B.S. Finance', title: 'Finance Degree', credits: 120, college: 'business', department: 'Finance',
    type: 'keystone', ring: 6, angle: 300, prerequisites: ['FIN-420'],
    description: 'Bachelor of Science in Finance. Preparation for financial careers.',
    careers: ['financial-analyst'] },

  // Marketing & Analytics
  { id: 'MKT-301', code: 'MKT 301', title: 'Marketing Principles', credits: 3, college: 'business', department: 'Marketing',
    type: 'required', ring: 3, angle: 310, prerequisites: ['BUS-101'],
    description: 'Marketing strategy, consumer behavior, branding, product development.',
    semesters: ['Fall', 'Spring'], careers: ['data-analyst', 'ux-designer'] },
  { id: 'MKT-420', code: 'MKT 420', title: 'Marketing Analytics', credits: 3, college: 'business', department: 'Marketing',
    type: 'notable', ring: 4, angle: 310, prerequisites: ['MKT-301', 'MATH-474'],
    description: 'Data-driven marketing, customer analytics, predictive modeling.',
    semesters: ['Fall', 'Spring'], careers: ['data-analyst'] },
  { id: 'BS-MKT', code: 'B.S. Marketing Analytics', title: 'Marketing Analytics Degree', credits: 120, college: 'business', department: 'Marketing',
    type: 'keystone', ring: 6, angle: 312, prerequisites: ['MKT-420', 'MATH-474'],
    description: 'Bachelor of Science in Marketing Analytics. Data-driven marketing.',
    careers: ['data-analyst', 'ux-designer'] },

  // ========== DESIGN (Angle: 290°) ==========
  { id: 'DES-101', code: 'DES 101', title: 'Design Fundamentals', credits: 3, college: 'design', department: 'Design',
    type: 'gateway', ring: 1, angle: 290, prerequisites: ['START'],
    description: 'Introduction to design thinking, visual communication, prototyping.',
    semesters: ['Fall', 'Spring'], careers: ['ux-designer'] },
  { id: 'DES-310', code: 'DES 310', title: 'Interaction Design', credits: 3, college: 'design', department: 'Design',
    type: 'notable', ring: 3, angle: 290, prerequisites: ['DES-101'],
    description: 'User interface design, interaction patterns, usability.',
    semesters: ['Fall', 'Spring'], careers: ['ux-designer'] },
  { id: 'DES-410', code: 'DES 410', title: 'Design Research', credits: 3, college: 'design', department: 'Design',
    type: 'notable', ring: 4, angle: 290, prerequisites: ['DES-310'],
    description: 'Ethnographic research, user studies, design synthesis.',
    semesters: ['Fall', 'Spring'], careers: ['ux-designer'] },

  // ========== ARCHITECTURE (Angle: 330°) ==========
  { id: 'ARCH-100', code: 'ARCH 100', title: 'Intro to Architecture', credits: 3, college: 'architecture', department: 'Architecture',
    type: 'gateway', ring: 1, angle: 330, prerequisites: ['START'],
    description: 'Architecture history, design thinking, spatial concepts.',
    semesters: ['Fall', 'Spring'], careers: ['architect'] },
  { id: 'ARCH-107', code: 'ARCH 107', title: 'Foundation Design Studio', credits: 6, college: 'architecture', department: 'Architecture',
    type: 'notable', ring: 2, angle: 330, prerequisites: ['ARCH-100'],
    description: 'Introduction to architectural design through hands-on projects.',
    semesters: ['Fall', 'Spring'], careers: ['architect'] },
  { id: 'ARCH-201', code: 'ARCH 201', title: 'Design Studio II', credits: 6, college: 'architecture', department: 'Architecture',
    type: 'required', ring: 3, angle: 322, prerequisites: ['ARCH-107'],
    description: 'Building design at multiple scales, site analysis, programming.',
    semesters: ['Fall'], careers: ['architect'] },
  { id: 'ARCH-202', code: 'ARCH 202', title: 'Design Studio III', credits: 6, college: 'architecture', department: 'Architecture',
    type: 'required', ring: 3, angle: 338, prerequisites: ['ARCH-201'],
    description: 'Urban context, complex programs, sustainable design.',
    semesters: ['Spring'], careers: ['architect'] },
  { id: 'ARCH-311', code: 'ARCH 311', title: 'Building Technology I', credits: 3, college: 'architecture', department: 'Architecture',
    type: 'required', ring: 4, angle: 318, prerequisites: ['ARCH-201'],
    description: 'Structural systems, building materials, construction methods.',
    semesters: ['Fall'], careers: ['architect'] },
  { id: 'ARCH-312', code: 'ARCH 312', title: 'Building Technology II', credits: 3, college: 'architecture', department: 'Architecture',
    type: 'required', ring: 4, angle: 342, prerequisites: ['ARCH-311'],
    description: 'Environmental systems, building envelope, sustainability.',
    semesters: ['Spring'], careers: ['architect'] },
  { id: 'ARCH-401', code: 'ARCH 401', title: 'Advanced Design Studio I', credits: 6, college: 'architecture', department: 'Architecture',
    type: 'notable', ring: 5, angle: 322, prerequisites: ['ARCH-202', 'ARCH-312'],
    description: 'Comprehensive building design integrating all systems.',
    semesters: ['Fall'], careers: ['architect'] },
  { id: 'ARCH-402', code: 'ARCH 402', title: 'Advanced Design Studio II', credits: 6, college: 'architecture', department: 'Architecture',
    type: 'notable', ring: 5, angle: 338, prerequisites: ['ARCH-401'],
    description: 'Complex buildings, urban design, professional practice.',
    semesters: ['Spring'], careers: ['architect'] },
  { id: 'BARCH', code: 'B.ARCH', title: 'Architecture Degree', credits: 159, college: 'architecture', department: 'Architecture',
    type: 'keystone', ring: 6, angle: 330, prerequisites: ['ARCH-402'],
    description: 'Bachelor of Architecture (5-year professional degree). NAAB accredited.',
    careers: ['architect'] },

  // ========== MINOR TRACK COURSES ==========
  // These courses support minor pathways that branch off from majors

  // Minor: Software Engineering (branches from CS)
  { id: 'CS-445', code: 'CS 445', title: 'Software Design', credits: 3, college: 'computing', department: 'CS',
    type: 'elective', ring: 4, angle: -12, prerequisites: ['CS-331'],
    description: 'Design patterns, software architecture, code quality.',
    semesters: ['Fall', 'Spring'], careers: ['software-dev'] },
  { id: 'CS-497', code: 'CS 497', title: 'Software Testing', credits: 3, college: 'computing', department: 'CS',
    type: 'elective', ring: 5, angle: -12, prerequisites: ['CS-445'],
    description: 'Unit testing, integration testing, test-driven development.',
    semesters: ['Fall', 'Spring'], careers: ['software-dev'] },

  // Minor: Data Science (branches from Applied Math)
  { id: 'MATH-564', code: 'MATH 564', title: 'Applied Statistics', credits: 3, college: 'computing', department: 'Applied Math',
    type: 'elective', ring: 4, angle: 38, prerequisites: ['MATH-474'],
    description: 'Advanced regression, multivariate analysis, categorical data.',
    semesters: ['Fall'], careers: ['data-scientist'] },

  // Minor: Cybersecurity (branches from ITM)
  { id: 'ITMS-448', code: 'ITMS 448', title: 'Cyber Forensics', credits: 3, college: 'computing', department: 'ITM',
    type: 'elective', ring: 5, angle: 60, prerequisites: ['CS-458'],
    description: 'Digital evidence, forensic analysis, incident response.',
    semesters: ['Fall', 'Spring'], careers: ['security-analyst'] },

  // Minor: Materials Science (branches from MMAE)
  { id: 'MS-201', code: 'MS 201', title: 'Intro to Materials Science', credits: 3, college: 'engineering_mmae', department: 'Materials',
    type: 'required', ring: 2, angle: 112, prerequisites: ['CHEM-122'],
    description: 'Structure, properties, processing of metals, ceramics, polymers.',
    semesters: ['Fall', 'Spring'], careers: ['materials-scientist', 'mechanical-engineer'] },
  { id: 'MMAE-362', code: 'MMAE 362', title: 'Physics of Solids', credits: 3, college: 'engineering_mmae', department: 'MMAE',
    type: 'notable', ring: 4, angle: 112, prerequisites: ['MS-201', 'PHYS-223'],
    description: 'Crystal structure, defects, mechanical properties.',
    semesters: ['Fall'], careers: ['materials-scientist'] },
  { id: 'MMAE-365', code: 'MMAE 365', title: 'Phase Transformations', credits: 3, college: 'engineering_mmae', department: 'MMAE',
    type: 'elective', ring: 5, angle: 115, prerequisites: ['MMAE-362'],
    description: 'Diffusion, solidification, solid-state transformations.',
    semesters: ['Spring'], careers: ['materials-scientist'] },

  // Minor: Entrepreneurship (branches from Business)
  { id: 'ENTR-301', code: 'ENTR 301', title: 'Entrepreneurship Fundamentals', credits: 3, college: 'business', department: 'Business',
    type: 'elective', ring: 3, angle: 318, prerequisites: ['BUS-101'],
    description: 'Opportunity recognition, business model canvas, lean startup.',
    semesters: ['Fall', 'Spring'], careers: ['project-manager'] },
  { id: 'ENTR-401', code: 'ENTR 401', title: 'Venture Creation', credits: 3, college: 'business', department: 'Business',
    type: 'elective', ring: 4, angle: 318, prerequisites: ['ENTR-301'],
    description: 'Business planning, funding, launch strategies.',
    semesters: ['Fall', 'Spring'], careers: ['project-manager'] },

  // Minor: Physics (supports engineering students)
  { id: 'PHYS-224', code: 'PHYS 224', title: 'Modern Physics', credits: 3, college: 'science_phys', department: 'Physics',
    type: 'required', ring: 3, angle: 225, prerequisites: ['PHYS-221', 'MATH-251'],
    description: 'Special relativity, quantum mechanics, nuclear physics.',
    semesters: ['Fall', 'Spring'], careers: ['physicist'] },

  // Minor: Psychology (supports various majors)
  { id: 'PSYC-325', code: 'PSYC 325', title: 'Behavioral Neuroscience', credits: 3, college: 'psychology', department: 'Psychology',
    type: 'elective', ring: 4, angle: 248, prerequisites: ['PSYC-311'],
    description: 'Brain-behavior relationships, neurological disorders.',
    semesters: ['Fall'], careers: ['psychologist'] },
];

// ============================================================================
// DEGREE PATHWAYS - Suggested course sequences for each major
// ============================================================================

const DEGREE_PATHWAYS = {
  'BS-CS': {
    name: 'B.S. Computer Science',
    color: COLLEGE_COLORS.computing,
    courses: ['START', 'CS-100', 'MATH-151', 'CS-115', 'CS-116', 'MATH-152', 'CS-330', 'CS-331', 'CS-350', 'MATH-251', 'CS-351', 'CS-425', 'CS-430', 'CS-440', 'CS-450', 'CS-487', 'BS-CS']
  },
  'BS-AI': {
    name: 'B.S. Artificial Intelligence',
    color: COLLEGE_COLORS.computing,
    courses: ['START', 'CS-100', 'MATH-151', 'CS-115', 'CS-116', 'MATH-152', 'CS-330', 'CS-331', 'MATH-251', 'MATH-333', 'CS-480', 'CS-484', 'CS-482', 'BS-AI']
  },
  'BS-DS': {
    name: 'B.S. Data Science',
    color: COLLEGE_COLORS.computing,
    courses: ['START', 'MATH-151', 'CS-100', 'CS-115', 'CS-116', 'MATH-152', 'MATH-333', 'CS-331', 'MATH-251', 'MATH-474', 'CS-425', 'MATH-481', 'MATH-485', 'BS-DS']
  },
  'BS-EE': {
    name: 'B.S. Electrical Engineering',
    color: COLLEGE_COLORS.engineering_ece,
    courses: ['START', 'ECE-100', 'MATH-151', 'PHYS-123', 'MATH-152', 'PHYS-221', 'ECE-211', 'MATH-251', 'MATH-252', 'ECE-213', 'ECE-218', 'ECE-307', 'ECE-308', 'ECE-311', 'ECE-417', 'ECE-418', 'ECE-443', 'BS-EE']
  },
  'BS-CPE': {
    name: 'B.S. Computer Engineering',
    color: COLLEGE_COLORS.engineering_ece,
    courses: ['START', 'ECE-100', 'CS-115', 'CS-116', 'MATH-151', 'PHYS-123', 'MATH-152', 'PHYS-221', 'ECE-211', 'ECE-218', 'ECE-213', 'ECE-242', 'CS-331', 'ECE-319', 'ECE-441', 'BS-CPE']
  },
  'BS-ME': {
    name: 'B.S. Mechanical Engineering',
    color: COLLEGE_COLORS.engineering_mmae,
    courses: ['START', 'MMAE-100', 'MATH-151', 'PHYS-123', 'MATH-152', 'MMAE-200', 'MATH-251', 'MATH-252', 'MMAE-205', 'MMAE-232', 'MMAE-312', 'MMAE-305', 'MMAE-320', 'MMAE-350', 'MMAE-370', 'MMAE-451', 'MMAE-495', 'BS-ME']
  },
  'BS-AE': {
    name: 'B.S. Aerospace Engineering',
    color: COLLEGE_COLORS.engineering_mmae,
    courses: ['START', 'MMAE-100', 'MATH-151', 'PHYS-123', 'MATH-152', 'MMAE-200', 'MATH-251', 'MATH-252', 'MMAE-205', 'MMAE-232', 'MMAE-305', 'MMAE-320', 'MMAE-443', 'MMAE-454', 'BS-AE']
  },
  'BS-CE': {
    name: 'B.S. Civil Engineering',
    color: COLLEGE_COLORS.engineering_civil,
    courses: ['START', 'CAEE-100', 'MATH-151', 'PHYS-123', 'CHEM-122', 'MATH-152', 'MMAE-200', 'CAEE-213', 'MATH-251', 'MMAE-232', 'CAEE-310', 'CAEE-330', 'CAEE-351', 'CAEE-410', 'CAEE-420', 'CAEE-450', 'BS-CE']
  },
  'BS-CHE': {
    name: 'B.S. Chemical Engineering',
    color: COLLEGE_COLORS.engineering_chbe,
    courses: ['START', 'CHBE-100', 'MATH-151', 'CHEM-122', 'MATH-152', 'CHEM-124', 'CHBE-201', 'MATH-251', 'MATH-252', 'MMAE-312', 'CHBE-302', 'CHBE-310', 'MMAE-320', 'CHBE-401', 'CHBE-410', 'CHBE-485', 'BS-CHE']
  },
  'BS-BME': {
    name: 'B.S. Biomedical Engineering',
    color: COLLEGE_COLORS.engineering_chbe,
    courses: ['START', 'BME-100', 'MATH-151', 'CHEM-122', 'PHYS-123', 'MATH-152', 'CHEM-124', 'PHYS-221', 'MATH-251', 'MATH-252', 'BME-301', 'BME-401', 'BME-450', 'BS-BME']
  },
  'BS-BIO': {
    name: 'B.S. Biology',
    color: COLLEGE_COLORS.science_bio,
    courses: ['START', 'BIOL-105', 'CHEM-122', 'MATH-151', 'BIOL-115', 'BIOL-206', 'CHEM-124', 'CHEM-237', 'BIOL-351', 'CHEM-238', 'BIOL-352', 'BIOL-401', 'BS-BIO']
  },
  'BS-CHEM': {
    name: 'B.S. Chemistry',
    color: COLLEGE_COLORS.science_phys,
    courses: ['START', 'CHEM-122', 'MATH-151', 'CHEM-124', 'MATH-152', 'CHEM-237', 'PHYS-123', 'CHEM-238', 'PHYS-221', 'MATH-251', 'CHEM-343', 'CHEM-344', 'BS-CHEM']
  },
  'BS-PHYS': {
    name: 'B.S. Physics',
    color: COLLEGE_COLORS.science_phys,
    courses: ['START', 'PHYS-123', 'MATH-151', 'MATH-152', 'PHYS-221', 'MATH-251', 'MATH-252', 'PHYS-223', 'MATH-333', 'PHYS-224', 'PHYS-301', 'PHYS-302', 'PHYS-401', 'PHYS-437', 'BS-PHYS']
  },
  'BS-PSYC': {
    name: 'B.S. Psychological Science',
    color: COLLEGE_COLORS.psychology,
    courses: ['START', 'PSYC-101', 'MATH-151', 'PSYC-203', 'PSYC-204', 'PSYC-311', 'PSYC-321', 'PSYC-350', 'PSYC-424', 'BS-PSYC']
  },
  'BS-GEM': {
    name: 'B.S. Game Design',
    color: COLLEGE_COLORS.humanities,
    courses: ['START', 'GEM-100', 'CS-115', 'CS-116', 'HUM-371', 'HUM-372', 'ITMD-361', 'HUM-374', 'ITMD-362', 'HUM-400', 'HUM-401', 'BS-GEM']
  },
  'BS-FIN': {
    name: 'B.S. Finance',
    color: COLLEGE_COLORS.business,
    courses: ['START', 'BUS-101', 'MATH-151', 'ECON-101', 'ECON-102', 'FIN-301', 'MATH-474', 'FIN-380', 'FIN-420', 'BS-FIN']
  },
  'BARCH': {
    name: 'B.ARCH Architecture',
    color: COLLEGE_COLORS.architecture,
    courses: ['START', 'ARCH-100', 'ARCH-107', 'ARCH-201', 'ARCH-202', 'ARCH-311', 'ARCH-312', 'ARCH-401', 'ARCH-402', 'BARCH']
  }
};

// Orbit ring definitions (course levels)
const ORBIT_RINGS = [
  { ring: 1, label: 'FRESHMAN', sublabel: '100-Level', color: '#3B82F6' },
  { ring: 2, label: 'SOPHOMORE', sublabel: '200-Level', color: '#8B5CF6' },
  { ring: 3, label: 'JUNIOR', sublabel: '300-Level', color: '#EC4899' },
  { ring: 4, label: 'SENIOR I', sublabel: '400-Level', color: '#F97316' },
  { ring: 5, label: 'SENIOR II', sublabel: 'Advanced', color: '#EAB308' },
  { ring: 6, label: 'CAPSTONE', sublabel: 'Degree', color: '#22C55E' },
];

// ============================================================================
// SIDEBAR CUSTOM SELECT (matches frosted pill UI; avoids native OS menu)
// ============================================================================

/**
 * @param {Object} props
 * @param {string} props.ariaLabel
 * @param {string} [props.title]
 * @param {string} props.value
 * @param {(v: string) => void} props.onChange
 * @param {string} props.placeholder - Shown when value is empty
 * @param {{ value: string, label: string }} [props.clearOption] - First row (e.g. reset to catalog-wide)
 * @param {{ heading: string, options: { value: string, label: string }[] }[]} [props.groups]
 * @param {{ value: string, label: string }[]} [props.options] - Flat list (mutually exclusive with groups+clearOption pattern)
 */
const SidebarSelect = ({ ariaLabel, title, value, onChange, placeholder, clearOption, groups, options }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const displayLabel = useMemo(() => {
    const v = value ?? '';
    if (clearOption && v === clearOption.value) return clearOption.label;
    if (!v && clearOption) return clearOption.label;
    if (options) {
      const hit = options.find((o) => o.value === v);
      return hit ? hit.label : placeholder;
    }
    if (groups) {
      for (const g of groups) {
        const hit = g.options.find((o) => o.value === v);
        if (hit) return hit.label;
      }
    }
    return placeholder;
  }, [value, placeholder, clearOption, groups, options]);

  const triggerRounded = open ? 'rounded-t-[20px] rounded-b-none border-b-0' : 'rounded-[20px]';

  return (
    <div className="relative" ref={wrapRef} style={{ borderRadius: 20 }}>
      <button
        type="button"
        title={title}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
        className={`w-full backdrop-blur-[10px] bg-white/50 border border-black/20 cursor-pointer hover:bg-white/70 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 text-[#787878] text-left ${triggerRounded}`}
        style={{ padding: '8px 32px 8px 16px', fontSize: 14 }}
      >
        {displayLabel}
      </button>
      <svg
        className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787878] pointer-events-none transition-transform ${open ? 'rotate-0' : 'rotate-180'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-[60] m-0 list-none bg-white/95 backdrop-blur-md border border-black/20 border-t-0 rounded-b-[20px] max-h-[min(280px,50vh)] overflow-y-auto px-0 py-1"
        >
          {clearOption && (
            <li role="none">
              <button
                type="button"
                role="option"
                aria-selected={value === clearOption.value}
                className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100/80 hover:bg-gray-100/90 ${
                  value === clearOption.value ? 'bg-gray-100 text-black font-medium' : 'text-[#787878]'
                }`}
                onClick={() => {
                  onChange(clearOption.value);
                  setOpen(false);
                }}
              >
                {clearOption.label}
              </button>
            </li>
          )}
          {groups &&
            groups.map((g) => (
              <li key={g.heading} role="none" className="list-none">
                <div className="px-4 pt-2.5 pb-1 text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">
                  {g.heading}
                </div>
                <ul className="m-0 list-none p-0 pb-1">
                  {g.options.map((opt) => (
                    <li key={opt.value} role="none">
                      <button
                        type="button"
                        role="option"
                        aria-selected={value === opt.value}
                        className={`w-full text-left px-4 py-2.5 text-sm pl-5 hover:bg-gray-100/90 border-b border-gray-50 last:border-0 ${
                          value === opt.value ? 'bg-gray-100 text-black font-medium' : 'text-[#787878]'
                        }`}
                        onClick={() => {
                          onChange(opt.value);
                          setOpen(false);
                        }}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          {options &&
            options.map((opt) => (
              <li key={opt.value} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={value === opt.value}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100/90 border-b border-gray-100/80 last:border-0 ${
                    value === opt.value ? 'bg-gray-100 text-black font-medium' : 'text-[#787878]'
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

// ============================================================================
// COURSE SEARCH COMPONENT
// ============================================================================

const CourseSearch = ({ courses, onSelectCourse, nodePositions, onPanTo, variant = 'default' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return courses.filter(course => 
      course.code.toLowerCase().includes(query) ||
      course.title.toLowerCase().includes(query) ||
      course.department?.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [searchQuery, courses]);
  
  const handleSelect = (course) => {
    onSelectCourse(course);
    if (nodePositions[course.id] && onPanTo) {
      onPanTo(nodePositions[course.id]);
    }
    setSearchQuery('');
    setIsOpen(false);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredCourses.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredCourses[selectedIndex]) {
      handleSelect(filteredCourses[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };
  
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCourses]);
  
  const isPill = variant === 'pill';
  
  return (
    <div className={isPill ? 'relative w-full' : ''} style={!isPill ? { position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 60, width: 320 } : {}}>
      <div className={isPill ? 'backdrop-blur-[10px] bg-white/50 border border-black/20 flex items-center gap-2 hover:bg-white/70 transition-colors' : ''}
        style={!isPill ? {
          display: 'flex', alignItems: 'center',
          background: '#0d0d14', border: '1px solid #333',
          borderRadius: isOpen && filteredCourses.length > 0 ? '12px 12px 0 0' : 12,
          padding: '8px 14px', gap: 10
        } : { borderRadius: isOpen && filteredCourses.length > 0 ? '20px 20px 0 0' : '20px', padding: '8px 16px' }}
      >
        <svg className={`w-4 h-4 text-[#787878] flex-shrink-0 ${!isPill ? 'hidden' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {!isPill && <span style={{ color: '#666' }}>🔍</span>}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={isPill ? 'Courses' : 'Search courses...'}
          className={isPill ? 'flex-1 bg-transparent border-none outline-none text-[#787878] text-sm placeholder:text-[#787878]' : ''}
          style={!isPill ? { flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 14, outline: 'none' } : {}}
        />
        {searchQuery && (
          <button onClick={() => { setSearchQuery(''); setIsOpen(false); }} className="text-[#787878] hover:text-black cursor-pointer text-lg leading-none">
            ×
          </button>
        )}
      </div>
      
      {isOpen && filteredCourses.length > 0 && (
        <div className={isPill ? 'absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur-md border border-black/20 border-t-0 rounded-b-[20px] max-h-[300px] overflow-y-auto z-50' : ''}
          style={!isPill ? {
            background: '#0d0d14', border: '1px solid #333', borderTop: 'none',
            borderRadius: '0 0 12px 12px', maxHeight: 300, overflowY: 'auto'
          } : {}}
        >
          {filteredCourses.map((course, i) => (
            <div
              key={course.id}
              onClick={() => handleSelect(course)}
              className={isPill ? `px-4 py-3 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 ${i === selectedIndex ? 'bg-gray-100' : ''}` : ''}
              style={!isPill ? {
                padding: '10px 14px', cursor: 'pointer',
                background: i === selectedIndex ? '#1a1a2e' : 'transparent',
                borderBottom: i < filteredCourses.length - 1 ? '1px solid #1a1a2e' : 'none',
                display: 'flex', alignItems: 'center', gap: 12
              } : {}}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <div className="rounded-full flex-shrink-0" style={{ width: 8, height: 8, background: COLLEGE_COLORS[course.college] || '#888' }} />
              <div className="flex-1 min-w-0">
                <div className={`font-bold ${isPill ? 'text-black text-sm' : ''}`} style={!isPill ? { color: '#fff', fontSize: 13 } : {}}>
                  {course.code}
                </div>
                <div className={isPill ? 'text-gray-500 text-xs' : ''} style={!isPill ? { color: '#888', fontSize: 11 } : {}}>
                  {course.title}
                </div>
              </div>
              <div className={isPill ? 'text-gray-400 text-xs flex-shrink-0' : ''} style={!isPill ? { color: '#666', fontSize: 10 } : {}}>
                {course.credits} cr
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PROGRESS DASHBOARD COMPONENT
// ============================================================================

const ProgressDashboard = ({ completedCourses, courses, selectedMajor, pathways }) => {
  const stats = useMemo(() => {
    const completed = Array.from(completedCourses).filter(id => id !== 'START');
    const completedCourseData = completed.map(id => courses.find(c => c.id === id)).filter(Boolean);
    const totalCredits = completedCourseData.reduce((sum, c) => sum + c.credits, 0);
    const totalCourses = completed.length;
    
    // Calculate by college
    const byCollege = {};
    completedCourseData.forEach(course => {
      if (!byCollege[course.college]) byCollege[course.college] = { count: 0, credits: 0 };
      byCollege[course.college].count++;
      byCollege[course.college].credits += course.credits;
    });
    
    // Calculate major progress
    let majorProgress = null;
    if (selectedMajor && pathways[selectedMajor]) {
      const majorCourses = pathways[selectedMajor].courses.filter(id => id !== 'START');
      const completedMajorCourses = majorCourses.filter(id => completedCourses.has(id));
      majorProgress = {
        name: pathways[selectedMajor].name,
        completed: completedMajorCourses.length,
        total: majorCourses.length,
        percent: Math.round((completedMajorCourses.length / majorCourses.length) * 100)
      };
    }
    
    // Estimate graduation (assuming 120 credits needed, 15 credits per semester)
    const creditsNeeded = Math.max(0, 120 - totalCredits);
    const semestersRemaining = Math.ceil(creditsNeeded / 15);
    
    return {
      totalCredits,
      totalCourses,
      byCollege,
      majorProgress,
      creditsNeeded,
      semestersRemaining,
      completionPercent: Math.min(100, Math.round((totalCredits / 120) * 100))
    };
  }, [completedCourses, courses, selectedMajor, pathways]);
  
  return (
    <div className="fixed bottom-8 left-8 backdrop-blur-[10px] bg-white/60 rounded-[5px] shadow-card px-3 py-3 w-[280px] z-50">
      <p className="text-black font-bold text-[15px] mb-0">Progress</p>
      
      <div className="mt-2">
        <div className="flex justify-between items-center text-[#656565] text-[11px] mb-1">
          <span>Credits • {stats.totalCredits}/120</span>
          <span>{stats.semestersRemaining} semesters left</span>
        </div>
        
        <div className="relative h-[9px] bg-[#d9d9d9] rounded-[5px] overflow-hidden mt-1">
          <div 
            className="absolute left-0 top-0 h-full bg-accent rounded-[5px] transition-all duration-300"
            style={{ width: `${Math.max(2, stats.completionPercent)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PREREQUISITE CHAIN COMPONENT
// ============================================================================

const PrerequisiteChain = ({ course, courses, completedCourses, onHighlightChain }) => {
  const [chain, setChain] = useState([]);
  
  useEffect(() => {
    if (!course) {
      setChain([]);
      return;
    }
    
    // Build the prerequisite chain (BFS to find all needed courses)
    const needed = new Set();
    const queue = [...course.prerequisites.filter(p => p !== 'START' && !completedCourses.has(p))];
    
    while (queue.length > 0) {
      const prereqId = queue.shift();
      if (needed.has(prereqId)) continue;
      needed.add(prereqId);
      
      const prereqCourse = courses.find(c => c.id === prereqId);
      if (prereqCourse) {
        prereqCourse.prerequisites
          .filter(p => p !== 'START' && !completedCourses.has(p) && !needed.has(p))
          .forEach(p => queue.push(p));
      }
    }
    
    // Sort by ring (inner to outer)
    const chainCourses = Array.from(needed)
      .map(id => courses.find(c => c.id === id))
      .filter(Boolean)
      .sort((a, b) => a.ring - b.ring);
    
    setChain(chainCourses);
    
    // Notify parent to highlight these courses
    if (onHighlightChain) {
      onHighlightChain(chainCourses.map(c => c.id));
    }
  }, [course, courses, completedCourses, onHighlightChain]);
  
  if (!course || chain.length === 0) return null;
  
  return (
    <div style={{
      position: 'absolute',
      bottom: 140,
      left: 24,
      background: '#0a0a0f',
      border: '1px solid #FF6B6B40',
      borderRadius: 12,
      padding: 14,
      maxWidth: 280,
      zIndex: 50
    }}>
      <div style={{ color: '#FF6B6B', fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>
        🔓 Prerequisites Needed for {course.code}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {chain.map((prereq, i) => (
          <div key={prereq.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: COLLEGE_COLORS[prereq.college] || '#888',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              color: '#000',
              fontWeight: 'bold'
            }}>
              {i + 1}
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 12 }}>{prereq.code}</div>
              <div style={{ color: '#666', fontSize: 10 }}>{prereq.title}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ color: '#888', fontSize: 10, marginTop: 10 }}>
        Complete these {chain.length} course{chain.length > 1 ? 's' : ''} to unlock {course.code}
      </div>
    </div>
  );
};

// ============================================================================
// AI COURSE ADVISOR CHATBOT
// ============================================================================

const CourseAdvisorChat = ({ completedCourses, selectedMajor, selectedCourse, courses, pathways, careerOutcomes, onSuggestPath, onClearPaths }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hi! I'm your Illinois Tech Course Advisor 🎓 I can help you:\n\n• Plan your course sequence\n• Explore majors and careers\n• Find prerequisites\n• Recommend electives\n\nWhat would you like to know?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedPath, setExtractedPath] = useState(null); // Path extracted from AI response
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Build context about student's current state
  const buildStudentContext = () => {
    const completed = Array.from(completedCourses)
      .filter(id => id !== 'START')
      .map(id => {
        const course = courses.find(c => c.id === id);
        return course ? `${course.code}: ${course.title}` : id;
      });
    
    const completedCredits = Array.from(completedCourses)
      .map(id => courses.find(c => c.id === id))
      .filter(Boolean)
      .reduce((sum, c) => sum + c.credits, 0);
    
    // Find available courses (prerequisites met but not completed)
    const available = courses.filter(course => {
      if (completedCourses.has(course.id)) return false;
      return course.prerequisites.every(p => completedCourses.has(p) || p === 'START');
    }).map(c => `${c.code}: ${c.title} (${c.credits} cr)`);
    
    const majorInfo = selectedMajor && pathways[selectedMajor] 
      ? `Currently exploring: ${pathways[selectedMajor].name}` 
      : 'No major selected yet';
    
    // Selected course context
    let selectedCourseInfo = '';
    if (selectedCourse) {
      const prereqs = selectedCourse.prerequisites
        .filter(p => p !== 'START')
        .map(p => courses.find(c => c.id === p)?.code || p)
        .join(', ');
      const unlocks = courses.filter(c => c.prerequisites.includes(selectedCourse.id))
        .map(c => c.code)
        .join(', ');
      selectedCourseInfo = `
CURRENTLY VIEWING COURSE:
- ${selectedCourse.code}: ${selectedCourse.title}
- Credits: ${selectedCourse.credits}
- Description: ${selectedCourse.description}
- Prerequisites: ${prereqs || 'None'}
- Unlocks: ${unlocks || 'No direct unlocks'}
- Department: ${selectedCourse.department}
`;
    }
    
    return `
STUDENT STATUS:
- Completed Credits: ${completedCredits}
- Completed Courses: ${completed.length > 0 ? completed.join(', ') : 'None yet'}
- ${majorInfo}
- Available Courses (prerequisites met): ${available.slice(0, 15).join(', ')}${available.length > 15 ? ` ... and ${available.length - 15} more` : ''}
${selectedCourseInfo}
`;
  };
  
  // Build course catalog context
  const buildCatalogContext = () => {
    const majorsList = Object.entries(pathways).map(([key, val]) => 
      `${val.name}: ${val.courses.slice(1, -1).join(' → ')}`
    ).join('\n');
    
    const careersList = Object.entries(careerOutcomes).map(([key, val]) =>
      `${val.title}: ${val.salary}, ${val.growth} growth`
    ).join('\n');
    
    return `
AVAILABLE MAJORS AND THEIR CORE SEQUENCES:
${majorsList}

CAREER OUTCOMES (with salary & growth data):
${careersList}

COURSE CATALOG SUMMARY:
- Total courses: ${courses.length}
- Colleges: Computing, Engineering (ECE, MMAE, Civil, Chemical/Biomedical), Science (Bio, Chem, Physics), Psychology, Humanities/Design, Business, Architecture
- Course levels: 100 (Gateway) → 200 (Foundation) → 300 (Core) → 400 (Advanced) → Capstone/Degree
`;
  };
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    try {
      const systemPrompt = `You are a friendly and knowledgeable academic advisor for Illinois Institute of Technology. You help students plan their courses, explore majors, understand prerequisites, and make informed decisions about their academic journey.

${buildStudentContext()}

${buildCatalogContext()}

GUIDELINES:
- Be encouraging and supportive
- Give specific, actionable advice
- Reference actual course codes and names from the catalog
- Consider the student's completed courses when making recommendations
- Explain prerequisite chains when relevant
- Connect courses to career outcomes when appropriate
- Keep responses concise but helpful (2-4 paragraphs max)
- Use emoji sparingly to keep things friendly 🎯
- If asked about something outside the catalog, acknowledge limitations
- When suggesting a course sequence, list the course codes in order (e.g., "I recommend: CS 100 → CS 115 → CS 116 → CS 331")

When recommending courses, prioritize ones the student can actually take (prerequisites met).`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: messages.slice(-10).concat([{ role: 'user', content: userMessage }]).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });
      
      const data = await response.json();
      const assistantMessage = data.content?.[0]?.text || "I'm sorry, I couldn't process that request. Please try again.";
      
      // Extract course codes from the response for potential path highlighting
      const courseCodePattern = /([A-Z]{2,4})\s*(\d{3})/g;
      const foundCodes = [];
      let match;
      while ((match = courseCodePattern.exec(assistantMessage)) !== null) {
        const code = `${match[1]}-${match[2]}`;
        // Check if it's a valid course ID
        if (courses.find(c => c.id === code)) {
          foundCodes.push(code);
        }
      }
      
      // Store extracted path for potential highlighting
      if (foundCodes.length >= 2) {
        setExtractedPath({
          courses: ['START', ...foundCodes],
          color: '#00FF88'
        });
      } else {
        setExtractedPath(null);
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // Dynamic suggested questions based on context
  const suggestedQuestions = useMemo(() => {
    const questions = [
      "What should I take next?",
      "Tell me about CS careers",
      "How do I become a data scientist?",
    ];
    
    if (selectedCourse && selectedCourse.code !== 'START') {
      questions.unshift(`Tell me about ${selectedCourse.code}`);
      questions.unshift(`What does ${selectedCourse.code} unlock?`);
    }
    
    if (selectedMajor && pathways[selectedMajor]) {
      questions.push(`${pathways[selectedMajor].name} requirements?`);
    }
    
    return questions.slice(0, 5);
  }, [selectedCourse, selectedMajor, pathways]);
  
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 100,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          zIndex: 100,
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 30px rgba(0, 212, 255, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 20px rgba(0, 212, 255, 0.4)';
        }}
      >
        🤖
      </button>
    );
  }
  
  return (
    <div style={{
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 380,
      height: 520,
      background: 'linear-gradient(135deg, #0d0d14 0%, #1a1a2e 100%)',
      border: '1px solid #333',
      borderRadius: 16,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0, 0, 0, 0.5)',
      zIndex: 100
    }}>
      <style>{`
        @keyframes legacy-advisor-thinking-dot {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
        .legacy-advisor-thinking-dots span {
          display: inline-block;
          animation: legacy-advisor-thinking-dot 1.2s ease-in-out infinite;
        }
        .legacy-advisor-thinking-dots span:nth-child(1) { animation-delay: 0s; }
        .legacy-advisor-thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
        .legacy-advisor-thinking-dots span:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(90deg, #00D4FF20 0%, #8B5CF620 100%)',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🤖</span> Course Advisor
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: 24,
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1
          }}
        >
          ×
        </button>
      </div>
      
      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}
          >
            <div style={{
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' 
                ? 'linear-gradient(135deg, #00D4FF 0%, #0088aa 100%)' 
                : '#1e1e2e',
              color: msg.role === 'user' ? '#000' : '#e0e0e0',
              fontSize: 13,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '16px 16px 16px 4px',
                background: '#1e1e2e',
                color: '#888',
                fontSize: 13,
                display: 'inline-flex',
                alignItems: 'baseline'
              }}
              role="status"
              aria-label="Advisor is thinking"
            >
              <span>Thinking</span>
              <span className="legacy-advisor-thinking-dots" style={{ display: 'inline-flex', marginLeft: 1 }} aria-hidden="true">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggested Questions (show only if few messages) */}
      {messages.length <= 2 && (
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid #222',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6
        }}>
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(q);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: 12,
                background: '#1a1a2e',
                border: '1px solid #333',
                color: '#888',
                fontSize: 11,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#00D4FF';
                e.target.style.color = '#00D4FF';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#333';
                e.target.style.color = '#888';
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}
      
      {/* Extracted Path Highlight Button */}
      {extractedPath && extractedPath.courses.length > 2 && (
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid #222',
          background: '#00FF8810'
        }}>
          <div style={{ color: '#00FF88', fontSize: 11, marginBottom: 6, fontWeight: 'bold' }}>
            📍 Path detected in response:
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
            {extractedPath.courses.slice(1, 6).map((id, i) => {
              const course = courses.find(c => c.id === id);
              return course ? (
                <span key={id} style={{
                  background: '#00FF8820',
                  color: '#00FF88',
                  padding: '2px 6px',
                  borderRadius: 3,
                  fontSize: 9
                }}>
                  {course.code}
                </span>
              ) : null;
            })}
            {extractedPath.courses.length > 6 && (
              <span style={{ color: '#666', fontSize: 9 }}>+{extractedPath.courses.length - 6} more</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => {
                if (onSuggestPath) onSuggestPath(extractedPath);
                setExtractedPath(null);
              }}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 6,
                background: 'linear-gradient(135deg, #00FF88 0%, #00CC6A 100%)',
                border: 'none',
                color: '#000',
                fontSize: 11,
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✨ Highlight Path
            </button>
            <button
              onClick={() => setExtractedPath(null)}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: '#333',
                border: 'none',
                color: '#888',
                fontSize: 11,
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Quick Path Actions */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid #222',
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => {
            if (onSuggestPath) {
              onSuggestPath({
                courses: ['START', 'CS-100', 'CS-115', 'CS-116', 'CS-331', 'CS-430', 'BS-CS'],
                color: '#00D4FF'
              });
            }
          }}
          style={{
            padding: '4px 8px',
            borderRadius: 4,
            background: '#00D4FF20',
            border: '1px solid #00D4FF40',
            color: '#00D4FF',
            fontSize: 10,
            cursor: 'pointer'
          }}
        >
          🖥️ CS Path
        </button>
        <button
          onClick={() => {
            if (onSuggestPath) {
              onSuggestPath({
                courses: ['START', 'MMAE-100', 'MMAE-200', 'MMAE-205', 'MMAE-232', 'MMAE-312', 'BS-ME'],
                color: '#F97316'
              });
            }
          }}
          style={{
            padding: '4px 8px',
            borderRadius: 4,
            background: '#F9731620',
            border: '1px solid #F9731640',
            color: '#F97316',
            fontSize: 10,
            cursor: 'pointer'
          }}
        >
          ⚙️ ME Path
        </button>
        <button
          onClick={() => {
            if (onSuggestPath) {
              onSuggestPath({
                courses: ['START', 'ECE-100', 'ECE-211', 'ECE-218', 'ECE-308', 'ECE-319', 'BS-EE'],
                color: '#8B5CF6'
              });
            }
          }}
          style={{
            padding: '4px 8px',
            borderRadius: 4,
            background: '#8B5CF620',
            border: '1px solid #8B5CF640',
            color: '#8B5CF6',
            fontSize: 10,
            cursor: 'pointer'
          }}
        >
          ⚡ EE Path
        </button>
        {onClearPaths && (
          <button
            onClick={onClearPaths}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              background: '#FF6B6B20',
              border: '1px solid #FF6B6B40',
              color: '#FF6B6B',
              fontSize: 10,
              cursor: 'pointer'
            }}
          >
            🔄 Clear
          </button>
        )}
      </div>
      
      {/* Input */}
      <div style={{
        padding: 12,
        borderTop: '1px solid #333',
        display: 'flex',
        gap: 8
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about courses, majors, careers..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 20,
            background: '#0a0a0f',
            border: '1px solid #333',
            color: '#fff',
            fontSize: 13,
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#00D4FF'}
          onBlur={(e) => e.target.style.borderColor = '#333'}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: input.trim() ? 'linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%)' : '#333',
            border: 'none',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            transition: 'all 0.2s'
          }}
        >
          ➤
        </button>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const getNodeColor = (course) => {
  return COLLEGE_COLORS[course.college] || COLLEGE_COLORS.core;
};

const getNodeSize = (course) => {
  if (course.type === 'start') return 45;
  if (course.type === 'keystone') return 38;
  if (course.type === 'notable' || course.type === 'gateway') return 26;
  return 20;
};

function clampNumber(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/** Default zoom on first paint; wheel allows ~0.3–3. Higher = more zoomed in at load. */
const INITIAL_SKILL_TREE_ZOOM = 1.06;

/** Default pan so canvas center is viewport-centered at `zoom` (SVG xMidYMid meet + translate/scale origin top-left). */
function getInitialMapPanZoom(viewportW, viewportH, canvasW, canvasH, zoom) {
  if (viewportW < 16 || viewportH < 16) {
    return { pan: { x: 0, y: 0 }, zoom };
  }
  const s = Math.min(viewportW / canvasW, viewportH / canvasH);
  const offsetX = (viewportW - canvasW * s) / 2;
  const offsetY = (viewportH - canvasH * s) / 2;
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  return {
    pan: {
      x: viewportW / 2 - (offsetX + cx * s) * zoom,
      y: viewportH / 2 - (offsetY + cy * s) * zoom
    },
    zoom
  };
}

/**
 * Pan (px) for translate(pan) scale(zoom) with transform-origin 0 0, so viewBox point (cx,cy) lands at container center.
 * Matches default SVG preserveAspectRatio xMidYMid meet inside a full-size map layer.
 */
function computePanToCenterViewBoxPoint(containerEl, canvasW, canvasH, cx, cy, zoom) {
  if (!containerEl || containerEl.clientWidth < 16 || containerEl.clientHeight < 16) {
    return {
      x: (canvasW / 2 - cx) * zoom,
      y: (canvasH / 2 - cy) * zoom
    };
  }
  const W = containerEl.clientWidth;
  const H = containerEl.clientHeight;
  const s = Math.min(W / canvasW, H / canvasH);
  const offsetX = (W - canvasW * s) / 2;
  const offsetY = (H - canvasH * s) / 2;
  return {
    x: W / 2 - (offsetX + cx * s) * zoom,
    y: H / 2 - (offsetY + cy * s) * zoom
  };
}

// Wrap title into lines (max chars per line at word boundaries) so full title is visible without truncation
const wrapTitleLines = (title, maxCharsPerLine = 28) => {
  if (!title || title.length <= maxCharsPerLine) return [title];
  const words = title.split(/\s+/);
  const lines = [];
  let current = '';
  for (const w of words) {
    const next = current ? current + ' ' + w : w;
    if (next.length <= maxCharsPerLine) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = w.length > maxCharsPerLine ? w.slice(0, maxCharsPerLine) : w;
    }
  }
  if (current) lines.push(current);
  return lines;
};

const getCourseState = (course, completedCourses) => {
  if (course.type === 'start') return 'available';
  if (completedCourses.has(course.id)) return 'completed';
  
  const prereqsMet = course.prerequisites.every(prereq => 
    completedCourses.has(prereq) || prereq === 'START'
  );
  
  return prereqsMet ? 'available' : 'locked';
};

// ============================================================================
// COMPONENTS
// ============================================================================

// Individual skill node with hover state
const SkillNode = ({ course, position, state, onSelect, onHover, onHoverEnd, isSelected, scale, isOnPath, isUnlockedByHover, isInPrereqChain, isHoveredByParent = false, isInActiveCatalogFilter = false, planTermDimmed = false, isAdvisedTermSpotlight = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const color = getNodeColor(course);
  const isKeystone = course.type === 'keystone';
  const isStart = course.type === 'start';
  const isNotable = course.type === 'notable' || course.type === 'gateway';
  
  const baseSize = isStart ? 45 : isKeystone ? 38 : isNotable ? 26 : 20;
  const size = baseSize;
  
  const effectiveHovered = isHovered || isHoveredByParent;
  // Active = primary color; inactive = pastel (catalog filter counts as active for highlight)
  const isActive = effectiveHovered || isSelected || isUnlockedByHover || isInPrereqChain || isOnPath || isInActiveCatalogFilter || isAdvisedTermSpotlight;
  const fillColor = isStart
    ? '#DDDDDD'
    : isActive
      ? color
      : (INACTIVE_NODE_COLORS[color] || color);
  const nodeOpacity = 1;
  
  const pathHighlight = isOnPath && !isSelected;
  
  // Label color for light background
  const labelColor = isSelected ? '#1e293b' : (effectiveHovered || isUnlockedByHover) ? '#0f172a' : isInPrereqChain ? '#dc2626' : (isOnPath || isInActiveCatalogFilter) ? '#334155' : '#64748b';
  const labelFontWeight = isSelected || effectiveHovered || isOnPath || isUnlockedByHover || isInPrereqChain || isInActiveCatalogFilter ? 'bold' : 'normal';
  const labelFontSize = isSelected ? 12 : (effectiveHovered || isUnlockedByHover) ? 11 : 10;
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onHover) onHover(course.id);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onHoverEnd) onHoverEnd();
  };
  
  const nodeScale = effectiveHovered || isSelected ? 1.15 : 1;
  const groupOpacity = planTermDimmed && !isSelected && !effectiveHovered ? 0.34 : 1;

  return (
    <g
      transform={`translate(${position.x}, ${position.y}) scale(${nodeScale})`}
      onClick={() => onSelect(course)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        cursor: 'pointer',
        transition: 'transform 0.15s ease-out, opacity 0.2s ease-out',
        opacity: groupOpacity
      }}
      className="skill-node"
    >
      {/* Main node shape - all circles, color in fill only (no colored stroke) */}
      {isStart ? (
        <circle r={size} fill={fillColor} stroke="none" opacity={nodeOpacity} />
      ) : (
        <circle r={size} fill={fillColor} stroke="none" opacity={nodeOpacity} />
      )}
      
      {/* Course code label */}
      <text
        y={size + 18}
        textAnchor="middle"
        fill={labelColor}
        fontSize={labelFontSize}
        fontWeight={labelFontWeight}
        opacity={nodeOpacity}
        style={{ pointerEvents: 'none' }}
      >
        {course.code}
      </text>
      
      {/* Course title on hover/select/unlocked - wrapped so full title is visible */}
      {(effectiveHovered || isSelected || isUnlockedByHover) && (
        <text
          x={0}
          y={size + 32}
          textAnchor="middle"
          fill={isSelected ? color : isUnlockedByHover ? color : '#bbb'}
          fontSize={9}
          fontWeight="500"
          style={{ pointerEvents: 'none' }}
        >
          {wrapTitleLines(course.title).map((line, i) => (
            <tspan key={i} x={0} dy={i === 0 ? 0 : 11} style={{ textAnchor: 'middle' }}>
              {line}
            </tspan>
          ))}
        </text>
      )}
      
    </g>
  );
};

// Connection line between nodes - straight, solid; trimmed to node edges so it doesn't overlap labels
const Connection = ({ from, to, isActive, color, fromRadius = 24, toRadius = 24 }) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 1e-6) return null;
  const ux = dx / dist;
  const uy = dy / dist;
  const x1 = from.x + ux * fromRadius;
  const y1 = from.y + uy * fromRadius;
  const x2 = to.x - ux * toRadius;
  const y2 = to.y - uy * toRadius;
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={isActive ? color : '#333'}
      strokeWidth={isActive ? 2.5 : 1.5}
      opacity={isActive ? 0.85 : 0.25}
    />
  );
};

// Course detail panel - matches Figma/Course Details design exactly (credits & type right-aligned)
// When decisionCoachOpen is true: fixed height so it doesn't overlap the coach; only content below the hairline scrolls.
// When false: original behavior (whole panel scrollable, max-h-[calc(100vh-120px)]).
const CoursePanel = ({ course, completedCourses, onToggleComplete, onClose, decisionCoachOpen = false }) => {
  const [panelEntered, setPanelEntered] = useState(false);

  useEffect(() => {
    if (!course) {
      setPanelEntered(false);
      return undefined;
    }
    setPanelEntered(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPanelEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [course?.id]);

  if (!course) return null;
  
  const nodeColor = getNodeColor(course);
  const buttonColor = nodeColor === '#8CFFFF' ? '#87E9E9' : nodeColor === '#7AFBAA' ? '#81DFA4' : nodeColor === '#C3FB7A' ? '#B1DE76' : nodeColor;
  const careers = course.careers.map(id => CAREER_OUTCOMES[id]).filter(Boolean);
  const typeLabel = course.type === 'required' ? 'Required' : course.type === 'notable' ? 'Elective' : (course.type && course.type !== 'start' ? course.type.charAt(0).toUpperCase() + course.type.slice(1) : course.type);

  // Heights for smooth transition: coach open = shorter so it doesn't overlap; coach closed = taller
  const maxHeightWhenCoachOpen = 'calc(100vh - 24px - 455px - 24px - 24px)';
  const maxHeightWhenCoachClosed = 'calc(100vh - 120px)';

  const headerBlock = (
    <div className="pr-8 origin-top-left" style={{ transform: 'scale(0.93)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-black font-bold text-2xl leading-tight mb-0">{course.code}</h2>
          <p className="text-[#686868] text-[13px] leading-tight mt-1 whitespace-nowrap">{course.title}</p>
        </div>
        <div className="flex shrink-0 gap-2 text-right" style={{ marginLeft: 22, marginTop: 8 }}>
          <div className="flex flex-col items-center gap-0" style={{ minWidth: 48, marginLeft: 14 }}>
            <span className="text-[#787878] text-[13px] font-medium">Credits</span>
            <span className="text-[#656565] text-[13px] font-light">{course.credits}</span>
          </div>
          <div className="flex flex-col items-center gap-0" style={{ minWidth: 56 }}>
            <span className="text-[#787878] text-[13px] font-medium">Type</span>
            <span className="text-[#656565] text-[13px] font-light">{typeLabel}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 w-full border-b border-gray-200/80" style={{ width: 'calc(100% + 3.5rem)' }} />
    </div>
  );

  const contentBlock = (
    <div className="pr-8 origin-top-left" style={{ transform: 'scale(0.93)' }}>
      <p className="font-medium text-black text-[15px] mt-6 mb-0 leading-tight">Description</p>
      <p className="text-black text-[13px] leading-tight mb-1 mt-0.5">{course.description}</p>

      {course.semesters && course.semesters.length > 0 && (
        <>
          <p className="font-medium text-black text-[15px] mt-4 mb-0 leading-tight">Offered</p>
          <div className="flex flex-wrap gap-2 mb-1 mt-0.5">
            {course.semesters.map(sem => (
              <span key={sem} className="text-white text-[12px] font-medium px-3.5 py-1.5 rounded-[5px]" style={{ backgroundColor: buttonColor }}>
                {sem}
              </span>
            ))}
          </div>
        </>
      )}

      {course.prerequisites.length > 0 && course.prerequisites[0] !== 'START' && (
        <>
          <p className="font-medium text-black text-[15px] mt-4 mb-0 leading-tight">Prerequisites</p>
          <div className="flex flex-wrap gap-2 mb-1 mt-0.5">
            {course.prerequisites.map(prereqId => {
              const prereq = COURSES.find(c => c.id === prereqId);
              const met = completedCourses.has(prereqId);
              const isDirectPrereq = prereqId === course.prerequisites[course.prerequisites.length - 1];
              return (
                <span
                  key={prereqId}
                  className="text-[12px] font-medium px-3.5 py-1.5 rounded-[5px]"
                  style={{
                    backgroundColor: met || isDirectPrereq ? buttonColor : '#e5e5e5',
                    color: met || isDirectPrereq ? 'white' : '#656565'
                  }}
                >
                  {prereq ? prereq.code : prereqId}
                </span>
              );
            })}
          </div>
        </>
      )}

      {careers.length > 0 && (
        <>
          <p className="font-medium text-black text-[15px] mt-4 mb-0 leading-tight">Career Paths</p>
          <div className="space-y-3 mb-1 mt-0.5">
            {careers.map(career => (
              <div key={career.title}>
                <span className="inline-block text-white text-[12px] font-medium px-3.5 py-1.5 rounded-[5px]" style={{ backgroundColor: buttonColor }}>
                  {career.title}
                </span>
                <p className="text-black text-[13px] font-normal mt-1 flex flex-wrap gap-x-5 gap-y-0">
                  <span>{career.salary}</span>
                  <span>
                    <span className={career.growth.startsWith('-') ? 'text-red-600' : 'text-green-600'} aria-hidden>{career.growth.startsWith('-') ? '▼' : '▲'}</span>
                    {' '}{career.growth.replace(/^[+-]/, '')}
                  </span>
                  <span>{career.source}</span>
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // Single layout for both states; max-height + slide/fade when opening or switching course
  return (
    <div
      key={course.id}
      className="fixed right-6 top-6 w-[357px] backdrop-blur-[10px] bg-white/50 border border-black/20 rounded-[5px] shadow-card flex flex-col overflow-hidden z-[100]"
      style={{
        maxHeight: decisionCoachOpen ? maxHeightWhenCoachOpen : maxHeightWhenCoachClosed,
        opacity: panelEntered ? 1 : 0,
        transform: panelEntered ? 'translateX(0)' : 'translateX(20px)',
        pointerEvents: panelEntered ? 'auto' : 'none',
        transition:
          'max-height 0.3s ease-in-out, opacity 0.32s cubic-bezier(0.4, 0, 0.2, 1), transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <button onClick={onClose} className="absolute right-3 top-3 bg-transparent border-none text-gray-400 hover:text-black text-2xl cursor-pointer leading-none z-10">
        ×
      </button>
      <div className="flex-shrink-0 pt-4 px-4 pb-0">{headerBlock}</div>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-0">{contentBlock}</div>
    </div>
  );
};

// Resolve advisor/chat path ids to keys present in nodePositions (handles spacing / case drift).
function resolveRawCourseIdToMapKey(raw, positions) {
  if (raw == null || raw === '') return null;
  const s = String(raw).trim();
  if (positions[s]) return s;
  const upper = s.toUpperCase();
  if (positions[upper]) return upper;
  const dashed = upper.replace(/\s+/g, '-');
  if (positions[dashed]) return dashed;
  const m = s.match(/^([A-Za-z]{2,4})[-\s]?(\d{3})$/);
  if (m) {
    const guess = `${m[1].toUpperCase()}-${m[2]}`;
    if (positions[guess]) return guess;
  }
  const course = COURSES.find((c) => c.id === s || c.id === dashed || c.id === upper);
  if (course && positions[course.id]) return course.id;
  return null;
}

function uniqueResolvedCourseIds(rawIds, positions) {
  const seen = new Set();
  const out = [];
  for (const raw of rawIds) {
    const id = resolveRawCourseIdToMapKey(raw, positions);
    if (id && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

/** Option value for "highlight every course that appears in any term of the advised plan" */
const ADVISING_PLAN_ALL_TERMS = '__all_planned__';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const IllinoisTechSkillTree = () => {
  const [completedCourses, setCompletedCourses] = useState(new Set(['START']));
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [hoveredCourse, setHoveredCourse] = useState(null); // Track hovered course for unlock highlighting
  const [activePathway, setActivePathway] = useState(null);
  const [selectedMajor, setSelectedMajor] = useState(null); // For suggested pathway highlighting
  const [chatSuggestedPath, setChatSuggestedPath] = useState(null); // Path suggested by AI chatbot
  /** @type {{ terms: { label: string, courseIds: string[] }[], color?: string } | null} */
  const [advisedPlan, setAdvisedPlan] = useState(null);
  const [selectedAdvisedTerm, setSelectedAdvisedTerm] = useState(null);
  const [prerequisiteChain, setPrerequisiteChain] = useState([]); // Courses needed to unlock selected course
  const [decisionCoachOpen, setDecisionCoachOpen] = useState(false); // When true, course panel uses fixed height + scrollable body
  const [pan, setPan] = useState(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    return getInitialMapPanZoom(window.innerWidth, window.innerHeight, 2800, 2800, INITIAL_SKILL_TREE_ZOOM).pan;
  });
  const [zoom, setZoom] = useState(INITIAL_SKILL_TREE_ZOOM);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const treeContainerRef = useRef(null);
  const mapTransformElRef = useRef(null);
  const mapWaaRef = useRef(null);
  const skipDomTransformSyncRef = useRef(false);
  const nodePositionsRef = useRef({});
  const panZoomRef = useRef({ pan: { x: 0, y: 0 }, zoom: INITIAL_SKILL_TREE_ZOOM });
  panZoomRef.current = { pan, zoom };

  const stopChatZoomAnimation = useCallback(() => {
    if (mapWaaRef.current) {
      try {
        mapWaaRef.current.cancel();
      } catch (_) {
        /* ignore */
      }
      mapWaaRef.current = null;
    }
    skipDomTransformSyncRef.current = false;
    const el = mapTransformElRef.current;
    if (el) {
      const { pan: p, zoom: z } = panZoomRef.current;
      el.style.transform = `translate(${p.x}px, ${p.y}px) scale(${z})`;
    }
  }, []);

  useLayoutEffect(() => {
    const el = mapTransformElRef.current;
    if (!el || skipDomTransformSyncRef.current) return;
    el.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
  }, [pan, zoom]);

  // Non-passive wheel: React's onWheel is often passive, so preventDefault does nothing and the browser won't let us zoom the map.
  useEffect(() => {
    const el = treeContainerRef.current;
    if (!el) return undefined;

    const onWheel = (e) => {
      e.preventDefault();
      stopChatZoomAnimation();
      const { pan: p, zoom: z0 } = panZoomRef.current;
      const delta = e.deltaY > 0 ? 0.97 : 1.03;
      const z1 = Math.max(0.3, Math.min(3, z0 * delta));
      if (Math.abs(z1 - z0) < 1e-6) return;
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const ratio = z1 / z0;
      setPan({
        x: mx * (1 - ratio) + p.x * ratio,
        y: my * (1 - ratio) + p.y * ratio
      });
      setZoom(z1);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [stopChatZoomAnimation]);
  
  // Canvas dimensions - larger for full catalog
  const canvasWidth = 2800;
  const canvasHeight = 2800;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const ringSpacing = 180; // Increased significantly for better spacing
  
  // Function to pan to a specific position (instant)
  const panToPosition = useCallback((pos) => {
    stopChatZoomAnimation();
    const containerEl = mapTransformElRef.current?.parentElement ?? null;
    setPan(
      computePanToCenterViewBoxPoint(containerEl, canvasWidth, canvasHeight, pos.x, pos.y, zoom)
    );
  }, [canvasWidth, canvasHeight, zoom, stopChatZoomAnimation]);
  
  // Get courses on the selected major pathway OR chat suggested path
  const pathwayCourses = useMemo(() => {
    const courses = new Set();
    
    // Add major pathway courses
    if (selectedMajor && MAJOR_PATHWAYS[selectedMajor]) {
      MAJOR_PATHWAYS[selectedMajor].courses.forEach(id => courses.add(id));
    }
    
    // Add chat suggested path courses
    if (chatSuggestedPath && chatSuggestedPath.courses) {
      chatSuggestedPath.courses.forEach(id => courses.add(id));
    }
    
    return courses;
  }, [selectedMajor, chatSuggestedPath]);
  
  // Function to clear all highlighted paths
  const clearAllPaths = useCallback(() => {
    stopChatZoomAnimation();
    setSelectedMajor(null);
    setChatSuggestedPath(null);
    setAdvisedPlan(null);
    setSelectedAdvisedTerm(null);
  }, [stopChatZoomAnimation]);
  
  // Build reverse mapping: course -> courses it unlocks (has it as prerequisite)
  const unlocksMap = useMemo(() => {
    const map = {};
    COURSES.forEach(course => {
      map[course.id] = [];
    });
    COURSES.forEach(course => {
      course.prerequisites.forEach(prereqId => {
        if (map[prereqId]) {
          map[prereqId].push(course.id);
        }
      });
    });
    return map;
  }, []);
  
  // Get set of courses unlocked by the currently hovered course
  const unlockedByHover = useMemo(() => {
    if (!hoveredCourse) return new Set();
    return new Set(unlocksMap[hoveredCourse] || []);
  }, [hoveredCourse, unlocksMap]);
  
  // Calculate node positions with staggered radii to prevent overlap
  const nodePositions = useMemo(() => {
    const positions = {};
    
    // Count nodes per ring for staggering
    const ringCounts = {};
    const ringIndices = {};
    COURSES.forEach(course => {
      if (!ringCounts[course.ring]) {
        ringCounts[course.ring] = 0;
        ringIndices[course.ring] = 0;
      }
      ringCounts[course.ring]++;
    });
    
    // Sort courses by angle within each ring for consistent staggering
    const sortedCourses = [...COURSES].sort((a, b) => {
      if (a.ring !== b.ring) return a.ring - b.ring;
      return a.angle - b.angle;
    });
    
    sortedCourses.forEach(course => {
      // Base radius
      let radius = course.ring * ringSpacing;
      
      // Add staggered offset for inner rings (1-3) to prevent overlap
      if (course.ring > 0 && course.ring <= 3) {
        const idx = ringIndices[course.ring]++;
        // Stagger every other node inward/outward by 30px
        const staggerOffset = (idx % 2 === 0) ? 25 : -25;
        // Add additional offset for every 4th node
        const extraOffset = (idx % 4 >= 2) ? 12 : -12;
        radius += staggerOffset + extraOffset;
      } else if (course.ring === 4) {
        // Slight stagger for ring 4
        const idx = ringIndices[course.ring]++;
        const staggerOffset = (idx % 2 === 0) ? 15 : -15;
        radius += staggerOffset;
      }
      
      const pos = polarToCartesian(centerX, centerY, radius, course.angle);
      positions[course.id] = pos;
    });
    
    return positions;
  }, [centerX, centerY, ringSpacing]);

  nodePositionsRef.current = nodePositions;

  // Web Animations API on the map div — React no longer sets inline transform (layout effect does), so WAAPI is not overwritten each render.
  const focusMapOnCourseIds = useCallback(
    (courseIds) => {
      const positions = nodePositionsRef.current;
      const ids = uniqueResolvedCourseIds(courseIds, positions);
      if (!ids.length) return;

      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      ids.forEach((id) => {
        const p = positions[id];
        const course = COURSES.find((c) => c.id === id);
        const pad = (course ? getNodeSize(course) : 24) + 64;
        minX = Math.min(minX, p.x - pad);
        minY = Math.min(minY, p.y - pad);
        maxX = Math.max(maxX, p.x + pad);
        maxY = Math.max(maxY, p.y + pad);
      });

      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const bw = Math.max(maxX - minX, 140);
      const bh = Math.max(maxY - minY, 140);

      const fit = 0.62;
      let targetZoom = Math.min(
        (fit * canvasWidth) / bw,
        (fit * canvasHeight) / bh
      );
      targetZoom = clampNumber(targetZoom, 0.32, 2.85);
      const z0 = panZoomRef.current.zoom;
      targetZoom = Math.max(targetZoom, 1.05, Math.min(2.65, z0 * 1.35));

      const containerEl = mapTransformElRef.current?.parentElement ?? null;
      const targetPan = computePanToCenterViewBoxPoint(
        containerEl,
        canvasWidth,
        canvasHeight,
        cx,
        cy,
        targetZoom
      );

      stopChatZoomAnimation();

      const el = mapTransformElRef.current;
      const fromPan = { ...panZoomRef.current.pan };
      const fromZoom = panZoomRef.current.zoom;
      const fromT = `translate(${fromPan.x}px, ${fromPan.y}px) scale(${fromZoom})`;
      const toT = `translate(${targetPan.x}px, ${targetPan.y}px) scale(${targetZoom})`;

      if (el && typeof el.animate === 'function') {
        try {
          skipDomTransformSyncRef.current = true;
          el.style.transform = fromT;
          const anim = el.animate(
            [{ transform: fromT }, { transform: toT }],
            { duration: 880, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
          );
          mapWaaRef.current = anim;
          anim.onfinish = () => {
            try {
              if (typeof anim.commitStyles === 'function') anim.commitStyles();
            } catch (_) {
              /* Safari */
            }
            try {
              anim.cancel();
            } catch (_) {
              /* ignore */
            }
            mapWaaRef.current = null;
            skipDomTransformSyncRef.current = false;
            setPan({ x: targetPan.x, y: targetPan.y });
            setZoom(targetZoom);
          };
          return;
        } catch (_) {
          skipDomTransformSyncRef.current = false;
        }
      }

      setPan(targetPan);
      setZoom(targetZoom);
    },
    [canvasWidth, canvasHeight, stopChatZoomAnimation]
  );

  const handleAdvisorFocusCourse = useCallback(
    (course) => {
      if (!course || course.type === 'start') return;
      setSelectedCourse(course);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          focusMapOnCourseIds([course.id]);
        });
      });
    },
    [focusMapOnCourseIds]
  );

  const handleChatSuggestedPath = useCallback(
    (path) => {
      if (!path) {
        stopChatZoomAnimation();
        setChatSuggestedPath(null);
        setAdvisedPlan(null);
        setSelectedAdvisedTerm(null);
        return;
      }

      const positions = nodePositionsRef.current;

      if (Array.isArray(path.terms) && path.terms.length > 0) {
        const resolvedTerms = path.terms
          .map((t) => {
            const raw = t.course_ids || t.courseIds || t.courses || [];
            const courseIds = uniqueResolvedCourseIds(raw, positions);
            return { label: (t.label && String(t.label).trim()) || 'Term', courseIds };
          })
          .filter((t) => t.courseIds.length > 0);

        if (resolvedTerms.length === 0) {
          stopChatZoomAnimation();
          setAdvisedPlan(null);
          setSelectedAdvisedTerm(null);
          setChatSuggestedPath(null);
          return;
        }

        stopChatZoomAnimation();
        setChatSuggestedPath(null);
        setAdvisedPlan({
          terms: resolvedTerms,
          color: path.color ?? '#00FF88'
        });
        setSelectedAdvisedTerm(resolvedTerms[0].label);

        const allIds = [...new Set(resolvedTerms.flatMap((t) => t.courseIds))];
        requestAnimationFrame(() => {
          requestAnimationFrame(() => focusMapOnCourseIds(['START', ...allIds]));
        });
        return;
      }

      setAdvisedPlan(null);
      setSelectedAdvisedTerm(null);

      if (!Array.isArray(path.courses) || path.courses.length === 0) {
        stopChatZoomAnimation();
        setChatSuggestedPath(null);
        return;
      }
      const resolved = uniqueResolvedCourseIds(path.courses, positions);
      if (!resolved.length) {
        stopChatZoomAnimation();
        setChatSuggestedPath(null);
        return;
      }
      stopChatZoomAnimation();
      setChatSuggestedPath({
        courses: resolved,
        color: path.color ?? '#00FF88'
      });
    },
    [stopChatZoomAnimation, focusMapOnCourseIds]
  );

  useLayoutEffect(() => {
    if (!chatSuggestedPath?.courses?.length) return;
    focusMapOnCourseIds(chatSuggestedPath.courses);
  }, [chatSuggestedPath, focusMapOnCourseIds]);

  useEffect(() => {
    return () => stopChatZoomAnimation();
  }, [stopChatZoomAnimation]);
  
  // Always show all courses; catalog filter only affects which nodes get highlighted
  const visibleCourses = useMemo(() => COURSES, []);

  // Course ids that match the active Academic Catalog filter (for highlighting only, not hiding)
  const inActiveCatalogFilterIds = useMemo(() => {
    if (!activePathway) return new Set();
    const pathwayAngles = {
      computing: 0,
      engineering_ece: 70,
      engineering_mmae: 100,
      engineering_civil: 125,
      engineering_chbe: 155,
      science_bio: 180,
      science_phys: 210,
      psychology: 240,
      humanities: 272,
      design: 290,
      business: 305,
      architecture: 330
    };
    const targetAngle = pathwayAngles[activePathway] || 0;
    const ids = new Set();
    COURSES.forEach(course => {
      if (course.type === 'start') { ids.add(course.id); return; }
      if (course.college === 'core') { ids.add(course.id); return; }
      if (course.college === activePathway) { ids.add(course.id); return; }
      let angleDiff = Math.abs(course.angle - targetAngle);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;
      if (angleDiff <= 50) ids.add(course.id);
    });
    return ids;
  }, [activePathway]);

  const allAdvisedCourseIds = useMemo(() => {
    if (!advisedPlan?.terms?.length) return new Set();
    const s = new Set();
    advisedPlan.terms.forEach((t) => {
      t.courseIds.forEach((id) => s.add(id));
    });
    return s;
  }, [advisedPlan]);

  const idsInActiveAdvisingSlice = useMemo(() => {
    if (!advisedPlan?.terms?.length || !selectedAdvisedTerm) return null;
    if (selectedAdvisedTerm === ADVISING_PLAN_ALL_TERMS) return allAdvisedCourseIds;
    const t = advisedPlan.terms.find((x) => x.label === selectedAdvisedTerm);
    return t ? new Set(t.courseIds) : allAdvisedCourseIds;
  }, [advisedPlan, selectedAdvisedTerm, allAdvisedCourseIds]);

  const advisingTermHighlightActive = !!(advisedPlan && selectedAdvisedTerm && idsInActiveAdvisingSlice);

  const advisingPlanDimmed = (courseId) => {
    if (!advisingTermHighlightActive || !idsInActiveAdvisingSlice) return false;
    if (courseId === 'START') return false;
    return !idsInActiveAdvisingSlice.has(courseId);
  };

  const advisingPlanSpotlight = (courseId) => {
    if (!advisingTermHighlightActive || !idsInActiveAdvisingSlice) return false;
    if (courseId === 'START') return false;
    return idsInActiveAdvisingSlice.has(courseId);
  };
  
  // Generate connections
  const connections = useMemo(() => {
    const conns = [];
    visibleCourses.forEach(course => {
      course.prerequisites.forEach(prereqId => {
        if (prereqId === 'START') prereqId = 'START';
        const prereq = COURSES.find(c => c.id === prereqId);
        if (prereq && nodePositions[course.id] && nodePositions[prereqId]) {
          const isVisible = visibleCourses.some(c => c.id === prereqId);
          if (isVisible) {
            conns.push({
              from: prereqId,
              to: course.id,
              isActive: completedCourses.has(prereqId),
              color: getNodeColor(course)
            });
          }
        }
      });
    });
    return conns;
  }, [visibleCourses, completedCourses, nodePositions]);

  const selectedId = selectedCourse?.id;
  const unlockedBySelectedIds = useMemo(() =>
    new Set(selectedId ? (unlocksMap[selectedId] || []) : []),
    [selectedId, unlocksMap]);

  // Prerequisite ids for selected and hovered (the "previous" nodes they point to, including START)
  const prerequisiteIdsForSelectedAndHovered = useMemo(() => {
    const ids = new Set();
    if (selectedCourse?.prerequisites) {
      selectedCourse.prerequisites.forEach(id => ids.add(id));
    }
    const hoveredCourseData = hoveredCourse ? COURSES.find(c => c.id === hoveredCourse) : null;
    if (hoveredCourseData?.prerequisites) {
      hoveredCourseData.prerequisites.forEach(id => ids.add(id));
    }
    return ids;
  }, [selectedCourse, hoveredCourse]);

  // When something is selected or hovered: put irrelevant nodes at bottom, then relevant lines, then relevant nodes (selected/hovered last)
  const relevantNodeIds = useMemo(() => {
    if (!selectedId && !hoveredCourse) return new Set();
    return new Set([
      selectedId,
      hoveredCourse,
      ...prerequisiteChain,
      ...prerequisiteIdsForSelectedAndHovered,
      ...unlockedBySelectedIds,
      ...unlockedByHover
    ].filter(Boolean));
  }, [selectedId, hoveredCourse, prerequisiteChain, prerequisiteIdsForSelectedAndHovered, unlockedBySelectedIds, unlockedByHover]);

  const coursesIrrelevant = useMemo(() =>
    visibleCourses.filter(c => !relevantNodeIds.has(c.id)),
    [visibleCourses, relevantNodeIds]);
  const coursesRelevantNotTop = useMemo(() =>
    visibleCourses.filter(c => relevantNodeIds.has(c.id) && c.id !== selectedId && c.id !== hoveredCourse),
    [visibleCourses, relevantNodeIds, selectedId, hoveredCourse]);
  const selectedCourseObj = selectedId ? visibleCourses.find(c => c.id === selectedId) : null;
  const hoveredCourseObj = hoveredCourse && hoveredCourse !== selectedId ? visibleCourses.find(c => c.id === hoveredCourse) : null;
  const hasSelectionOrHover = !!(selectedId || hoveredCourse);

  // Handlers
  const toggleComplete = useCallback((courseId) => {
    setCompletedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  }, []);
  
  const handleMouseDown = (e) => {
    if (e.target.closest('.skill-node')) return;
    stopChatZoomAnimation();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  
  const handleMouseUp = () => setIsDragging(false);
  
  // Progress stats
  const totalCredits = COURSES.filter(c => c.type !== 'start').reduce((sum, c) => sum + c.credits, 0);
  const completedCredits = COURSES.filter(c => completedCourses.has(c.id) && c.type !== 'start')
    .reduce((sum, c) => sum + c.credits, 0);
  
  const pathways = [
    { id: 'computing', name: 'Computing', color: COLLEGE_COLORS.computing },
    { id: 'engineering_ece', name: 'ECE', color: COLLEGE_COLORS.engineering_ece },
    { id: 'engineering_mmae', name: 'MMAE', color: COLLEGE_COLORS.engineering_mmae },
    { id: 'engineering_civil', name: 'Civil', color: COLLEGE_COLORS.engineering_civil },
    { id: 'engineering_chbe', name: 'ChBE/BME', color: COLLEGE_COLORS.engineering_chbe },
    { id: 'science_bio', name: 'Biology', color: COLLEGE_COLORS.science_bio },
    { id: 'science_phys', name: 'Physics/Chem', color: COLLEGE_COLORS.science_phys },
    { id: 'psychology', name: 'Psychology', color: COLLEGE_COLORS.psychology },
    { id: 'humanities', name: 'Humanities', color: COLLEGE_COLORS.humanities },
    { id: 'business', name: 'Business', color: COLLEGE_COLORS.business },
    { id: 'architecture', name: 'Architecture', color: COLLEGE_COLORS.architecture },
  ];
  
  return (
    <div className="bg-white overflow-hidden font-sans fixed inset-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .tree-container {
          cursor: grab;
        }
        
        .tree-container:active {
          cursor: grabbing;
        }
      `}</style>
      
      {/* Main SVG Canvas - only this area zooms/pans; fixed behind overlays */}
      <div
        ref={treeContainerRef}
        className="tree-container fixed inset-0 z-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={mapTransformElRef}
          className="w-full h-full"
          style={{
            transformOrigin: '0 0'
          }}
        >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          data-skill-tree-map="waapi-v2"
        >
          {/* Pathway highlight connections - glowing lines for selected major; each segment uses the from-node color */}
          {selectedMajor && MAJOR_PATHWAYS[selectedMajor] && (
            <>
              {MAJOR_PATHWAYS[selectedMajor].courses.slice(0, -1).map((courseId, i) => {
                const nextCourseId = MAJOR_PATHWAYS[selectedMajor].courses[i + 1];
                const fromPos = nodePositions[courseId];
                const toPos = nodePositions[nextCourseId];
                if (!fromPos || !toPos) return null;
                const fromCourse = COURSES.find(c => c.id === courseId);
                const toCourse = COURSES.find(c => c.id === nextCourseId);
                const pathColor =
                  fromCourse?.type === 'start' && toCourse
                    ? getNodeColor(toCourse)
                    : fromCourse
                      ? getNodeColor(fromCourse)
                      : MAJOR_PATHWAYS[selectedMajor].color;
                return (
                  <g key={`path-${courseId}-${nextCourseId}`}>
                    <line x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y} stroke={pathColor} strokeWidth={12} opacity={0.15} style={{ filter: 'blur(8px)' }} />
                    <line x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y} stroke={pathColor} strokeWidth={4} opacity={0.7} />
                  </g>
                );
              })}
            </>
          )}
          
          {/* Chat-suggested path connections - each segment uses the from-node color */}
          {chatSuggestedPath && chatSuggestedPath.courses && (
            <>
              {chatSuggestedPath.courses.slice(0, -1).map((courseId, i) => {
                const nextCourseId = chatSuggestedPath.courses[i + 1];
                const fromPos = nodePositions[courseId];
                const toPos = nodePositions[nextCourseId];
                if (!fromPos || !toPos) return null;
                const fromCourse = COURSES.find(c => c.id === courseId);
                const toCourse = COURSES.find(c => c.id === nextCourseId);
                const pathColor =
                  fromCourse?.type === 'start' && toCourse
                    ? getNodeColor(toCourse)
                    : fromCourse
                      ? getNodeColor(fromCourse)
                      : (chatSuggestedPath.color || '#00FF88');
                return (
                  <line
                    key={`chat-path-${courseId}-${nextCourseId}`}
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke={pathColor}
                    strokeWidth={4}
                    opacity={0.9}
                  />
                );
              })}
            </>
          )}
          
          {/* Layer 1: Irrelevant nodes at bottom (when something selected/hovered); otherwise all nodes first */}
          {(hasSelectionOrHover ? coursesIrrelevant : visibleCourses).map(course => (
            <SkillNode
              key={course.id}
              course={course}
              position={nodePositions[course.id]}
              state={getCourseState(course, completedCourses)}
              onSelect={setSelectedCourse}
              onHover={setHoveredCourse}
              onHoverEnd={() => setHoveredCourse(null)}
              isSelected={false}
              isOnPath={pathwayCourses.has(course.id)}
              isUnlockedByHover={unlockedByHover.has(course.id)}
              isInPrereqChain={prerequisiteChain.includes(course.id)}
              isInActiveCatalogFilter={inActiveCatalogFilterIds.has(course.id)}
              planTermDimmed={advisingPlanDimmed(course.id)}
              isAdvisedTermSpotlight={advisingPlanSpotlight(course.id)}
              scale={zoom}
            />
          ))}

          {/* Layer 2: Relevant connections (above irrelevant nodes, below relevant nodes so line ends stay under nodes) */}
          {hasSelectionOrHover && connections
            .filter(conn => (selectedId && (conn.from === selectedId || conn.to === selectedId)) || (hoveredCourse && (conn.from === hoveredCourse || conn.to === hoveredCourse)))
            .map((conn, i) => {
              const fromCourse = COURSES.find(c => c.id === conn.from);
              const toCourse = COURSES.find(c => c.id === conn.to);
              return (
                <Connection
                  key={`rel-conn-${conn.from}-${conn.to}-${i}`}
                  from={nodePositions[conn.from]}
                  to={nodePositions[conn.to]}
                  isActive={conn.isActive}
                  color={conn.color}
                  fromRadius={fromCourse ? getNodeSize(fromCourse) : 24}
                  toRadius={toCourse ? getNodeSize(toCourse) : 24}
                />
              );
            })}
          {hoveredCourse && unlockedByHover.size > 0 && Array.from(unlockedByHover).map(unlockedId => {
            const fromPos = nodePositions[hoveredCourse];
            const toPos = nodePositions[unlockedId];
            if (!fromPos || !toPos) return null;
            const fromCourse = COURSES.find(c => c.id === hoveredCourse);
            const unlockedCourse = COURSES.find(c => c.id === unlockedId);
            const unlockColor = unlockedCourse ? getNodeColor(unlockedCourse) : '#00D4FF';
            const r1 = fromCourse ? getNodeSize(fromCourse) : 24;
            const r2 = unlockedCourse ? getNodeSize(unlockedCourse) : 24;
            const dx = toPos.x - fromPos.x, dy = toPos.y - fromPos.y;
            const dist = Math.hypot(dx, dy) || 1;
            const ux = dx / dist, uy = dy / dist;
            const x1 = fromPos.x + ux * r1, y1 = fromPos.y + uy * r1;
            const x2 = toPos.x - ux * r2, y2 = toPos.y - uy * r2;
            return (
              <line
                key={`rel-unlock-h-${hoveredCourse}-${unlockedId}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={unlockColor}
                strokeWidth={3}
                opacity={0.9}
              />
            );
          })}
          {selectedId && unlockedBySelectedIds.size > 0 && Array.from(unlockedBySelectedIds).map(unlockedId => {
            const fromPos = nodePositions[selectedId];
            const toPos = nodePositions[unlockedId];
            if (!fromPos || !toPos) return null;
            const fromCourse = COURSES.find(c => c.id === selectedId);
            const unlockedCourse = COURSES.find(c => c.id === unlockedId);
            const unlockColor = unlockedCourse ? getNodeColor(unlockedCourse) : '#00D4FF';
            const r1 = fromCourse ? getNodeSize(fromCourse) : 24;
            const r2 = unlockedCourse ? getNodeSize(unlockedCourse) : 24;
            const dx = toPos.x - fromPos.x, dy = toPos.y - fromPos.y;
            const dist = Math.hypot(dx, dy) || 1;
            const ux = dx / dist, uy = dy / dist;
            const x1 = fromPos.x + ux * r1, y1 = fromPos.y + uy * r1;
            const x2 = toPos.x - ux * r2, y2 = toPos.y - uy * r2;
            return (
              <line
                key={`rel-unlock-s-${selectedId}-${unlockedId}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={unlockColor}
                strokeWidth={3}
                opacity={0.9}
              />
            );
          })}

          {/* Layer 3: Relevant nodes (not selected/hovered) - so line ends are under these nodes */}
          {coursesRelevantNotTop.map(course => (
            <SkillNode
              key={course.id}
              course={course}
              position={nodePositions[course.id]}
              state={getCourseState(course, completedCourses)}
              onSelect={setSelectedCourse}
              onHover={setHoveredCourse}
              onHoverEnd={() => setHoveredCourse(null)}
              isSelected={false}
              isOnPath={pathwayCourses.has(course.id)}
              isUnlockedByHover={unlockedByHover.has(course.id)}
              isInPrereqChain={prerequisiteChain.includes(course.id)}
              isInActiveCatalogFilter={inActiveCatalogFilterIds.has(course.id)}
              planTermDimmed={advisingPlanDimmed(course.id)}
              isAdvisedTermSpotlight={advisingPlanSpotlight(course.id)}
              scale={zoom}
            />
          ))}

          {/* Layer 4: Selected node */}
          {selectedCourseObj && (
            <SkillNode
              key={selectedCourseObj.id}
              course={selectedCourseObj}
              position={nodePositions[selectedCourseObj.id]}
              state={getCourseState(selectedCourseObj, completedCourses)}
              onSelect={setSelectedCourse}
              onHover={setHoveredCourse}
              onHoverEnd={() => setHoveredCourse(null)}
              isSelected={true}
              isOnPath={pathwayCourses.has(selectedCourseObj.id)}
              isUnlockedByHover={unlockedByHover.has(selectedCourseObj.id)}
              isInPrereqChain={prerequisiteChain.includes(selectedCourseObj.id)}
              isInActiveCatalogFilter={inActiveCatalogFilterIds.has(selectedCourseObj.id)}
              planTermDimmed={advisingPlanDimmed(selectedCourseObj.id)}
              isAdvisedTermSpotlight={advisingPlanSpotlight(selectedCourseObj.id)}
              scale={zoom}
            />
          )}

          {/* Layer 5: Hovered node on top */}
          {hoveredCourseObj && (
            <SkillNode
              key={`hovered-${hoveredCourseObj.id}`}
              course={hoveredCourseObj}
              position={nodePositions[hoveredCourseObj.id]}
              state={getCourseState(hoveredCourseObj, completedCourses)}
              onSelect={setSelectedCourse}
              onHover={setHoveredCourse}
              onHoverEnd={() => setHoveredCourse(null)}
              isSelected={false}
              isOnPath={pathwayCourses.has(hoveredCourseObj.id)}
              isUnlockedByHover={unlockedByHover.has(hoveredCourseObj.id)}
              isInPrereqChain={prerequisiteChain.includes(hoveredCourseObj.id)}
              isInActiveCatalogFilter={inActiveCatalogFilterIds.has(hoveredCourseObj.id)}
              isHoveredByParent={true}
              planTermDimmed={advisingPlanDimmed(hoveredCourseObj.id)}
              isAdvisedTermSpotlight={advisingPlanSpotlight(hoveredCourseObj.id)}
              scale={zoom}
            />
          )}

          {/* Layer 6: Labels for selected/hovered on topmost layer so lines/nodes never cover them */}
          {selectedCourseObj && (() => {
            const pos = nodePositions[selectedCourseObj.id];
            if (!pos) return null;
            const size = getNodeSize(selectedCourseObj);
            const color = getNodeColor(selectedCourseObj);
            const titleLines = wrapTitleLines(selectedCourseObj.title);
            return (
              <g key="label-selected" transform={`translate(${pos.x}, ${pos.y}) scale(1.15)`} style={{ pointerEvents: 'none' }}>
                <text x={0} y={size + 18} textAnchor="middle" fill="#1e293b" fontSize={12} fontWeight="bold">
                  {selectedCourseObj.code}
                </text>
                <text x={0} y={size + 32} textAnchor="middle" fill={color} fontSize={9} fontWeight="500">
                  {titleLines.map((line, i) => (
                    <tspan key={i} x={0} dy={i === 0 ? 0 : 11}>{line}</tspan>
                  ))}
                </text>
              </g>
            );
          })()}
          {hoveredCourseObj && (() => {
            const pos = nodePositions[hoveredCourseObj.id];
            if (!pos) return null;
            const size = getNodeSize(hoveredCourseObj);
            const color = getNodeColor(hoveredCourseObj);
            const titleLines = wrapTitleLines(hoveredCourseObj.title);
            return (
              <g key="label-hovered" transform={`translate(${pos.x}, ${pos.y}) scale(1.15)`} style={{ pointerEvents: 'none' }}>
                <text x={0} y={size + 18} textAnchor="middle" fill="#0f172a" fontSize={11} fontWeight="bold">
                  {hoveredCourseObj.code}
                </text>
                <text x={0} y={size + 32} textAnchor="middle" fill={color} fontSize={9} fontWeight="500">
                  {titleLines.map((line, i) => (
                    <tspan key={i} x={0} dy={i === 0 ? 0 : 11}>{line}</tspan>
                  ))}
                </text>
              </g>
            );
          })()}
        </svg>
        </div>
      </div>
      
      {/* Fixed overlays - not affected by zoom/pan */}
      {/* Left sidebar */}
      <div className="fixed left-8 top-8 flex flex-col z-50" style={{ width: 220, gap: 32 }} data-left-sidebar="dropdowns-only">
        <div style={{ marginBottom: 28 }}>
          <h1 className="text-black font-normal leading-tight whitespace-nowrap" style={{ fontSize: 36, letterSpacing: '-0.72px', fontFamily: '"Nuosu SIL", serif' }}>
            Illinois Tech Skill Tree
          </h1>
        </div>
        
        {/* Academic Catalog */}
        <SidebarSelect
          title="Academic Catalog – open to filter by college"
          ariaLabel="Academic Catalog – select to filter by college"
          value={activePathway || ''}
          onChange={(v) => setActivePathway(v || null)}
          placeholder="Academic Catalog"
          clearOption={{ value: '', label: 'Academic Catalog' }}
          groups={[
            {
              heading: 'Filter by college',
              options: pathways.map((p) => ({ value: p.id, label: p.name }))
            }
          ]}
        />

        {/* Suggested Pathways */}
        <SidebarSelect
          ariaLabel="Suggested pathways — select a major track"
          value={selectedMajor || ''}
          onChange={(v) => setSelectedMajor(v || null)}
          placeholder="Suggested Pathways"
          clearOption={{ value: '', label: 'Suggested Pathways' }}
          groups={[
            {
              heading: 'Computing',
              options: [
                { value: 'cs', label: 'Computer Science' },
                { value: 'ai', label: 'Artificial Intelligence' },
                { value: 'ds', label: 'Data Science' }
              ]
            },
            {
              heading: 'Engineering',
              options: [
                { value: 'ee', label: 'Electrical Engineering' },
                { value: 'cpe', label: 'Computer Engineering' },
                { value: 'me', label: 'Mechanical Engineering' },
                { value: 'ae', label: 'Aerospace Engineering' },
                { value: 'ce', label: 'Civil Engineering' },
                { value: 'che', label: 'Chemical Engineering' },
                { value: 'bme', label: 'Biomedical Engineering' }
              ]
            },
            {
              heading: 'Science',
              options: [
                { value: 'bio', label: 'Biology' },
                { value: 'chem', label: 'Chemistry' },
                { value: 'phys', label: 'Physics' }
              ]
            },
            {
              heading: 'Other',
              options: [
                { value: 'psych', label: 'Psychological Science' },
                { value: 'gem', label: 'Game Design' },
                { value: 'arch', label: 'Architecture' },
                { value: 'fin', label: 'Finance' }
              ]
            }
          ]}
        />

        {advisedPlan && advisedPlan.terms.length > 0 && (
          <SidebarSelect
            title="Advisor plan — highlight courses for this term on the map"
            ariaLabel="Advisor plan — highlight courses for this term on the map"
            value={selectedAdvisedTerm ?? advisedPlan.terms[0].label}
            onChange={(v) => setSelectedAdvisedTerm(v)}
            placeholder={advisedPlan.terms[0].label}
            options={[
              { value: ADVISING_PLAN_ALL_TERMS, label: 'All planned courses' },
              ...advisedPlan.terms.map((t) => ({ value: t.label, label: t.label }))
            ]}
          />
        )}
        
        {/* Courses search - CourseSearch renders here */}
        <div className="relative w-full">
          <CourseSearch
            courses={COURSES}
            onSelectCourse={setSelectedCourse}
            nodePositions={nodePositions}
            onPanTo={panToPosition}
            variant="pill"
          />
        </div>
      </div>
      
      {/* Course Detail Panel */}
      <CoursePanel
        course={selectedCourse}
        completedCourses={completedCourses}
        onToggleComplete={toggleComplete}
        onClose={() => setSelectedCourse(null)}
        decisionCoachOpen={decisionCoachOpen}
      />
      
      {/* Progress Dashboard */}
      <ProgressDashboard
        completedCourses={completedCourses}
        courses={COURSES}
        selectedMajor={selectedMajor}
        pathways={MAJOR_PATHWAYS}
      />
      
      {/* Keyboard Shortcuts Help */}
      
      {/* AI Course Advisor Chatbot */}
      {USE_DECISION_COACH ? (
        <DecisionCoachAdapter
          completedCourses={completedCourses}
          selectedMajor={selectedMajor}
          selectedCourse={selectedCourse}
          courses={COURSES}
          pathways={MAJOR_PATHWAYS}
          careerOutcomes={CAREER_OUTCOMES}
          onSuggestPath={handleChatSuggestedPath}
          onClearPaths={clearAllPaths}
          onOpenChange={setDecisionCoachOpen}
          onFocusCourse={handleAdvisorFocusCourse}
        />
      ) : (
        <CourseAdvisorChat
          completedCourses={completedCourses}
          selectedMajor={selectedMajor}
          selectedCourse={selectedCourse}
          courses={COURSES}
          pathways={MAJOR_PATHWAYS}
          careerOutcomes={CAREER_OUTCOMES}
          onSuggestPath={handleChatSuggestedPath}
          onClearPaths={clearAllPaths}
        />
      )}
    </div>
  );
};

export default IllinoisTechSkillTree;
