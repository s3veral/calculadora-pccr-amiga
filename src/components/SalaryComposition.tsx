import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

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
  // Novos campos de descontos detalhados
  previdencia?: number;
  irrf?: number;
  pensaoAlimenticia?: number;
  valeTransporte?: number;
  emprestimo?: number;
  outrosDescontos?: number;
}

interface SalaryCompositionProps {
  salarioBase: number;
  bruto: number;
  liquido: number;
  composicao: ComposicaoSalarial;
  formatarMoeda: (valor: number) => string;
}

const SalaryComposition = ({ salarioBase, bruto, liquido, composicao, formatarMoeda }: SalaryCompositionProps) => {
  const [mostrarBruto, setMostrarBruto] = useState(true);
  const [mostrarLiquido, setMostrarLiquido] = useState(false);

  // Calcular totais de vencimentos
  const totalVencimentos = salarioBase + 
    composicao.comissao + 
    composicao.portaria + 
    composicao.anuenio + 
    composicao.insalubridade + 
    composicao.periculosidade + 
    composicao.adicionalNoturno + 
    composicao.horasExtras + 
    composicao.gratificacao + 
    composicao.outrosVencimentos;

  // Calcular percentuais sobre o bruto
  const calcPercentual = (valor: number) => bruto > 0 ? ((valor / bruto) * 100).toFixed(1) : '0';
  const calcPercentualLiquido = (valor: number) => bruto > 0 ? ((valor / bruto) * 100).toFixed(1) : '0';

  // Componentes do bruto (só mostra se > 0)
  const componentesBruto = [
    { nome: 'Base Salarial', valor: salarioBase, emoji: '💵' },
    { nome: 'Comissão', valor: composicao.comissao, emoji: '📋' },
    { nome: 'Portaria', valor: composicao.portaria, emoji: '📄' },
    { nome: 'Anuênio', valor: composicao.anuenio, emoji: '📅' },
    { nome: 'Insalubridade', valor: composicao.insalubridade, emoji: '⚗️' },
    { nome: 'Periculosidade', valor: composicao.periculosidade, emoji: '⚠️' },
    { nome: 'Adicional Noturno', valor: composicao.adicionalNoturno, emoji: '🌙' },
    { nome: 'Horas Extras', valor: composicao.horasExtras, emoji: '⏰' },
    { nome: 'Gratificação', valor: composicao.gratificacao, emoji: '🎁' },
    { nome: 'Outros Vencimentos', valor: composicao.outrosVencimentos, emoji: '📦' },
  ].filter(c => c.valor > 0);

  // Descontos (simulados quando não há detalhe)
  const totalDescontos = composicao.descontos;
  const descontosEstimados = totalDescontos > 0 ? [
    // Se tiver campos específicos, usa. Senão estima baseado no desconto total
    { nome: 'Previdência (est.)', valor: composicao.previdencia || (totalDescontos * 0.45), emoji: '🏛️' },
    { nome: 'IRRF (est.)', valor: composicao.irrf || (totalDescontos * 0.25), emoji: '📑' },
    { nome: 'Vale Transporte (est.)', valor: composicao.valeTransporte || (totalDescontos * 0.10), emoji: '🚌' },
    { nome: 'Empréstimo (est.)', valor: composicao.emprestimo || (totalDescontos * 0.10), emoji: '🏦' },
    { nome: 'Outros (est.)', valor: composicao.outrosDescontos || (totalDescontos * 0.10), emoji: '📎' },
  ] : [];

  return (
    <div className="space-y-3">
      {/* Resumo Rápido */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground">Base</p>
              <p className="text-sm sm:text-base font-bold">{formatarMoeda(salarioBase)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground">Bruto</p>
              <p className="text-sm sm:text-base font-bold text-blue-600">{formatarMoeda(bruto)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground">Líquido</p>
              <p className="text-sm sm:text-base font-bold text-green-600">{formatarMoeda(liquido)}</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-dashed text-center">
            <p className="text-xs text-muted-foreground">
              Você leva pra casa <span className="font-bold text-green-600">{calcPercentualLiquido(liquido)}%</span> do bruto
              {totalDescontos > 0 && (
                <span className="text-red-500"> (perde {calcPercentualLiquido(totalDescontos)}%)</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento do Bruto */}
      <Collapsible open={mostrarBruto} onOpenChange={setMostrarBruto}>
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full flex justify-between items-center p-4 h-auto">
              <span className="font-semibold text-blue-800 dark:text-blue-200">
                💰 Composição do Bruto ({formatarMoeda(bruto)})
              </span>
              {mostrarBruto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 space-y-2">
              {componentesBruto.map((comp, idx) => (
                <div key={idx} className="flex justify-between items-center bg-background/80 p-2 rounded text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <span>{comp.emoji}</span> {comp.nome}
                  </span>
                  <div className="text-right">
                    <span className="font-medium text-green-600">+{formatarMoeda(comp.valor)}</span>
                    <span className="text-xs text-muted-foreground ml-1">({calcPercentual(comp.valor)}%)</span>
                  </div>
                </div>
              ))}
              
              <div className="border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
                <div className="flex justify-between items-center bg-blue-100 dark:bg-blue-900/50 p-2 rounded font-semibold">
                  <span>Total Bruto:</span>
                  <span className="text-lg text-blue-700 dark:text-blue-300">{formatarMoeda(bruto)}</span>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Detalhamento do Líquido (Descontos) */}
      {totalDescontos > 0 && (
        <Collapsible open={mostrarLiquido} onOpenChange={setMostrarLiquido}>
          <Card className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex justify-between items-center p-4 h-auto">
                <span className="font-semibold text-red-800 dark:text-red-200">
                  📉 Descontos ({formatarMoeda(totalDescontos)} = {calcPercentualLiquido(totalDescontos)}%)
                </span>
                {mostrarLiquido ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4 space-y-2">
                <p className="text-[10px] text-red-600 dark:text-red-400 mb-2">
                  ⚠️ Valores estimados (a API não detalha cada desconto)
                </p>
                
                {descontosEstimados.map((desc, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-background/80 p-2 rounded text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <span>{desc.emoji}</span> {desc.nome}
                    </span>
                    <div className="text-right">
                      <span className="font-medium text-red-600">-{formatarMoeda(desc.valor)}</span>
                      <span className="text-xs text-muted-foreground ml-1">({calcPercentualLiquido(desc.valor)}%)</span>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-red-200 dark:border-red-700 pt-2 mt-2 space-y-2">
                  <div className="flex justify-between items-center bg-background/80 p-2 rounded">
                    <span className="text-muted-foreground">Total Descontos:</span>
                    <span className="font-medium text-red-600">-{formatarMoeda(totalDescontos)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-green-100 dark:bg-green-900/50 p-2 rounded font-semibold">
                    <span>💵 Líquido Final:</span>
                    <span className="text-lg text-green-700 dark:text-green-300">{formatarMoeda(liquido)}</span>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
};

export default SalaryComposition;
