# Meu Treino

App de academia (PWA: página web instalável). Funciona offline depois da primeira abertura. Os dados ficam só no celular.

## Arquivos
- `index.html`: página do app
- `app.js`: telas e lógica
- `corpo.js`: figura com os grupos musculares
- `programa-inicial.js`: série carregada na primeira abertura (Ultra Laranjeiras, Prof. João Lourenço, 25/11/2026)
- `estilo.css`, `manifest.webmanifest`, `sw.js`, `icone-*.png`: visual, instalação e modo offline

## Instalar no celular
O app precisa estar hospedado num endereço https (por exemplo GitHub Pages). Depois:
- Android/Chrome: abrir o endereço → menu ⋮ → "Instalar app" ou "Adicionar à tela inicial".
- iPhone/Safari: abrir o endereço → Compartilhar → "Adicionar à Tela de Início".

## Trocar de celular
Ajustes → Exportar tudo (.json). No celular novo, instalar o app e usar Ajustes → Importar arquivo.

## Série nova
- Pelo app: Ajustes → Começar série nova (copia a atual para você editar).
- Por arquivo: um .json com `name`, `coach` e `workouts` (mesmo formato de `programa-inicial.js`), via Ajustes → Importar.
A série anterior fica em Ajustes → Séries anteriores, com todo o histórico.

## Claude (IA)
Ajustes → Claude: colar uma chave da API da Anthropic (console.anthropic.com → API keys) e escolher o modelo.
A chave fica só no celular (fora do backup). A API é cobrada por uso, à parte da assinatura do Claude.
As perguntas vão com o contexto da série, cargas, observações e histórico.

## Atualizar o app
Substituir os arquivos na hospedagem e subir a versão em `sw.js` (`meutreino-v1` → `meutreino-v2`). Os dados do celular não são afetados.
