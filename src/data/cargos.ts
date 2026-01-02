// Dados extraídos do PLC 0017/2025 - PCCR São Pedro da Aldeia

export interface CargoInfo {
  nome: string;
  categoria: 'geral' | 'saude' | 'dentista' | 'medico' | 'enfermagem';
  nivelInicial: string;
  cargaHoraria: number;
  salariosPorPadrao: number[]; // Padrões A até P (16 padrões = até 45 anos)
}

// Tabela Geral (G I a G V) - 40h
const tabelaGeral40h = {
  'G I': [1542.15, 1588.41, 1636.07, 1685.15, 1735.70, 1787.77, 1841.41, 1896.65, 1953.55, 2012.16, 2072.52, 2134.70, 2198.74, 2264.70, 2332.64],
  'G II': [1717.87, 1769.41, 1822.49, 1877.16, 1933.48, 1991.48, 2051.23, 2112.76, 2176.15, 2241.43, 2308.67, 2377.93, 2449.27, 2522.75, 2598.43],
  'G III': [1913.61, 1971.02, 2030.15, 2091.06, 2153.79, 2218.40, 2284.95, 2353.50, 2424.11, 2496.83, 2571.74, 2648.89, 2728.35, 2810.21, 2894.51],
  'G IV': [2131.66, 2195.61, 2261.48, 2329.32, 2399.20, 2471.18, 2545.31, 2621.67, 2700.32, 2781.33, 2864.77, 2950.72, 3039.24, 3130.41, 3224.33],
  'G V': [2374.55, 2445.79, 2519.16, 2594.74, 2672.58, 2752.76, 2835.34, 2920.40, 3008.01, 3098.25, 3191.20, 3286.93, 3385.54, 3487.11, 3591.72],
};

// Tabela Agentes da Saúde (S I a S II) - 40h
const tabelaAgenteSaude = {
  'S I': [2824.00, 2908.72, 2995.98, 3085.86, 3178.44, 3273.79, 3372.00, 3473.16, 3577.36, 3684.68, 3795.22, 3909.08, 4026.35, 4147.14, 4271.55],
  'S II': [3145.78, 3240.15, 3337.36, 3437.48, 3540.60, 3646.82, 3756.23, 3868.91, 3984.98, 4104.53, 4227.67, 4354.50, 4485.13, 4619.68, 4758.28],
};

// Tabela Cirurgiões-Dentistas - 40h
const tabelaDentista40h = {
  'CD I': [4750.00, 4892.50, 5039.28, 5190.45, 5346.17, 5506.55, 5671.75, 5841.90, 6017.16, 6197.67, 6383.60, 6575.11, 6772.36, 6975.54, 7184.80],
  'CD II': [5291.24, 5449.98, 5613.48, 5781.88, 5955.34, 6134.00, 6318.02, 6507.56, 6702.78, 6903.87, 7110.98, 7324.31, 7544.04, 7770.36, 8003.47],
};

// Tabela Cirurgiões-Dentistas - 24h
const tabelaDentista24h = {
  'CD I': [2850.00, 2935.50, 3023.57, 3114.27, 3207.70, 3303.93, 3403.05, 3505.14, 3610.29, 3718.60, 3830.16, 3945.07, 4063.42, 4185.32, 4310.88],
  'CD II': [3174.74, 3269.99, 3368.09, 3469.13, 3573.20, 3680.40, 3790.81, 3904.53, 4021.67, 4142.32, 4266.59, 4394.59, 4526.42, 4662.22, 4802.08],
};

// Tabela Cirurgiões-Dentistas - 20h
const tabelaDentista20h = {
  'CD I': [2375.00, 2446.25, 2519.64, 2595.23, 2673.08, 2753.28, 2835.87, 2920.95, 3008.58, 3098.84, 3191.80, 3287.56, 3386.18, 3487.77, 3592.40],
  'CD II': [2645.62, 2724.99, 2806.74, 2890.94, 2977.67, 3067.00, 3159.01, 3253.78, 3351.39, 3451.93, 3555.49, 3662.16, 3772.02, 3885.18, 4001.74],
};

