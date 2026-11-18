# Camadas territoriais da PoC

Esta demonstração usa exclusivamente 6.615 registros sintéticos, gerados de forma determinística em `layers.js`. Não há conexão com bancos da Polícia Militar, SSP, SUS ou GeoSampa e não há inferência de informações sobre residentes. O nome PM-SP identifica o cenário de apresentação, não parceria ou homologação.

## Demonstração

Abra Camadas e escolha Saúde urbana, Infraestrutura ou Vitimização · PM-SP. Use Cidade, Período de referência, Turno do registro e Natureza da vitimização. A data de referência fica fixa em 18/11/2026 para repetir uma gravação. Os períodos incluem o dia da referência: idade menor que 7, 30, 90 ou 180 dias. Diurno: 06h–17h59; noturno: 18h–05h59.

Dados disponíveis em São Paulo, Campinas, Santos, Guarulhos, Osasco e Ribeirão Preto. As coordenadas são sorteadas ao redor dos centros municipais, sem validação de limites territoriais. Não representam locais efetivos de eventos ou piscinas.

- Dengue: registro fictício de vistoria com foco; não notificação de pessoa doente.
- Iluminação: chamado fictício de falha; não inventário de postes instalados.
- Piscinas: registro fictício de inventário. A data e turno são do registro, não da existência da piscina. Não é identificação de imóveis reais e não indica criadouro.
- Alagamentos: registro fictício de evento.
- Vitimização: uma vítima fictícia de um evento por registro, sem nomes, perfil individual, endereço ou identificação; não equivale a número de boletins.

## Visualização e limites

Os filtros precedem a agregação em uma grade fixa de 0,01 grau (aproximadamente 1 km nestas latitudes; não é uma malha métrica ou divisão oficial). O mapa de calor usa os centros das células ponderados pelas contagens, com raio em pixels. O modo grade mostra contagens por célula; clique em uma célula para ver o resumo. As camadas possuem cores e contagens independentes. Sobrepor temas não calcula correlação, risco ou causalidade. O total soma registros de tipos diferentes, não pessoas únicas.

O calor é uma visualização de concentração relativa, dependente de zoom e raio, sem denominador populacional. Não deve ser usado para classificar bairros, prever crimes ou definir ações policiais. Antes de uso operacional, integrar bases autorizadas, validar cobertura, deduplicação, temporalidade, significado dos campos e controles de acesso.

As seleções persistem na sessão da página e ao trocar mapa base, mas não após recarregar. As camadas ficam ocultas ao sair para o login. Nenhum dado temático precisa de rede; o mapa base Mapbox continua dependendo de internet.

## Fontes públicas possíveis (não integradas)

- [GeoSampa](https://novogeosampa.prefeitura.sp.gov.br/): limites e infraestrutura urbana. [Publicação municipal sobre iluminação](https://gestaourbana.prefeitura.sp.gov.br/noticias/semaforos-e-pontos-de-iluminacao-publica-podem-ser-localizados-no-geosampa/). Verificar atualização, metadados e licença de cada camada. Ponto de iluminação não é evidência de defeito.
- [Ministério da Saúde — dengue](https://dadosabertos.saude.gov.br/dataset/arboviroses-dengue): notificações epidemiológicas; não converter coordenadas municipais em local exato de casos ou focos.
- [SSP-SP — dados mensais](https://www.ssp.sp.gov.br/estatistica/dados-mensais) e [dados abertos](https://www.ssp.sp.gov.br/transparencia/dados-abertos): verificar a granularidade disponível e se cada tabela contabiliza ocorrências ou vítimas.
- Piscinas: nenhuma base pública local foi integrada ou verificada. Para a PoC, manter sintético; uma integração futura exigiria fonte e licença adequadas.

## Verificação

`node --test layers.test.cjs` valida determinismo, cobertura, combinações de filtros, divisão de turnos, contagem na agregação, seleção vazia e separação entre temas.
