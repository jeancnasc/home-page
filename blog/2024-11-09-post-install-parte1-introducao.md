---
title: 'Post Install (Parte 1): Introdução ao Projeto Post-Install'
description: Nessa postagem eu apresento o projeto post install, cujo objetivo é automatizar as etapas de pós-instalação do meu sistema, e a etapa de instalação do powershell.
slug: post-install-parte1-introducao
tags: [post install, windows, powershell, winget]
keywords: [post install, windows, powershell, winget]
hide_table_of_contents: false
---

Uma tarefa incomoda após a troca de máquina, ou reinstalação da mesma, é instalar e configurar tudo conforme nossas preferências pessoais, na prática, precisamos executar várias etapas manuais para colocar o sistema no estado desejamos. Outro problema é quando temos mais de uma estação de trabalho e queremos manter tudo sincronizado. Para nos auxiliar nessa tarefa podemos recorrer a soluções como o [Ninite](https://ninite.com/), mas, a verdade é que nada é mais flexível do que fazermos nossos próprios scripts para automatizar essas etapas de configuração.
 
O objeto desse projeto é criar scripts que automatizem etapas de configuração pós-instalação para instalar e configurar minhas maquinas, e compartilhar o resultado para que qualquer um possa adaptá-los para suas necessidades. A minha pretensão é separa os scripts em categorias, para organizar, e para garantir que eu possa executar etapas em separado caso algo dê errado.

<!-- truncate -->

## PowerShell

A primeira decisão sobre esse projeto é em que linguagem os scripts serão escritos. Em primeiro lugar, vou considerar que minhas máquinas vão usar o sistema `Windows` - de minha preferência pessoal -, portanto, entre as opções estão `Batch` e `PowerShell`, mas também seria possível tentar usar `Python` e, com alguma dificuldade, `Shell Script`.

No meu caso vou escolher `PowerShell`, pois é uma linguagem que já tenho algum conhecimento e acredito ser mais versátil que `Batch`. Note que existe uma diferença entre a versão do `Windows PowerShell`, a que já vem instalada no Windows, e `PowerShell` mais recente, existe certa compatibilidade entre os scripts de ambas as versões, mas para evitar qualquer tipo de problema vou preferir executar os scripts nesse último.

## WinGet

Como uso o `Windows`, para instalar qualquer software de que necessito irei usar, em primeiro lugar, o [`WinGet`](https://learn.microsoft.com/pt-br/windows/package-manager/winget/), e caso ele não o possua recorrei a gestores de pacotes de terceiros, como o [`Scoop`](https://scoop.sh/) e o [`Chocolatey`](https://chocolatey.org/). Irei evitar ao máximo baixar software direto pela URL, pois a URL pode defasar e implicar em instalar software desatualizado, ou ficar indisponível, exigindo que a URL seja manualmente atualizada no script.

## OneDrive

Uma das minhas pretensões nesse projeto é manter uma pasta de configurações em um armazenamento na nuvem, automatizando o backup das configurações e sincronizado diferentes estações de trabalho que tenho. Isso será feito substituindo os arquivos de configuração por *links simbólicos* que apontem para os arquivos de configuração no armazenamento da nuvem. Alguns programas permitem alterar a pasta em que armazenam, ou procuram, seus arquivos de configuração, e quando isso estiver disponível será preferido. Mas outros vão exigir alguma solução para fazer ou restaurar uma cópia de segurança.

Existem muitas soluções de armazenamento na nuvem gratuitos disponíveis, mas em meu caso irei usar o `OneDrive`, porque já uso a bastante tempo, e já está pré-instalado no Windows. Acredito que qualquer outra solução deva funcionar bem.

## Primeira etapa: Instalando o PowerShell

Vou considerar uma instalação limpa do `Windows 11` como ponto partida, apesar do `Windows PowerShell 5.1` vir pré-instalado, essa versão é diferente da versão do `PowerShell` que pretendo usar, portanto, o script de partida será escrito em `Batch`, por hora, ele irá instalar o `PowerShell` e apenas isso, mas confirme o projeto avançar ira executar o restante dos scripts.

```batch Install.bat
@echo off
echo 'Instalando o PowerShell'
winget install 'Microsoft.PowerShell'
```

## Sincronizar arquivos do PowerShell

O `PowerShell` armazena as configurações dentro da pasta `Documentos`, a qual o OneDrive já faz sincronização, portanto, nenhuma configuração é necessária.

## Link do Projeto no Github

Os arquivos desse projeto serão armazenados no [GitHub](https://github.com/jeancnasc/post-install)

## Conclusão

Aqui apresento minha ideia inicial para o script de pós-instalação que pretendo construir, tomei algumas decisões que estão relacionadas ao meu gosto pessoal, porém, acredito que qualquer um poderá alterar o que eu fizer para seu próprio gosto sem dificuldades. 

## Referências

[PowerShell](https://github.com/PowerShell/PowerShell)  
[Usar a ferramenta WinGet para instalar e gerenciar aplicativos](https://learn.microsoft.com/pt-br/windows/package-manager/winget/)  
[Scoop: A command-line installer for Windows](https://scoop.sh/)  
[The Package Manager for Windows](https://chocolatey.org/)