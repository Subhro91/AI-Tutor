export interface Resource {
  title: string;
  type: 'article' | 'video' | 'interactive' | 'practice' | 'quiz';
  url?: string;
  description: string;
  durationMinutes?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface SubTopic {
  id: string;
  title: string;
  description: string;
  resources: Resource[];
  keyPoints: string[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  subtopics: SubTopic[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisiteTopicIds?: string[];
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color: string;
  topics: Topic[];
}

export const subjects: Subject[] = [
  {
    id: 'math',
    name: 'Mathematics',
    description: 'Explore the world of numbers, patterns, and quantitative reasoning',
    color: '#4C51BF', // Indigo
    topics: [
      {
        id: 'math-basics',
        title: 'Basic Arithmetic',
        description: 'Fundamentals of mathematics including operations and number sense',
        difficulty: 'beginner',
        subtopics: [
          {
            id: 'math-basics-operations',
            title: 'Basic Operations',
            description: 'Addition, subtraction, multiplication, and division',
            keyPoints: [
              'Understanding place value',
              'Mental math strategies',
              'Order of operations (PEMDAS)',
              'Estimation techniques'
            ],
            resources: [
              {
                title: 'Basic Math Operations Tutorial',
                type: 'video',
                description: 'Visual guide to understanding basic math operations',
                difficulty: 'beginner',
                durationMinutes: 15
              },
              {
                title: 'Operations Practice Worksheet',
                type: 'practice',
                description: 'Practice problems with solutions for basic operations',
                difficulty: 'beginner',
                durationMinutes: 20
              }
            ]
          },
          {
            id: 'math-basics-fractions',
            title: 'Fractions and Decimals',
            description: 'Understanding and working with fractions and decimal numbers',
            keyPoints: [
              'Converting between fractions and decimals',
              'Operations with fractions',
              'Comparing fractions and decimals',
              'Applications in real-life'
            ],
            resources: [
              {
                title: 'Fractions Explained Simply',
                type: 'article',
                description: 'Clear explanations with visual aids for understanding fractions',
                difficulty: 'beginner',
                durationMinutes: 10
              },
              {
                title: 'Decimal Places Quiz',
                type: 'quiz',
                description: 'Test your understanding of decimal places and values',
                difficulty: 'beginner',
                durationMinutes: 15
              }
            ]
          }
        ]
      },
      {
        id: 'math-algebra',
        title: 'Algebra',
        description: 'Using symbols and letters to represent numbers and relationships',
        difficulty: 'intermediate',
        prerequisiteTopicIds: ['math-basics'],
        subtopics: [
          {
            id: 'math-algebra-equations',
            title: 'Linear Equations',
            description: 'Solving equations with one variable',
            keyPoints: [
              'Isolating variables',
              'Graphing linear equations',
              'Systems of equations',
              'Word problems and applications'
            ],
            resources: [
              {
                title: 'Solving Linear Equations',
                type: 'video',
                description: 'Step-by-step guide to solving linear equations',
                difficulty: 'intermediate',
                durationMinutes: 20
              },
              {
                title: 'Linear Equation Interactive Explorer',
                type: 'interactive',
                description: 'Manipulate linear equations and see results in real-time',
                difficulty: 'intermediate',
                durationMinutes: 25
              }
            ]
          },
          {
            id: 'math-algebra-expressions',
            title: 'Algebraic Expressions',
            description: 'Working with variables, terms, and operations',
            keyPoints: [
              'Simplifying expressions',
              'Combining like terms',
              'Distributive property',
              'Factoring expressions'
            ],
            resources: [
              {
                title: 'Algebraic Expressions Demystified',
                type: 'article',
                description: 'Clear explanation of algebraic expressions and operations',
                difficulty: 'intermediate',
                durationMinutes: 15
              },
              {
                title: 'Expression Simplification Practice',
                type: 'practice',
                description: 'Practice problems for simplifying algebraic expressions',
                difficulty: 'intermediate',
                durationMinutes: 20
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Discover how our world works through observation and experimentation',
    color: '#38A169', // Green
    topics: [
      {
        id: 'science-physics',
        title: 'Physics: Mechanics',
        description: 'Study of motion, forces, energy, and matter',
        difficulty: 'intermediate',
        subtopics: [
          {
            id: 'science-physics-motion',
            title: 'Motion and Forces',
            description: 'Understanding how objects move and the forces that affect them',
            keyPoints: [
              'Newton\'s laws of motion',
              'Velocity and acceleration',
              'Force diagrams',
              'Gravity and friction'
            ],
            resources: [
              {
                title: 'Physics in Motion',
                type: 'video',
                description: 'Visual demonstrations of motion concepts with examples',
                difficulty: 'intermediate',
                durationMinutes: 25
              },
              {
                title: 'Forces and Motion Simulation',
                type: 'interactive',
                description: 'Interactive simulation to explore forces and motion',
                difficulty: 'intermediate',
                durationMinutes: 30
              }
            ]
          },
          {
            id: 'science-physics-energy',
            title: 'Energy and Work',
            description: 'Understanding energy, its forms, and transformations',
            keyPoints: [
              'Potential and kinetic energy',
              'Conservation of energy',
              'Work and power',
              'Simple machines'
            ],
            resources: [
              {
                title: 'Energy Transformations',
                type: 'article',
                description: 'Comprehensive article on energy types and transformations',
                difficulty: 'intermediate',
                durationMinutes: 20
              },
              {
                title: 'Energy Concepts Quiz',
                type: 'quiz',
                description: 'Test your understanding of energy principles',
                difficulty: 'intermediate',
                durationMinutes: 15
              }
            ]
          }
        ]
      },
      {
        id: 'science-chemistry',
        title: 'Chemistry: Elements',
        description: 'Study of matter, its properties, and transformations',
        difficulty: 'intermediate',
        subtopics: [
          {
            id: 'science-chemistry-periodic',
            title: 'Periodic Table',
            description: 'Understanding elements and their organization',
            keyPoints: [
              'Element properties',
              'Periodic trends',
              'Electron configuration',
              'Groups and periods'
            ],
            resources: [
              {
                title: 'Interactive Periodic Table',
                type: 'interactive',
                description: 'Explore the periodic table with detailed element information',
                difficulty: 'intermediate',
                durationMinutes: 25
              },
              {
                title: 'Periodic Trends Explained',
                type: 'article',
                description: 'Detailed explanation of periodic trends with examples',
                difficulty: 'intermediate',
                durationMinutes: 20
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'english',
    name: 'English',
    description: 'Develop language skills through reading, writing, and analysis',
    color: '#DD6B20', // Orange
    topics: [
      {
        id: 'english-grammar',
        title: 'Grammar',
        description: 'Rules that govern the structure of language',
        difficulty: 'beginner',
        subtopics: [
          {
            id: 'english-grammar-parts',
            title: 'Parts of Speech',
            description: 'Understanding the different components of language',
            keyPoints: [
              'Nouns, verbs, adjectives, adverbs',
              'Prepositions and conjunctions',
              'Pronouns and articles',
              'Identifying parts of speech in sentences'
            ],
            resources: [
              {
                title: 'Parts of Speech Guide',
                type: 'article',
                description: 'Comprehensive guide to parts of speech with examples',
                difficulty: 'beginner',
                durationMinutes: 15
              },
              {
                title: 'Parts of Speech Practice',
                type: 'practice',
                description: 'Exercises to identify parts of speech in context',
                difficulty: 'beginner',
                durationMinutes: 20
              }
            ]
          },
          {
            id: 'english-grammar-sentences',
            title: 'Sentence Structure',
            description: 'Building effective and grammatically correct sentences',
            keyPoints: [
              'Subject-verb agreement',
              'Simple, compound, and complex sentences',
              'Punctuation rules',
              'Common sentence errors'
            ],
            resources: [
              {
                title: 'Sentence Structure Explained',
                type: 'video',
                description: 'Visual guide to creating strong sentences',
                difficulty: 'beginner',
                durationMinutes: 18
              },
              {
                title: 'Sentence Structure Quiz',
                type: 'quiz',
                description: 'Test your understanding of sentence construction',
                difficulty: 'beginner',
                durationMinutes: 15
              }
            ]
          }
        ]
      },
      {
        id: 'english-writing',
        title: 'Writing Essays',
        description: 'Crafting effective essays and arguments',
        difficulty: 'intermediate',
        prerequisiteTopicIds: ['english-grammar'],
        subtopics: [
          {
            id: 'english-writing-structure',
            title: 'Essay Structure',
            description: 'Organization and components of effective essays',
            keyPoints: [
              'Introduction, body, and conclusion',
              'Thesis statements',
              'Topic sentences and transitions',
              'Supporting evidence and examples'
            ],
            resources: [
              {
                title: 'Essay Structure Blueprint',
                type: 'article',
                description: 'Complete guide to structuring effective essays',
                difficulty: 'intermediate',
                durationMinutes: 20
              },
              {
                title: 'Essay Planning Workshop',
                type: 'interactive',
                description: 'Interactive tool to plan and structure your essay',
                difficulty: 'intermediate',
                durationMinutes: 30
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'history',
    name: 'History',
    description: 'Explore the past to understand the present and shape the future',
    color: '#9F7AEA', // Purple
    topics: [
      {
        id: 'history-ancient',
        title: 'Ancient Civilizations',
        description: 'Early human societies and their contributions',
        difficulty: 'beginner',
        subtopics: [
          {
            id: 'history-ancient-mesopotamia',
            title: 'Mesopotamia',
            description: 'The cradle of civilization between the Tigris and Euphrates rivers',
            keyPoints: [
              'Development of writing (cuneiform)',
              'Early cities and governance',
              'Sumerian, Akkadian, and Babylonian cultures',
              'Code of Hammurabi'
            ],
            resources: [
              {
                title: 'Mesopotamia Overview',
                type: 'video',
                description: 'Visual journey through Mesopotamian civilization',
                difficulty: 'beginner',
                durationMinutes: 22
              },
              {
                title: 'Mesopotamian Artifacts Interactive',
                type: 'interactive',
                description: 'Explore important artifacts and their significance',
                difficulty: 'beginner',
                durationMinutes: 25
              }
            ]
          },
          {
            id: 'history-ancient-egypt',
            title: 'Ancient Egypt',
            description: 'Civilization along the Nile River',
            keyPoints: [
              'Pharaohs and social structure',
              'Pyramids and monuments',
              'Religious beliefs and practices',
              'Daily life in ancient Egypt'
            ],
            resources: [
              {
                title: 'Egypt: Life Along the Nile',
                type: 'article',
                description: 'Comprehensive overview of Egyptian civilization',
                difficulty: 'beginner',
                durationMinutes: 18
              },
              {
                title: 'Egyptian Chronology Quiz',
                type: 'quiz',
                description: 'Test your knowledge of Egyptian timelines and events',
                difficulty: 'beginner',
                durationMinutes: 15
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'programming',
    name: 'Programming',
    description: 'Learn to code and create software solutions',
    color: '#3182CE', // Blue
    topics: [
      {
        id: 'programming-basics',
        title: 'Programming Basics',
        description: 'Fundamental concepts of coding and computer science',
        difficulty: 'beginner',
        subtopics: [
          {
            id: 'programming-basics-concepts',
            title: 'Core Concepts',
            description: 'Essential programming principles and terminologies',
            keyPoints: [
              'Variables and data types',
              'Control flow (if statements, loops)',
              'Functions and methods',
              'Basic algorithms'
            ],
            resources: [
              {
                title: 'Programming Fundamentals',
                type: 'video',
                description: 'Introduction to core programming concepts',
                difficulty: 'beginner',
                durationMinutes: 25
              },
              {
                title: 'Coding Basics Practice',
                type: 'practice',
                description: 'Hands-on practice with basic programming concepts',
                difficulty: 'beginner',
                durationMinutes: 30
              }
            ]
          },
          {
            id: 'programming-basics-languages',
            title: 'Introduction to Languages',
            description: 'Overview of common programming languages and their uses',
            keyPoints: [
              'JavaScript and web development',
              'Python for versatility and data science',
              'Java and object-oriented programming',
              'Choosing the right language for your goals'
            ],
            resources: [
              {
                title: 'Programming Language Comparison',
                type: 'article',
                description: 'Detailed comparison of popular programming languages',
                difficulty: 'beginner',
                durationMinutes: 20
              },
              {
                title: 'Language Selection Interactive Guide',
                type: 'interactive',
                description: 'Interactive tool to help choose your first language',
                difficulty: 'beginner',
                durationMinutes: 15
              }
            ]
          }
        ]
      },
      {
        id: 'programming-web',
        title: 'Web Development',
        description: 'Creating websites and web applications',
        difficulty: 'intermediate',
        prerequisiteTopicIds: ['programming-basics'],
        subtopics: [
          {
            id: 'programming-web-html-css',
            title: 'HTML and CSS Fundamentals',
            description: 'Building blocks of web pages',
            keyPoints: [
              'HTML document structure',
              'CSS styling and selectors',
              'Responsive design principles',
              'Forms and user input'
            ],
            resources: [
              {
                title: 'HTML & CSS Bootcamp',
                type: 'video',
                description: 'Comprehensive introduction to HTML and CSS',
                difficulty: 'intermediate',
                durationMinutes: 35
              },
              {
                title: 'Web Page Builder',
                type: 'interactive',
                description: 'Interactive tool to practice HTML/CSS concepts',
                difficulty: 'intermediate',
                durationMinutes: 30
              }
            ]
          }
        ]
      }
    ]
  }
]; 