import { useState } from 'react';
import { cargos, calcularSalario, getPadraoAtual, CargoInfo } from '@/data/cargos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Index = () => {
  const [cargoSelecionado, setCargoSelecionado] = useState<CargoInfo | null>(null);
  const [anosServico, setAnosServico] = useState<number>(0);
  const [resultado, setResultado] = useState<{ cargo: string; anos: number; salario: number; padrao: string } | null>(null);

  const handleCalcular = () => {
    if (cargoSelecionado) {
      const salario = calcularSalario(cargoSelecionado, anosServico);
      const padrao = getPadraoAtual(anosServico);
      setResultado({
        cargo: cargoSelecionado.nome,
        anos: anosServico,
        salario,
        padrao,
      });
    }
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

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

        {/* Calculadora */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              💼 Consulte seu Salário Base
            </CardTitle>
            <CardDescription>
              Selecione seu cargo e informe o tempo de serviço para ver o salário estimado
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Seleção de Cargo */}
            <div className="space-y-2">
              <Label htmlFor="cargo" className="text-sm font-medium">
                🏛️ Cargo
              </Label>
              <Select
                onValueChange={(value) => {
                  const cargo = cargos.find((c) => c.nome === value);
                  setCargoSelecionado(cargo || null);
                  setResultado(null);
                }}
              >
                <SelectTrigger id="cargo" className="w-full">
                  <SelectValue placeholder="Selecione seu cargo..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {cargos.map((cargo) => (
                    <SelectItem key={cargo.nome} value={cargo.nome}>
                      {cargo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {cargoSelecionado && (
                <p className="text-xs text-muted-foreground">
                  Carga horária: {cargoSelecionado.cargaHoraria}h | Nível: {cargoSelecionado.nivelInicial}
                </p>
              )}
            </div>

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
              onClick={handleCalcular}
              disabled={!cargoSelecionado}
              className="w-full text-lg py-6"
              size="lg"
            >
              🧮 Calcular Salário
            </Button>

            {/* Resultado */}
            {resultado && (
              <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4">
                <Card className="bg-primary/10 border-primary/30">
                  <CardContent className="pt-6 text-center space-y-3">
                    <p className="text-lg">
                      Para o cargo de <span className="font-bold text-primary">{resultado.cargo}</span>, 
                      o salário estimado com o tempo de casa de{' '}
                      <span className="font-bold text-primary">{resultado.anos} anos</span> será de:
                    </p>
                    <p className="text-4xl font-bold text-primary">
                      {formatarMoeda(resultado.salario)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Padrão: {resultado.padrao}
                    </p>
                  </CardContent>
                </Card>

                {/* A piadinha */}
                <div className="text-center p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30">
                  <p className="text-sm text-muted-foreground italic">
                    E aí, efetivo? Achou que seu aumento seria de quanto? 25%?! 😏 HAHAHAHA
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Legal */}
        <footer className="text-center space-y-2 text-xs text-muted-foreground border-t pt-6">
          <p>⚠️ <strong>Aviso Legal:</strong> Os valores apresentados são apenas estimativas baseadas no PLC 0017/2025.</p>
          <p>Os valores finais podem sofrer alterações conforme aprovação e regulamentação da lei.</p>
          <p className="pt-2 text-[10px]">
            * A piadinha é baseada em informações passadas aos servidores ao longo de 2025, extraoficialmente. 
            Qualquer semelhança com promessas não cumpridas é mera coincidência. 😅
          </p>
          <p className="pt-4">
            Desenvolvido com ☕ para os servidores de SPA
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
