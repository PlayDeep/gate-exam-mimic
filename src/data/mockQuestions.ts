
export const mockQuestions = {
  CS: [
    {
      id: 1,
      type: 'MCQ',
      subject: 'Data Structures',
      question: 'What is the time complexity of searching an element in a balanced binary search tree?',
      options: [
        { id: 'A', text: 'O(n)' },
        { id: 'B', text: 'O(log n)' },
        { id: 'C', text: 'O(n log n)' },
        { id: 'D', text: 'O(1)' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'In a balanced BST, the height is O(log n), so search takes O(log n) time.'
    },
    {
      id: 2,
      type: 'MCQ',
      subject: 'Algorithms',
      question: 'Which sorting algorithm has the best average-case time complexity?',
      options: [
        { id: 'A', text: 'Bubble Sort' },
        { id: 'B', text: 'Quick Sort' },
        { id: 'C', text: 'Merge Sort' },
        { id: 'D', text: 'Selection Sort' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Merge Sort has O(n log n) time complexity in all cases.'
    },
    {
      id: 3,
      type: 'NAT',
      subject: 'Computer Networks',
      question: 'In a subnet with mask 255.255.255.240, how many host addresses are available?',
      correctAnswer: '14',
      marks: 2,
      explanation: 'With /28 subnet (255.255.255.240), there are 4 host bits = 16 addresses - 2 (network & broadcast) = 14 hosts.'
    },
    {
      id: 4,
      type: 'MCQ',
      subject: 'Operating Systems',
      question: 'Which page replacement algorithm suffers from Belady\'s anomaly?',
      options: [
        { id: 'A', text: 'LRU (Least Recently Used)' },
        { id: 'B', text: 'FIFO (First In First Out)' },
        { id: 'C', text: 'LFU (Least Frequently Used)' },
        { id: 'D', text: 'Optimal' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'FIFO can have more page faults with more frames, which is Belady\'s anomaly.'
    },
    {
      id: 5,
      type: 'MCQ',
      subject: 'Database Systems',
      question: 'Which normal form eliminates transitive dependencies?',
      options: [
        { id: 'A', text: '1NF' },
        { id: 'B', text: '2NF' },
        { id: 'C', text: '3NF' },
        { id: 'D', text: 'BCNF' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: '3NF eliminates transitive dependencies where non-key attributes depend on other non-key attributes.'
    }
  ],
  ME: [
    {
      id: 1,
      type: 'MCQ',
      subject: 'Thermodynamics',
      question: 'For an ideal gas undergoing an adiabatic process, which relation is correct?',
      options: [
        { id: 'A', text: 'PV = constant' },
        { id: 'B', text: 'PV^γ = constant' },
        { id: 'C', text: 'P/V = constant' },
        { id: 'D', text: 'P^γV = constant' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'For adiabatic process, PV^γ = constant where γ is the ratio of specific heats.'
    },
    {
      id: 2,
      type: 'NAT',
      subject: 'Fluid Mechanics',
      question: 'Water flows through a pipe of diameter 0.1 m at a velocity of 2 m/s. What is the Reynolds number? (Take kinematic viscosity = 1×10^-6 m²/s)',
      correctAnswer: '200000',
      marks: 2,
      explanation: 'Re = VD/ν = (2 × 0.1)/(1×10^-6) = 200,000'
    },
    {
      id: 3,
      type: 'MCQ',
      subject: 'Strength of Materials',
      question: 'The maximum shear stress in a circular shaft under torsion occurs at:',
      options: [
        { id: 'A', text: 'Center of the shaft' },
        { id: 'B', text: 'Outer surface of the shaft' },
        { id: 'C', text: 'At radius R/2' },
        { id: 'D', text: 'At radius R/√2' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Shear stress in torsion varies linearly from center (zero) to maximum at outer surface.'
    },
    {
      id: 4,
      type: 'MCQ',
      subject: 'Heat Transfer',
      question: 'Which mode of heat transfer does not require a medium?',
      options: [
        { id: 'A', text: 'Conduction' },
        { id: 'B', text: 'Convection' },
        { id: 'C', text: 'Radiation' },
        { id: 'D', text: 'All require medium' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Radiation can occur through vacuum and does not require any medium.'
    },
    {
      id: 5,
      type: 'NAT',
      subject: 'Machine Design',
      question: 'A bolt is subjected to a tensile load of 10 kN. If the yield strength is 300 MPa and factor of safety is 2, what is the minimum bolt diameter required (in mm)?',
      correctAnswer: '8.2',
      marks: 2,
      explanation: 'Allowable stress = 300/2 = 150 MPa. Area = 10000/150 = 66.67 mm². Diameter = √(4×66.67/π) = 8.2 mm'
    }
  ],
  EE: [
    {
      id: 1,
      type: 'MCQ',
      subject: 'Circuit Theory',
      question: 'In an RLC series circuit, resonance occurs when:',
      options: [
        { id: 'A', text: 'XL = XC' },
        { id: 'B', text: 'XL > XC' },
        { id: 'C', text: 'XL < XC' },
        { id: 'D', text: 'R = XL = XC' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'At resonance, inductive reactance equals capacitive reactance (XL = XC).'
    },
    {
      id: 2,
      type: 'NAT',
      subject: 'Power Systems',
      question: 'A transmission line has a resistance of 0.5 Ω/km and inductance of 1 mH/km. For a 100 km line, what is the total impedance magnitude at 50 Hz? (in Ω)',
      correctAnswer: '81.4',
      marks: 2,
      explanation: 'R = 50Ω, XL = 2πfL = 2π×50×0.1 = 31.4Ω. Z = √(50² + 31.4²) = 59.2Ω'
    },
    {
      id: 3,
      type: 'MCQ',
      subject: 'Control Systems',
      question: 'For a system to be stable, all poles of the closed-loop transfer function must lie:',
      options: [
        { id: 'A', text: 'On the right half of s-plane' },
        { id: 'B', text: 'On the left half of s-plane' },
        { id: 'C', text: 'On the imaginary axis' },
        { id: 'D', text: 'At the origin' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'For stability, all poles must have negative real parts (left half s-plane).'
    },
    {
      id: 4,
      type: 'MCQ',
      subject: 'Electrical Machines',
      question: 'In a DC motor, back EMF is directly proportional to:',
      options: [
        { id: 'A', text: 'Armature current' },
        { id: 'B', text: 'Field flux' },
        { id: 'C', text: 'Speed' },
        { id: 'D', text: 'Both flux and speed' }
      ],
      correctAnswer: 'D',
      marks: 1,
      explanation: 'Back EMF = kΦN, where k is constant, Φ is flux, and N is speed.'
    },
    {
      id: 5,
      type: 'NAT',
      subject: 'Electronics',
      question: 'An op-amp has an open-loop gain of 100,000 and is used in an inverting amplifier with Rf = 100kΩ and Ri = 10kΩ. What is the closed-loop gain?',
      correctAnswer: '-10',
      marks: 2,
      explanation: 'For inverting amplifier, closed-loop gain = -Rf/Ri = -100k/10k = -10'
    }
  ],
  CE: [
    {
      id: 1,
      type: 'MCQ',
      subject: 'Structural Analysis',
      question: 'For a simply supported beam with point load at center, the maximum bending moment occurs at:',
      options: [
        { id: 'A', text: 'Supports' },
        { id: 'B', text: 'Quarter span' },
        { id: 'C', text: 'Mid span' },
        { id: 'D', text: 'Three-quarter span' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'For point load at center of simply supported beam, maximum moment occurs at mid-span.'
    },
    {
      id: 2,
      type: 'NAT',
      subject: 'Concrete Technology',
      question: 'A concrete mix has cement = 400 kg/m³, water = 200 kg/m³. What is the water-cement ratio?',
      correctAnswer: '0.5',
      marks: 2,
      explanation: 'Water-cement ratio = Water/Cement = 200/400 = 0.5'
    },
    {
      id: 3,
      type: 'MCQ',
      subject: 'Geotechnical Engineering',
      question: 'Terzaghi\'s equation for bearing capacity is applicable for:',
      options: [
        { id: 'A', text: 'Strip footing' },
        { id: 'B', text: 'Square footing' },
        { id: 'C', text: 'Circular footing' },
        { id: 'D', text: 'All types of footings' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Terzaghi\'s original equation was derived for strip footings.'
    },
    {
      id: 4,
      type: 'MCQ',
      subject: 'Hydraulics',
      question: 'Manning\'s formula is used to calculate:',
      options: [
        { id: 'A', text: 'Velocity in pipes' },
        { id: 'B', text: 'Velocity in open channels' },
        { id: 'C', text: 'Pressure in pipes' },
        { id: 'D', text: 'Head loss in pipes' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Manning\'s formula: V = (1/n)R^(2/3)S^(1/2) is used for open channel flow.'
    },
    {
      id: 5,
      type: 'NAT',
      subject: 'Transportation Engineering',
      question: 'A road has a design speed of 80 kmph. If the coefficient of friction is 0.35, what is the minimum stopping sight distance (in m)?',
      correctAnswer: '71',
      marks: 2,
      explanation: 'SSD = V²/(2gf) = (80/3.6)²/(2×9.81×0.35) = 71.3 m ≈ 71 m'
    }
  ],
  ECE: [
    {
      id: 1,
      type: 'MCQ',
      subject: 'Signals and Systems',
      question: 'The Fourier transform of a unit step function is:',
      options: [
        { id: 'A', text: '1/jω' },
        { id: 'B', text: 'π δ(ω) + 1/jω' },
        { id: 'C', text: 'δ(ω)' },
        { id: 'D', text: '1/(1+jω)' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'FT of unit step = π δ(ω) + 1/jω, where δ(ω) is impulse and 1/jω is from the integral.'
    },
    {
      id: 2,
      type: 'NAT',
      subject: 'Digital Communications',
      question: 'A binary signal is transmitted at 1 Mbps. If each symbol represents 2 bits, what is the symbol rate (in symbols/sec)?',
      correctAnswer: '500000',
      marks: 2,
      explanation: 'Symbol rate = Bit rate / bits per symbol = 1,000,000 / 2 = 500,000 symbols/sec'
    },
    {
      id: 3,
      type: 'MCQ',
      subject: 'Analog Electronics',
      question: 'In a common emitter amplifier, the phase relationship between input and output is:',
      options: [
        { id: 'A', text: '0°' },
        { id: 'B', text: '90°' },
        { id: 'C', text: '180°' },
        { id: 'D', text: '270°' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'Common emitter amplifier provides 180° phase shift between input and output.'
    },
    {
      id: 4,
      type: 'MCQ',
      subject: 'Electromagnetic Theory',
      question: 'Maxwell\'s equation ∇ × E = -∂B/∂t represents:',
      options: [
        { id: 'A', text: 'Gauss law for electricity' },
        { id: 'B', text: 'Gauss law for magnetism' },
        { id: 'C', text: 'Faraday\'s law' },
        { id: 'D', text: 'Ampere\'s law' }
      ],
      correctAnswer: 'C',
      marks: 1,
      explanation: 'This equation represents Faraday\'s law of electromagnetic induction.'
    },
    {
      id: 5,
      type: 'NAT',
      subject: 'Digital Electronics',
      question: 'How many NAND gates are required to implement a 3-input AND gate?',
      correctAnswer: '4',
      marks: 2,
      explanation: 'Need 3 NAND gates for inputs (A NAND A = A\', B NAND B = B\', C NAND C = C\') and 1 NAND gate for final output.'
    }
  ],
  CH: [
    {
      id: 1,
      type: 'MCQ',
      subject: 'Chemical Reaction Engineering',
      question: 'For a first-order reaction, the half-life is:',
      options: [
        { id: 'A', text: 'Proportional to initial concentration' },
        { id: 'B', text: 'Independent of initial concentration' },
        { id: 'C', text: 'Inversely proportional to initial concentration' },
        { id: 'D', text: 'Proportional to square of initial concentration' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'For first-order reaction, t₁/₂ = ln(2)/k, which is independent of initial concentration.'
    },
    {
      id: 2,
      type: 'NAT',
      subject: 'Mass Transfer',
      question: 'A gas mixture contains 20% CO₂ by volume at 1 atm. What is the partial pressure of CO₂ (in atm)?',
      correctAnswer: '0.2',
      marks: 2,
      explanation: 'Partial pressure = mole fraction × total pressure = 0.20 × 1 = 0.2 atm'
    },
    {
      id: 3,
      type: 'MCQ',
      subject: 'Heat Transfer',
      question: 'The effectiveness of a heat exchanger is defined as:',
      options: [
        { id: 'A', text: 'Actual heat transfer / Maximum possible heat transfer' },
        { id: 'B', text: 'Heat transferred / Heat supplied' },
        { id: 'C', text: 'Outlet temperature / Inlet temperature' },
        { id: 'D', text: 'None of the above' }
      ],
      correctAnswer: 'A',
      marks: 1,
      explanation: 'Effectiveness = Actual heat transfer / Maximum possible heat transfer'
    },
    {
      id: 4,
      type: 'MCQ',
      subject: 'Process Control',
      question: 'A proportional controller with Kc = 2 will:',
      options: [
        { id: 'A', text: 'Eliminate steady-state error' },
        { id: 'B', text: 'Reduce steady-state error' },
        { id: 'C', text: 'Increase steady-state error' },
        { id: 'D', text: 'Have no effect on steady-state error' }
      ],
      correctAnswer: 'B',
      marks: 1,
      explanation: 'Proportional controller reduces but does not eliminate steady-state error.'
    },
    {
      id: 5,
      type: 'NAT',
      subject: 'Fluid Mechanics',
      question: 'Water flows through a venturi meter with throat diameter 0.1 m and inlet diameter 0.2 m. If inlet velocity is 2 m/s, what is throat velocity (in m/s)?',
      correctAnswer: '8',
      marks: 2,
      explanation: 'From continuity: A₁V₁ = A₂V₂. π(0.1)²×2 = π(0.05)²×V₂. V₂ = 8 m/s'
    }
  ]
};

// Generate more questions for each subject to reach 65 questions
Object.keys(mockQuestions).forEach(subject => {
  const baseQuestions = mockQuestions[subject as keyof typeof mockQuestions];
  const targetLength = 65;
  
  while (baseQuestions.length < targetLength) {
    // Duplicate and modify existing questions
    const randomIndex = Math.floor(Math.random() * 5);
    const baseQuestion = { ...baseQuestions[randomIndex] };
    baseQuestion.id = baseQuestions.length + 1;
    
    // Slightly modify the question text to make it unique
    baseQuestion.question = baseQuestion.question + " (Variant " + (baseQuestions.length - 4) + ")";
    
    baseQuestions.push(baseQuestion);
  }
});
