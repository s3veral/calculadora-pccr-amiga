import { useState } from 'react';
import { cargos, calcularSalario, calcularSalarioAnterior, getPadraoAtual, CargoInfo } from '@/data/cargos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import SalaryComposition from '@/components/SalaryComposition';
import SalaryComparison from '@/components/SalaryComparison';
import NameSearch from '@/components/NameSearch';

interface ResultadoCargo {
  tipo: 'cargo';
  cargo: string;
  categoria: string;
  anos: number;
  salarioNovo: number;
  salarioAnterior: number;
  aumento: number;
  percentual: number;
  padrao: string;
  cargaHoraria: number;
}

interface ComposicaoSalarial {
  comissao: number;
  portaria: number;
  anuenio: number;
  insalubridade: number;
  periculosidade: number;
  adicionalNoturno: number;
  horasExtras: number;
  gratificacao: number;
  outrosVencimentos: number;
  descontos: number;
}

interface ResultadoMatricula {
  tipo: 'matricula';
  nome: string;
  cargo: string;
  cargoEquivalente?: string;
  cargoAproximado?: string;
  categoria?: string;
  matricula: string;
  salarioBaseAtual: number;
  brutoAtual: number;
  liquidoAtual: number;
  composicao: ComposicaoSalarial;
  dataAdmissao: string;
  anosServico: number;
  salarioNovo: number;
  aumento: number;
  percentual: number;
  cargaHoraria: number;
  secretaria: string;
}

interface HistoricoItem {
  ano: number;
  mes: number;
  cargo: string;
  baseSalarial: number;
  bruto: number;
  liquido: number;
  dataAdmissao: string;
  regime: string;
  secretaria: string;
  nome: string;
  comissao?: number;
  portaria?: number;
  anuenio?: number;
  insalubridade?: number;
  periculosidade?: number;
  adicionalNoturno?: number;
  horasExtras?: number;
  gratificacao?: number;
  outrosVencimentos?: number;
  descontos?: number;
}

interface HistoricoData {
  historico: HistoricoItem[];
  evolucao: {
    anoInicial: number;
    anoFinal: number;
    baseSalarialInicial: number;
    baseSalarialFinal: number;
    diferencaAbsoluta: number;
    diferencaPercentual: number;
  } | null;
  matricula: string;
}

type Resultado = ResultadoCargo | ResultadoMatricula;

// Função para verificar se um cargo é da área da saúde (para insalubridade)
const isCargoSaude = (categoria?: string, cargo?: string): boolean => {
  // Categorias explícitas de saúde
  const categoriasSaude = ['saude', 'enfermagem', 'medico', 'dentista'];
  if (categoria && categoriasSaude.includes(categoria)) return true;
  
  // Cargos da saúde que estão na categoria 'geral'
  const cargosSaude = [
    'fisioterapeuta', 'fonoaudiologo', 'fonoaudiólogo', 'psicologo', 'psicólogo',
    'nutricionista', 'farmaceutico', 'farmacêutico', 'terapeuta ocupacional',
    'assistente social', 'auxiliar de farmacia', 'auxiliar de farmácia',
    'auxiliar de saude bucal', 'auxiliar de saúde bucal', 'cuidador de saude mental',
    'cuidador de saúde mental', 'maqueiro', 'biologo', 'biólogo',
    'agente comunitario de saude', 'agente comunitário de saúde',
    'agente de combate', 'acs', 'ace', 'tecnico de enfermagem', 'técnico de enfermagem',
    'auxiliar de enfermagem', 'enfermeiro', 'enfermeira', 'medico', 'médico',
    'dentista', 'cirurgiao-dentista', 'cirurgião-dentista', 'odontologo', 'odontólogo',
    'musicoterapeuta', 'psicomotricista', 'educador fisico', 'educador físico',
    'fiscal sanitario', 'fiscal sanitário'
  ];
  
  if (cargo) {
    const cargoNormalizado = cargo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return cargosSaude.some(c => {
      const cNormalizado = c.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return cargoNormalizado.includes(cNormalizado);
    });
  }
  
  return false;
};

