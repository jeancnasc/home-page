---
title: 'Post Install (Parte 3): Instalar o WSL'
description: 'Nessa postagem eu adiciono ao projeto post install a instalação do WSL e configuração do Oh My Posh no WSL'
slug: post-install-instalar-wsl
tags: [post install, windows, powershell, oh my posh, wsl]
keywords: [post install, windows, powershell, oh my posh, wsl]
hide_table_of_contents: false
---

Na postagem anterior, instalamos as ferramentas relacionadas ao terminal, agora vamos instalar o [WSL (Windows Subsystem for Linux)](https://learn.microsoft.com/pt-br/windows/wsl/). Essa instalação envolve um desavio extra: habilitar o `WSL` exige a reinicialização do computador. Além disso, vamos configurar o Oh My Posh no terminal `bash` do `WSL`.

<!-- truncate -->

## Instalação do WSL

Antigamente, o processo de instalar o `WSL` envolvia algumas etapas, incluindo ativar recursos de virtualização do Windows, no entanto, o processo foi simplificado e atualmente é preciso apenas um comando - `wsl --install` -, ele instala os componentes necessários sem a intervenção do usuário. Aqui eu vou instalá-lo usando o `Ubuntu` como distribuição, se você optar por outro sistema deverá fazer o ajuste aqui e nos scripts seguintes.

```powershell
Write-Output 'Instalando o WSL'
wsl --install Ubuntu --no-launch
```

Por padrão, após a instalação o `WSL` é iniciado para concluir a instalação da distribuição, nesse processo ele solicita um usuário e senha, e depois deixa o terminal aberto, assim, o script ficará preso nessa etapa até o usuário sair manualmente - executando o comando `exit`. Isso não é prático, nem intuitivo, por isso adicionamos o parâmetro `--no-launch`, ele diz ao `WSL` que para não executar o sistema após a instalação. Para prosseguir com a configuração vamos executar um comando - como `echo` -, ao invés de abrir um terminal. Assim ele irá concluir a instalação, pedir o nome de usuário e senha, executar o comando solicitado e se encerrar logo que o comando terminar. 

O caminho normal para fazer isso seria executar `wsl echo`, mas como a instalação do `Ubuntu` não foi concluída, isso vai gerar um erro, ou executar em outra distribuição - se houver. Portanto, vamos usar o binário do próprio `Ubuntu` dessa forma: `ubuntu run echo`. 

:::note
Eu poderia ignorar a etapa de inserir manualmente o usuário e senha usando o comando `ubuntu install --root`, isso o deixaria executando com o usuário `root` - o que tem seus riscos -, ou criando o usuário mais tarde e usando o comando `ubuntu config --default-user <nome de usuário>` para configurar o usuário padrão para esse novo usuário. Mas, por enquanto, considero essa pequena etapa manual aceitável.
:::

Existe mais um problema que devemos contornar, instalar o `WSL` pode requerer a reinicialização da máquina, somente após a reinicialização podemos prosseguir com a configuração. Então precisamos detectar quando o `WSL`, mas especificamente o `Ubuntu`, está pronto para prosseguir, para isso vamos criar um processo separado para executar a etapa anterior e verificar seu o código de saída.

```powershell
$checkPendingReboot = Start-Process -FilePath ubuntu -ArgumentList "run echo" -PassThru -Wait
...
if(($checkPendingReboot.ExitCode) -ne 0) {
    ...
}
```

O comando `Start-Process` inicia um novo processo, o parâmetro `-Wait` faz ele aguardar o término do processo antes de retornar, se ele não fizer isso o código de saída não será capturado corretamente. Já o parâmetro `-PassThru`, faz o comando retornar um objeto que representa o processo criado, a partir dele podemos obter o código de saída (`ExitCode`) e verificar se ele falhou - ou seja, se é diferente (`-ne`, é abreviação de ***N**ot **E**qual*) de `0`. Agora precisamos decidir o que vamos fazer quando uma reinicialização for necessária.

Como já citei em partes anteriores, nosso script tenta ser repetível, de tal forma que execuções seguidas devem restaurar as configurações, ou corrigir falhas de execuções anteriores. Portanto, poderíamos executar o script novamente depois da reinicialização para prosseguir a configuração, porém, vamos adotar uma solução um pouco mais complexa, vamos criar uma tarefa no `Agendador de Tarefas` para executar após a reinicialização, e para isso vamos criar um script separado para configurar o `WSL`, executar esse script será a ação da nossa tarefa.

```powershell
$configScript = Join-Path -Path $PSScriptRoot -ChildPath ".\Install.WSL.Config.ps1"
if(($checkPendingReboot.ExitCode) -ne 0) {
    $taskTrigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
    $taskAction = New-ScheduledTaskAction `
        -Execute "cmd" `
        -Argument "/C pwsh -File $configScript"
        
    Unregister-ScheduledTask "WSL" -TaskPath "\Post-Install\" -Confirm:$false -ErrorAction Ignore | Out-Null
    Register-ScheduledTask "WSL" -TaskPath "\Post-Install\" -Action $taskAction -Trigger $taskTrigger -RunLevel Highest | Out-Null
} else {
    & $configScript
}
```

Para esse tarefa o gatilho será a logon do usuário atual. Como instalamos o `PowerShell` pelo `winget`, o `Agentador de Tarefas` não consegue executá-lo diretamente, por isso, a ação será pedir para o `cmd` chamar o `pwsh` e executar o script. Por fim, para garantir, removemos qualquer outra tarefa registrada com o mesmo nome e registramos a nova tarefa solicitando a execução em nível elevado/administrador (`-RunLevel Highest`). Note que, caso o `WSL` esteja pronto para configurar, o script será executado imediatamente. Agora vamos nos concentrar no script de configuração, que chamamos de `Install.WSL.Config.ps1`.

```powershell
$postInstallHome = $env:POST_INSTALL_HOME ?? $env:OneDrive
$configPath = Join-Path -Path $postInstallHome -ChildPath Config

ubuntu run echo
wsl --set-default Ubuntu
wsl --user root -- apt update `&`& apt upgrade -y
```

A primeira parte define as variáveis, que já mencionamos na parte anterior, que iremos utilizar no restante do script. Logo após executamos o comando que já tinha sido detalhado antes, note que executamos ele novamente porque esse script também deve executar após a reinicialização, ou seja, após esse mesmo comando falhar no outro script. Nosso script pode falhar se houve outra distribuição configurada como padrão, por exemplo, quando o `Docker` está instalado, portanto, configuramos o `Ubuntu` como distribuição padrão do `WSL` - isso também evita que sejamos obrigados a usar `--distribution <ditribuição>` em cada comando `wsl`. Por último, buscamos e aplicamos todas as atualizações de pacotes disponíveis do `ubuntu`.

## Instalando o Oh My Posh dentro do WSL

A instalação do `Oh My Posh` no `Linux` é simples, basta executar o script de instalação, conforme o [guia de instalação](https://ohmyposh.dev/docs/installation/linux). Porém, essa instalação exige certos programas, como o próprio `curl` usado para baixar o script, dependendo da distribuição esses pacotes podem já estar pré-instalados, no caso do `Ubuntu`, o pacote `unzip` não está pré-instalado e isso deve ser feito antes de instalar o `Oh My Posh`.

```powershell
wsl --user root -- apt install unzip
wsl -- curl -s https://ohmyposh.dev/install.sh `| bash -s
```

:::note
Em partes anteriores, eu comentei que evitaria baixar manualmente pacotes de instalação, preferindo usar gerenciadores de pacote. No caso do `Oh My Posh` para `Linux` vou abrir uma exceção, pois a única outra forma de instalá-lo é pelo `Homebrew`, acho desnecessário instalá-lo apenas para esse caso, além disso, a URL do script é limpa, sem detalhes como a versão, por exemplo, que poderiam nos forçar a atualizar a URL de tempos em tempos.
::: 

Agora que o `Oh My Posh` está instalado vamos configurá-lo no `bash`, para isso precisamos do caminho para o tema, que está na pasta de configurações, mencionado em partes anteriores. 

:::info
O `WSL`, por padrão, monta as unidades do `Windows` no diretório `/mnt`, por exemplo, a pasta de usuário pode ser acessada por `/mnt/c/Users/`. 
:::

Vamos usar o utilitário `wslpath` para converter o caminho do `Windows` no seu equivalente no `WSL`. Como seque abaixo.

```powershell
$configPathPOSH = Join-Path -Path $configPath -ChildPath "OhMyPosh" 
$poshTheme = Join-Path -Path $configPathPOSH -ChildPath "theme.omp.json"

$poshThemeWsl = wsl wslpath "$($poshTheme -replace '\\','\\')"
```

Precisamos adicionar uma chamada ao `Oh My Posh` no arquivo `.profile` do usuário, vou usar a mesma regra que usei para ao configurar o `PowerShell` para tornar o processo repetível. Há apenas um detalhe a mais, criei um backup do arquivo antes de alterá-lo, achei isso necessário devido a sua importância para o funcionamento do sistema.

``` powershell
$time = Get-Date -Format "yyyyMMddHHmmss"
wsl -- cp ~/.profile ~/.profile.$time.bak 
wsl -- cat ~/.profile.$time.bak `| grep --invert-match oh-my-posh `> ~/.profile 
wsl -- echo "eval `"\`$(oh-my-posh init bash --config `"$poshThemeWsl`" )`"" `>> ~/.profile
```

## Remover tarefa agendada

A última etapa do script de configuração é remover a tarefa de configuração, caso ela exista.

``` powershell

Unregister-ScheduledTask "WSL" -TaskPath "\Post-Install\" -Confirm:$false -ErrorAction Ignore | Out-Null

```

# Install.bat

Agora vamos adicionar o script ao nosso arquivo `Install.bat`. Há mais um ajuste aqui, os parâmetros `--accept-source-agreements` e `--accept-package-agreements` foram adicionados para evitar a interação manual para aceitar licenças do repositório e do pacote, respectivamente, ao instalar o `PowerShell`.

```batch
@echo off
echo 'Instalando o PowerShell'
winget install "Microsoft.PowerShell" --accept-source-agreements --accept-package-agreements

pwsh -File %~dp0\Install.Terminal.ps1
pwsh -File %~dp0\Install.WSL.ps1
```

## Conclusão

Aqui conseguimos instalar o `WSL`, talvez a instalação mais complexa até agora, pois exige um reinicialização no meio do processo de configuração. E configuramos o `Oh My Posh` no `bash`, apontando para o mesmo tema do outros terminais que configuramos, mantendo a consistência - agora vemos todos o mesmo tema aplicado a todos os terminais que uso.


## Link do Projeto no Github

Os arquivos desse projeto serão armazenados no [GitHub](https://github.com/jeancnasc/post-install)


## Referências
[Documentação do Subsistema Windows para Linux](https://learn.microsoft.com/pt-br/windows/wsl/)
[Oh My Posh](https://ohmyposh.dev/)

## Arquivo completo: Install.WSL.ps1
```powershell
$ErrorActionPreference = 'Stop'

Write-Output 'Instalando o WSL'
wsl --install Ubuntu --no-launch
$checkPendingReboot = Start-Process -FilePath ubuntu -ArgumentList "run echo" -PassThru -Wait
$configScript = Join-Path -Path $PSScriptRoot -ChildPath ".\Install.WSL.Config.ps1"
if(($checkPendingReboot.ExitCode) -ne 0) {
    $taskTrigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
    $taskAction = New-ScheduledTaskAction `
        -Execute "cmd" `
        -Argument "/C pwsh -File $configScript"
        
    Unregister-ScheduledTask "WSL" -TaskPath "\Post-Install\" -Confirm:$false -ErrorAction Ignore | Out-Null
    Register-ScheduledTask "WSL" -TaskPath "\Post-Install\" -Action $taskAction -Trigger $taskTrigger -RunLevel Highest | Out-Null
} else {
    & $configScript
}

```

## Arquivo completo: Install.WSL.Config.ps1
```powershell
$ErrorActionPreference = 'Stop'

$postInstallHome = $env:POST_INSTALL_HOME ?? $env:OneDrive
$configPath = Join-Path -Path $postInstallHome -ChildPath Config

# --------------------------------------------------------------------------------------------------------------
# Configurar o WSL

ubuntu run echo
wsl --set-default Ubuntu
wsl --user root -- apt update `&`& apt upgrade -y

# --------------------------------------------------------------------------------------------------------------
# Instalar o Oh My Posh

wsl --user root -- apt install unzip
wsl -- curl -s https://ohmyposh.dev/install.sh `| bash -s

$configPathPOSH = Join-Path -Path $configPath -ChildPath "OhMyPosh" 
$poshTheme = Join-Path -Path $configPathPOSH -ChildPath "theme.omp.json"

$poshThemeWsl = wsl wslpath "$($poshTheme -replace '\\','\\')"

$time = Get-Date -Format "yyyyMMddHHmmss"
wsl -- cp ~/.profile ~/.profile.$time.bak 
wsl -- cat ~/.profile.$time.bak `| grep --invert-match oh-my-posh `> ~/.profile 
wsl -- echo "eval `"\`$(oh-my-posh init bash --config `"$poshThemeWsl`" )`"" `>> ~/.profile

# --------------------------------------------------------------------------------------------------------------
# Remover Tarefa

Unregister-ScheduledTask "WSL" -TaskPath "\Post-Install\" -Confirm:$false -ErrorAction Ignore | Out-Null
```
