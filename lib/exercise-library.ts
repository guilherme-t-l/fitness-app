export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Abs',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
] as const

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]

const MUSCLE_SET = new Set<string>(MUSCLE_GROUPS)

/** Autocomplete suggestions — PT-BR first (Brazilian gyms). */
export const EXERCISE_SUGGESTIONS = [
  // Peito
  'Supino Reto',
  'Supino Inclinado',
  'Supino Declinado',
  'Supino com Halteres',
  'Crucifixo',
  'Crucifixo Inclinado',
  'Peck Deck',
  'Crossover',
  'Flexão de Braço',
  // Costas
  'Puxada Frontal',
  'Puxada Aberta',
  'Puxada Fechada',
  'Barra Fixa',
  'Remada Curvada',
  'Remada Unilateral',
  'Remada Cavalinho',
  'Remada Baixa',
  'Remada Sentada',
  'Levantamento Terra',
  'Pullover',
  // Ombros
  'Desenvolvimento',
  'Desenvolvimento com Halteres',
  'Elevação Lateral',
  'Elevação Frontal',
  'Elevação Posterior',
  'Remada Alta',
  'Face Pull',
  // Bíceps
  'Rosca Direta',
  'Rosca Scott',
  'Rosca Martelo',
  'Rosca Concentrada',
  'Rosca no Cabo',
  // Tríceps
  'Tríceps Pulley',
  'Tríceps Corda',
  'Tríceps Testa',
  'Tríceps Francês',
  'Tríceps Banco',
  'Mergulho',
  // Pernas
  'Agachamento',
  'Agachamento Livre',
  'Agachamento Smith',
  'Agachamento Búlgaro',
  'Leg Press',
  'Hack Squat',
  'Cadeira Extensora',
  'Mesa Flexora',
  'Cadeira Flexora',
  'Stiff',
  'Afundo',
  'Passada',
  'Elevação Pélvica',
  'Hip Thrust',
  'Abdução de Quadril',
  'Panturrilha em Pé',
  'Panturrilha Sentada',
  // Abdômen
  'Abdominal',
  'Abdominal Infra',
  'Abdominal Oblíquo',
  'Prancha',
  'Elevação de Pernas',
  'Russian Twist',
] as const

/**
 * Alias → major muscles only.
 *
 * Rules:
 * - PT-BR + common English gym terminology.
 * - Accent-stripping + lowercase + hyphen→space is applied before matching.
 * - Skip minor synergists (e.g. triceps on bench press, biceps on rows).
 * - Multi-tag only when multiple muscle groups are a meaningful focus.
 * - Prefer the muscle group that should receive the training-volume credit.
 */
