---
title: 'Post Install (Parte1): Introdução ao Projeto Post-Install'
description: Nesse postagem eu apresento o projeto post install, cujo objetivo é automatizar as etapas de pós-instalação do meu sistema, e a etapa de instalação do powershell.
slug: post-install-parte1-introducao
tags: [post install, windows, powershell, winget]
keywords: [post install, windows, powershell, winget]
hide_table_of_contents: false
---

Uma tarefa incomoda após a troca de máquina, ou reinstalação da mesma, é instalar e configurar tudo conforme nossas preferências pessoais, na prática, precisamos executar várias etapas manuais para colocar o sistema no estado desejamos. Outro problema é quando temos mais de uma estação de trabalho e queremos manter tudo sincronizado. Para nos auxiliar nessa tarefa podemos recorrer a soluções como o Ninite[^1], mas, a verdade é que nada é mais flexível do que fazermos nossos próprios scripts para automatizar essas etapas de configuração.
 
O objeto desse projeto é criar scripts que automatizem etapas de configuração pós-instalação para instalar e configurar minhas maquinas, e compartilhar o resultado para que qualquer um possa adaptá-los para suas necessidades. A minha pretensão é separa os scripts em categorias, para organizar, e para garantir que eu possa executar etapas em separado caso algo dê errado.

## PowerShell

A primeira decisão sobre esse projeto é em que linguagem os scripts serão escritos. Em primeiro como devo considerar que minhas máquinas usam o sistema Windows, portanto, entre as opções estão `Batch` e `PowerShell`[^2], mas também seria possível tentar usar `Python` e, com alguma dificuldade, `Shell Script`.

No meu caso vou escolher `PowerShell`, pois é uma linguagem que já tenho algum conhecimento e acredito ser mais versátil que `Batch`. Note que existe uma diferença entre a versão do `Windows PowerShell` e `PowerShell`, geralmente os scripts que ire escrever podem ser executadas em ambas as versões, mas para evitar qualquer tipo de incompatibilidade vou preferir executar os scripts no último, devido a sua proposta multiplataforma.

## WinGet

Como uso o Windows, para instalar qualquer software de que necessito irei usar, em primeiro lugar, o WinGet[^3], e caso ele não o possua recorrei a gestores de pacotes de terceiros, como o Scoop[^4] e o Chocolatey[^5]. Irei evitar ao máximo baixar software direto pela URL, pois isso pode implicar em instalar software desatualizado.

## OneDrive

Uma das minhas pretensões nesse projeto é manter uma pasta de configurações em um armazenamento na nuvem, automatizando o backup das configurações e sincronizado diferentes estações de trabalho que tenho. Isso será feito substituindo os arquivos de configuração por *links simbólicos* que apontem para os arquivos de configuração no armazenamento da nuvem. Alguns programas permitem alterar a pasta em que armazenam, ou procuram, seus arquivos de configuração, e quando isso estiver disponível será preferido. Mas outros vão exigir alguma solução para fazer ou restaurar uma cópia de segurança.

Existem muitas soluções de armazenamento na nuvem gratuitos disponíveis, mas em meu caso irei usar o `OneDrive`[^6], porque já uso a bastante tempo, e já está pré-instalado no Windows. Acredito que qualquer outra solução deva funcionar bem.

## Primeira etapa: Instalando o PowerShell

Vou considerar uma instalação limpa do `Windows 11` como ponto partida, apesar do `Windows PowerShell 5.1` vir pré-instalado, essa versão é diferente da versão do `PowerShell` que pretendo usar, portanto, o script de partida será escrito em `Batch`, por hora, ele irá instalar o `PowerShell` e apenas isso, mas confirme o projeto avançar ira executar o restante dos scripts.

```batch Install.bat
@echo off
echo 'Instalando o PowerShell'
winget install 'Microsoft.PowerShell'
```


## Referências

[^1][Ninite](https://ninite.com/)  
[^2][PowerShell](https://github.com/PowerShell/PowerShell)  
[^3][Usar a ferramenta WinGet para instalar e gerenciar aplicativos](https://learn.microsoft.com/pt-br/windows/package-manager/winget/)  
[^4][Scoop: A command-line installer for Windows](https://scoop.sh/)  
[^5][The Package Manager for Windows](https://chocolatey.org/)