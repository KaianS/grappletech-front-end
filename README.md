# Grapple Tech Monitor

Este projeto é um monitor de dados de treino desenvolvido com React e Next.js, projetado para receber e exibir dados de um dispositivo de hardware via porta serial. Ele fornece informações em tempo real sobre o desempenho do treino, incluindo dados vitais como BPM, duração, força e pontuação.

## Funcionalidades

- **Conexão Serial:** Permite conectar e desconectar o dispositivo via porta serial usando a API Web Serial.
- **Visualização de Dados em Tempo Real:** Exibe dados de treino em tempo real, incluindo BPM máximo, mínimo e médio, duração do treino, força máxima e pontuações.
- **Histórico de Treinos:** Armazena e exibe o histórico de treinos, permitindo visualizar dados de sessões anteriores.
- **Gráfico de BPM:** Apresenta um gráfico de linha interativo mostrando a variação do BPM médio ao longo do tempo.
- **Debug Data:** Exibe os dados brutos recebidos pela porta serial para fins de depuração.

## Tecnologias Utilizadas

- **React:** Biblioteca JavaScript para construção de interfaces de usuário.
- **Next.js:** Framework React para renderização do lado do servidor e geração de sites estáticos.
- **TypeScript:** Superset JavaScript que adiciona tipagem estática.
- **shadcn/ui:** Biblioteca de componentes React estilizados com Radix UI e Tailwind CSS.
- **recharts:** Biblioteca React para criação de gráficos.
- **Web Serial API:** API do navegador para comunicação com dispositivos seriais.
- **lucide-react:** Biblioteca de ícones.

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Um navegador compatível com a API Web Serial (Chrome, Edge)
- Um dispositivo de hardware que envia dados de treino via porta serial no formato JSON.

## Como Executar

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/KaianS/grappletech-front-end.git
    cd grappletech-front-end
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Execute o aplicativo:**

    ```bash
    npm run dev
    # ou
    yarn dev
    ```

4.  **Abra o navegador (Edge para melhor compatibilidade):**

    Acesse `http://localhost:3000` no seu navegador.

5.  **Conecte o dispositivo:**

    Clique no botão "Conectar" e selecione a porta serial do seu dispositivo.

## Configuração do Dispositivo

O dispositivo de hardware deve enviar dados no formato JSON, com as seguintes chaves:

-   `duracao`: Duração do treino em segundos.
-   `bpm_max`: BPM máximo.
-   `bpm_min`: BPM mínimo.
-   `bpm_medio`: BPM médio.
-   `forca_maxima`: Força máxima.
-   `pontuacao_a`: Pontuação A.
-   `pontuacao_b`: Pontuação B.
-   `quedas`: quantidade de quedas.

Exemplo de dados JSON:

```json
{
  "duracao": 60,
  "bpm_max": 150,
  "bpm_min": 80,
  "bpm_medio": 120,
  "forca_maxima": 500,
  "pontuacao_a": 10,
  "pontuacao_b": 5,
  "quedas": 2
}

```