// Tabela Médicos - 40h
const tabelaMedico40h = {
  'M I': [9500.00, 9785.00, 10078.55, 10380.91, 10692.33, 11013.10, 11343.50, 11683.80, 12034.32, 12395.35, 12767.21, 13150.22, 13544.73, 13951.07, 14369.60],
  'M II': [10582.48, 10899.95, 11226.95, 11563.76, 11910.67, 12267.99, 12636.03, 13015.11, 13405.57, 13807.73, 14221.96, 14648.62, 15088.08, 15540.72, 16006.95],
};

// Tabela Médicos - 24h
const tabelaMedico24h = {
  'M I': [5700.00, 5871.00, 6047.13, 6228.54, 6415.40, 6607.86, 6806.10, 7010.28, 7220.59, 7437.21, 7660.32, 7890.13, 8126.84, 8370.64, 8621.76],
  'M II': [6349.49, 6539.97, 6736.17, 6938.26, 7146.40, 7360.80, 7581.62, 7809.07, 8043.34, 8284.64, 8533.18, 8789.17, 9052.85, 9324.43, 9604.17],
};

// Tabela Médicos - 20h
const tabelaMedico20h = {
  'M I': [4750.00, 4892.50, 5039.28, 5190.45, 5346.17, 5506.55, 5671.75, 5841.90, 6017.16, 6197.67, 6383.60, 6575.11, 6772.36, 6975.54, 7184.80],
  'M II': [5291.24, 5449.98, 5613.48, 5781.88, 5955.34, 6134.00, 6318.02, 6507.56, 6702.78, 6903.87, 7110.98, 7324.31, 7544.04, 7770.36, 8003.47],
};

// Tabela Enfermagem - 40h
const tabelaEnfermagem40h = {
  'E I': [2159.09, 2223.86, 2290.58, 2359.30, 2430.07, 2502.98, 2578.07, 2655.41, 2735.07, 2817.12, 2901.64, 2988.69, 3078.35, 3170.70, 3265.82],
  'E II': [2405.11, 2477.26, 2551.58, 2628.13, 2706.97, 2788.18, 2871.82, 2957.98, 3046.72, 3138.12, 3232.26, 3329.23, 3429.11, 3531.98, 3637.94],
  'E III': [3022.73, 3113.41, 3206.81, 3303.02, 3402.11, 3504.17, 3609.30, 3717.58, 3829.10, 3943.98, 4062.30, 4184.17, 4309.69, 4438.98, 4572.15],
  'E IV': [3367.15, 3468.17, 3572.21, 3679.38, 3789.76, 3903.46, 4020.56, 4141.18, 4265.41, 4393.37, 4525.17, 4660.93, 4800.76, 4944.78, 5093.12],
  'E V': [4318.18, 4447.73, 4581.16, 4718.59, 4860.15, 5005.95, 5156.13, 5310.82, 5470.14, 5634.25, 5803.27, 5977.37, 6156.69, 6341.39, 6531.63],
  'E VI': [4810.22, 4954.52, 5103.16, 5256.25, 5413.94, 5576.36, 5743.65, 5915.96, 6093.44, 6276.24, 6464.53, 6658.46, 6858.22, 7063.96, 7275.88],
};

// Tabela Enfermagem - 20h
const tabelaEnfermagem20h = {
  'E I': [1079.55, 1111.93, 1145.29, 1179.65, 1215.04, 1251.49, 1289.03, 1327.70, 1367.54, 1408.56, 1450.82, 1494.34, 1539.17, 1585.35, 1632.91],
  'E II': [1202.55, 1238.63, 1275.79, 1314.06, 1353.48, 1394.09, 1435.91, 1478.99, 1523.36, 1569.06, 1616.13, 1664.62, 1714.55, 1765.99, 1818.97],
  'E III': [1511.37, 1556.71, 1603.41, 1651.51, 1701.05, 1752.09, 1804.65, 1858.79, 1914.55, 1971.99, 2031.15, 2092.08, 2154.85, 2219.49, 2286.08],
};

// Função para calcular salário proporcional à carga horária
function calcularProporcional(salarios: number[], chOriginal: number, chDesejada: number): number[] {
  return salarios.map(s => Math.round((s * chDesejada / chOriginal) * 100) / 100);
}

