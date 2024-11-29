---
title: 'Post Install (Parte 4): Instalar Ferramentas Básicas de Desenvolvimento'
description: 'Nessa postagem eu adiciono ao projeto post install a instalação do Git e configuração das chaves SSH, e algumas ferramentas como vscode e o JetBrains Toolbox.'
slug: post-install-dev
tags: [post install, windows, powershell, git, ssh]
keywords: [post install, windows, powershell, git, ssh]
hide_table_of_contents: false
---

Nessa postagem vou adicionar ao script de pós-instalação algumas ferramentas que utilizo no meu trabalho como desenvolvedor, como o editor de código-fonte `vscode` e o `Git`, assim como configuração da chave `SSH` necessária para realizar as operações nos repositórios. Não vou abordar ferramentas específicas para cada linguagem que utilizo, isso poderá ser adicionado mais tarde.

<!-- truncate -->

## Instalando o Visual Studio Code

Para editar código eu utilizo alguns editores, alguns para linguagens específicas, mas gosto de usar o `vscode` para trabalhos que não exigem IDEs mais complexas, ele é rápido, flexível e fácil de usar. Ele sincroniza as configurações a partir da nuvem, então só preciso fazer a instalação. 

```powershell title="Install.Dev.ps1"
Write-Output 'Instalando Visual Code'
winget install Microsoft.VisualStudioCode
```
:::note
Eu fiz essa etapa antes, pois, se o `vscode` não estiver instalado, quando optarmos por ele como editor padrão durante a instalação do `Git` a opção não será aplicada.
:::

## Instalando o Git

