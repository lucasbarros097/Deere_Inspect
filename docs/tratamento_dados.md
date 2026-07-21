# Política de Tratamento de Dados e Conformidade com a LGPD

Este documento descreve as diretrizes de privacidade, retenção de dados, fluxo de informações e conformidade com a **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)** aplicadas ao sistema **Deere Inspect** e ao seu assistente de Inteligência Artificial.

---

## 1. Visão Geral da Arquitetura do Chatbot

O assistente virtual do Deere Inspect foi projetado seguindo o princípio de **Privacy by Design** (Privacidade desde a Concepção). Todas as requisições enviadas ao módulo de IA passam por um fluxo de processamento stateless (sem retenção em banco de dados).

```
[ Usuário / Client ] ──(HTTPS TLS 1.3)──> [ Backend Deere Inspect ] ──(API)──> [ OpenRouter Proxy ] ──> [ Provider OpenAI ]
```

---

## 2. Fluxo e Ciclo de Vida dos Dados

| Etapa | Componente | Tratamento dos Dados | Retenção / Armazenamento | Treinamento de Modelos |
| :--- | :--- | :--- | :--- | :--- |
| **1. Frontend** | Interface Web/Mobile | Criptografia de canal via TLS 1.3. O estado do chat permanece em memória local (React State). | Apagado ao atualizar/fechar a sessão no navegador. | N/A |
| **2. Backend** | Endpoint `/chat/ask` (FastAPI) | Recebe o prompt, injeta as diretrizes do sistema e encaminha à API. | **0 Dias.** Nenhuma mensagem ou histórico é gravado em disco ou banco de dados. | N/A |
| **3. Proxy API** | OpenRouter (`https://openrouter.ai`) | Roteia a chamada de forma transparente ao provedor do modelo de IA. | **0 Dias.** Sem registro de mensagens ou prompts (*no logging by default*). | **Desativado por Padrão** (*Off by Default*). |
| **4. Provedor IA** | OpenAI API (`gpt-4o-mini`) | Processa a requisição em memória de execução para gerar a resposta. | Retenção técnica temporária máxima de até 30 dias exclusiva para monitoramento de abusos/segurança. | **Zero Training.** Prompts de API comercial **não** são utilizados para treinamento de IAs. |

---

## 3. Garantias de Privacidade e Não-Treinamento (API vs Consumidor)

Existe uma distinção fundamental entre o uso público de ferramentas de IA (como ChatGPT web gratuito) e a integração via **API Comercial**:

1. **Uso de Dados para Treinamento:**
   - De acordo com os termos do OpenRouter e os **OpenAI API Data Usage Terms**, os dados de entrada (*prompts*) e saída (*completions*) trafegados via API comercial **NÃO são utilizados para treinar ou aprimorar modelos de inteligência artificial**.

2. **Privacidade Padrão no OpenRouter (*No Logging*):**
   - O OpenRouter armazena apenas metadados de auditoria e faturamento (timestamp, quantidade de tokens consumidos e identificador do modelo).
   - O recurso de compartilhamento de dados para treinamento em troca de descontos em tokens vem **desativado por padrão** (*Off by Default*).

3. **Links e Fontes da Documentação Oficial:**
   - 🔗 [OpenRouter Privacy Policy](https://openrouter.ai/privacy)
   - 🔗 [OpenRouter Provider Data Policies](https://openrouter.ai/docs/provider-routing)
   - 🔗 [OpenAI Enterprise & API Data Privacy](https://openai.com/enterprise-privacy)

---

## 4. Recomendações e Boas Práticas para Usuários (LGPD)

Para garantir a conformidade contínua com a LGPD:

- **Minimização de Dados:** O assistente utiliza apenas dados financeiros e operacionais genéricos de tabela de preços e custos técnicos de manutenção.
- **Vedação de PII (Dados Pessoais Identificáveis):** É instruído aos usuários que **não insiram dados pessoais sensíveis** (como CPF, RG, dados bancários ou nomes completos de clientes finais) nos campos de prompt do assistente.
- **Vedação ao Termo "Laudo":** Em estrito cumprimento às normas regulatórias e jurídicas da empresa, o assistente é parametrizado via *System Prompt* para emitir apenas **relatórios técnicos de inspeção** e análises operacionais.

---

## 5. Opções de Implantação Enterprise (Nuvem Dedicada)

Caso a governança da empresa exija isolamento total em território nacional ou conformidade de *Zero Data Retention* (ZDR) contratual direto:

- É possível direcionar a variável `base_url` do backend para a **Azure OpenAI Service**, que oferece conformidade nativa ISO/IEC 27018, HIPAA, LGPD e contrato de proteção de dados assinado diretamente com a Microsoft.
