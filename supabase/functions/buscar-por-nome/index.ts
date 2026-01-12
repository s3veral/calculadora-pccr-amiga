import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para calcular distância de Levenshtein (fuzzy matching)
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

// Normaliza texto para comparação
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Calcula similaridade (0-1)
function similaridade(a: string, b: string): number {
  const aNorm = normalizar(a);
  const bNorm = normalizar(b);
  const maxLen = Math.max(aNorm.length, bNorm.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(aNorm, bNorm) / maxLen;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome, limite = 10 } = await req.json();

    if (!nome || nome.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: 'Digite pelo menos 3 caracteres para buscar' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Buscando servidores com nome similar a: ${nome}`);

    // Buscar dados mais recentes
    const tentativas = [
      { ano: 2025, mes: 5 },
      { ano: 2025, mes: 4 },
      { ano: 2025, mes: 3 },
    ];

    let todosServidores: any[] = [];

    for (const tentativa of tentativas) {
      const url = `https://transparencia.pmspa.rj.gov.br/sincronia/apidados.rule?sys=LAI&api=salarios_servidores_bruto_liquido&ano=${tentativa.ano}&mes=${String(tentativa.mes).padStart(2, '0')}`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'sucess' && data.dados && data.dados.length > 0) {
          todosServidores = data.dados;
          console.log(`Encontrados ${todosServidores.length} servidores em ${tentativa.ano}/${tentativa.mes}`);
          break;
        }
      } catch (error) {
        console.error(`Erro ao buscar ${tentativa.ano}/${tentativa.mes}:`, error);
        continue;
      }
    }

    if (todosServidores.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Não foi possível acessar a base de dados' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const nomeNorm = normalizar(nome);
    const palavras = nomeNorm.split(' ').filter(p => p.length > 2);

    // Buscar correspondências
    const resultados = todosServidores
      .map((servidor: any) => {
        const nomeServidor = servidor.NOME || '';
        const nomeServidorNorm = normalizar(nomeServidor);
        
        // Calcular score de similaridade
        let score = 0;
        
        // Correspondência exata parcial (contém o termo buscado)
        if (nomeServidorNorm.includes(nomeNorm)) {
          score = 0.95;
        } else {
          // Verificar palavras individuais
          const palavrasServidor = nomeServidorNorm.split(' ');
          let matches = 0;
          let totalSim = 0;
          
          for (const palavra of palavras) {
            let melhorSim = 0;
            for (const palavraServ of palavrasServidor) {
              const sim = similaridade(palavra, palavraServ);
              if (sim > melhorSim) melhorSim = sim;
            }
            if (melhorSim > 0.7) matches++;
            totalSim += melhorSim;
          }
          
          // Score baseado em matches e similaridade média
          score = (matches / palavras.length) * 0.6 + (totalSim / palavras.length) * 0.4;
        }

        return {
          nome: nomeServidor,
          matricula: servidor.MATRICULA,
          cargo: servidor.CARGO,
          secretaria: servidor.SECRETARIA,
          baseSalarial: parseFloat(servidor.BASE_SALARIAL) || 0,
          bruto: parseFloat(servidor.BRUTO) || 0,
          liquido: parseFloat(servidor.LIQUIDO) || 0,
          dataAdmissao: servidor.DATA_ADMISSAO,
          score
        };
      })
      .filter((r: any) => r.score > 0.5)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limite);

    console.log(`Encontrados ${resultados.length} resultados similares`);

    return new Response(
      JSON.stringify({ resultados, total: resultados.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Erro na função buscar-por-nome:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