Para instalar o [`Git for Windows`](https://git-scm.com/) temos o pacote `Git.Git` no `winget`, no entanto, se você já o instalou alguma vez deve lembrar que o instalador faz diversos questionamentos, como o `winget` faz a instalação de forma silenciosa, eles são respondidos com opções padrões. Podemos fornecer nossas próprias opções fornecendo um arquivo `INF`, esse arquivo pode ser gerado [baixando o instalador](https://git-scm.com/downloads/win), iniciando a instalação fornecendo o argumento `SAVEINF` e o nome do arquivo em que serão gravadas as opções - por exemplo: `.\Git-2.47.1-64-bit.exe /SAVEINF=Setup.Git.inf`. Quando a instalação terminar o arquivo gerado deve parecer com abaixo.

:::note MinGit
Também é possível instalar o pacote `Git.MinGit`, essa é uma instalação mínima do `Git`, porém você pode encontrar problemas, como ter que instalar manualmente alguns componentes como o [`Git LFS`](https://git-lfs.com/).
:::

```ini title="Setup.Git.inf"
[Setup]
Lang=default
Dir=C:\Program Files\Git
Group=Git
NoIcons=0
SetupType=default
Components=gitlfs,assoc,autoupdate,scalar
Tasks=
EditorOption=VisualStudioCode
CustomEditorPath=
DefaultBranchOption=master
PathOption=Cmd
SSHOption=ExternalOpenSSH
TortoiseOption=false
CURLOption=WinSSL
CRLFOption=CRLFAlways
BashTerminalOption=MinTTY
GitPullBehaviorOption=Rebase
UseCredentialManager=Enabled
PerformanceTweaksFSCache=Enabled
EnableSymlinks=Disabled
EnableFSMonitor=Disabled
```

Agora podemos fornecer esse arquivo ao instalador através da opção `--custom` do `winget`.

```powershell title="Install.Dev.ps1"
Write-Output 'Instalando Git'
$infPath = Join-Path -Path $PSScriptRoot -ChildPath "Setup.Git.inf"
winget install Git.Git --custom /LOADINF=$infPath
```



## Configurando Nome e E-Mail

A primeira coisa que devemos fazer após instalar o `Git` é configurar o nosso nome e e-mail. Para isso poderíamos deixar esses dados fixos no script, mas, além do óbvio problema de segurança de deixar esse tipo de informação em um repositório público, não é prático pedir para o usuário alterar um script antes de usá-lo. Assim, vamos solicitar esses dados ao usuário.

Solicitar informações no meio da execução do script não é o ideal, as etapas de instalação podem demorar e o usuário pode não estar - e não é pretendido que esteja - atendo a execução. O script pode ficar longos períodos parado solicitando uma informação para um usuário que saiu para tomar um café. Então, vamos pedir todas as informações no início do script e armazená-las em variáveis de ambientes - isso permite reusarmos as informações se for necessário reexecutar o script.

```powershell title="Input.Fullname.ps1"
$fullname = [Environment]::GetEnvironmentVariable('POST_INSTALL_FULLNAME', 'User')
if($null -eq $fullname){
    $fullname = Read-Host -Prompt "Informe seu Nome Completo"
    [Environment]::SetEnvironmentVariable('POST_INSTALL_FULLNAME', $fullname, 'User')
} else {
    Write-Host "Nome Completo: $fullname"
}
$env:POST_INSTALL_FULLNAME=$fullname
```

```powershell title="Input.Email.ps1"
$email = [Environment]::GetEnvironmentVariable('POST_INSTALL_EMAIL', 'User')
if($null -eq $email){
    $email = Read-Host -Prompt "Informe seu E-Mail"
    [Environment]::SetEnvironmentVariable('POST_INSTALL_EMAIL', $email, 'User')
} else {
    Write-Host "E-Mail: $email"
}
$env:POST_INSTALL_EMAIL=$email

```

Chamamos ambos os scripts antes de qualquer outro no `Install.bat`.

```batch title="Install.bat"
@echo off
echo 'Instalando o PowerShell'
winget install "Microsoft.PowerShell" --accept-source-agreements --accept-package-agreements

pwsh -File %~dp0\Install.Input.Fullname.ps1
pwsh -File %~dp0\Install.Input.Email.ps1
...

```

Agora podemos configurar o `Git` usando as variáveis de ambiente. Executarmos os script novamente antes de configurar para garantir que as variáveis foram configuradas, no caso do script ser executado isoladamente.

```powershell title="Install.Dev.ps1"

& $PSScriptRoot/Input.Fullname.ps1
& $PSScriptRoot/Input.Email.ps1

git config --global user.name "$env:POST_INSTALL_FULLNAME"
git config --global user.email "$env:POST_INSTALL_EMAIL"

```

:::tip múltiplos e-mails
Se você usa múltiplos e-mails, por exemplo, um para uso pessoal e outro para o profissional, configurar o nome e e-mail globalmente pode ser um problema, você pode acidentalmente usar o e-mail pessoal em um repositório profissional. O ideal nesse caso é não configurar globalmente (`--global`), e fazer isso local (`--local`), para cada repositório. Você vai ter o trabalho de configurar isso toda vez que criar ou clonar um repositório, mas estará seguro que, caso esquecer de fazê-lo o `git` apresentará uma mensagem que o lembrará do seu erro.
:::

## Configurando SSH

Por fim, como uso o `SSH` para me conectar ao `Git`, vou configurar as chaves de acesso, sincronizando-as no armazenamento da nuvem. As chave ficam armazenadas na pasta `.ssh` na raiz da pasta do usuário (apontada na variável de ambiente `USERPROFILE`), então basta criar um link simbólico. Vou criar um script em separado para esse parte, caso seja necessário executá-lo a parte em um momento futuro.

```powershell title="Install.Dev.SSH.ps1"
$postInstallHome = $env:POST_INSTALL_HOME ?? $env:OneDrive
$configPath = Join-Path -Path $postInstallHome -ChildPath Config

Write-Output 'Configurando SSH'
& $PSScriptRoot/Input.Email.ps1

$sshOriginalPath = Join-Path -Path $env:USERPROFILE -ChildPath ".ssh"
$sshConfigPath = Join-Path -Path $configPath -ChildPath "SSH"


if(Test-Path -Type Container -Path $sshConfigPath){
    if((Test-Path -Type Container -Path $sshOriginalPath) -and ($null -eq (Get-Item $sshOriginalPath ).LinkType)){
        $time = Get-Date -Format "yyyyMMddHHmmss"
        Move-Item $sshOriginalPath "$sshOriginalPath.$time.bak" | Out-Null
    }
} else {
    if(Test-Path -Type Container -Path $sshOriginalPath){
        Move-Item $sshOriginalPath $sshConfigPath | Out-Null
    } else{
        New-Item -ItemType Directory $sshConfigPath | Out-Null
    }
}
New-Item -ItemType SymbolicLink -Path $sshOriginalPath -Target $sshConfigPath -Force | Out-Null

$keyPath = Join-Path -Path $sshOriginalPath -ChildPath "id_rsa"
if(!(Test-Path -PathType Leaf $keyPath)){
    Write-Host "Gerando Chave para $env:POST_INSTALL_EMAIL"
    "y" | ssh-keygen -t ed25519 -C $env:POST_INSTALL_EMAIL -N "" -f $keyPath
}
```

A primeira parte do script é verificar se já existem a pasta de configuração e a pasta `.ssh`, e então move ou faz uma cópia de segurança, conforme a necessidade, por último, ele cria o link simbólico. Depois ele gera a chave de caso ela ainda não exista, note que um `y` é passado ao programa que gera as chaves, isso acontece para responder uma pergunta que o programa faz e que não pode ser ignorada de outra forma. Com a chave gerada temos que cadastrar a chave pública em quaisquer serviços em que desejamos usá-la, esses passos não serão detalhados aqui.

:::danger Segurança das Chaves SSH
Existem algumas questões de segurança, que talvez sejam revisadas mais tarde. 

Primeiro, por se tratar de informações sensíveis, sincronizar as chaves `SSH` em um armazenamento na nuvem pode não ser a ação mais segura. Talvez o ideal seja gerar e configurar a chave sempre que configurar uma nova estação de trabalho. 

Segundo que usamos uma senha em branco para gerar a chave.

Terceiro seria interessante gerar novas chaves de tempo em tempo

:::

## Install.bat

Agora vamos adicionar o script ao nosso arquivo `Install.bat`. Lembrando que os scripts de entrada de informação serão executados antes de todos os outros.

```batch title="Install.bat"
@echo off
echo 'Instalando o PowerShell'
winget install "Microsoft.PowerShell" --accept-source-agreements --accept-package-agreements

pwsh -File %~dp0\Input.Fullname.ps1
pwsh -File %~dp0\Input.Email.ps1
pwsh -File %~dp0\Install.Terminal.ps1
pwsh -File %~dp0\Install.WSL.ps1
pwsh -File %~dp0\Install.Dev.ps1
pwsh -File %~dp0\Install.Dev.SSH.ps1
```

## Conclusão

Agora nosso script de pós-instalação tem as ferramentas básicas para começar em desenvolvimento de software, outras ferramentas podem ser adicionadas conforme a necessidade, como outros sistemas de controle de versão e editor de código, e claro, compiladores e IDEs.


## Link do Projeto no Github

Os arquivos desse projeto serão armazenados no [GitHub](https://github.com/jeancnasc/post-install)


## Referências
[Getting Started - First-Time Git Setup](https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup)  
[Gerando uma nova chave SSH e adicionando-a ao agente SSH](https://docs.github.com/pt/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)

## Arquivo completo: Install.Dev.ps1

```powershell
$ErrorActionPreference = 'Stop'

# --------------------------------------------------------------------------------------------------------------

Write-Output 'Instalando Visual Code'
winget install Microsoft.VisualStudioCode

# --------------------------------------------------------------------------------------------------------------

Write-Output 'Instalando Git'
$infPath = Join-Path -Path $PSScriptRoot -ChildPath "Setup.Git.inf"
winget install Git.Git --custom /LOADINF=$infPath

& $PSScriptRoot/Input.Fullname.ps1
& $PSScriptRoot/Input.Email.ps1

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User") 

git config --global user.name "$env:POST_INSTALL_FULLNAME"
git config --global user.email "$env:POST_INSTALL_EMAIL"
```