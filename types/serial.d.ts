// types/serial.d.ts
interface SerialOptions {
    baudRate: number;
    dataBits?: number;
    stopBits?: number;
    parity?: string;
    bufferSize?: number;
    flowControl?: string;
  }
  
  interface SerialPort {
    readable: ReadableStream;
    writable: WritableStream;
    open(options: SerialOptions): Promise<void>;
    close(): Promise<void>;
    getInfo(): SerialPortInfo;
  }
  
  interface SerialPortInfo {
    usbVendorId: number;
    usbProductId: number;
  }
  
  interface NavigatorSerial {
    serial: {
      requestPort(): Promise<SerialPort>;
      getPorts(): Promise<SerialPort[]>;
    };
  }
  
  // Extend the Navigator type
  declare global {
    interface Navigator extends NavigatorSerial {}
  }
  
  // app/page.tsx
  'use client';
  
  import { useEffect, useState } from 'react';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import { Badge } from '@/components/ui/badge';
  import { Alert, AlertDescription } from '@/components/ui/alert';
  import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
  import { Cable, Activity, Timer, Medal, BarChart2, Power } from 'lucide-react';
  
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
  
  const isSerialSupported = () => {
    return 'serial' in navigator;
  };
  
  export default function Home() {
    const [port, setPort] = useState<SerialPort | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [reader, setReader] = useState<ReadableStreamDefaultReader | null>(null);
    const [currentTraining, setCurrentTraining] = useState<TrainingData | null>(null);
    const [trainingHistory, setTrainingHistory] = useState<TrainingData[]>([]);
    const [error, setError] = useState<string | null>(null);
  
    const connectToDevice = async () => {
      if (!isSerialSupported()) {
        setError('Web Serial API não é suportada neste navegador. Use Chrome ou Edge.');
        return;
      }
  
      try {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        setPort(port);
        setIsConnected(true);
        setError(null);
        startReading(port);
      } catch (err) {
        setError('Falha ao conectar ao dispositivo. Certifique-se que o Pico está conectado.');
        console.error(err);
      }
    };
  
    const startReading = async (port: SerialPort) => {
      while (port.readable) {
        try {
          const reader = port.readable.getReader();
          setReader(reader);
  
          let buffer = '';
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
  
            buffer += new TextDecoder().decode(value);
  
            if (buffer.includes('\n')) {
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
  
              for (const line of lines) {
                try {
                  if (line.trim()) {
                    const data = JSON.parse(line);
                    const trainingData: TrainingData = {
                      ...data,
                      timestamp: Date.now(),
                    };
                    setCurrentTraining(trainingData);
                    setTrainingHistory(prev => [...prev, trainingData]);
                  }
                } catch (e) {
                  console.error('Error parsing JSON:', e);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error reading:', error);
        } finally {
          reader?.releaseLock();
        }
      }
    };
  
    const disconnect = async () => {
      if (reader) {
        await reader.cancel();
        setReader(null);
      }
      if (port) {
        await port.close();
        setPort(null);
      }
      setIsConnected(false);
    };
  
    useEffect(() => {
      return () => {
        disconnect();
      };
    }, []);
  
  }