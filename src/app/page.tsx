'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Cable, Activity, Timer, Medal, BarChart2, Power } from 'lucide-react';
import { SerialPort } from '../../types/serial';

interface TrainingData {
  duracao: number;
  bpm_max: number;
  bpm_min: number;
  bpm_medio: number;
  forca_maxima: number;
  pontuacao_a: number;
  pontuacao_b: number;
  timestamp?: number;
}

export default function Home() {
  const [port, setPort] = useState<SerialPort | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reader, setReader] = useState<ReadableStreamDefaultReader | null>(null);
  const [currentTraining, setCurrentTraining] = useState<TrainingData | null>(null);
  const [trainingHistory, setTrainingHistory] = useState<TrainingData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>(''); // Debug state

  const connectToDevice = async () => {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      setPort(port);
      setIsConnected(true);
      setError(null);
      console.log('Porta conectada:', port);
      startReading(port);
    } catch (err) {
      setError('Falha ao conectar ao dispositivo: ' + (err as Error).message);
      console.error('Erro de conexão:', err);
    }
  };

  const startReading = async (port: SerialPort) => {
    try {
      const reader = port.readable.getReader();
      setReader(reader);
      console.log('Iniciando leitura...');
  
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log('Leitura finalizada');
          break;
        }
  
        if (value) {
          const newText = new TextDecoder().decode(value);
          buffer += newText;
          setDebug(prev => prev + newText); // Debug: mostra dados recebidos
  
          let lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Mantém qualquer fragmento incompleto
  
          for (const line of lines) {
            if (line.trim()) {
              try {
                console.log('Dados recebidos:', line);
                const data = JSON.parse(line);
                const trainingData: TrainingData = {
                  ...data,
                  timestamp: Date.now(),
                };
                setCurrentTraining(trainingData);
                setTrainingHistory(prev => [...prev, trainingData]);
              } catch (e) {
                console.error('Erro ao processar JSON:', line, e);
                setError('Erro ao processar dados: ' + (e as Error).message);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro na leitura:', error);
      setError('Erro na leitura: ' + (error as Error).message);
    } finally {
      if (reader) {
        reader.releaseLock();
      }
    }
  };
  

  const disconnect = async () => {
    try {
      if (reader) {
        await reader.cancel();
        setReader(null);
      }
      if (port) {
        await port.close();
        setPort(null);
      }
      setIsConnected(false);
      console.log('Desconectado com sucesso');
    } catch (err) {
      console.error('Erro ao desconectar:', err);
      setError('Erro ao desconectar: ' + (err as Error).message);
    }
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Grapple Tech Monitor</h1>
          <Button
            onClick={isConnected ? disconnect : connectToDevice}
            variant={isConnected ? "destructive" : "default"}
          >
            {isConnected ? (
              <>
                <Power className="mr-2 h-4 w-4" />
                Desconectar
              </>
            ) : (
              <>
                <Cable className="mr-2 h-4 w-4" />
                Conectar
              </>
            )}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentTraining && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2" />
                  Dados Vitais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">BPM Máximo</span>
                    <Badge variant="default">{currentTraining.bpm_max}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">BPM Mínimo</span>
                    <Badge variant="default">{currentTraining.bpm_min}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">BPM Médio</span>
                    <Badge variant="default">{currentTraining.bpm_medio}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Timer className="mr-2" />
                  Desempenho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Duração</span>
                    <Badge variant="default">{currentTraining.duracao}s</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Força Máxima</span>
                    <Badge variant="default">{currentTraining.forca_maxima}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Pontuação A</div>
                      <div className="text-2xl font-bold">{currentTraining.pontuacao_a}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Pontuação B</div>
                      <div className="text-2xl font-bold">{currentTraining.pontuacao_b}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {trainingHistory.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart2 className="mr-2" />
                Histórico de BPM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trainingHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(timestamp) => new Date(Number(timestamp)).toLocaleTimeString()}
                    />
                    <Line
                      type="monotone"
                      dataKey="bpm_medio"
                      stroke="#2563eb"
                      name="BPM Médio"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {trainingHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Medal className="mr-2" />
                Histórico de Treinos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingHistory.map((training, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-600">
                          Treino {index + 1} - {new Date(training.timestamp!).toLocaleTimeString()}
                        </div>
                        <div className="mt-1">
                          <span className="text-gray-900">
                            Duração: {training.duracao}s | BPM Médio: {training.bpm_medio}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Pontuação</div>
                        <div className="text-gray-900">A: {training.pontuacao_a} | B: {training.pontuacao_b}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Debug Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-40">
              {debug}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}