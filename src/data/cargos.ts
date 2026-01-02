// Dados extraídos do PLC 0017/2025 - PCCR São Pedro da Aldeia

export type Categoria = 'geral' | 'saude' | 'dentista' | 'medico' | 'enfermagem';

export interface CargoInfo {
  nome: string;
  categoria: Categoria;
  nivelInicial: string;
  cargasHorariasDisponiveis: number[]; // Opções de CH disponíveis para o cargo
  salariosPorCH: { [ch: number]: number[] }; // Salários por padrão para cada CH
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

// Tabela Cirurgiões-Dentistas
const tabelaDentista40h = {
  'CD I': [4750.00, 4892.50, 5039.28, 5190.45, 5346.17, 5506.55, 5671.75, 5841.90, 6017.16, 6197.67, 6383.60, 6575.11, 6772.36, 6975.54, 7184.80],
  'CD II': [5291.24, 5449.98, 5613.48, 5781.88, 5955.34, 6134.00, 6318.02, 6507.56, 6702.78, 6903.87, 7110.98, 7324.31, 7544.04, 7770.36, 8003.47],
};
const tabelaDentista24h = {
  'CD I': [2850.00, 2935.50, 3023.57, 3114.27, 3207.70, 3303.93, 3403.05, 3505.14, 3610.29, 3718.60, 3830.16, 3945.07, 4063.42, 4185.32, 4310.88],
  'CD II': [3174.74, 3269.99, 3368.09, 3469.13, 3573.20, 3680.40, 3790.81, 3904.53, 4021.67, 4142.32, 4266.59, 4394.59, 4526.42, 4662.22, 4802.08],
};
const tabelaDentista20h = {
  'CD I': [2375.00, 2446.25, 2519.64, 2595.23, 2673.08, 2753.28, 2835.87, 2920.95, 3008.58, 3098.84, 3191.80, 3287.56, 3386.18, 3487.77, 3592.40],
  'CD II': [2645.62, 2724.99, 2806.74, 2890.94, 2977.67, 3067.00, 3159.01, 3253.78, 3351.39, 3451.93, 3555.49, 3662.16, 3772.02, 3885.18, 4001.74],
};

// Tabela Médicos
const tabelaMedico40h = {
  'M I': [9500.00, 9785.00, 10078.55, 10380.91, 10692.33, 11013.10, 11343.50, 11683.80, 12034.32, 12395.35, 12767.21, 13150.22, 13544.73, 13951.07, 14369.60],
  'M II': [10582.48, 10899.95, 11226.95, 11563.76, 11910.67, 12267.99, 12636.03, 13015.11, 13405.57, 13807.73, 14221.96, 14648.62, 15088.08, 15540.72, 16006.95],
};
const tabelaMedico24h = {
  'M I': [5700.00, 5871.00, 6047.13, 6228.54, 6415.40, 6607.86, 6806.10, 7010.28, 7220.59, 7437.21, 7660.32, 7890.13, 8126.84, 8370.64, 8621.76],
  'M II': [6349.49, 6539.97, 6736.17, 6938.26, 7146.40, 7360.80, 7581.62, 7809.07, 8043.34, 8284.64, 8533.18, 8789.17, 9052.85, 9324.43, 9604.17],
};
const tabelaMedico20h = {
  'M I': [4750.00, 4892.50, 5039.28, 5190.45, 5346.17, 5506.55, 5671.75, 5841.90, 6017.16, 6197.67, 6383.60, 6575.11, 6772.36, 6975.54, 7184.80],
  'M II': [5291.24, 5449.98, 5613.48, 5781.88, 5955.34, 6134.00, 6318.02, 6507.56, 6702.78, 6903.87, 7110.98, 7324.31, 7544.04, 7770.36, 8003.47],
};

// Tabela Enfermagem
const tabelaEnfermagem40h = {
  'E I': [2159.09, 2223.86, 2290.58, 2359.30, 2430.07, 2502.98, 2578.07, 2655.41, 2735.07, 2817.12, 2901.64, 2988.69, 3078.35, 3170.70, 3265.82],
  'E II': [2405.11, 2477.26, 2551.58, 2628.13, 2706.97, 2788.18, 2871.82, 2957.98, 3046.72, 3138.12, 3232.26, 3329.23, 3429.11, 3531.98, 3637.94],
  'E III': [3022.73, 3113.41, 3206.81, 3303.02, 3402.11, 3504.17, 3609.30, 3717.58, 3829.10, 3943.98, 4062.30, 4184.17, 4309.69, 4438.98, 4572.15],
  'E IV': [3367.15, 3468.17, 3572.21, 3679.38, 3789.76, 3903.46, 4020.56, 4141.18, 4265.41, 4393.37, 4525.17, 4660.93, 4800.76, 4944.78, 5093.12],
  'E V': [4318.18, 4447.73, 4581.16, 4718.59, 4860.15, 5005.95, 5156.13, 5310.82, 5470.14, 5634.25, 5803.27, 5977.37, 6156.69, 6341.39, 6531.63],
  'E VI': [4810.22, 4954.52, 5103.16, 5256.25, 5413.94, 5576.36, 5743.65, 5915.96, 6093.44, 6276.24, 6464.53, 6658.46, 6858.22, 7063.96, 7275.88],
};
const tabelaEnfermagem24h = {
  'E III': [1814.04, 1868.05, 1924.09, 1981.81, 2041.27, 2102.50, 2165.58, 2230.55, 2297.46, 2366.39, 2437.38, 2510.50, 2585.82, 2663.39, 2743.29],
  'E IV': [2020.29, 2080.90, 2143.33, 2207.63, 2273.86, 2342.07, 2412.34, 2484.71, 2559.25, 2636.02, 2715.10, 2796.56, 2880.46, 2966.87, 3055.87],
};

// Função para calcular salário proporcional
function calcProp(salarios: number[], chOriginal: number, chDesejada: number): number[] {
  return salarios.map(s => Math.round((s * chDesejada / chOriginal) * 100) / 100);
}

// Função helper para criar cargo com múltiplas CHs
function criarCargo(
  nome: string,
  categoria: Categoria,
  nivelInicial: string,
  chs: number[],
  getSalarios: (ch: number) => number[]
): CargoInfo {
  const salariosPorCH: { [ch: number]: number[] } = {};
  chs.forEach(ch => {
    salariosPorCH[ch] = getSalarios(ch);
  });
  return { nome, categoria, nivelInicial, cargasHorariasDisponiveis: chs, salariosPorCH };
}

const cargosData: CargoInfo[] = [
  // AGENTES DA SAÚDE - só 40h
  criarCargo("Agente Comunitário de Saúde", 'saude', 'S I', [40], () => tabelaAgenteSaude['S I']),
  criarCargo("Agente de Combate às Endemias", 'saude', 'S I', [40], () => tabelaAgenteSaude['S I']),
  
  // APOIO À FISCALIZAÇÃO - só 40h
  criarCargo("Auxiliar de Fiscal de Transporte", 'geral', 'G I', [40], () => tabelaGeral40h['G I']),
  
  // APOIO À PROMOÇÃO SOCIAL
  criarCargo("Agente de Ação Social", 'geral', 'G I', [40], () => tabelaGeral40h['G I']),
  criarCargo("Auxiliar de Cuidador Social", 'geral', 'G II', [40], () => tabelaGeral40h['G II']),
  criarCargo("Cuidador Social", 'geral', 'G III', [40], () => tabelaGeral40h['G III']),
  criarCargo("Educador Social", 'geral', 'G II', [20], () => calcProp(tabelaGeral40h['G II'], 40, 20)),
  criarCargo("Entrevistador Social", 'geral', 'G III', [40], () => tabelaGeral40h['G III']),
  
  // APOIO À SAÚDE
  criarCargo("Auxiliar de Farmácia", 'geral', 'G I', [40], () => tabelaGeral40h['G I']),
  criarCargo("Auxiliar de Saúde Bucal", 'geral', 'G II', [40], () => tabelaGeral40h['G II']),
  criarCargo("Cuidador de Saúde Mental", 'geral', 'G I', [40], () => tabelaGeral40h['G I']),
  criarCargo("Maqueiro", 'geral', 'G I', [40], () => tabelaGeral40h['G I']),
  
  // APOIO À SEGURANÇA PÚBLICA
  criarCargo("Agente de Defesa Civil", 'geral', 'G III', [40], () => tabelaGeral40h['G III']),
  
  // APOIO ADMINISTRATIVO-FINANCEIRO
  criarCargo("Agente Administrativo", 'geral', 'G II', [40], () => tabelaGeral40h['G II']),
  criarCargo("Agente de Proteção e Defesa do Consumidor", 'geral', 'G I', [40], () => tabelaGeral40h['G I']),
  criarCargo("Recepcionista", 'geral', 'G II', [40], () => tabelaGeral40h['G II']),
  
  // APOIO AO MEIO AMBIENTE
  criarCargo("Guarda Ambiental", 'geral', 'G II', [40], () => tabelaGeral40h['G II']),
  
  // ESPORTE, LAZER E CULTURA
  criarCargo("Instrutor de Artesanato", 'geral', 'G III', [40], () => tabelaGeral40h['G III']),
  criarCargo("Instrutor de Capoeira", 'geral', 'G II', [40], () => tabelaGeral40h['G II']),
  criarCargo("Instrutor de Dança", 'geral', 'G III', [40], () => tabelaGeral40h['G III']),
  criarCargo("Instrutor de Teatro", 'geral', 'G II', [40], () => tabelaGeral40h['G II']),
  criarCargo("Instrutor Musical", 'geral', 'G III', [40], () => tabelaGeral40h['G III']),
  
  // FISCALIZAÇÃO - NÍVEL SUPERIOR
  criarCargo("Fiscal de Meio Ambiente", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Fiscal de Obras", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Fiscal de Posturas", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Fiscal de Transporte", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Fiscal Sanitário - Biólogo", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Fiscal Sanitário - Cirurgião-Dentista", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Fiscal Sanitário - Enfermeiro", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Fiscal Sanitário - Farmacêutico", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Fiscal Sanitário - Nutricionista", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Fiscal Sanitário - Veterinário", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  
  // NÍVEL SUPERIOR - GERAL
  criarCargo("Advogado", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Analista de Gestão Pública", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Analista de Licitação", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Analista de Tecnologia da Informação", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Arquiteto", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  
  // ASSISTENTE SOCIAL - 20h ou 30h
  criarCargo("Assistente Social", 'geral', 'G IV', [20, 30], (ch) => calcProp(tabelaGeral40h['G IV'], 40, ch)),
  criarCargo("Assistente Social Especialista em Saúde Mental", 'geral', 'G IV', [30], () => calcProp(tabelaGeral40h['G IV'], 40, 30)),
  
  criarCargo("Auditor Interno", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Bibliotecário", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Biólogo", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Comunicador Social", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Contador", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Controlador do Patrimônio Cultural", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Economista", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Educador Físico", 'geral', 'G IV', [20], () => calcProp(tabelaGeral40h['G IV'], 40, 20)),
  criarCargo("Engenheiro", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Engenheiro Ambiental", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Engenheiro Civil", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Engenheiro Eletricista", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Engenheiro Florestal", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Engenheiro Sanitarista", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Farmacêutico", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  
  // FISIOTERAPEUTAS - apenas 30h conforme documento
  criarCargo("Fisioterapeuta", 'geral', 'G IV', [30], () => calcProp(tabelaGeral40h['G IV'], 40, 30)),
  criarCargo("Fisioterapeuta - Especialista em Neurologia", 'geral', 'G IV', [30], () => calcProp(tabelaGeral40h['G IV'], 40, 30)),
  criarCargo("Fisioterapeuta - Especialista em Neuropediatria", 'geral', 'G IV', [30], () => calcProp(tabelaGeral40h['G IV'], 40, 30)),
  criarCargo("Fisioterapeuta - Especialista em Psicomotricidade", 'geral', 'G IV', [30], () => calcProp(tabelaGeral40h['G IV'], 40, 30)),
  criarCargo("Fisioterapeuta - Especialista em Terapia Respiratória", 'geral', 'G IV', [30], () => calcProp(tabelaGeral40h['G IV'], 40, 30)),
  
  // FONOAUDIÓLOGO - apenas 20h conforme documento
  criarCargo("Fonoaudiólogo", 'geral', 'G IV', [20], () => calcProp(tabelaGeral40h['G IV'], 40, 20)),
  
  criarCargo("Geólogo", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Museólogo", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Musicoterapeuta", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Nutricionista", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Procurador Municipal", 'geral', 'G IV', [20], () => calcProp(tabelaGeral40h['G IV'], 40, 20)),
  criarCargo("Produtor Cultural", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Psicomotricista", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  
  // PSICÓLOGOS - 40h conforme documento
  criarCargo("Psicólogo", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Psicólogo - Especialização em Autismo", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  criarCargo("Psicólogo - Especialização em Saúde Mental", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  
  criarCargo("Terapeuta Ocupacional", 'geral', 'G IV', [30], () => calcProp(tabelaGeral40h['G IV'], 40, 30)),
  criarCargo("Turismólogo", 'geral', 'G IV', [40], () => tabelaGeral40h['G IV']),
  
  // NÍVEL TÉCNICO
  criarCargo("Social Media Designer", 'geral', 'G II', [40], () => tabelaGeral40h['G II']),
  criarCargo("Técnico Agrícola", 'geral', 'G III', [40], () => tabelaGeral40h['G III']),
  criarCargo("Técnico Cadista", 'geral', 'G III', [40], () => tabelaGeral40h['G III']),
  criarCargo("Técnico de Arquivo", 'geral', 'G II', [40], () => tabelaGeral40h['G II']),
  criarCargo("Técnico de Segurança do Trabalho", 'geral', 'G III', [40], () => tabelaGeral40h['G III']),
  criarCargo("Técnico de Suporte de T.I.", 'geral', 'G III', [40], () => tabelaGeral40h['G III']),
  criarCargo("Técnico em Contabilidade", 'geral', 'G III', [40], () => tabelaGeral40h['G III']),
  criarCargo("Técnico em Edificações", 'geral', 'G II', [40], () => tabelaGeral40h['G II']),
  criarCargo("Técnico em Geoprocessamento", 'geral', 'G III', [40], () => tabelaGeral40h['G III']),
  criarCargo("Técnico em Órtese e Prótese", 'geral', 'G III', [40], () => tabelaGeral40h['G III']),
  criarCargo("Técnico em Prótese Dentária", 'geral', 'G III', [40], () => tabelaGeral40h['G III']),
  
  // OBRAS E SERVIÇOS PÚBLICOS
  criarCargo("Ajudante de Mecânico de Máquina Pesada", 'geral', 'G II', [40], () => tabelaGeral40h['G II']),
  criarCargo("Apontador", 'geral', 'G II', [40], () => tabelaGeral40h['G II']),
  criarCargo("Artífice de Obras e Serviços Públicos", 'geral', 'G I', [40], () => tabelaGeral40h['G I']),
  criarCargo("Condutor de Máquina Pesada", 'geral', 'G I', [40], () => tabelaGeral40h['G I']),
  criarCargo("Eletricista", 'geral', 'G I', [40], () => tabelaGeral40h['G I']),
  criarCargo("Jardineiro", 'geral', 'G I', [40], () => tabelaGeral40h['G I']),
  criarCargo("Mecânico de Manutenção de Máquina Pesada", 'geral', 'G II', [40], () => tabelaGeral40h['G II']),
  criarCargo("Mecânico de Veículos", 'geral', 'G II', [40], () => tabelaGeral40h['G II']),
  criarCargo("Motorista", 'geral', 'G I', [40], () => tabelaGeral40h['G I']),
  criarCargo("Operador de Retroescavadeira", 'geral', 'G I', [40], () => tabelaGeral40h['G I']),
  criarCargo("Pedreiro de Conservação e Manutenção", 'geral', 'G I', [40], () => tabelaGeral40h['G I']),
  
  // SERVIÇOS GERAIS
  criarCargo("Auxiliar de Cozinha", 'geral', 'G I', [40], () => tabelaGeral40h['G I']),
  criarCargo("Auxiliar de Serviços Gerais", 'geral', 'G I', [40], () => tabelaGeral40h['G I']),
  criarCargo("Coveiro", 'geral', 'G I', [40], () => tabelaGeral40h['G I']),
  criarCargo("Cozinheiro", 'geral', 'G II', [40], () => tabelaGeral40h['G II']),
  
  // CIRURGIÕES-DENTISTAS - 20h, 24h ou 40h
  criarCargo("Cirurgião-Dentista", 'dentista', 'CD I', [20, 24, 40], (ch) => 
    ch === 40 ? tabelaDentista40h['CD I'] : ch === 24 ? tabelaDentista24h['CD I'] : tabelaDentista20h['CD I']),
  criarCargo("Cirurgião-Dentista - Bucomaxilofacial", 'dentista', 'CD I', [40], () => tabelaDentista40h['CD I']),
  criarCargo("Cirurgião-Dentista - Clínico Endodontista", 'dentista', 'CD I', [40], () => tabelaDentista40h['CD I']),
  criarCargo("Cirurgião-Dentista - Clínico Generalista", 'dentista', 'CD I', [40], () => tabelaDentista40h['CD I']),
  criarCargo("Cirurgião-Dentista - Especialista em Pacientes com Deficiência", 'dentista', 'CD I', [40], () => tabelaDentista40h['CD I']),
  criarCargo("Cirurgião-Dentista - Odontopediatra", 'dentista', 'CD I', [40], () => tabelaDentista40h['CD I']),
  criarCargo("Cirurgião-Dentista - Ortodontista", 'dentista', 'CD I', [40], () => tabelaDentista40h['CD I']),
  criarCargo("Cirurgião-Dentista - Protesista", 'dentista', 'CD I', [40], () => tabelaDentista40h['CD I']),
  criarCargo("Cirurgião-Dentista - Radiologista", 'dentista', 'CD I', [40], () => tabelaDentista40h['CD I']),
  
  // ENFERMAGEM - 40h ou 24h para técnicos
  criarCargo("Técnico de Enfermagem", 'enfermagem', 'E III', [24, 40], (ch) => 
    ch === 40 ? tabelaEnfermagem40h['E III'] : tabelaEnfermagem24h['E III']),
  criarCargo("Enfermeiro", 'enfermagem', 'E V', [40], () => tabelaEnfermagem40h['E V']),
  criarCargo("Enfermeiro - Saúde do Trabalho", 'enfermagem', 'E V', [40], () => tabelaEnfermagem40h['E V']),
  criarCargo("Enfermeiro - Saúde Mental", 'enfermagem', 'E V', [40], () => tabelaEnfermagem40h['E V']),
  
  // MÉDICOS - 20h ou 40h
  criarCargo("Médico - Alergista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Angiologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Cardiologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Cirurgião Geral", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Cirurgião Geral Ambulatório", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Clínico Geral", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Dermatologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Endocrinologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Especialista em Cabeça e Pescoço", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Especialista em Ultrassonografia", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Gastroenterologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Ginecologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Hematologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Infectologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Mastologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Medicina do Trabalho", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Nefrologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Neurologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Neuropediatra", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Oftalmologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Oncologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Ortopedista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Otorrinolaringologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Pediatra", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Perito", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Pneumologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Pneumologista Infantil", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Proctologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Psiquiatra", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Psiquiatra Infantojuvenil", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Regulador", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Reumatologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Urologista", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Veterinário", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Veterinário Cirurgião", 'medico', 'M I', [20], () => tabelaMedico20h['M I']),
  criarCargo("Médico - Saúde da Família e Comunidade", 'medico', 'M I', [40], () => tabelaMedico40h['M I']),
];

export const cargos: CargoInfo[] = [...cargosData].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

export function calcularSalario(cargo: CargoInfo, anosServico: number, cargaHoraria: number): number {
  const salarios = cargo.salariosPorCH[cargaHoraria];
  if (!salarios) return 0;
  const padrao = Math.min(Math.floor(anosServico / 3), salarios.length - 1);
  return salarios[padrao];
}

export function calcularSalarioAnterior(cargo: CargoInfo, anosServico: number, cargaHoraria: number): number {
  // Salário anterior = salário base inicial + anuênios (1% por ano)
  const salarios = cargo.salariosPorCH[cargaHoraria];
  if (!salarios) return 0;
  const salarioBase = salarios[0]; // Primeiro padrão (sem progressão)
  const anuenio = salarioBase * (anosServico * 0.01); // 1% por ano
  return salarioBase + anuenio;
}

export function getPadraoAtual(anosServico: number): string {
  const padroes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
  const indice = Math.min(Math.floor(anosServico / 3), padroes.length - 1);
  return padroes[indice];
}
