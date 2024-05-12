---
title: 'EditorConfig: mantenha o estilo de codifição consistente no seu time'
description: EditorConfig é uma ferramenta que ajuda a manter estilos de codificação consistentes para vários desenvolvedores que trabalham no mesmo projeto em diferentes editores e IDEs.
slug: editorconfig-estilo-codificacao-consistente
tags: [boas praticas, ferramentas]
keywords: [editorconfig, boas praticas, code style, dev tools]
hide_table_of_contents: false
---
EditorConfig é uma ferramenta que ajuda a manter estilos de codificação consistentes para vários desenvolvedores que trabalham no mesmo projeto em diferentes editores e IDEs. Ele consiste em um formato de arquivo para definir estilos de codificação e uma coleção de plugins de editor de texto que permitem que os editores leiam o formato de arquivo e sigam os estilos definidos. Os arquivos EditorConfig são facilmente legíveis e funcionam bem com sistemas de controle de versão.

<!-- truncate -->


## Por que usar EditorConfig?

As convenções de codificação usadas em seus projetos pessoais podem ser diferentes das usadas nos projetos de sua equipe. Por exemplo, talvez você prefira que, quando estiver codificando, o recuo adicione um caractere de tabulação. No entanto, sua equipe pode preferir que o recuo adicione quatro caracteres de espaço em vez de um caractere de tabulação. Essas diferenças podem causar inconsistências, erros e conflitos no código. Para evitar esses problemas, você pode usar EditorConfig para definir e impor estilos de codificação consistentes para cada projeto.

## Como criar e usar arquivos EditorConfig?

Para usar EditorConfig, você precisa criar um arquivo chamado `.editorconfig` na pasta raiz do seu projeto ou em qualquer subpasta. Esse arquivo deve conter seções que especificam os estilos de codificação para diferentes tipos de arquivos, usando um formato INI compatível com o Python ConfigParser Library. Cada seção deve ter um nome que corresponda a um padrão de caminho de arquivo, usando caracteres curinga como `*`, `?`, `[` e `]`. Dentro de cada seção, você pode definir várias propriedades que afetam o estilo de codificação, como `indent_style`, `indent_size`, `end_of_line`, `charset`, `trim_trailing_whitespace` e `insert_final_newline`. Você pode encontrar a lista completa de propriedades suportadas no [site oficial do EditorConfig](https://editorconfig.org/).

Quando você abre um arquivo em um editor que suporta EditorConfig, ele procura por um arquivo `.editorconfig` no diretório do arquivo aberto e em todos os diretórios pai. A pesquisa por arquivos `.editorconfig` irá parar se o caminho raiz for alcançado ou se um arquivo EditorConfig com `root=true` for encontrado. Os arquivos EditorConfig são lidos de cima para baixo e as regras mais recentes encontradas têm precedência. As propriedades das seções correspondentes do EditorConfig são aplicadas na ordem em que foram lidas, portanto, as propriedades dos arquivos mais próximos têm precedência.

## Exemplo de arquivo EditorConfig

A seguir, um exemplo de arquivo `.editorconfig` que define estilos de codificação para arquivos Python e JavaScript.

```ini
# EditorConfig is awesome: https://EditorConfig.org

# top-most EditorConfig file
root = true

# Unix-style newlines with a newline ending every file
[*]
end_of_line = lf
insert_final_newline = true

# Matches multiple files with brace expansion notation
# Set default charset
[*.{js,py}]
charset = utf-8

# 4 space indentation
[*.py]
indent_style = space
indent_size = 4

# Tab indentation (no size specified)
[Makefile]
indent_style = tab

# Indentation override for all JS under lib directory
[lib/**.js]
indent_style = space
indent_size = 2

# Matches the exact files either package.json or .travis.yml
[{package.json,.travis.yml}]
indent_style = space
indent_size = 2
```

## Como instalar e configurar plugins EditorConfig?

Para que o EditorConfig funcione, você precisa instalar um plugin para o seu editor ou IDE de escolha. Você pode encontrar a lista de plugins disponíveis para vários editores e IDEs no [site oficial do EditorConfig](https://editorconfig.org/). Alguns editores, como o Visual Studio, já têm suporte integrado ao EditorConfig e não requerem nenhum plugin adicional.

Depois de instalar o plugin, você pode configurá-lo de acordo com as suas preferências. Por exemplo, no Visual Studio, você pode acessar as configurações do EditorConfig em Ferramentas > Opções > Editor de Texto > C# > Estilo de Código > Formatação > Geral. Lá, você pode escolher se deseja aplicar as preferências do EditorConfig ao digitar, ao colar ou ao formatar o documento. Você também pode executar a Limpeza de Código (Ctrl + K, Ctrl + E) para aplicar as configurações do EditorConfig ao código existente.

## Conclusão

EditorConfig é uma ferramenta útil que permite definir e impor estilos de codificação consistentes para diferentes projetos, editores e IDEs. Ele ajuda a evitar inconsistências, erros e conflitos no código, melhorando a qualidade e a legibilidade do código. Para usar o EditorConfig, você precisa criar um arquivo `.editorconfig` com as propriedades desejadas e instalar um plugin para o seu editor ou IDE. Você pode encontrar mais informações e recursos sobre o EditorConfig no [site oficial](https://editorconfig.org/).

## Referências

[EditorConfig](https://editorconfig.org/), (16/02/2024).   
[Definir estilos de codificação com EditorConfig](https://learn.microsoft.com/pt-br/visualstudio/ide/create-portable-custom-editor-options?view=vs-2022.), (16/02/2024)