const Index = () => {
  // Estado para modo Cargo
  const [cargoSelecionado, setCargoSelecionado] = useState<CargoInfo | null>(null);
  const [cargaHoraria, setCargaHoraria] = useState<number | null>(null);
  const [anosServico, setAnosServico] = useState<number>(0);
  
  // Estado para modo Matrícula
  const [matricula, setMatricula] = useState<string>('');
  const [carregando, setCarregando] = useState(false);
  
  // Estado para histórico
  const [historicoData, setHistoricoData] = useState<HistoricoData | null>(null);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  
  // Resultado
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const handleCargoChange = (value: string) => {
    const cargo = cargos.find((c) => c.nome === value);
    setCargoSelecionado(cargo || null);
    setResultado(null);
    
    if (cargo) {
      // Sempre define a carga horária - se só tem uma opção, já vem selecionada
      if (cargo.cargasHorariasDisponiveis.length === 1) {
        setCargaHoraria(cargo.cargasHorariasDisponiveis[0]);
      } else {
        setCargaHoraria(null);
      }
    } else {
      setCargaHoraria(null);
    }
  };

  const handleCalcularCargo = () => {
    if (cargoSelecionado && cargaHoraria) {
      const salarioNovo = calcularSalario(cargoSelecionado, anosServico, cargaHoraria);
      const salarioAnterior = calcularSalarioAnterior(cargoSelecionado, anosServico, cargaHoraria);
      const aumento = salarioNovo - salarioAnterior;
      const percentual = salarioAnterior > 0 ? ((aumento / salarioAnterior) * 100) : 0;
      const padrao = getPadraoAtual(anosServico);
      
      setResultado({
        tipo: 'cargo',
        cargo: cargoSelecionado.nome,
        categoria: cargoSelecionado.categoria,
        anos: anosServico,
        salarioNovo,
        salarioAnterior,
        aumento,
        percentual,
        padrao,
        cargaHoraria,
      });
    }
  };

  const calcularAnosServico = (dataAdmissao: string): number => {
    const admissao = new Date(dataAdmissao);
    const hoje = new Date();
    let anos = hoje.getFullYear() - admissao.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesAdmissao = admissao.getMonth();
    if (mesAtual < mesAdmissao || (mesAtual === mesAdmissao && hoje.getDate() < admissao.getDate())) {
      anos--;
    }
    return Math.max(0, anos);
  };

  const encontrarCargoCorrespondente = (cargoAPI: string): { cargo: CargoInfo; ch: number; aproximado?: string } | null => {
    const cargoNormalizado = cargoAPI.toLowerCase().trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove acentos
    
    // Tenta encontrar correspondência direta
    for (const cargo of cargos) {
      const nomeNormalizado = cargo.nome.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (cargoNormalizado.includes(nomeNormalizado) || nomeNormalizado.includes(cargoNormalizado)) {
        return { cargo, ch: cargo.cargasHorariasDisponiveis[0] };
      }
    }
    
    // Mapeamentos de cargos inexistentes para cargos equivalentes no PCCR
    const mapeamentos: { [key: string]: { equivalente: string; aproximado?: string } } = {
      // Administrativos
      'auxiliar administrativo': { equivalente: 'Agente Administrativo', aproximado: 'Auxiliar Administrativo → Agente Administrativo' },
      'aux. adm': { equivalente: 'Agente Administrativo', aproximado: 'Aux. Adm. → Agente Administrativo' },
      'aux adm': { equivalente: 'Agente Administrativo', aproximado: 'Aux Adm → Agente Administrativo' },
      'auxiliar adm': { equivalente: 'Agente Administrativo', aproximado: 'Auxiliar Adm → Agente Administrativo' },
      'oficial administrativo': { equivalente: 'Agente Administrativo', aproximado: 'Oficial Administrativo → Agente Administrativo' },
      'escriturario': { equivalente: 'Agente Administrativo', aproximado: 'Escriturário → Agente Administrativo' },
      'agente de administracao': { equivalente: 'Agente Administrativo', aproximado: 'Agente de Administração → Agente Administrativo' },
      'datilografo': { equivalente: 'Agente Administrativo', aproximado: 'Datilógrafo → Agente Administrativo' },
      'telefonista': { equivalente: 'Recepcionista', aproximado: 'Telefonista → Recepcionista' },
      'atendente': { equivalente: 'Recepcionista', aproximado: 'Atendente → Recepcionista' },
      
      // Serviços Gerais
      'vigia': { equivalente: 'Auxiliar de Serviços Gerais', aproximado: 'Vigia → Auxiliar de Serviços Gerais' },
      'servente': { equivalente: 'Auxiliar de Serviços Gerais', aproximado: 'Servente → Auxiliar de Serviços Gerais' },
      'zelador': { equivalente: 'Auxiliar de Serviços Gerais', aproximado: 'Zelador → Auxiliar de Serviços Gerais' },
      'porteiro': { equivalente: 'Auxiliar de Serviços Gerais', aproximado: 'Porteiro → Auxiliar de Serviços Gerais' },
      'gari': { equivalente: 'Auxiliar de Serviços Gerais', aproximado: 'Gari → Auxiliar de Serviços Gerais' },
      'continuo': { equivalente: 'Auxiliar de Serviços Gerais', aproximado: 'Contínuo → Auxiliar de Serviços Gerais' },
      'faxineiro': { equivalente: 'Auxiliar de Serviços Gerais', aproximado: 'Faxineiro → Auxiliar de Serviços Gerais' },
      'faxineira': { equivalente: 'Auxiliar de Serviços Gerais', aproximado: 'Faxineira → Auxiliar de Serviços Gerais' },
      'copeiro': { equivalente: 'Auxiliar de Cozinha', aproximado: 'Copeiro → Auxiliar de Cozinha' },
      'copeira': { equivalente: 'Auxiliar de Cozinha', aproximado: 'Copeira → Auxiliar de Cozinha' },
      'inspetor de aluno': { equivalente: 'Auxiliar de Serviços Gerais', aproximado: 'Inspetor de Aluno → Auxiliar de Serviços Gerais' },
      'inspetor de alunos': { equivalente: 'Auxiliar de Serviços Gerais', aproximado: 'Inspetor de Alunos → Auxiliar de Serviços Gerais' },
      'monitor': { equivalente: 'Auxiliar de Serviços Gerais', aproximado: 'Monitor → Auxiliar de Serviços Gerais' },
      'merendeira': { equivalente: 'Cozinheiro', aproximado: 'Merendeira → Cozinheiro' },
      'merendeiro': { equivalente: 'Cozinheiro', aproximado: 'Merendeiro → Cozinheiro' },
      
      // Saúde
      'psicologo': { equivalente: 'Psicólogo' },
      'psicologa': { equivalente: 'Psicólogo' },
      'assistente social': { equivalente: 'Assistente Social' },
      'enfermeiro': { equivalente: 'Enfermeiro' },
      'enfermeira': { equivalente: 'Enfermeiro' },
      'tecnico de enfermagem': { equivalente: 'Técnico de Enfermagem' },
      'tecnica de enfermagem': { equivalente: 'Técnico de Enfermagem' },
      'aux enfermagem': { equivalente: 'Técnico de Enfermagem', aproximado: 'Aux. Enfermagem → Técnico de Enfermagem' },
      'auxiliar de enfermagem': { equivalente: 'Técnico de Enfermagem', aproximado: 'Auxiliar de Enfermagem → Técnico de Enfermagem' },
      'atendente de enfermagem': { equivalente: 'Técnico de Enfermagem', aproximado: 'Atendente de Enfermagem → Técnico de Enfermagem' },
      'agente comunitario de saude': { equivalente: 'Agente Comunitário de Saúde' },
      'acs': { equivalente: 'Agente Comunitário de Saúde' },
      'agente de combate a endemias': { equivalente: 'Agente de Combate às Endemias' },
      'ace': { equivalente: 'Agente de Combate às Endemias' },
      'agente de saude publica': { equivalente: 'Agente Comunitário de Saúde', aproximado: 'Agente de Saúde Pública → ACS' },
      'cirurgiao dentista': { equivalente: 'Cirurgião-Dentista' },
      'dentista': { equivalente: 'Cirurgião-Dentista', aproximado: 'Dentista → Cirurgião-Dentista' },
      'odontologo': { equivalente: 'Cirurgião-Dentista', aproximado: 'Odontólogo → Cirurgião-Dentista' },
      'fisioterapeuta': { equivalente: 'Fisioterapeuta' },
      'fonoaudiologo': { equivalente: 'Fonoaudiólogo' },
      'fonoaudilogo': { equivalente: 'Fonoaudiólogo' },
      'nutricionista': { equivalente: 'Nutricionista' },
      'farmaceutico': { equivalente: 'Farmacêutico' },
      'bioquimico': { equivalente: 'Farmacêutico', aproximado: 'Bioquímico → Farmacêutico' },
      'terapeuta ocupacional': { equivalente: 'Terapeuta Ocupacional' },
      
      // Operacional/Obras
      'motorista': { equivalente: 'Motorista' },
      'jardineiro': { equivalente: 'Jardineiro' },
      'cozinheiro': { equivalente: 'Cozinheiro' },
      'cozinheira': { equivalente: 'Cozinheiro' },
      'auxiliar de cozinha': { equivalente: 'Auxiliar de Cozinha' },
      'pedreiro': { equivalente: 'Pedreiro de Conservação e Manutenção', aproximado: 'Pedreiro → Pedreiro de Conservação' },
      'eletricista': { equivalente: 'Eletricista' },
      'operador de maquina': { equivalente: 'Condutor de Máquina Pesada', aproximado: 'Operador de Máquina → Condutor de Máquina Pesada' },
      'operador de maquinas': { equivalente: 'Condutor de Máquina Pesada', aproximado: 'Operador de Máquinas → Condutor de Máquina Pesada' },
      'tratorista': { equivalente: 'Condutor de Máquina Pesada', aproximado: 'Tratorista → Condutor de Máquina Pesada' },
      'mecanico': { equivalente: 'Mecânico de Veículos' },
      'bombeiro hidraulico': { equivalente: 'Artífice de Obras e Serviços Públicos', aproximado: 'Bombeiro Hidráulico → Artífice de Obras' },
      'carpinteiro': { equivalente: 'Artífice de Obras e Serviços Públicos', aproximado: 'Carpinteiro → Artífice de Obras' },
      'pintor': { equivalente: 'Artífice de Obras e Serviços Públicos', aproximado: 'Pintor → Artífice de Obras' },
      'calceteiro': { equivalente: 'Artífice de Obras e Serviços Públicos', aproximado: 'Calceteiro → Artífice de Obras' },
      
      // Técnicos
      'tecnico em contabilidade': { equivalente: 'Técnico em Contabilidade' },
      'tecnico contabil': { equivalente: 'Técnico em Contabilidade', aproximado: 'Técnico Contábil → Téc. Contabilidade' },
      'tecnico agricola': { equivalente: 'Técnico Agrícola' },
      'tecnico de seguranca': { equivalente: 'Técnico de Segurança do Trabalho' },
      
      // Nível Superior
      'advogado': { equivalente: 'Advogado' },
      'contador': { equivalente: 'Contador' },
      'engenheiro': { equivalente: 'Engenheiro' },
      'engenheiro civil': { equivalente: 'Engenheiro Civil' },
      'arquiteto': { equivalente: 'Arquiteto' },
      'economista': { equivalente: 'Economista' },
      'biologo': { equivalente: 'Biólogo' },
      'veterinario': { equivalente: 'Fiscal Sanitário - Veterinário', aproximado: 'Veterinário → Fiscal Sanitário - Veterinário' },
      'medico veterinario': { equivalente: 'Fiscal Sanitário - Veterinário', aproximado: 'Médico Veterinário → Fiscal Sanitário - Veterinário' },
      
      // Recepção
      'recepcionista': { equivalente: 'Recepcionista' },
      
      // Segurança
      'guarda municipal': { equivalente: 'Guarda Ambiental', aproximado: 'Guarda Municipal → Guarda Ambiental' },
      'guarda': { equivalente: 'Guarda Ambiental', aproximado: 'Guarda → Guarda Ambiental' },
      
      // Educação (se não existir no PCCR, aproximar)
      'professor doc i': { equivalente: 'Educador Social', aproximado: 'Professor Doc I → Educador Social' },
      'professor doc ii': { equivalente: 'Educador Social', aproximado: 'Professor Doc II → Educador Social' },
      'inspetor escolar': { equivalente: 'Educador Social', aproximado: 'Inspetor Escolar → Educador Social' },
      'professor': { equivalente: 'Educador Social', aproximado: 'Professor → Educador Social' },
      'orientador educacional': { equivalente: 'Educador Social', aproximado: 'Orientador Educacional → Educador Social' },
      'orientador pedagogico': { equivalente: 'Educador Social', aproximado: 'Orientador Pedagógico → Educador Social' },
      'supervisor escolar': { equivalente: 'Educador Social', aproximado: 'Supervisor Escolar → Educador Social' },
      
      // Fiscalização
      'fiscal': { equivalente: 'Fiscal de Posturas', aproximado: 'Fiscal → Fiscal de Posturas' },
      'fiscal de obras': { equivalente: 'Fiscal de Obras' },
      'fiscal de posturas': { equivalente: 'Fiscal de Posturas' },
    };
    
    for (const [chave, valor] of Object.entries(mapeamentos)) {
      const chaveNormalizada = chave.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (cargoNormalizado.includes(chaveNormalizada)) {
        const cargoEncontrado = cargos.find(c => c.nome === valor.equivalente);
        if (cargoEncontrado) {
          return { 
            cargo: cargoEncontrado, 
            ch: cargoEncontrado.cargasHorariasDisponiveis[0],
            aproximado: valor.aproximado
          };
        }
      }
    }
    
    return null;
  };

  const handleConsultarMatricula = async () => {
    if (!matricula.trim()) {
      toast.error('Digite uma matrícula válida');
      return;
    }

    setCarregando(true);
    setResultado(null);
    setHistoricoData(null);
    setMostrarHistorico(false);

    try {
      // Busca na API os dados mais recentes (ano 2025, mês atual ou anterior)
      const hoje = new Date();
      const ano = hoje.getFullYear();
      const mes = hoje.getMonth(); // 0-indexed, então se for janeiro, pega dezembro do ano anterior
      
      const tentativas = [
        { ano: 2025, mes: 5 },
        { ano: 2025, mes: 4 },
        { ano: 2025, mes: 3 },
        { ano: ano, mes: mes > 0 ? mes : 12 },
      ];

      let dadosServidor = null;

      for (const tentativa of tentativas) {
        const url = `https://transparencia.pmspa.rj.gov.br/sincronia/apidados.rule?sys=LAI&api=salarios_servidores_bruto_liquido&ano=${tentativa.ano}&mes=${String(tentativa.mes).padStart(2, '0')}`;
        
        try {
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.status === 'sucess' && data.dados) {
            const servidor = data.dados.find((s: any) => 
              s.MATRICULA === matricula.trim() || 
              s.MATRICULA === matricula.trim().padStart(5, '0')
            );
            
            if (servidor) {
              dadosServidor = servidor;
              break;
            }
          }
        } catch {
          continue;
        }
      }

      if (!dadosServidor) {
        toast.error('Matrícula não encontrada. Verifique o número e tente novamente.');
        setCarregando(false);
        return;
      }

      const anosCalc = calcularAnosServico(dadosServidor.DATA_ADMISSAO);
      const correspondencia = encontrarCargoCorrespondente(dadosServidor.CARGO);
      
      if (!correspondencia) {
        toast.warning(`Cargo "${dadosServidor.CARGO}" não encontrado na tabela PCCR. Mostrando dados atuais.`);
        setResultado({
          tipo: 'matricula',
          nome: dadosServidor.NOME,
          cargo: dadosServidor.CARGO,
          matricula: dadosServidor.MATRICULA,
          salarioBaseAtual: parseFloat(dadosServidor.BASE_SALARIAL) || 0,
          brutoAtual: parseFloat(dadosServidor.BRUTO) || 0,
          liquidoAtual: parseFloat(dadosServidor.LIQUIDO) || 0,
          composicao: {
            comissao: parseFloat(dadosServidor.COMISSAO) || 0,
            portaria: parseFloat(dadosServidor.PORTARIA) || 0,
            anuenio: parseFloat(dadosServidor.ANUENIO) || 0,
            insalubridade: parseFloat(dadosServidor.INSALUBRIDADE) || 0,
            periculosidade: parseFloat(dadosServidor.PERICULOSIDADE) || 0,
            adicionalNoturno: parseFloat(dadosServidor.ADICIONAL_NOTURNO) || 0,
            horasExtras: parseFloat(dadosServidor.HORAS_EXTRAS) || 0,
            gratificacao: parseFloat(dadosServidor.GRATIFICACAO) || 0,
            outrosVencimentos: parseFloat(dadosServidor.OUTROS_VENCIMENTOS) || 0,
            descontos: parseFloat(dadosServidor.DESCONTOS) || 0,
          },
          dataAdmissao: dadosServidor.DATA_ADMISSAO,
          anosServico: anosCalc,
          salarioNovo: 0,
          aumento: 0,
          percentual: 0,
          cargaHoraria: 40,
          secretaria: dadosServidor.SECRETARIA,
        });
        setCarregando(false);
        return;
      }

      const salarioNovo = calcularSalario(correspondencia.cargo, anosCalc, correspondencia.ch);
      const salarioAnterior = parseFloat(dadosServidor.BASE_SALARIAL) || 0;
      const aumento = salarioNovo - salarioAnterior;
      const percentual = salarioAnterior > 0 ? ((aumento / salarioAnterior) * 100) : 0;

      if (correspondencia.aproximado) {
        toast.info(`Cargo aproximado: ${correspondencia.aproximado}`);
      }

      setResultado({
        tipo: 'matricula',
        nome: dadosServidor.NOME,
        cargo: dadosServidor.CARGO,
        cargoEquivalente: correspondencia.cargo.nome,
        cargoAproximado: correspondencia.aproximado,
        categoria: correspondencia.cargo.categoria,
        matricula: dadosServidor.MATRICULA,
        salarioBaseAtual: salarioAnterior,
        brutoAtual: parseFloat(dadosServidor.BRUTO) || 0,
        liquidoAtual: parseFloat(dadosServidor.LIQUIDO) || 0,
        composicao: {
          comissao: parseFloat(dadosServidor.COMISSAO) || 0,
          portaria: parseFloat(dadosServidor.PORTARIA) || 0,
          anuenio: parseFloat(dadosServidor.ANUENIO) || 0,
          insalubridade: parseFloat(dadosServidor.INSALUBRIDADE) || 0,
          periculosidade: parseFloat(dadosServidor.PERICULOSIDADE) || 0,
          adicionalNoturno: parseFloat(dadosServidor.ADICIONAL_NOTURNO) || 0,
          horasExtras: parseFloat(dadosServidor.HORAS_EXTRAS) || 0,
          gratificacao: parseFloat(dadosServidor.GRATIFICACAO) || 0,
          outrosVencimentos: parseFloat(dadosServidor.OUTROS_VENCIMENTOS) || 0,
          descontos: parseFloat(dadosServidor.DESCONTOS) || 0,
        },
        dataAdmissao: dadosServidor.DATA_ADMISSAO,
        anosServico: anosCalc,
        salarioNovo,
        aumento,
        percentual,
        cargaHoraria: correspondencia.ch,
        secretaria: dadosServidor.SECRETARIA,
      });

    } catch (error) {
      console.error('Erro ao consultar API:', error);
      toast.error('Erro ao consultar a API. Tente novamente mais tarde.');
    }

    setCarregando(false);
  };

  const handleBuscarHistorico = async (mat: string) => {
    setCarregandoHistorico(true);
    setMostrarHistorico(true);
    setHistoricoData(null);

    try {
      const { data, error } = await supabase.functions.invoke('historico-salarial', {
        body: { matricula: mat }
      });

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        toast.error('Erro ao buscar histórico salarial');
        setCarregandoHistorico(false);
        return;
      }

      setHistoricoData(data as HistoricoData);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast.error('Erro ao buscar histórico salarial');
    }

    setCarregandoHistorico(false);
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (dataStr: string) => {
    if (!dataStr) return 'N/A';
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR');
  };

  const podeCalcular = cargoSelecionado && cargaHoraria;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">
            📊 Calculadora PCCR
          </h1>
          <p className="text-muted-foreground">
            São Pedro da Aldeia - PLC 0017/2025
          </p>
        </div>

        {/* Calculadora com Tabs */}
        <Card className="border-primary/20 shadow-lg">
          <Tabs defaultValue="cargo" className="w-full">
            <CardHeader className="bg-primary/5 pb-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cargo">💼 Por Cargo</TabsTrigger>
                <TabsTrigger value="matricula">🔢 Por Matrícula</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Modo Cargo */}
              <TabsContent value="cargo" className="space-y-6 mt-0">
                <CardDescription className="text-center">
                  Selecione seu cargo, carga horária e informe o tempo de serviço
                </CardDescription>

                {/* Seleção de Cargo */}
                <div className="space-y-2">
                  <Label htmlFor="cargo" className="text-sm font-medium">
                    🏛️ Cargo
                  </Label>
                  <Select onValueChange={handleCargoChange}>
                    <SelectTrigger id="cargo" className="w-full">
                      <SelectValue placeholder="Selecione seu cargo..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] bg-background">
                      {cargos.map((cargo) => (
                        <SelectItem key={cargo.nome} value={cargo.nome}>
                          {cargo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Seleção de Carga Horária - SEMPRE APARECE quando tem cargo */}
                {cargoSelecionado && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      ⏰ Carga Horária Semanal
                    </Label>
                    <RadioGroup
                      value={cargaHoraria?.toString() || ''}
                      onValueChange={(value) => {
                        setCargaHoraria(parseInt(value));
                        setResultado(null);
                      }}
                      className="flex flex-wrap gap-4"
                    >
                      {cargoSelecionado.cargasHorariasDisponiveis.map((ch) => (
                        <div key={ch} className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value={ch.toString()} 
                            id={`ch-${ch}`}
                            disabled={cargoSelecionado.cargasHorariasDisponiveis.length === 1}
                          />
                          <Label 
                            htmlFor={`ch-${ch}`} 
                            className={`cursor-pointer font-medium ${
                              cargoSelecionado.cargasHorariasDisponiveis.length === 1 
                                ? 'text-primary' 
                                : ''
                            }`}
                          >
                            {ch}h
                            {cargoSelecionado.cargasHorariasDisponiveis.length === 1 && (
                              <span className="text-xs text-muted-foreground ml-1">(única opção)</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Info do cargo selecionado */}
                {cargoSelecionado && cargaHoraria && (
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    📋 Carga horária: {cargaHoraria}h | Nível: {cargoSelecionado.nivelInicial}
                  </p>
                )}

                {/* Tempo de Serviço */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">
                    ⏱️ Tempo de Casa: <span className="text-primary font-bold">{anosServico} anos</span>
                  </Label>
                  <Slider
                    value={[anosServico]}
                    onValueChange={(value) => {
                      setAnosServico(value[0]);
                      setResultado(null);
                    }}
                    max={45}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={45}
                      value={anosServico}
                      onChange={(e) => {
                        const val = Math.min(45, Math.max(0, parseInt(e.target.value) || 0));
                        setAnosServico(val);
                        setResultado(null);
                      }}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">anos de serviço</span>
                  </div>
                </div>

                {/* Botão Calcular */}
                <Button
                  onClick={handleCalcularCargo}
                  disabled={!podeCalcular}
                  className="w-full text-lg py-6"
                  size="lg"
                >
                  🧮 Calcular Salário
                </Button>
              </TabsContent>

              {/* Modo Matrícula */}
              <TabsContent value="matricula" className="space-y-6 mt-0">
                <CardDescription className="text-center">
                  Busque por matrícula ou nome para consultar dados do Portal da Transparência
                </CardDescription>

                {/* Busca por Nome */}
                <NameSearch 
                  onSelectServidor={(mat) => {
                    setMatricula(mat);
                    // Auto-consultar após selecionar
                    setTimeout(() => {
                      const btn = document.getElementById('btn-consultar-matricula');
                      if (btn) btn.click();
                    }, 100);
                  }}
                  formatarMoeda={formatarMoeda}
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-[10px] font-semibold px-2 py-1 rounded-full">
                      BUSCA POR MATRÍCULA
                    </span>
                  </div>
                  <Label htmlFor="matricula" className="text-sm font-medium">
                    🔢 Digite o número da matrícula
                  </Label>
                  <Input
                    id="matricula"
                    type="text"
                    placeholder="Ex: 12345, 00123..."
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <Button
                  id="btn-consultar-matricula"
                  onClick={handleConsultarMatricula}
                  disabled={carregando || !matricula.trim()}
                  className="w-full text-lg py-6"
                  size="lg"
                >
                  {carregando ? '⏳ Consultando...' : '🔍 Consultar'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  * Os dados são obtidos da API pública do Portal da Transparência de SPA
                </p>
              </TabsContent>

              {/* Resultado - compartilhado entre os dois modos */}
              {resultado && (
                <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 mt-6 pt-6 border-t">
                  {/* Resultado por Cargo */}
                  {resultado.tipo === 'cargo' && (
                    <>
                      <Card className="bg-primary/10 border-primary/30">
                        <CardContent className="pt-6 text-center space-y-3">
                          <p className="text-lg">
                            Para o cargo de <span className="font-bold text-primary">{resultado.cargo}</span> ({resultado.cargaHoraria}h), 
                            com <span className="font-bold text-primary">{resultado.anos} anos</span> de serviço:
                          </p>
                          <p className="text-4xl font-bold text-primary">
                            {formatarMoeda(resultado.salarioNovo)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Padrão: {resultado.padrao}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Comparação */}
                      <Card className="bg-muted/30 border-muted">
                        <CardContent className="pt-6 space-y-4">
                          <h3 className="font-semibold text-center text-lg">📊 Comparativo</h3>
                          
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-3 bg-background rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">💰 Antes (base + anuênio)</p>
                              <p className="text-xl font-bold text-muted-foreground">{formatarMoeda(resultado.salarioAnterior)}</p>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">🎉 Com PCCR</p>
                              <p className="text-xl font-bold text-primary">{formatarMoeda(resultado.salarioNovo)}</p>
                            </div>
                          </div>

                          <div className="text-center p-4 bg-background rounded-lg border">
                            <p className="text-sm text-muted-foreground mb-2">Diferença</p>
                            <p className={`text-2xl font-bold ${resultado.aumento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {resultado.aumento >= 0 ? '+' : ''}{formatarMoeda(resultado.aumento)}
                            </p>
                            <p className={`text-lg font-semibold ${resultado.aumento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({resultado.aumento >= 0 ? '+' : ''}{resultado.percentual.toFixed(2)}%)
                            </p>
                          </div>

                          <p className="text-xs text-muted-foreground text-center">
                            * Cálculo anterior considera: salário base inicial + anuênio de 1% ao ano
                          </p>
                        </CardContent>
                      </Card>

                      {/* Insalubridade para cargos da saúde */}
                      {isCargoSaude(resultado.categoria, resultado.cargo) && (
                        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                          <CardContent className="pt-6 space-y-4">
                            <h3 className="font-semibold text-center text-lg text-green-800 dark:text-green-200">
                              🏥 Estimativa com Insalubridade
                            </h3>
                            <p className="text-xs text-center text-green-700 dark:text-green-300">
                              Valores estimados caso receba adicional de insalubridade sobre o salário base PCCR
                            </p>
                            
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="p-3 bg-background rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-xs text-muted-foreground mb-1">Grau Mínimo</p>
                                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                  {formatarMoeda(resultado.salarioNovo * 1.10)}
                                </p>
                                <p className="text-xs text-green-600">+{formatarMoeda(resultado.salarioNovo * 0.10)} (+10%)</p>
                              </div>
                              <div className="p-3 bg-background rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-xs text-muted-foreground mb-1">Grau Médio</p>
                                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                  {formatarMoeda(resultado.salarioNovo * 1.20)}
                                </p>
                                <p className="text-xs text-green-600">+{formatarMoeda(resultado.salarioNovo * 0.20)} (+20%)</p>
                              </div>
                              <div className="p-3 bg-background rounded-lg border border-green-200 dark:border-green-800">
                                <p className="text-xs text-muted-foreground mb-1">Grau Máximo</p>
                                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                  {formatarMoeda(resultado.salarioNovo * 1.40)}
                                </p>
                                <p className="text-xs text-green-600">+{formatarMoeda(resultado.salarioNovo * 0.40)} (+40%)</p>
                              </div>
                            </div>
                            
                            <p className="text-xs text-center text-green-600 dark:text-green-400">
                              ⚠️ Valores ilustrativos. O percentual real depende da avaliação do ambiente de trabalho.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}

                  {/* Resultado por Matrícula */}
                  {resultado.tipo === 'matricula' && (
                    <>
                      <Card className="bg-primary/10 border-primary/30">
                        <CardContent className="pt-6 space-y-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-primary">{resultado.nome}</p>
                            <p className="text-sm text-muted-foreground">Matrícula: {resultado.matricula}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-background/50 p-2 rounded">
                              <p className="text-muted-foreground">Cargo:</p>
                              <p className="font-medium">{resultado.cargo}</p>
                              {resultado.cargoAproximado && (
                                <p className="text-xs text-amber-600 mt-1">
                                  ⚡ {resultado.cargoAproximado}
                                </p>
                              )}
                            </div>
                            <div className="bg-background/50 p-2 rounded">
                              <p className="text-muted-foreground">Admissão:</p>
                              <p className="font-medium">{formatarData(resultado.dataAdmissao)}</p>
                            </div>
                            <div className="bg-background/50 p-2 rounded">
                              <p className="text-muted-foreground">Tempo de serviço:</p>
                              <p className="font-medium">{resultado.anosServico} anos</p>
                            </div>
                            <div className="bg-background/50 p-2 rounded">
                              <p className="text-muted-foreground">Secretaria:</p>
                              <p className="font-medium text-xs">{resultado.secretaria}</p>
                            </div>
                          </div>

                          {resultado.salarioNovo > 0 ? (
                            <div className="text-center pt-4 border-t">
                              <p className="text-sm text-muted-foreground mb-2">Salário Base Estimado (PCCR)</p>
                              <p className="text-4xl font-bold text-primary">
                                {formatarMoeda(resultado.salarioNovo)}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center pt-4 border-t">
                              <p className="text-sm text-destructive">
                                ⚠️ Cargo não encontrado na tabela PCCR
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Detalhamento do Bruto/Líquido com novo componente */}
                      {resultado.brutoAtual > 0 && (
                        <SalaryComposition
                          salarioBase={resultado.salarioBaseAtual}
                          bruto={resultado.brutoAtual}
                          liquido={resultado.liquidoAtual}
                          composicao={resultado.composicao}
                          formatarMoeda={formatarMoeda}
                        />
                      )}

                      {resultado.salarioNovo > 0 && (
                        <>
                          <SalaryComparison
                            salarioBaseAtual={resultado.salarioBaseAtual}
                            salarioNovoPCCR={resultado.salarioNovo}
                            anosServico={resultado.anosServico}
                            formatarMoeda={formatarMoeda}
                            isCargoSaude={isCargoSaude(resultado.categoria, resultado.cargo)}
                            composicaoInsalubridade={resultado.composicao.insalubridade}
                          />

                          {/* Botão para ver histórico */}
                          <Button
                            variant="outline"
                            onClick={() => handleBuscarHistorico(resultado.matricula)}
                            disabled={carregandoHistorico}
                            className="w-full"
                          >
                            {carregandoHistorico ? '⏳ Carregando...' : '📈 Ver Histórico Salarial (2018-2025)'}
                          </Button>
                        </>
                      )}

                      {/* Histórico Salarial */}
                      {mostrarHistorico && (
                        <Card className="bg-muted/30 border-muted">
                          <CardContent className="pt-6 space-y-4">
                            <h3 className="font-semibold text-center text-lg">📈 Histórico Salarial</h3>
                            
                            {carregandoHistorico && (
                              <div className="text-center py-8">
                                <p className="text-muted-foreground">Buscando histórico em múltiplos anos...</p>
                                <p className="text-xs text-muted-foreground mt-1">Isso pode levar alguns segundos</p>
                              </div>
                            )}

                            {historicoData && historicoData.historico.length > 0 && (
                              <>
                                {/* Evolução geral */}
                                {historicoData.evolucao && (
                                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                                    <p className="text-sm text-muted-foreground mb-2">
                                      Evolução de {historicoData.evolucao.anoInicial} a {historicoData.evolucao.anoFinal}
                                    </p>
                                    <p className="text-lg font-bold">
                                      {formatarMoeda(historicoData.evolucao.baseSalarialInicial)} → {formatarMoeda(historicoData.evolucao.baseSalarialFinal)}
                                    </p>
                                    <p className={`text-sm font-semibold ${historicoData.evolucao.diferencaPercentual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {historicoData.evolucao.diferencaPercentual >= 0 ? '+' : ''}
                                      {historicoData.evolucao.diferencaPercentual.toFixed(2)}% no período
                                    </p>
                                  </div>
                                )}

                                {/* Tabela de histórico */}
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-center">Base Salarial por Ano</p>
                                  <div className="max-h-48 overflow-y-auto space-y-1">
                                    {historicoData.historico.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center p-2 bg-background rounded text-sm">
                                        <span className="text-muted-foreground">{item.ano}/{String(item.mes).padStart(2, '0')}</span>
                                        <span className="font-medium">{formatarMoeda(item.baseSalarial)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}

                            {historicoData && historicoData.historico.length === 0 && (
                              <div className="text-center py-4">
                                <p className="text-muted-foreground">Nenhum histórico encontrado para esta matrícula</p>
                              </div>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setMostrarHistorico(false)}
                              className="w-full"
                            >
                              Fechar histórico
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}

                  {/* A piadinha - só aparece se aumento < 25% */}
                  {resultado.percentual < 25 && (
                    <div className="text-center p-3 sm:p-4 bg-amber-100/80 dark:bg-amber-900/40 rounded-lg border-2 border-dashed border-amber-400 dark:border-amber-600">
                      <p className="text-sm sm:text-base font-medium text-amber-800 dark:text-amber-200">
                        E aí, efetivo? Achou que seu aumento seria de quanto? <span className="font-bold">25%?!</span> 😏 HAHAHAHA
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Tabs>
        </Card>

        {/* Footer Legal */}
        <footer className="text-center space-y-4 text-xs text-muted-foreground border-t pt-6">
          <div className="space-y-2">
            <p>⚠️ <strong>Aviso Legal:</strong> Os valores apresentados são apenas estimativas baseadas no PLC 0017/2025.</p>
            <p>Os valores finais podem sofrer alterações conforme aprovação e regulamentação da lei.</p>
          </div>
          
          <div className="pt-2 text-[10px] space-y-1">
            <p>A informação dos 25% foi baseada em informações passadas aos servidores ao longo de 2025, extraoficialmente.</p>
            <p>Qualquer semelhança com promessas não cumpridas é mera coincidência. :)</p>
            <p className="pt-2">Os dados referentes a pagamentos, salários base, comissões, portarias e afins foram obtidos através da API do Portal da Transparência.</p>
            <p className="text-[9px] opacity-70">(Que aliás não tem barreira decente nenhuma contra ataques, né, prefeitura? Ah, um DDoS pra ficar esperta...)</p>
          </div>

          <div className="pt-4 mt-4 border-t border-dashed space-y-3">
            <p className="font-medium text-sm text-foreground/80">
              É isso. Boa sorte para todos. 🧊
            </p>
            <p className="text-[11px]">
              Se eu fosse vocês, começava a se mexer pra resolver essa palhaçada.
            </p>
            <p className="text-[11px]">
              Já passou da hora dos servidores criarem vergonha e pressionarem esse governo "pândego" 
              para que paremos de receber essa esmola miserável por nossos serviços.
            </p>
            <p className="font-medium text-[11px] pt-2">
              Bjunda procêis. Usem essas informações com sabedoria.
            </p>
            <p className="text-[10px] pt-2 opacity-80">
              Qualquer atualização oficial que tiverem, mandem para: <br />
              <span className="font-mono bg-muted px-1 rounded">niputu1810@anowt.com</span>
              <br />
              <span className="text-[9px]">(somente texto. Se quiser mandar documentos, fotos, áudios, vídeos ou qualquer outra coisa, mande o link para download.)</span>
            </p>
            <p className="pt-2 text-[10px] opacity-60">Lerigou 🧊</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
