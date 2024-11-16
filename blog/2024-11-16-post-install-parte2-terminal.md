---
title: 'Post Install (Parte 2): Instalar ferramentas de terminal'
description: 'Nessa postagem eu adiciono ao projeto post install as ferramentas que costumo utiliar relacionadas ao terminal, como: Windows Terminal, Clink, Oh My Posh.'
slug: post-install-instalar-terminal
tags: [post install, windows terminal, terminal, windows, powershell, oh my posh, clink]
keywords: [post install, windows terminal, terminal, windows, powershell, oh my posh, clink]
hide_table_of_contents: false
---

Nessa postagem, vou adicionar ao script de pós-instalação, iniciado na [parte 1](/blog/2024-11-09-post-install-parte1-introducao.md), a instalação e configuração de ferramentas relacionadas ao Terminal, são elas:
* [Windows Terminal](https://github.com/microsoft/terminal): um terminal moderno e customizável feito pela própria Microsoft
* [CLink](https://github.com/chrisant996/clink): uma ferramenta que adiciona funcionalidades ao CMD do Windows, também permite integrar o `Oh My Posh` ao `CMD`.
* [Oh My Posh](https://ohmyposh.dev/): uma ferramenta para customizar a aparência do terminal, com suporte a `PowerShell`, `CMD` e `Bash`, entre outros.

Para manter tudo organizando vou criar um script em separado para essa etapa, chamado `Install.Terminal.ps1`.

## Pasta de Configuração

Como citado na postagem anterior, vou usar um armazenamento na nuvem, no meu caso o `OneDrive`, para fazer backup das configurações e mante-las sincronizadas entre reinstalações, e entre os meus computadores. O primeiro passo para isso é criar uma pasta que irá armazenar todas as configurações dentro da pasta sincronizada na nuvem. Dentro dessa pasta serão criadas subpastas para cada programa que instalarmos.

```powershell
$postInstallHome = $env:POST_INSTALL_HOME ?? $env:OneDrive
$configPath = Join-Path -Path $postInstallHome -ChildPath Config
Write-Output "Pasta de Configuração: $configPath"
if(!(Test-Path -PathType Container -Path $configPath)){
    New-Item -Type Directory $configPath | Out-Null
}
```

Esse script é bem simples, como o `OneDrive` vem instalado com o Windows não é necessária uma etapa de instalação, o script apenas cria a pasta `Config`, caso ela ainda não exista. Outra ajuda é o variável de ambiente `OneDrive` que aponta para pasta sincronizada - caso você use outro cliente de armazenamento em nuvem, terá que verificar como ele provê essa informação. Eu adicionei uma leitura a variável de ambiente `POST_INSTALL_HOME` para tornar o script flexível e para auxiliar nos testes.

## Windows Terminal

O Windows Terminal armazena as suas configurações em um arquivo JSON chamado `settings.json`, a [localização desse arquivo](https://learn.microsoft.com/en-us/windows/terminal/install#settings-json-file) depende de qual método foi escolhido para instalar o Windows Terminal, como vamos usar `winget` para instalá-lo, a localização vai ser:

`%LOCALAPPDATA%\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json`

Não existe, pelo menos até o momento, alguma configuração para alterar a local desse arquivo, portanto iremos substituí-lo por *link simbólico* apontando para o `settings.json` do nossa pasta de configurações, como apresentado abaixo.

```powershell
Write-Output 'Instalando Windows Terminal'
winget install 'Microsoft.WindowsTerminal'

$configPathWinTerm = Join-Path -Path $configPath -ChildPath "WindowsTerminal" 
$settingsPathOriginal = Join-Path -Path $env:LOCALAPPDATA -ChildPath "\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json"
$settingsPathConfig = Join-Path -Path $configPathWinTerm -ChildPath "settings.json" 

If(!(Test-Path -PathType Leaf -Path $settingsPathConfig)){
    New-Item -ItemType Directory -Path $configPathWinTerm | Out-Null
    Copy-Item -Path $settingsPathOriginal -Destination $settingsPathConfig -Force | Out-Null
}
New-Item -ItemType SymbolicLink -Path $settingsPathOriginal -Target $settingsPathConfig -Force | Out-Null

# Configurar como terminal padrão

$RegPath = "HKCU:\Console\%%Startup"
New-Item -Path $RegPath -Force | Out-Null
New-ItemProperty -Path $RegPath -Name 'DelegationConsole' -Value '{2EACA947-7F5F-4CFA-BA87-8F7FBEEFBE69}' -PropertyType String -Force | Out-Null
New-ItemProperty -Path $RegPath -Name 'DelegationTerminal' -Value '{E12CFF52-A866-4C77-9A90-F570A7AA2C6B}' -PropertyType String -Force | Out-Null
```

Antes de criar o *link simbólico*, verificamos se o arquivo `settings.json` existe na pasta de configurações, caso não existe fazemos uma cópia do arquivo atual. Observe que **o script deve executar em modo de administrador para conseguir criar o link simbólico**. A última etapa define o Windows Terminal como aplicativo de terminal padrão, essa é uma configuração obscura, pesquisando na internet encontramos os registros que precisamos alterar, mas em documentações oficiais ela é difícil de encontrar, alguns detalhes sobre esse registros pode ser encontrados em: [Default Terminal Choice in Windows OS](https://github.com/microsoft/terminal/blob/main/doc/specs/%23492%20-%20Default%20Terminal/spec.md), e [Windows changing "Default Terminal Application" automatically without asking.](https://github.com/microsoft/terminal/issues/15654).

## Clink

Para configurar o Clink vamos adicionar duas variáveis de ambiente: a variável `CLINK_SETTINGS` define o [local do arquivo `clink_settings`](https://chrisant996.github.io/clink/clink.html#file-locations), que armazena as configurações; e 
a `CLINK_PATH` define o *[local de onde serão carregados scripts lua](https://chrisant996.github.io/clink/clink.html#location-of-lua-scripts). Os scripts lua são usados para extender a funcionalidade do Clink, eles serão usados na próxima etapa para integrar o CLink e o Oh My Posh.

```powershell
Write-Output 'Instalando o Clink'
winget install 'chrisant996.Clink'

$configPathClink = Join-Path -Path $configPath -ChildPath "Clink" 

If(!(Test-Path -PathType Container -Path $configPathClink)){
    New-Item -ItemType Directory -Path "$configPathClink" | Out-Null
}
[Environment]::SetEnvironmentVariable('CLINK_SETTINGS', $configPathClink, 'User')
[Environment]::SetEnvironmentVariable('CLINK_PATH', $configPathClink, 'User')
```

Por enquanto a pasta do `Clink` ficara vazia, na próxima etapa iremos adicionar o script lua para integrar Clink e Oh My Posh.

## Oh My Posh

Por último vamos instalar o `Oh My Posh`, ele não define uma pasta padrão onde configurações são armazenadas, ao invés disso passamos a localização por parâmetro na integração com o terminal. Por enquanto, caso não exista, vamos copiar um tema predefinido ( qualquer um deles ) para pasta de configuração.

```powershell
Write-Output 'Instalando Oh My Posh'
winget install 'JanDeDobbeleer.OhMyPosh'

$configPathPOSH = Join-Path -Path $configPath -ChildPath "OhMyPosh" 

$env:POSH_THEMES_PATH = [System.Environment]::GetEnvironmentVariable("POSH_THEMES_PATH","User") 
$defaultPoshTheme = Join-Path -Path $env:POSH_THEMES_PATH -ChildPath "jandedobbeleer.omp.json"
$poshTheme = Join-Path -Path $configPathPOSH -ChildPath "theme.omp.json"

If(!(Test-Path -PathType Container -Path $configPathPOSH)){
    New-Item -ItemType Directory -Path "$configPathPOSH" | Out-Null
    Copy-Item -Path $defaultPoshTheme -Destination $poshTheme -Force | Out-Null
}
```
Os temas predefinidos podem ser encontrados na pasta apontada na variável de ambiente `POSH_THEMES_PATH`, porém, essa variável pode estar indefinita quando o script foi iniciado, assim a recarregamos para garantir que o script funcione corretamente.

Agora vamos integrá-lo com dois terminais o `PowerShell` e `CMD`. No `PowerShell`, é necessário acrescentar uma linha de chamada ao `Oh My Posh` ao arquivo de perfil, apontado pela variável `$PROFILE` - caso o arquivo não exista ele será criado.

```powershell
# Integrar com PowerShell

if(!(Test-Path -PathType Leaf -Path $PROFILE)){
    New-Item -Path $PROFILE -Force | Out-Null
}
@("if (Get-Command oh-my-posh -ErrorAction SilentlyContinue){ oh-my-posh init pwsh --config `"$poshTheme`" | Invoke-Expression }") + $(Get-Content -Force $PROFILE | Select-String oh-my-posh -NotMatch) | Set-Content $PROFILE
```

Existe uma pequena diferença entre a linha sugerida no [manual de instalação do `Oh My Posh`](https://ohmyposh.dev/docs/installation/prompt) e a adicionada pelo script de pós-instalação: antes de executar, verificamos se o comando `oh-my-posh` está disponível. Como o arquivo de perfil é sincronizado na nuvem, ele pode estar sendo sincronizado em uma estação que não tem o `Oh My Posh` instalado, portanto, se não verificamos a presença do comando, erros vão ocorrer na inicialização do `PowerShell`. A mesmo consideração vai ser feita ao integrar com o `CMD`, logo abaixo.

É interessante tornar a execução de qualquer script "repetível", ou seja, a possibilidade de executar o script várias vezes sem causa danos, nesse caso a operação de inserir uma linha em um arquivo pode ocasionar em várias entradas repetidas, pois desejamos conservar quaisquer outras entradas presentes no arquivo de perfil. Portanto, adotei a seguinte lógica: pego o conteúdo do perfil e removo dele quaisquer linhas que contenham `oh-my-posh`, depois concateno a nova linha ao conteúdo restante e sobrescrevo o arquivo original. Para essa lógica funcionar a chamada do `oh-my-posh` foi escrito de forma a ter apenas uma linha, separada das demais, facilitando a remoção.

No caso do `CMD`, a integração é feita através do `Clink`, criando um script lua como seque abaixo.
 
 ```powershell
 # Integrar com Clink
 
 $poshClinkScript = Join-Path -Path $configPathClink -ChildPath "oh-my-posh.lua"
"if( os.execute('where /Q oh-my-posh') ) then load(io.popen('oh-my-posh init cmd --config `"$($poshTheme -replace '\\', '/')`" '):read(`"*a`"))() end" | Set-Content $poshClinkScript
 ```
 
 Nesse caso não precisamos nos preocupar em conservar o conteúdo pré-existente, portanto, o conteúdo inteiro do arquivo é sobrescrito toda vez.
 
 ## Instalar uma Fonte
 
 O próximo passo do nosso script é [instalar uma fonte](https://ohmyposh.dev/docs/installation/fonts), apesar de não entrar em detalhes, para customizar o terminal é necessária uma fonte que contenha certos caracteres especiais, glifos e ícones - não é obrigatório, mas com certeza potencializa o nível de customização. Você pode dar uma olhada nas fontes disponíveis em [NerdFonts](https://www.nerdfonts.com/). Existem algumas formas fazer essa instalação, aqui vamos aproveitar que o `Oh My Posh` fornece uma opção para isso. Você pode executar `oh-my-posh font install`, sem o nome da fonte, para ver os nomes das fontes disponíveis.
  
 ```powershell
 # Instalar Fontes
 
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User") 
oh-my-posh font install cascadiamono
 ```
 
Note que recarregamos a variável de ambiente `PATH`, pois, como `Oh My Posh` foi instalado anteriormente pelo mesmo script, o `PATH` ainda não contém o caminho para ele. Se isso não fosse feito, a próxima linha iria falhar por ausência do comando.

## Adicionando o scrit ao Install.bat

Por último, vamos adicionar o script ao nosso `Install.bat`.

```batch
@echo off
echo 'Instalando o PowerShell'
winget install "Microsoft.PowerShell"

pwsh -File .\Install.Terminal.ps1
```

## Conclusão

Nosso script de pós-instalação foi incrementado com as ferramentas relacionadas ao terminal, instalamos e deixamos tudo pronto para backup/sincronização, qualquer configuração que for feita no futuro será salva em nosso armazenamento na nuvem. No entanto, não entrei em detalhes as configurações que uso. Também não entrei em detalhes sobre como aplicá-las via script, para muitos isso não é necessário, visto que a estratégia de sincronizar com a nuvem permite que a configuração seja feita apenas uma vez, e sincronizada no restante. 


## Link do Projeto no Github

Os arquivos desse projeto serão armazenados no [GitHub](https://github.com/jeancnasc/post-install)

## Referências
[Windows Terminal](https://github.com/microsoft/terminal)  
[Clink](https://github.com/chrisant996/clink)  
[Oh My Posh](https://ohmyposh.dev/)
[NerdFonts](https://www.nerdfonts.com/)

## Arquivo completo: Install.Terminal.ps1

```powershell
$ErrorActionPreference = 'Stop'

$postInstallHome = $env:POST_INSTALL_HOME ?? $env:OneDrive
$configPath = Join-Path -Path $postInstallHome -ChildPath Config
Write-Output "Pasta de Configuração: $configPath"
if(!(Test-Path -PathType Container -Path $configPath)){
    New-Item -Type Directory $configPath | Out-Null
}

# --------------------------------------------------------------------------------------------------------------

Write-Output 'Instalando Windows Terminal'
winget install 'Microsoft.WindowsTerminal'

$configPathWinTerm = Join-Path -Path $configPath -ChildPath "WindowsTerminal" 
$settingsPathOriginal = Join-Path -Path $env:LOCALAPPDATA -ChildPath "\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json"
$settingsPathConfig = Join-Path -Path $configPathWinTerm -ChildPath "settings.json" 

If(!(Test-Path -PathType Leaf -Path $settingsPathConfig)){
    New-Item -ItemType Directory -Path $configPathWinTerm | Out-Null
    Copy-Item -Path $settingsPathOriginal -Destination $settingsPathConfig -Force | Out-Null
}
New-Item -ItemType SymbolicLink -Path $settingsPathOriginal -Target $settingsPathConfig -Force | Out-Null

# Configurar como terminal padrão

$RegPath = "HKCU:\Console\%%Startup"
New-Item -Path $RegPath -Force | Out-Null
New-ItemProperty -Path $RegPath -Name 'DelegationConsole' -Value '{2EACA947-7F5F-4CFA-BA87-8F7FBEEFBE69}' -PropertyType String -Force | Out-Null
New-ItemProperty -Path $RegPath -Name 'DelegationTerminal' -Value '{E12CFF52-A866-4C77-9A90-F570A7AA2C6B}' -PropertyType String -Force | Out-Null

# --------------------------------------------------------------------------------------------------------------

Write-Output 'Instalando o Clink'
winget install 'chrisant996.Clink'

$configPathClink = Join-Path -Path $configPath -ChildPath "Clink" 

If(!(Test-Path -PathType Container -Path $configPathClink)){
    New-Item -ItemType Directory -Path "$configPathClink" | Out-Null
}
[Environment]::SetEnvironmentVariable('CLINK_SETTINGS', $configPathClink, 'User')
[Environment]::SetEnvironmentVariable('CLINK_PATH', $configPathClink, 'User')

# --------------------------------------------------------------------------------------------------------------

Write-Output 'Instalando Oh My Posh'
winget install 'JanDeDobbeleer.OhMyPosh'



$configPathPOSH = Join-Path -Path $configPath -ChildPath "OhMyPosh" 

$env:POSH_THEMES_PATH = [System.Environment]::GetEnvironmentVariable("POSH_THEMES_PATH","User") 
$defaultPoshTheme = Join-Path -Path $env:POSH_THEMES_PATH -ChildPath "jandedobbeleer.omp.json"
$poshTheme = Join-Path -Path $configPathPOSH -ChildPath "theme.omp.json"

If(!(Test-Path -PathType Container -Path $configPathPOSH)){
    New-Item -ItemType Directory -Path "$configPathPOSH" | Out-Null
    Copy-Item -Path $defaultPoshTheme -Destination $poshTheme -Force | Out-Null
}

# Integrar com PowerShell

if(!(Test-Path -PathType Leaf -Path $PROFILE)){
    New-Item -Path $PROFILE -Force | Out-Null
}
@("if (Get-Command oh-my-posh -ErrorAction SilentlyContinue){ oh-my-posh init pwsh --config `"$poshTheme`" | Invoke-Expression }") + $(Get-Content -Force $PROFILE | Select-String oh-my-posh -NotMatch) | Set-Content $PROFILE

# Integrar com Clink

$poshClinkScript = Join-Path -Path $configPathClink -ChildPath "oh-my-posh.lua"
"if( os.execute('where /Q oh-my-posh') ) then load(io.popen('oh-my-posh init cmd --config `"$($poshTheme -replace '\\', '/')`" '):read(`"*a`"))() end" | Set-Content $poshClinkScript

# Instalar Fontes

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User") 
oh-my-posh font install cascadiamono


```