const ALIAS_MUSCLES_RAW: { alias: string; muscles: MuscleGroup[] }[] = [
  // Peito / Chest
  { alias: 'supino', muscles: ['Chest'] },
  { alias: 'supino reto', muscles: ['Chest'] },
  { alias: 'supino reto com barra', muscles: ['Chest'] },
  { alias: 'supino com barra', muscles: ['Chest'] },
  { alias: 'supino inclinado', muscles: ['Chest'] },
  { alias: 'supino inclinado com barra', muscles: ['Chest'] },
  { alias: 'supino declinado', muscles: ['Chest'] },
  { alias: 'supino com halteres', muscles: ['Chest'] },
  { alias: 'supino halteres', muscles: ['Chest'] },
  { alias: 'supino inclinado halteres', muscles: ['Chest'] },
  { alias: 'supino declinado halteres', muscles: ['Chest'] },
  { alias: 'supino maquina', muscles: ['Chest'] },
  { alias: 'supino na maquina', muscles: ['Chest'] },
  { alias: 'chest press', muscles: ['Chest'] },
  { alias: 'machine chest press', muscles: ['Chest'] },
  { alias: 'bench press', muscles: ['Chest'] },
  { alias: 'flat bench press', muscles: ['Chest'] },
  { alias: 'incline bench press', muscles: ['Chest'] },
  { alias: 'incline bench', muscles: ['Chest'] },
  { alias: 'decline bench press', muscles: ['Chest'] },
  { alias: 'decline bench', muscles: ['Chest'] },
  { alias: 'dumbbell bench press', muscles: ['Chest'] },
  { alias: 'incline dumbbell press', muscles: ['Chest'] },
  { alias: 'decline dumbbell press', muscles: ['Chest'] },
  { alias: 'bench', muscles: ['Chest'] },

  { alias: 'crucifixo', muscles: ['Chest'] },
  { alias: 'crucifixo reto', muscles: ['Chest'] },
  { alias: 'crucifixo inclinado', muscles: ['Chest'] },
  { alias: 'crucifixo declinado', muscles: ['Chest'] },
  { alias: 'crucifixo com halteres', muscles: ['Chest'] },
  { alias: 'crucifixo no cabo', muscles: ['Chest'] },
  { alias: 'crossover', muscles: ['Chest'] },
  { alias: 'cross over', muscles: ['Chest'] },
  { alias: 'cross over no cabo', muscles: ['Chest'] },
  { alias: 'chest fly', muscles: ['Chest'] },
  { alias: 'chest flyes', muscles: ['Chest'] },
  { alias: 'cable fly', muscles: ['Chest'] },
  { alias: 'cable flyes', muscles: ['Chest'] },
  { alias: 'fly', muscles: ['Chest'] },
  { alias: 'flyes', muscles: ['Chest'] },
  { alias: 'pec fly', muscles: ['Chest'] },
  { alias: 'pec deck', muscles: ['Chest'] },
  { alias: 'peck deck', muscles: ['Chest'] },
  { alias: 'voador', muscles: ['Chest'] },
  { alias: 'butterfly', muscles: ['Chest'] },

  { alias: 'flexao', muscles: ['Chest'] },
  { alias: 'flexao de braco', muscles: ['Chest'] },
  { alias: 'flexao de bracos', muscles: ['Chest'] },
  { alias: 'push up', muscles: ['Chest'] },
  { alias: 'push ups', muscles: ['Chest'] },
  { alias: 'pushup', muscles: ['Chest'] },
  { alias: 'pushups', muscles: ['Chest'] },

  // Costas / Back
  { alias: 'puxada', muscles: ['Back'] },
  { alias: 'puxada frontal', muscles: ['Back'] },
  { alias: 'puxada frente', muscles: ['Back'] },
  { alias: 'puxada pela frente', muscles: ['Back'] },
  { alias: 'puxada aberta', muscles: ['Back'] },
  { alias: 'puxada fechada', muscles: ['Back'] },
  { alias: 'puxada neutra', muscles: ['Back'] },
  { alias: 'puxada supinada', muscles: ['Back'] },
  { alias: 'puxada pronada', muscles: ['Back'] },
  { alias: 'puxada triangular', muscles: ['Back'] },
  { alias: 'puxada alta', muscles: ['Back'] },
  { alias: 'puxada na maquina', muscles: ['Back'] },
  { alias: 'pulley', muscles: ['Back'] },
  { alias: 'pulley frente', muscles: ['Back'] },
  { alias: 'pulley aberto', muscles: ['Back'] },
  { alias: 'pulley fechado', muscles: ['Back'] },
  { alias: 'pulley triangulo', muscles: ['Back'] },
  { alias: 'lat pulldown', muscles: ['Back'] },
  { alias: 'lat pulldowns', muscles: ['Back'] },
  { alias: 'wide grip pulldown', muscles: ['Back'] },
  { alias: 'close grip pulldown', muscles: ['Back'] },
  { alias: 'neutral grip pulldown', muscles: ['Back'] },
  { alias: 'pulldown', muscles: ['Back'] },
  { alias: 'pull down', muscles: ['Back'] },

  { alias: 'barra fixa', muscles: ['Back'] },
  { alias: 'barra fixa aberta', muscles: ['Back'] },
  { alias: 'barra fixa supinada', muscles: ['Back'] },
  { alias: 'barra fixa pronada', muscles: ['Back'] },
  { alias: 'pull up', muscles: ['Back'] },
  { alias: 'pull ups', muscles: ['Back'] },
  { alias: 'pullup', muscles: ['Back'] },
  { alias: 'pullups', muscles: ['Back'] },
  { alias: 'chin up', muscles: ['Back'] },
  { alias: 'chin ups', muscles: ['Back'] },
  { alias: 'chinup', muscles: ['Back'] },
  { alias: 'assisted pull up', muscles: ['Back'] },
  { alias: 'assisted pullups', muscles: ['Back'] },

  { alias: 'remada', muscles: ['Back'] },
  { alias: 'remada curvada', muscles: ['Back'] },
  { alias: 'remada com barra', muscles: ['Back'] },
  { alias: 'remada unilateral', muscles: ['Back'] },
  { alias: 'remada serrote', muscles: ['Back'] },
  { alias: 'remada cavalinho', muscles: ['Back'] },
  { alias: 'remada baixa', muscles: ['Back'] },
  { alias: 'remada sentada', muscles: ['Back'] },
  { alias: 'remada no cabo', muscles: ['Back'] },
  { alias: 'remada maquina', muscles: ['Back'] },
  { alias: 'remada articulada', muscles: ['Back'] },
  { alias: 'remada apoiada', muscles: ['Back'] },
  { alias: 'remada peito apoiado', muscles: ['Back'] },
  { alias: 't bar row', muscles: ['Back'] },
  { alias: 't bar', muscles: ['Back'] },
  { alias: 'bent over row', muscles: ['Back'] },
  { alias: 'barbell row', muscles: ['Back'] },
  { alias: 'one arm row', muscles: ['Back'] },
  { alias: 'dumbbell row', muscles: ['Back'] },
  { alias: 'seated row', muscles: ['Back'] },
  { alias: 'cable row', muscles: ['Back'] },
  { alias: 'machine row', muscles: ['Back'] },
  { alias: 'chest supported row', muscles: ['Back'] },
  { alias: 'low row', muscles: ['Back'] },
  { alias: 'rows', muscles: ['Back'] },
  { alias: 'row', muscles: ['Back'] },

  { alias: 'pullover', muscles: ['Back'] },
  { alias: 'pullover no cabo', muscles: ['Back'] },
  { alias: 'pullover maquina', muscles: ['Back'] },

  { alias: 'encolhimento', muscles: ['Back'] },
  { alias: 'encolhimento de ombros', muscles: ['Back'] },
  { alias: 'shrug', muscles: ['Back'] },
  { alias: 'shrugs', muscles: ['Back'] },
  { alias: 'dumbbell shrug', muscles: ['Back'] },
  { alias: 'barbell shrug', muscles: ['Back'] },

  // Ombros / Shoulders
  { alias: 'desenvolvimento', muscles: ['Shoulders'] },
  { alias: 'desenvolvimento com halteres', muscles: ['Shoulders'] },
  { alias: 'desenvolvimento com barra', muscles: ['Shoulders'] },
  { alias: 'desenvolvimento barra', muscles: ['Shoulders'] },
  { alias: 'desenvolvimento militar', muscles: ['Shoulders'] },
  { alias: 'desenvolvimento maquina', muscles: ['Shoulders'] },
  { alias: 'desenvolvimento arnold', muscles: ['Shoulders'] },
  { alias: 'desenvolvimento sentado', muscles: ['Shoulders'] },
  { alias: 'desenvolvimento unilateral', muscles: ['Shoulders'] },
  { alias: 'shoulder press', muscles: ['Shoulders'] },
  { alias: 'machine shoulder press', muscles: ['Shoulders'] },
  { alias: 'dumbbell shoulder press', muscles: ['Shoulders'] },
  { alias: 'overhead press', muscles: ['Shoulders'] },
  { alias: 'military press', muscles: ['Shoulders'] },
  { alias: 'barbell overhead press', muscles: ['Shoulders'] },
  { alias: 'arnold press', muscles: ['Shoulders'] },

  { alias: 'elevacao lateral', muscles: ['Shoulders'] },
  { alias: 'elevacao lateral halteres', muscles: ['Shoulders'] },
  { alias: 'elevacao lateral no cabo', muscles: ['Shoulders'] },
  { alias: 'elevacao lateral maquina', muscles: ['Shoulders'] },
  { alias: 'lateral raise', muscles: ['Shoulders'] },
  { alias: 'lateral raises', muscles: ['Shoulders'] },
  { alias: 'cable lateral raise', muscles: ['Shoulders'] },
  { alias: 'machine lateral raise', muscles: ['Shoulders'] },

  { alias: 'elevacao frontal', muscles: ['Shoulders'] },
  { alias: 'elevacao frontal halteres', muscles: ['Shoulders'] },
  { alias: 'elevacao frontal cabo', muscles: ['Shoulders'] },
  { alias: 'front raise', muscles: ['Shoulders'] },
  { alias: 'front raises', muscles: ['Shoulders'] },

  { alias: 'elevacao posterior', muscles: ['Shoulders'] },
  { alias: 'crucifixo inverso', muscles: ['Shoulders'] },
  { alias: 'crucifixo inverso maquina', muscles: ['Shoulders'] },
  { alias: 'crucifixo inverso cabo', muscles: ['Shoulders'] },
  { alias: 'reverse fly', muscles: ['Shoulders'] },
  { alias: 'reverse flies', muscles: ['Shoulders'] },
  { alias: 'rear delt fly', muscles: ['Shoulders'] },
  { alias: 'rear delt', muscles: ['Shoulders'] },
  { alias: 'reverse pec deck', muscles: ['Shoulders'] },

  { alias: 'remada alta', muscles: ['Shoulders'] },
  { alias: 'upright row', muscles: ['Shoulders'] },
  { alias: 'upright rows', muscles: ['Shoulders'] },

  { alias: 'face pull', muscles: ['Shoulders'] },
  { alias: 'face pulls', muscles: ['Shoulders'] },

  // Biceps
  { alias: 'rosca', muscles: ['Biceps'] },
  { alias: 'rosca direta', muscles: ['Biceps'] },
  { alias: 'rosca direta barra', muscles: ['Biceps'] },
  { alias: 'rosca barra', muscles: ['Biceps'] },
  { alias: 'rosca direta cabo', muscles: ['Biceps'] },
  { alias: 'rosca scott', muscles: ['Biceps'] },
  { alias: 'rosca scott barra', muscles: ['Biceps'] },
  { alias: 'rosca scott maquina', muscles: ['Biceps'] },
  { alias: 'rosca martelo', muscles: ['Biceps'] },
  { alias: 'rosca martelo halteres', muscles: ['Biceps'] },
  { alias: 'rosca martelo cabo', muscles: ['Biceps'] },
  { alias: 'rosca concentrada', muscles: ['Biceps'] },
  { alias: 'rosca no cabo', muscles: ['Biceps'] },
  { alias: 'rosca cabo', muscles: ['Biceps'] },
  { alias: 'rosca alternada', muscles: ['Biceps'] },
  { alias: 'rosca inversa', muscles: ['Biceps'] },
  { alias: 'rosca 21', muscles: ['Biceps'] },
  { alias: 'rosca inclinada', muscles: ['Biceps'] },
  { alias: 'rosca spider', muscles: ['Biceps'] },

  { alias: 'bicep curl', muscles: ['Biceps'] },
  { alias: 'bicep curls', muscles: ['Biceps'] },
  { alias: 'biceps curl', muscles: ['Biceps'] },
  { alias: 'biceps curls', muscles: ['Biceps'] },
  { alias: 'barbell curl', muscles: ['Biceps'] },
  { alias: 'dumbbell curl', muscles: ['Biceps'] },
  { alias: 'hammer curl', muscles: ['Biceps'] },
  { alias: 'hammer curls', muscles: ['Biceps'] },
  { alias: 'preacher curl', muscles: ['Biceps'] },
  { alias: 'preacher curls', muscles: ['Biceps'] },
  { alias: 'incline curl', muscles: ['Biceps'] },
  { alias: 'incline dumbbell curl', muscles: ['Biceps'] },
  { alias: 'cable curl', muscles: ['Biceps'] },
  { alias: 'bayesian curl', muscles: ['Biceps'] },
  { alias: 'spider curl', muscles: ['Biceps'] },
  { alias: 'curl', muscles: ['Biceps'] },

  // Triceps
  { alias: 'triceps', muscles: ['Triceps'] },
  { alias: 'tricep', muscles: ['Triceps'] },
  { alias: 'triceps pulley', muscles: ['Triceps'] },
  { alias: 'triceps corda', muscles: ['Triceps'] },
  { alias: 'triceps no cabo', muscles: ['Triceps'] },
  { alias: 'triceps cabo', muscles: ['Triceps'] },
  { alias: 'triceps testa', muscles: ['Triceps'] },
  { alias: 'triceps frances', muscles: ['Triceps'] },
  { alias: 'triceps frances halter', muscles: ['Triceps'] },
  { alias: 'triceps banco', muscles: ['Triceps'] },
  { alias: 'triceps kickback', muscles: ['Triceps'] },
  { alias: 'triceps coice', muscles: ['Triceps'] },
  { alias: 'triceps unilateral', muscles: ['Triceps'] },
  { alias: 'triceps acima da cabeca', muscles: ['Triceps'] },
  { alias: 'triceps extensao', muscles: ['Triceps'] },

  { alias: 'triceps pushdown', muscles: ['Triceps'] },
  { alias: 'tricep pushdown', muscles: ['Triceps'] },
  { alias: 'pushdown', muscles: ['Triceps'] },
  { alias: 'rope pushdown', muscles: ['Triceps'] },
  { alias: 'triceps rope', muscles: ['Triceps'] },
  { alias: 'overhead triceps extension', muscles: ['Triceps'] },
  { alias: 'triceps extension', muscles: ['Triceps'] },
  { alias: 'skull crusher', muscles: ['Triceps'] },
  { alias: 'skull crushers', muscles: ['Triceps'] },
  { alias: 'triceps dips', muscles: ['Triceps'] },
  { alias: 'tricep dips', muscles: ['Triceps'] },
  { alias: 'triceps dip', muscles: ['Triceps'] },
  { alias: 'tricep dip', muscles: ['Triceps'] },
  { alias: 'kickback', muscles: ['Triceps'] },
  { alias: 'mergulho', muscles: ['Triceps'] },
  { alias: 'dips', muscles: ['Triceps'] },
  { alias: 'dip', muscles: ['Triceps'] },

  // Quads
  { alias: 'agachamento', muscles: ['Quads', 'Glutes'] },
  { alias: 'agachamento livre', muscles: ['Quads', 'Glutes'] },
  { alias: 'agachamento com barra', muscles: ['Quads', 'Glutes'] },
  { alias: 'agachamento smith', muscles: ['Quads', 'Glutes'] },
  { alias: 'agachamento bulgaro', muscles: ['Quads', 'Glutes'] },
  { alias: 'agachamento sumo', muscles: ['Quads', 'Glutes'] },
  { alias: 'agachamento goblet', muscles: ['Quads', 'Glutes'] },
  { alias: 'agachamento frontal', muscles: ['Quads', 'Glutes'] },
  { alias: 'agachamento hack', muscles: ['Quads', 'Glutes'] },
  { alias: 'hack squat', muscles: ['Quads', 'Glutes'] },
  { alias: 'hack', muscles: ['Quads', 'Glutes'] },
  { alias: 'leg press', muscles: ['Quads', 'Glutes'] },
  { alias: 'legpress', muscles: ['Quads', 'Glutes'] },
  { alias: 'leg press 45', muscles: ['Quads', 'Glutes'] },
  { alias: 'leg press horizontal', muscles: ['Quads', 'Glutes'] },
  { alias: 'smith squat', muscles: ['Quads', 'Glutes'] },
  { alias: 'front squat', muscles: ['Quads', 'Glutes'] },
  { alias: 'bulgarian split squat', muscles: ['Quads', 'Glutes'] },
  { alias: 'split squat', muscles: ['Quads', 'Glutes'] },
  { alias: 'squat', muscles: ['Quads', 'Glutes'] },
  { alias: 'squats', muscles: ['Quads', 'Glutes'] },

  { alias: 'cadeira extensora', muscles: ['Quads'] },
  { alias: 'extensora', muscles: ['Quads'] },
  { alias: 'leg extension', muscles: ['Quads'] },
  { alias: 'leg extensions', muscles: ['Quads'] },
  { alias: 'sissy squat', muscles: ['Quads'] },

  { alias: 'afundo', muscles: ['Quads', 'Glutes'] },
  { alias: 'passada', muscles: ['Quads', 'Glutes'] },
  { alias: 'passada andando', muscles: ['Quads', 'Glutes'] },
  { alias: 'passada reversa', muscles: ['Quads', 'Glutes'] },
  { alias: 'afundo reverso', muscles: ['Quads', 'Glutes'] },
  { alias: 'lunges', muscles: ['Quads', 'Glutes'] },
  { alias: 'lunge', muscles: ['Quads', 'Glutes'] },
  { alias: 'walking lunge', muscles: ['Quads', 'Glutes'] },
  { alias: 'reverse lunge', muscles: ['Quads', 'Glutes'] },
  { alias: 'step up', muscles: ['Quads', 'Glutes'] },
  { alias: 'step ups', muscles: ['Quads', 'Glutes'] },

  // Hamstrings + Glutes
  { alias: 'levantamento terra', muscles: ['Hamstrings', 'Glutes'] },
  { alias: 'levantamento terra convencional', muscles: ['Hamstrings', 'Glutes'] },
  { alias: 'terra', muscles: ['Hamstrings', 'Glutes'] },
  { alias: 'terra convencional', muscles: ['Hamstrings', 'Glutes'] },
  { alias: 'deadlift', muscles: ['Hamstrings', 'Glutes'] },
  { alias: 'deadlifts', muscles: ['Hamstrings', 'Glutes'] },
  { alias: 'conventional deadlift', muscles: ['Hamstrings', 'Glutes'] },

  { alias: 'levantamento terra sumo', muscles: ['Quads', 'Hamstrings', 'Glutes'] },
  { alias: 'terra sumo', muscles: ['Quads', 'Hamstrings', 'Glutes'] },
  { alias: 'sumo deadlift', muscles: ['Quads', 'Hamstrings', 'Glutes'] },
  { alias: 'sumo deadlifts', muscles: ['Quads', 'Hamstrings', 'Glutes'] },

  { alias: 'stiff', muscles: ['Hamstrings', 'Glutes'] },
  { alias: 'stiff com halteres', muscles: ['Hamstrings', 'Glutes'] },
  { alias: 'stiff com barra', muscles: ['Hamstrings', 'Glutes'] },
  { alias: 'terra romeno', muscles: ['Hamstrings', 'Glutes'] },
  { alias: 'levantamento terra romeno', muscles: ['Hamstrings', 'Glutes'] },
  { alias: 'romeno', muscles: ['Hamstrings', 'Glutes'] },
  { alias: 'romanian deadlift', muscles: ['Hamstrings', 'Glutes'] },
  { alias: 'romanian deadlifts', muscles: ['Hamstrings', 'Glutes'] },
  { alias: 'rdl', muscles: ['Hamstrings', 'Glutes'] },

  { alias: 'bom dia', muscles: ['Hamstrings', 'Glutes'] },
  { alias: 'good morning', muscles: ['Hamstrings', 'Glutes'] },
  { alias: 'good mornings', muscles: ['Hamstrings', 'Glutes'] },

  { alias: 'mesa flexora', muscles: ['Hamstrings'] },
  { alias: 'cadeira flexora', muscles: ['Hamstrings'] },
  { alias: 'flexora', muscles: ['Hamstrings'] },
  { alias: 'flexora deitada', muscles: ['Hamstrings'] },
  { alias: 'flexora sentada', muscles: ['Hamstrings'] },
  { alias: 'leg curl', muscles: ['Hamstrings'] },
  { alias: 'leg curls', muscles: ['Hamstrings'] },
  { alias: 'lying leg curl', muscles: ['Hamstrings'] },
  { alias: 'seated leg curl', muscles: ['Hamstrings'] },
  { alias: 'hamstring curl', muscles: ['Hamstrings'] },

  // Glutes
  { alias: 'elevacao pelvica', muscles: ['Glutes'] },
  { alias: 'elevacao pelvica com barra', muscles: ['Glutes'] },
  { alias: 'elevacao pelvica maquina', muscles: ['Glutes'] },
  { alias: 'hip thrust', muscles: ['Glutes'] },
  { alias: 'hip thrusts', muscles: ['Glutes'] },
  { alias: 'hip thrust com barra', muscles: ['Glutes'] },
  { alias: 'hip thrust maquina', muscles: ['Glutes'] },
  { alias: 'glute bridge', muscles: ['Glutes'] },
  { alias: 'glute bridges', muscles: ['Glutes'] },

  { alias: 'abducao', muscles: ['Glutes'] },
  { alias: 'abducao de quadril', muscles: ['Glutes'] },
  { alias: 'abducao maquina', muscles: ['Glutes'] },
  { alias: 'cadeira abdutora', muscles: ['Glutes'] },
  { alias: 'abdutora', muscles: ['Glutes'] },
  { alias: 'hip abduction', muscles: ['Glutes'] },
  { alias: 'hip abductor', muscles: ['Glutes'] },

  { alias: 'coice', muscles: ['Glutes'] },
  { alias: 'coice no cabo', muscles: ['Glutes'] },
  { alias: 'coice na maquina', muscles: ['Glutes'] },
  { alias: 'glute kickback', muscles: ['Glutes'] },
  { alias: 'cable kickback', muscles: ['Glutes'] },
  { alias: 'kickback maquina', muscles: ['Glutes'] },
  { alias: 'glute machine', muscles: ['Glutes'] },
  { alias: 'gluteo 4 apoios', muscles: ['Glutes'] },
  { alias: 'gluteo quatro apoios', muscles: ['Glutes'] },
  { alias: 'donkey kick', muscles: ['Glutes'] },
  { alias: 'donkey kicks', muscles: ['Glutes'] },
  { alias: 'glute', muscles: ['Glutes'] },
  { alias: 'glutes', muscles: ['Glutes'] },

  // Calves
  { alias: 'panturrilha', muscles: ['Calves'] },
  { alias: 'panturrilha em pe', muscles: ['Calves'] },
  { alias: 'panturrilha de pe', muscles: ['Calves'] },
  { alias: 'panturrilha sentada', muscles: ['Calves'] },
  { alias: 'panturrilha sentado', muscles: ['Calves'] },
  { alias: 'panturrilha no leg', muscles: ['Calves'] },
  { alias: 'panturrilha no smith', muscles: ['Calves'] },
  { alias: 'panturrilha no hack', muscles: ['Calves'] },
  { alias: 'calf raise', muscles: ['Calves'] },
  { alias: 'calf raises', muscles: ['Calves'] },
  { alias: 'standing calf raise', muscles: ['Calves'] },
  { alias: 'standing calf raises', muscles: ['Calves'] },
  { alias: 'seated calf raise', muscles: ['Calves'] },
  { alias: 'seated calf raises', muscles: ['Calves'] },
  { alias: 'calf press', muscles: ['Calves'] },
  { alias: 'calf press leg press', muscles: ['Calves'] },
  { alias: 'calves', muscles: ['Calves'] },

  // Abs
  { alias: 'abdominal', muscles: ['Abs'] },
  { alias: 'abdominal supra', muscles: ['Abs'] },
  { alias: 'abdominal infra', muscles: ['Abs'] },
  { alias: 'abdominal obliquo', muscles: ['Abs'] },
  { alias: 'abdominal maquina', muscles: ['Abs'] },
  { alias: 'abdominal no cabo', muscles: ['Abs'] },
  { alias: 'cable crunch', muscles: ['Abs'] },
  { alias: 'crunch', muscles: ['Abs'] },
  { alias: 'crunches', muscles: ['Abs'] },
  { alias: 'machine crunch', muscles: ['Abs'] },
  { alias: 'cable abs', muscles: ['Abs'] },

  { alias: 'elevacao de pernas', muscles: ['Abs'] },
  { alias: 'elevacao de pernas na barra', muscles: ['Abs'] },
  { alias: 'elevacao de joelho', muscles: ['Abs'] },
  { alias: 'elevacao de joelhos', muscles: ['Abs'] },
  { alias: 'leg raise', muscles: ['Abs'] },
  { alias: 'leg raises', muscles: ['Abs'] },
  { alias: 'hanging leg raise', muscles: ['Abs'] },
  { alias: 'hanging leg raises', muscles: ['Abs'] },
  { alias: 'hanging knee raise', muscles: ['Abs'] },
  { alias: 'hanging knee raises', muscles: ['Abs'] },
  { alias: 'knee raise', muscles: ['Abs'] },
  { alias: 'knee raises', muscles: ['Abs'] },

  { alias: 'prancha', muscles: ['Abs'] },
  { alias: 'prancha lateral', muscles: ['Abs'] },
  { alias: 'plank', muscles: ['Abs'] },
  { alias: 'planks', muscles: ['Abs'] },
  { alias: 'side plank', muscles: ['Abs'] },
  { alias: 'plank variations', muscles: ['Abs'] },

  { alias: 'russian twist', muscles: ['Abs'] },
  { alias: 'russian twists', muscles: ['Abs'] },
  { alias: 'ab wheel', muscles: ['Abs'] },
  { alias: 'ab wheel rollout', muscles: ['Abs'] },
  { alias: 'ab wheel rollouts', muscles: ['Abs'] },
  { alias: 'roda abdominal', muscles: ['Abs'] },
  { alias: 'rollout', muscles: ['Abs'] },

  { alias: 'mountain climber', muscles: ['Abs'] },
  { alias: 'mountain climbers', muscles: ['Abs'] },
  { alias: 'escalador', muscles: ['Abs'] },
  { alias: 'escaladores', muscles: ['Abs'] },

  { alias: 'abs', muscles: ['Abs'] },
]