export const cargos: CargoInfo[] = ([
  // AGENTES DA SAÚDE
  { nome: "Agente Comunitário de Saúde", categoria: 'saude', nivelInicial: 'S I', cargaHoraria: 40, salariosPorPadrao: tabelaAgenteSaude['S I'] },
  { nome: "Agente de Combate às Endemias", categoria: 'saude', nivelInicial: 'S I', cargaHoraria: 40, salariosPorPadrao: tabelaAgenteSaude['S I'] },
  
  // APOIO À FISCALIZAÇÃO
  { nome: "Auxiliar de Fiscal de Transporte", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  
  // APOIO À PROMOÇÃO SOCIAL
  { nome: "Agente de Ação Social", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  { nome: "Auxiliar de Cuidador Social", categoria: 'geral', nivelInicial: 'G II', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G II'] },
  { nome: "Cuidador Social", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  { nome: "Educador Social", categoria: 'geral', nivelInicial: 'G II', cargaHoraria: 20, salariosPorPadrao: calcularProporcional(tabelaGeral40h['G II'], 40, 20) },
  { nome: "Entrevistador Social", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  
  // APOIO À SAÚDE
  { nome: "Auxiliar de Farmácia", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  { nome: "Auxiliar de Saúde Bucal", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  { nome: "Cuidador de Saúde Mental", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  { nome: "Maqueiro", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  
  // APOIO À SEGURANÇA PÚBLICA
  { nome: "Agente de Defesa Civil", categoria: 'geral', nivelInicial: 'G III', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G III'] },
  
  // APOIO ADMINISTRATIVO-FINANCEIRO
  { nome: "Agente Administrativo", categoria: 'geral', nivelInicial: 'G II', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G II'] },
  { nome: "Agente de Proteção e Defesa do Consumidor", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  { nome: "Recepcionista", categoria: 'geral', nivelInicial: 'G II', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G II'] },
  
  // APOIO AO MEIO AMBIENTE
  { nome: "Guarda Ambiental", categoria: 'geral', nivelInicial: 'G II', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G II'] },
  
  // ESPORTE, LAZER E CULTURA
  { nome: "Instrutor de Artesanato", categoria: 'geral', nivelInicial: 'G III', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G III'] },
  { nome: "Instrutor de Capoeira", categoria: 'geral', nivelInicial: 'G II', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G II'] },
  { nome: "Instrutor de Dança", categoria: 'geral', nivelInicial: 'G III', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G III'] },
  { nome: "Instrutor de Teatro", categoria: 'geral', nivelInicial: 'G II', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G II'] },
  { nome: "Instrutor Musical", categoria: 'geral', nivelInicial: 'G III', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G III'] },
  
  // FISCALIZAÇÃO - NÍVEL SUPERIOR
  { nome: "Fiscal de Meio Ambiente", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Fiscal de Obras", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Fiscal de Posturas", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Fiscal de Transporte", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Fiscal Sanitário - Biólogo", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Fiscal Sanitário - Cirurgião-Dentista", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Fiscal Sanitário - Enfermeiro", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Fiscal Sanitário - Farmacêutico", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Fiscal Sanitário - Nutricionista", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Fiscal Sanitário - Veterinário", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  
  // NÍVEL SUPERIOR - GERAL
  { nome: "Advogado", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Analista de Gestão Pública", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Analista de Licitação", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Analista de Tecnologia da Informação", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Arquiteto", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Assistente Social", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 30, salariosPorPadrao: calcularProporcional(tabelaGeral40h['G IV'], 40, 30) },
  { nome: "Assistente Social Especialista em Saúde Mental", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 30, salariosPorPadrao: calcularProporcional(tabelaGeral40h['G IV'], 40, 30) },
  { nome: "Auditor Interno", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Bibliotecário", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Biólogo", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Comunicador Social", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Contador", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Controlador do Patrimônio Cultural", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Economista", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Educador Físico", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 20, salariosPorPadrao: calcularProporcional(tabelaGeral40h['G IV'], 40, 20) },
  { nome: "Engenheiro", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Engenheiro Ambiental", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Engenheiro Civil", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Engenheiro Eletricista", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Engenheiro Florestal", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Engenheiro Sanitarista", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Farmacêutico", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Fisioterapeuta", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 30, salariosPorPadrao: calcularProporcional(tabelaGeral40h['G IV'], 40, 30) },
  { nome: "Fisioterapeuta - Especialista em Neurologia", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 30, salariosPorPadrao: calcularProporcional(tabelaGeral40h['G IV'], 40, 30) },
  { nome: "Fisioterapeuta - Especialista em Neuropediatria", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 30, salariosPorPadrao: calcularProporcional(tabelaGeral40h['G IV'], 40, 30) },
  { nome: "Fisioterapeuta - Especialista em Psicomotricidade", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 30, salariosPorPadrao: calcularProporcional(tabelaGeral40h['G IV'], 40, 30) },
  { nome: "Fisioterapeuta - Especialista em Terapia Respiratória", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 30, salariosPorPadrao: calcularProporcional(tabelaGeral40h['G IV'], 40, 30) },
  { nome: "Fonoaudiólogo", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 20, salariosPorPadrao: calcularProporcional(tabelaGeral40h['G IV'], 40, 20) },
  { nome: "Geólogo", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Museólogo", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Musicoterapeuta", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Nutricionista", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Procurador Municipal", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 20, salariosPorPadrao: calcularProporcional(tabelaGeral40h['G IV'], 40, 20) },
  { nome: "Produtor Cultural", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Psicomotricista", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Psicólogo", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Psicólogo - Especialização em Autismo", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Psicólogo - Especialização em Saúde Mental", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  { nome: "Terapeuta Ocupacional", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 30, salariosPorPadrao: calcularProporcional(tabelaGeral40h['G IV'], 40, 30) },
  { nome: "Turismólogo", categoria: 'geral', nivelInicial: 'G IV', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G IV'] },
  
  // NÍVEL TÉCNICO
  { nome: "Social Media Designer", categoria: 'geral', nivelInicial: 'G II', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G II'] },
  { nome: "Técnico Agrícola", categoria: 'geral', nivelInicial: 'G III', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G III'] },
  { nome: "Técnico Cadista", categoria: 'geral', nivelInicial: 'G III', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G III'] },
  { nome: "Técnico de Arquivo", categoria: 'geral', nivelInicial: 'G III', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G III'] },
  { nome: "Técnico de Segurança do Trabalho", categoria: 'geral', nivelInicial: 'G III', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G III'] },
  { nome: "Técnico de Suporte de T.I.", categoria: 'geral', nivelInicial: 'G III', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G III'] },
  { nome: "Técnico em Contabilidade", categoria: 'geral', nivelInicial: 'G III', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G III'] },
  { nome: "Técnico em Edificações", categoria: 'geral', nivelInicial: 'G III', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G III'] },
  { nome: "Técnico em Geoprocessamento", categoria: 'geral', nivelInicial: 'G III', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G III'] },
  { nome: "Técnico em Órtese e Prótese", categoria: 'geral', nivelInicial: 'G III', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G III'] },
  { nome: "Técnico em Prótese Dentária", categoria: 'geral', nivelInicial: 'G III', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G III'] },
  
  // OBRAS E SERVIÇOS PÚBLICOS
  { nome: "Ajudante de Mecânico de Máquina Pesada", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  { nome: "Apontador", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  { nome: "Artífice de Obras e Serviços Públicos", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  { nome: "Condutor de Máquina Pesada", categoria: 'geral', nivelInicial: 'G II', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G II'] },
  { nome: "Eletricista", categoria: 'geral', nivelInicial: 'G II', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G II'] },
  { nome: "Jardineiro", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  { nome: "Mecânico de Manutenção de Máquina Pesada", categoria: 'geral', nivelInicial: 'G II', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G II'] },
  { nome: "Mecânico de Veículos", categoria: 'geral', nivelInicial: 'G II', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G II'] },
  { nome: "Motorista", categoria: 'geral', nivelInicial: 'G II', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G II'] },
  { nome: "Operador de Retroescavadeira", categoria: 'geral', nivelInicial: 'G II', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G II'] },
  { nome: "Pedreiro de Conservação e Manutenção", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  
  // SERVIÇOS GERAIS
  { nome: "Auxiliar de Cozinha", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  { nome: "Auxiliar de Serviços Gerais", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  { nome: "Coveiro", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  { nome: "Cozinheiro", categoria: 'geral', nivelInicial: 'G I', cargaHoraria: 40, salariosPorPadrao: tabelaGeral40h['G I'] },
  
  // CIRURGIÕES-DENTISTAS
  { nome: "Cirurgião-Dentista", categoria: 'dentista', nivelInicial: 'CD I', cargaHoraria: 40, salariosPorPadrao: tabelaDentista40h['CD I'] },
  { nome: "Cirurgião-Dentista - Bucomaxilofacial", categoria: 'dentista', nivelInicial: 'CD I', cargaHoraria: 40, salariosPorPadrao: tabelaDentista40h['CD I'] },
  { nome: "Cirurgião-Dentista - Clínico Endodontista", categoria: 'dentista', nivelInicial: 'CD I', cargaHoraria: 40, salariosPorPadrao: tabelaDentista40h['CD I'] },
  { nome: "Cirurgião-Dentista - Clínico Generalista", categoria: 'dentista', nivelInicial: 'CD I', cargaHoraria: 40, salariosPorPadrao: tabelaDentista40h['CD I'] },
  { nome: "Cirurgião-Dentista - Especialista em Pacientes com Deficiência", categoria: 'dentista', nivelInicial: 'CD I', cargaHoraria: 40, salariosPorPadrao: tabelaDentista40h['CD I'] },
  { nome: "Cirurgião-Dentista - Odontopediatra", categoria: 'dentista', nivelInicial: 'CD I', cargaHoraria: 40, salariosPorPadrao: tabelaDentista40h['CD I'] },
  { nome: "Cirurgião-Dentista - Ortodontista", categoria: 'dentista', nivelInicial: 'CD I', cargaHoraria: 40, salariosPorPadrao: tabelaDentista40h['CD I'] },
  { nome: "Cirurgião-Dentista - Protesista", categoria: 'dentista', nivelInicial: 'CD I', cargaHoraria: 40, salariosPorPadrao: tabelaDentista40h['CD I'] },
  { nome: "Cirurgião-Dentista - Radiologista", categoria: 'dentista', nivelInicial: 'CD I', cargaHoraria: 40, salariosPorPadrao: tabelaDentista40h['CD I'] },
  
  // ENFERMAGEM
  { nome: "Técnico de Enfermagem", categoria: 'enfermagem', nivelInicial: 'E III', cargaHoraria: 40, salariosPorPadrao: tabelaEnfermagem40h['E III'] },
  { nome: "Enfermeiro", categoria: 'enfermagem', nivelInicial: 'E V', cargaHoraria: 40, salariosPorPadrao: tabelaEnfermagem40h['E V'] },
  { nome: "Enfermeiro - Saúde do Trabalho", categoria: 'enfermagem', nivelInicial: 'E V', cargaHoraria: 40, salariosPorPadrao: tabelaEnfermagem40h['E V'] },
  { nome: "Enfermeiro - Saúde Mental", categoria: 'enfermagem', nivelInicial: 'E V', cargaHoraria: 40, salariosPorPadrao: tabelaEnfermagem40h['E V'] },
  
  // MÉDICOS - 20h
  { nome: "Médico - Alergista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Angiologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Cardiologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Cirurgião Geral", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Cirurgião Geral Ambulatório", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Clínico Geral", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Dermatologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Endocrinologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Especialista em Cabeça e Pescoço", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Especialista em Ultrassonografia", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Gastroenterologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Ginecologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Hematologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Infectologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Mastologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Medicina do Trabalho", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Nefrologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Neurologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Neuropediatra", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Oftalmologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Oncologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Ortopedista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Otorrinolaringologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Pediatra", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Perito", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Pneumologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Pneumologista Infantil", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Proctologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Psiquiatra", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Psiquiatra Infantojuvenil", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Regulador", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Reumatologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Urologista", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Veterinário", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Veterinário Cirurgião", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 20, salariosPorPadrao: tabelaMedico20h['M I'] },
  { nome: "Médico - Saúde da Família e Comunidade", categoria: 'medico', nivelInicial: 'M I', cargaHoraria: 40, salariosPorPadrao: tabelaMedico40h['M I'] },
].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

export function calcularSalario(cargo: CargoInfo, anosServico: number): number {
  // Cada padrão corresponde a 3 anos de serviço
  const padrao = Math.min(Math.floor(anosServico / 3), cargo.salariosPorPadrao.length - 1);
  return cargo.salariosPorPadrao[padrao];
}

export function getPadraoAtual(anosServico: number): string {
  const padroes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
  const indice = Math.min(Math.floor(anosServico / 3), padroes.length - 1);
  return padroes[indice];
}
