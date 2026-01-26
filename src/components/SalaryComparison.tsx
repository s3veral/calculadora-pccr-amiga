import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPadraoAtual } from '@/data/cargos';

interface SalaryComparisonProps {
  salarioBaseAtual: number;
  salarioNovoPCCR: number;
  anosServico: number;
  formatarMoeda: (valor: number) => string;
  isCargoSaude: boolean;
  composicaoInsalubridade?: number;
}

const SalaryComparison = ({ 
  salarioBaseAtual, 
  salarioNovoPCCR, 
  anosServico, 
  formatarMoeda,
  isCargoSaude,
  composicaoInsalubridade = 0
}: SalaryComparisonProps) => {
  const aumento = salarioNovoPCCR - salarioBaseAtual;
  const percentual = salarioBaseAtual > 0 ? ((aumento / salarioBaseAtual) * 100) : 0;
  
  // Calcular progressão PCCR aplicada ao base atual
  const padraoAtual = Math.min(Math.floor(anosServico / 3), 14);
  const fatorProgressao = Math.pow(1.03, padraoAtual);
  const baseAtualComProgressao = salarioBaseAtual * fatorProgressao;
  
  // Determinar qual é maior
  const baseMaior = Math.max(salarioNovoPCCR, salarioBaseAtual);
  const baseMaiorComProgressao = Math.max(salarioNovoPCCR, baseAtualComProgressao);
  
  const atualMaiorQuePCCR = salarioBaseAtual > salarioNovoPCCR;

  return (
    <Card className="bg-muted/30 border-muted">
      <CardContent className="pt-6 space-y-4">
        <h3 className="font-semibold text-center text-lg">📊 Comparativo Base Atual vs PCCR</h3>
        
        {/* Cards de comparação lado a lado */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className={`p-3 rounded-lg border-2 ${atualMaiorQuePCCR ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400' : 'bg-background border-muted'}`}>
            <p className="text-xs text-muted-foreground mb-1">💰 Base Atual</p>
            <p className={`text-xl font-bold ${atualMaiorQuePCCR ? 'text-amber-600' : 'text-muted-foreground'}`}>
              {formatarMoeda(salarioBaseAtual)}
            </p>
            {atualMaiorQuePCCR && <p className="text-[10px] text-amber-600 mt-1">✓ Maior!</p>}
          </div>
          <div className={`p-3 rounded-lg border-2 ${!atualMaiorQuePCCR ? 'bg-primary/10 border-primary' : 'bg-background border-muted'}`}>
            <p className="text-xs text-muted-foreground mb-1">🎉 Base PCCR</p>
            <p className={`text-xl font-bold ${!atualMaiorQuePCCR ? 'text-primary' : 'text-muted-foreground'}`}>
              {formatarMoeda(salarioNovoPCCR)}
            </p>
            {!atualMaiorQuePCCR && <p className="text-[10px] text-primary mt-1">✓ Maior!</p>}
          </div>
        </div>

        {/* Diferença */}
        <div className="text-center p-3 bg-background rounded-lg border">
          <p className="text-sm text-muted-foreground mb-1">Diferença entre as bases</p>
          <p className={`text-2xl font-bold ${aumento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {aumento >= 0 ? '+' : ''}{formatarMoeda(aumento)}
          </p>
          <p className={`text-sm font-semibold ${aumento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ({aumento >= 0 ? '+' : ''}{percentual.toFixed(2)}%)
          </p>
        </div>

        {/* Alerta se base atual é maior */}
        {atualMaiorQuePCCR && (
          <div className="bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded-lg p-3">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 text-center">
              ⚠️ Seu salário atual é <strong>MAIOR</strong> que o previsto na tabela PCCR!
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 text-center mt-1">
              Se a regra for manter o maior, você continuará com seu base atual.
            </p>
          </div>
        )}

        {/* Projeções com Toggle */}
        <Tabs defaultValue="cenario1" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto bg-muted p-1">
            <TabsTrigger value="cenario1" className="text-xs py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              📗 Base PCCR
            </TabsTrigger>
            <TabsTrigger value="cenario2" className="text-xs py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              📙 Mantém Atual
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cenario1" className="mt-3">
            <div className="bg-primary/5 rounded-lg p-4 space-y-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Base PCCR (Padrão {getPadraoAtual(anosServico)})</p>
                <p className="text-2xl font-bold text-primary">{formatarMoeda(salarioNovoPCCR)}</p>
              </div>
              
              {isCargoSaude && (
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
                  <div className="text-center p-2 bg-background rounded">
                    <p className="text-[10px] text-muted-foreground">+10% Insal.</p>
                    <p className="text-sm font-bold text-green-600">{formatarMoeda(salarioNovoPCCR * 1.10)}</p>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <p className="text-[10px] text-muted-foreground">+20% Insal.</p>
                    <p className="text-sm font-bold text-green-600">{formatarMoeda(salarioNovoPCCR * 1.20)}</p>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <p className="text-[10px] text-muted-foreground">+40% Insal.</p>
                    <p className="text-sm font-bold text-green-600">{formatarMoeda(salarioNovoPCCR * 1.40)}</p>
                  </div>
                </div>
              )}
              
              <p className="text-[10px] text-center text-muted-foreground">
                Valores da tabela oficial PLC 0017/2025 com progressão aplicada
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="cenario2" className="mt-3">
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 space-y-3">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Base Atual + Progressão PCCR (Padrão {getPadraoAtual(anosServico)})</p>
                <p className="text-2xl font-bold text-amber-600">{formatarMoeda(baseAtualComProgressao)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  ({formatarMoeda(salarioBaseAtual)} × {fatorProgressao.toFixed(4)})
                </p>
              </div>
              
              {isCargoSaude && (
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
                  <div className="text-center p-2 bg-background rounded">
                    <p className="text-[10px] text-muted-foreground">+10% Insal.</p>
                    <p className="text-sm font-bold text-green-600">{formatarMoeda(baseAtualComProgressao * 1.10)}</p>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <p className="text-[10px] text-muted-foreground">+20% Insal.</p>
                    <p className="text-sm font-bold text-green-600">{formatarMoeda(baseAtualComProgressao * 1.20)}</p>
                  </div>
                  <div className="text-center p-2 bg-background rounded">
                    <p className="text-[10px] text-muted-foreground">+40% Insal.</p>
                    <p className="text-sm font-bold text-green-600">{formatarMoeda(baseAtualComProgressao * 1.40)}</p>
                  </div>
                </div>
              )}
              
              <p className="text-[10px] text-center text-muted-foreground">
                Cenário onde você mantém seu base atual e aplica apenas as regras de progressão PCCR
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Comparativo final dos cenários */}
        <div className="bg-background rounded-lg p-3 border">
          <p className="text-xs text-center text-muted-foreground mb-2">Comparativo dos Cenários</p>
          <div className="flex justify-center items-center gap-3">
            <div className="text-center">
              <p className="text-xs text-primary">PCCR</p>
              <p className="font-bold text-primary">{formatarMoeda(salarioNovoPCCR)}</p>
            </div>
            <span className="text-muted-foreground">vs</span>
            <div className="text-center">
              <p className="text-xs text-amber-600">Atual+Prog</p>
              <p className="font-bold text-amber-600">{formatarMoeda(baseAtualComProgressao)}</p>
            </div>
          </div>
          <p className={`text-xs text-center mt-2 font-medium ${salarioNovoPCCR >= baseAtualComProgressao ? 'text-primary' : 'text-amber-600'}`}>
            {salarioNovoPCCR >= baseAtualComProgressao 
              ? `Tabela PCCR é ${formatarMoeda(salarioNovoPCCR - baseAtualComProgressao)} maior`
              : `Manter atual seria ${formatarMoeda(baseAtualComProgressao - salarioNovoPCCR)} maior`
            }
          </p>
        </div>

        {/* Aviso importante */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-blue-600">ℹ️</span>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>ATENÇÃO:</strong> Estes valores são <strong>ESTIMATIVAS</strong>. 
              O documento do PCCR não detalha todas as regras de enquadramento e transição.
              Valores finais dependem de regulamentação complementar.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalaryComparison;
