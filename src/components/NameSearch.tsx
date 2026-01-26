import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, User, Loader2 } from 'lucide-react';

interface ServidorResultado {
  nome: string;
  matricula: string;
  cargo: string;
  secretaria: string;
  baseSalarial: number;
  bruto: number;
  liquido: number;
  dataAdmissao: string;
  score: number;
}

interface NameSearchProps {
  onSelectServidor: (matricula: string) => void;
  formatarMoeda: (valor: number) => string;
}

const NameSearch = ({ onSelectServidor, formatarMoeda }: NameSearchProps) => {
  const [nomeBusca, setNomeBusca] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [resultados, setResultados] = useState<ServidorResultado[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const handleBuscarNome = async () => {
    if (nomeBusca.trim().length < 3) {
      toast.error('Digite pelo menos 3 caracteres');
      return;
    }

    setBuscando(true);
    setResultados([]);
    setMostrarResultados(true);

    try {
      const { data, error } = await supabase.functions.invoke('buscar-por-nome', {
        body: { nome: nomeBusca, limite: 8 }
      });

      if (error) {
        console.error('Erro na busca:', error);
        toast.error('Erro ao buscar. Tente novamente.');
        setBuscando(false);
        return;
      }

      if (data.resultados && data.resultados.length > 0) {
        setResultados(data.resultados);
        toast.success(`Encontrados ${data.resultados.length} resultados`);
      } else {
        toast.warning('Nenhum servidor encontrado com esse nome');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro na conexão. Tente novamente.');
    }

    setBuscando(false);
  };

  const handleSelectServidor = (matricula: string) => {
    setMostrarResultados(false);
    setResultados([]);
    setNomeBusca('');
    onSelectServidor(matricula);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-semibold px-2 py-1 rounded-full">
            BUSCA POR NOME
          </span>
        </div>
        <Label htmlFor="nome-busca" className="text-sm font-medium">
          🔤 Digite o nome do servidor
        </Label>
        <div className="flex gap-2">
          <Input
            id="nome-busca"
            type="text"
            placeholder="Ex: Maria Silva, João Santos..."
            value={nomeBusca}
            onChange={(e) => setNomeBusca(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscarNome()}
            className="flex-1"
          />
          <Button
            onClick={handleBuscarNome}
            disabled={buscando || nomeBusca.trim().length < 3}
            size="icon"
            variant="secondary"
          >
            {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          💡 A busca encontra nomes mesmo com pequenos erros de digitação
        </p>
      </div>

      {/* Resultados da busca */}
      {mostrarResultados && (
        <div className="space-y-2 animate-in fade-in-50 slide-in-from-top-2">
          {buscando && (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Buscando servidores...</p>
            </div>
          )}

          {!buscando && resultados.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground">
                Selecione o servidor desejado:
              </p>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {resultados.map((servidor, idx) => (
                  <Card 
                    key={idx}
                    className="cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-colors"
                    onClick={() => handleSelectServidor(servidor.matricula)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 rounded-full p-2">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{servidor.nome}</p>
                          <p className="text-xs text-muted-foreground truncate">{servidor.cargo}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-muted-foreground">
                              Mat: {servidor.matricula}
                            </span>
                            <span className="text-xs font-medium text-primary">
                              {formatarMoeda(servidor.baseSalarial)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            servidor.score > 0.9 ? 'bg-green-100 text-green-700' :
                            servidor.score > 0.7 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {Math.round(servidor.score * 100)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {!buscando && resultados.length === 0 && nomeBusca.length >= 3 && (
            <div className="text-center py-4 text-muted-foreground">
              <p className="text-sm">Nenhum resultado encontrado</p>
              <p className="text-xs mt-1">Tente outro nome ou verifique a grafia</p>
            </div>
          )}

          {resultados.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setMostrarResultados(false); setResultados([]); }}
              className="w-full text-xs"
            >
              Fechar resultados
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default NameSearch;
