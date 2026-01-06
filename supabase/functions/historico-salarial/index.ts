import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { matricula } = await req.json();

    if (!matricula) {
      return new Response(
        JSON.stringify({ error: 'Matrícula é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Buscando histórico para matrícula: ${matricula}`);

    // Anos para buscar (de 2018 até 2025)
    const anos = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    const historico: any[] = [];

    // Buscar dados de cada ano (mês 12 para ter dados completos, exceto ano atual)
    for (const ano of anos) {
      const mes = ano === 2025 ? 5 : 12; // Para 2025, usar mês mais recente disponível
      
      try {
        const url = `https://transparencia.pmspa.rj.gov.br/sincronia/apidados.rule?sys=LAI&api=salarios_servidores_bruto_liquido&ano=${ano}&mes=${mes}`;
        console.log(`Buscando: ${url}`);
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'sucess' && data.dados) {
          // Buscar o servidor específico pela matrícula
          const servidor = data.dados.find((s: any) => 
            s.MATRICULA === matricula || 
            s.MATRICULA === String(matricula).padStart(5, '0')
          );

          if (servidor) {
            historico.push({
              ano,
              mes,
              cargo: servidor.CARGO,
              baseSalarial: parseFloat(servidor.BASE_SALARIAL) || 0,
              bruto: parseFloat(servidor.BRUTO) || 0,
              liquido: parseFloat(servidor.LIQUIDO) || 0,
              dataAdmissao: servidor.DATA_ADMISSAO,
              regime: servidor.DESCRICAO_REGIME,
              secretaria: servidor.SECRETARIA,
              nome: servidor.NOME,
              // Campos detalhados da composição salarial
              comissao: parseFloat(servidor.COMISSAO) || 0,
              portaria: parseFloat(servidor.PORTARIA) || 0,
              anuenio: parseFloat(servidor.ANUENIO) || 0,
              insalubridade: parseFloat(servidor.INSALUBRIDADE) || 0,
              periculosidade: parseFloat(servidor.PERICULOSIDADE) || 0,
              adicionalNoturno: parseFloat(servidor.ADICIONAL_NOTURNO) || 0,
              horasExtras: parseFloat(servidor.HORAS_EXTRAS) || 0,
              gratificacao: parseFloat(servidor.GRATIFICACAO) || 0,
              outrosVencimentos: parseFloat(servidor.OUTROS_VENCIMENTOS) || 0,
              descontos: parseFloat(servidor.DESCONTOS) || 0,
            });
            console.log(`Encontrado em ${ano}/${mes}: BASE_SALARIAL = ${servidor.BASE_SALARIAL}, BRUTO = ${servidor.BRUTO}`);
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar ano ${ano}:`, error);
        // Continuar mesmo se um ano falhar
      }
    }

    // Ordenar por ano
    historico.sort((a, b) => a.ano - b.ano);

    // Calcular evolução
    let evolucao = null;
    if (historico.length >= 2) {
      const primeiro = historico[0];
      const ultimo = historico[historico.length - 1];
      
      evolucao = {
        anoInicial: primeiro.ano,
        anoFinal: ultimo.ano,
        baseSalarialInicial: primeiro.baseSalarial,
        baseSalarialFinal: ultimo.baseSalarial,
        diferencaAbsoluta: ultimo.baseSalarial - primeiro.baseSalarial,
        diferencaPercentual: primeiro.baseSalarial > 0 
          ? ((ultimo.baseSalarial - primeiro.baseSalarial) / primeiro.baseSalarial) * 100 
          : 0
      };
    }

    console.log(`Histórico encontrado: ${historico.length} registros`);

    return new Response(
      JSON.stringify({ 
        historico, 
        evolucao,
        matricula 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Erro na função historico-salarial:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
