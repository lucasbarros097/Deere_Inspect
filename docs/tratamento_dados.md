# 🛡️ Política de Tratamento de Dados e Conformidade LGPD

Este documento descreve as diretrizes de privacidade, retenção de dados, fluxo de informações e conformidade com a **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)** aplicadas ao sistema **Deere Inspect** e ao seu assistente de Inteligência Artificial.

> [!NOTE]
> O assistente virtual do Deere Inspect foi projetado seguindo o princípio de **Privacy by Design** (Privacidade desde a Concepção). Nenhuma mensagem do usuário é retida em banco de dados local ou utilizada para treinamento de inteligências artificiais.

---

## 1. 🏗️ Arquitetura Visual do Fluxo de Dados

```mermaid
flowchart LR
    classDef client fill:#0f172a,stroke:#f59e0b,stroke-width:2px,color:#fff
    classDef backend fill:#0f172a,stroke:#22c55e,stroke-width:2px,color:#fff
    classDef proxy fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    classDef provider fill:#0f172a,stroke:#a855f7,stroke-width:2px,color:#fff

    A["👤 Usuário / Client<br/><code>Interface Web & Mobile</code>"] :::client
    B["⚙️ Backend Deere Inspect<br/><code>FastAPI (Stateless)</code>"] :::backend
    C["🔀 OpenRouter Proxy<br/><code>No-Logging Default</code>"] :::proxy
    D["🤖 Provider OpenAI<br/><code>GPT-4o-mini (Zero-Training)</code>"] :::provider

    A -- "🔒 HTTPS / TLS 1.3" --> B
    B -- "🔑 API Key / Prompt System" --> C
    C -- "🛡️ Transit Criptografado" --> D
```

---

## 2. 📊 Fluxo e Ciclo de Vida dos Dados

| Etapa | Componente | Tratamento dos Dados | Retenção / Armazenamento | Treinamento de Modelos |
| :--- | :--- | :--- | :--- | :--- |
| 1️⃣ **Frontend** | Interface Web/Mobile | Criptografia de canal via TLS 1.3. O estado do chat permanece em memória local (React State). | 🧹 Apagado ao atualizar/fechar a sessão no navegador. | 🚫 N/A |
| 2️⃣ **Backend** | Endpoint `/chat/ask` (FastAPI) | Recebe o prompt, injeta as diretrizes do sistema e encaminha à API. | ⚡ **0 Dias.** Nenhuma mensagem ou histórico é gravado em disco ou banco de dados. | 🚫 N/A |
| 3️⃣ **Proxy API** | OpenRouter (`https://openrouter.ai`) | Roteia a chamada de forma transparente ao provedor do modelo de IA. | 🛑 **0 Dias.** Sem registro de mensagens ou prompts (*no logging by default*). | 🔒 **Desativado por Padrão** (*Off by Default*). |
| 4️⃣ **Provedor IA** | OpenAI API (`gpt-4o-mini`) | Processa a requisição em memória de execução para gerar a resposta. | 🕒 Retenção técnica temporária máxima de até 30 dias exclusiva para auditoria de abusos/segurança. | 🛡️ **Zero Training.** Prompts de API comercial **não** são utilizados para treinamento de IAs. |

---

## 3. 🛡️ Garantias de Privacidade e Não-Treinamento (API vs Consumidor)

> [!IMPORTANT]
> Existe uma distinção fundamental entre o uso público de ferramentas de IA (como ChatGPT web gratuito) e a integração via **API Comercial**:

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

## 4. ⚖️ Recomendações e Boas Práticas para Usuários (LGPD)

- 📌 **Minimização de Dados:** O assistente utiliza apenas dados financeiros e operacionais genéricos de tabela de preços e custos técnicos de manutenção.
- 🚫 **Vedação de PII (Dados Pessoais Identificáveis):** É instruído aos usuários que **não insiram dados pessoais sensíveis** (como CPF, RG, dados bancários ou nomes completos de clientes finais) nos campos de prompt do assistente.
- ⚖️ **Vedação ao Termo "Laudo":** Em estrito cumprimento às normas regulatórias e jurídicas da empresa, o assistente é parametrizado via *System Prompt* para emitir apenas **relatórios técnicos de inspeção** e análises operacionais.

---

## 5. 🏢 Opções de Implantação Enterprise (Nuvem Dedicada)

Caso a governança da empresa exija isolamento total em território nacional ou conformidade de *Zero Data Retention* (ZDR) contratual direto:

> [!TIP]
> É possível direcionar a variável `base_url` do backend para a **Azure OpenAI Service**, que oferece conformidade nativa ISO/IEC 27018, HIPAA, LGPD e contrato de proteção de dados assinado diretamente com a Microsoft.
