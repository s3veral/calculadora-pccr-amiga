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

interface ResultadoCargo {
  tipo: 'cargo';
  cargo: string;
  anos: number;
  salarioNovo: number;
  salarioAnterior: number;
  aumento: number;
  percentual: number;
  padrao: string;
  cargaHoraria: number;
}

interface ResultadoMatricula {
  tipo: 'matricula';
  nome: string;
  cargo: string;
  matricula: string;
  salarioBaseAtual: number;
  dataAdmissao: string;
  anosServico: number;
  salarioNovo: number;
  aumento: number;
  percentual: number;
  cargaHoraria: number;
  secretaria: string;
}

type Resultado = ResultadoCargo | ResultadoMatricula;

const Index = () => {
  // Estado para modo Cargo
  const [cargoSelecionado, setCargoSelecionado] = useState<CargoInfo | null>(null);
  const [cargaHoraria, setCargaHoraria] = useState<number | null>(null);
  const [anosServico, setAnosServico] = useState<number>(0);
  
  // Estado para modo Matrícula
  const [matricula, setMatricula] = useState<string>('');
  const [carregando, setCarregando] = useState(false);
  
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

  const encontrarCargoCorrespondente = (cargoAPI: string): { cargo: CargoInfo; ch: number } | null => {
    const cargoNormalizado = cargoAPI.toLowerCase().trim();
    
    // Tenta encontrar correspondência direta
    for (const cargo of cargos) {
      const nomeNormalizado = cargo.nome.toLowerCase();
      if (cargoNormalizado.includes(nomeNormalizado) || nomeNormalizado.includes(cargoNormalizado)) {
        // Usa a primeira CH disponível como padrão
        return { cargo, ch: cargo.cargasHorariasDisponiveis[0] };
      }
    }
    
    // Mapeamentos específicos
    const mapeamentos: { [key: string]: string } = {
      'psicologo': 'Psicólogo',
      'psicologa': 'Psicólogo',
      'assistente social': 'Assistente Social',
      'enfermeiro': 'Enfermeiro',
      'enfermeira': 'Enfermeiro',
      'tecnico de enfermagem': 'Técnico de Enfermagem',
      'tecnica de enfermagem': 'Técnico de Enfermagem',
      'agente comunitario de saude': 'Agente Comunitário de Saúde',
      'agente de combate a endemias': 'Agente de Combate às Endemias',
      'auxiliar de servicos gerais': 'Auxiliar de Serviços Gerais',
      'guarda municipal': 'Guarda Municipal',
      'motorista': 'Motorista',
      'merendeira': 'Cozinheiro',
      'auxiliar administrativo': 'Agente Administrativo',
      'recepcionista': 'Recepcionista',
      'cirurgiao dentista': 'Cirurgião-Dentista',
      'fisioterapeuta': 'Fisioterapeuta',
      'fonoaudiologo': 'Fonoaudiólogo',
      'nutricionista': 'Nutricionista',
      'farmaceutico': 'Farmacêutico',
      'vigia': 'Auxiliar de Serviços Gerais',
      'servente': 'Auxiliar de Serviços Gerais',
      'jardineiro': 'Jardineiro',
      'cozinheiro': 'Cozinheiro',
      'cozinheira': 'Cozinheiro',
      'auxiliar de cozinha': 'Auxiliar de Cozinha',
      'inspetor de aluno': 'Auxiliar de Serviços Gerais',
      'inspetor escolar': 'Inspetor Escolar',
      'professor doc i': 'Professor Doc I',
      'professor doc ii': 'Professor Doc II',
    };
    
    for (const [chave, valor] of Object.entries(mapeamentos)) {
      if (cargoNormalizado.includes(chave)) {
        const cargoEncontrado = cargos.find(c => c.nome === valor);
        if (cargoEncontrado) {
          return { cargo: cargoEncontrado, ch: cargoEncontrado.cargasHorariasDisponiveis[0] };
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

      setResultado({
        tipo: 'matricula',
        nome: dadosServidor.NOME,
        cargo: dadosServidor.CARGO,
        matricula: dadosServidor.MATRICULA,
        salarioBaseAtual: salarioAnterior,
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
                  Digite sua matrícula para consultar seus dados diretamente da API do Portal da Transparência
                </CardDescription>

                <div className="space-y-2">
                  <Label htmlFor="matricula" className="text-sm font-medium">
                    🔢 Matrícula
                  </Label>
                  <Input
                    id="matricula"
                    type="text"
                    placeholder="Digite sua matrícula..."
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <Button
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

                      {resultado.salarioNovo > 0 && (
                        <Card className="bg-muted/30 border-muted">
                          <CardContent className="pt-6 space-y-4">
                            <h3 className="font-semibold text-center text-lg">📊 Comparativo</h3>
                            
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div className="p-3 bg-background rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">💰 Salário Base Atual</p>
                                <p className="text-xl font-bold text-muted-foreground">{formatarMoeda(resultado.salarioBaseAtual)}</p>
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
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}

                  {/* A piadinha - só aparece se aumento < 25% */}
                  {resultado.percentual < 25 && (
                    <div className="text-center p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30">
                      <p className="text-sm text-muted-foreground italic">
                        E aí, efetivo? Achou que seu aumento seria de quanto? 25%?! 😏 HAHAHAHA
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
