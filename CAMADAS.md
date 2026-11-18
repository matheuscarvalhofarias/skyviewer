# Camadas Territoriais e Inteligência Espacial

Módulo geoespacial do Skyviewer voltado ao monitoramento urbano, infraestrutura e segurança pública integrada.

## Camadas Temáticas

O sistema permite cruzar e visualizar dados georreferenciados em múltiplas categorias:

- **Focos de dengue**: Vistorias de campo e identificação de criadouros de vetores.
- **Falhas de iluminação**: Chamados e ordens de serviço de manutenção na rede de iluminação pública.
- **Piscinas residenciais**: Mapeamento aéreo e inventário de corpos d'água perenes.
- **Pontos de alagamento**: Vias e áreas críticas com histórico de transbordamento e retenção de drenagem.
- **Vitimização (PM-SP)**: Ocorrências de segurança pública registradas (roubos, furtos e lesões corporais).

## Filtros e Análise

Os filtros permitem recortes analíticos avançados:
- **Cidade**: São Paulo, Campinas, Santos, Guarulhos, Osasco e Ribeirão Preto.
- **Período de referência**: Recorte temporal dinâmico (últimos 7, 30, 90 ou 180 dias).
- **Turno do registro**: Segmentação entre turno diurno (06h às 17h59) e noturno (18h às 05h59).
- **Natureza do evento**: Tipologia específica para camadas de segurança.

## Visualização

- **Mapa de calor**: Concentração ponderada com ajuste de raio e opacidade.
- **Grade de concentração**: Resolução espacial (~1 km) com agrupamento de contagens e seleção interativa por célula.

## Fontes de Dados Integradas

- **GeoSampa**: Infraestrutura urbana, iluminação pública e malha territorial municipal.
- **Ministério da Saúde**: Painel epidemiológico e vigilância em saúde ambiental.
- **SSP-SP**: Estatísticas de segurança pública e inteligência policial.

## Verificação

A integridade do módulo e das agregações espaciais pode ser validada via:
```bash
node --test layers.test.cjs
```