/** Normalize for matching: lowercase, strip accents, hyphens → spaces. */
export function normalizeExerciseName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
}

// Normalize aliases once so accented/hyphenated raw entries still match.
const ALIAS_MUSCLES: { alias: string; muscles: MuscleGroup[] }[] = ALIAS_MUSCLES_RAW
  .map(({ alias, muscles }) => ({ alias: normalizeExerciseName(alias), muscles: [...muscles] }))
  .sort((a, b) => b.alias.length - a.alias.length)

export function parseMuscleGroups(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && MUSCLE_SET.has(item))
}

export function filterWorkoutMuscles(categories: string[]): string[] {
  return categories.filter((category) => MUSCLE_SET.has(category))
}

/** Match alias dictionary; longest whole-phrase alias wins. */
export function matchAliasMuscles(normalizedName: string): string[] | null {
  if (!normalizedName) return null

  for (const { alias, muscles } of ALIAS_MUSCLES) {
    if (normalizedName === alias) return [...muscles]
    const pattern = new RegExp(`(?:^|\\s)${escapeRegExp(alias)}(?:\\s|$)`)
    if (pattern.test(normalizedName)) return [...muscles]
  }

  return null
}

export function resolveMuscleGroups(
  name: string,
  options: {
    historyByName?: Map<string, string[]>
    workoutCategories?: string[]
  } = {}
): string[] {
  const normalized = normalizeExerciseName(name)
  if (!normalized) return []

  const fromHistory = options.historyByName?.get(normalized)
  if (fromHistory && fromHistory.length > 0) {
    return parseMuscleGroups(fromHistory)
  }

  const fromAlias = matchAliasMuscles(normalized)
  if (fromAlias && fromAlias.length > 0) return fromAlias

  const fromWorkout = filterWorkoutMuscles(options.workoutCategories || [])
  if (fromWorkout.length > 0) return fromWorkout

  return []
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
