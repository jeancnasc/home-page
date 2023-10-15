---
title: Exceções Genéricas
description: 'Exceções Genéricas'
---

Um bom tratamento de erro exige do desenvolvedor a compreensão sobre quando e como erros acontecem, e os detalhes envolvidos no seu tratamento. Essa é uma tarefa desafiante se levarmos em conta a diversidade de erros que a aplicação pode enfrentar. Para auxiliar nisso, irei explicar o que chamo de exceções "genérias", um conceito que acredito ser essencial para desenvolver um tratamento de erros eficiente, além de descrever um problema comum: tratar uma exceção "genérica" de forma específica.

## Definindo o problema

Para demostrar esse problema é apresentado o código abaixo. É um programa simples, ele preenche uma matriz de cem números usando o resultado da divisão de dois número gerados aleatoriamente.

```java
Random r = new Random();
int[] resultado = new int[100];

for (int c = 0; c <= 100; c++) {
    int a = r.nextInt(0, Integer.MAX_VALUE);
    int b = r.nextInt(9);
    System.out.printf("%1$10d / %2$d = ", a, b);

    resultado[c] = a / b;
    System.out.println(resultado[c]);
}
```

Ao executarmos, veremos que o ele é encerrado abruptamente em algum momento da repetição com a seguinte mensagem:

```text
Exception in thread "main" java.lang.ArithmeticException: / by zero
```

Esse é um erro de divisão por zero, podemos corrigi-lo de algumas formas, mas para nossa demonstração vamos supor que nos solicitaram apenas que seja impresso uma mensagem na tela, da seguinte forma:

```java
Random r = new Random();
int[] resultado = new int[100];

for (int c = 0; c <= 100; c++) {
    int a = r.nextInt(0, Integer.MAX_VALUE);
    int b = r.nextInt(9);
    System.out.printf("%1$10d / %2$d = ", a, b);

    // highlight-next-line
    try {
        resultado[c] = a / b;
        System.out.println(resultado[c]);
    // highlight-start
    } catch (Exception ex) {
        System.out.println("divisão por zero");
    }
    // highlight-end
}
```

Abaixo é apresentado as últimas dez linhas da saída do programa.

```text
...
1508881077 / 0 = divisão por zero
1876825288 / 1 = 1876825288
2134431072 / 5 = 426886214
1466923053 / 3 = 488974351
  46475564 / 5 = 89295112
 554033125 / 0 = divisão por zero
1466158909 / 5 = 293231781
1579460336 / 2 = 789730168
 465918227 / 5 = 93183645
1768198173 / 3 = divisão por zero
```

O programa parece funcionar bem até a última linha, se o executarmos mais vezes notaremos que isso é uma constante: a última linha impressa sempre informa uma divisão por zero independentemente do valor do divisor. Um desenvolvedor atento pode ter notado a falha deste a primeira versão do programa, para alguns talvez uma segunda revisão mais cuidadosa do código possa revelar a causa do problema, mas para outros esse tipo de falha pode ser incompreensível e frustrante, e somente uma depuração cuidadosa, e talvez trabalhosa, do código vai tornar a causa da falha evidente. Na vida real,  é muito comum estarmos nesse último grupo.

Para evidenciar o problema vamos imprimir a pilha de chamada,  usando o método printStackTrace - não recomendo o uso desse método em código de produção, mas para essa demonstração é aceitável.

```java
Random r = new Random();
int[] resultado = new int[100];

for (int c = 0; c <= 100; c++) {
    int a = r.nextInt(0, Integer.MAX_VALUE);
    int b = r.nextInt(9);
    System.out.printf("%1$10d / %2$d = ", a, b);

    try {
        resultado[c] = a / b;
        System.out.println(resultado[c]);
    } catch (Exception ex) {
        System.out.println("divisão por zero");
        // highlight-next-line
        ex.printStackTrace(System.out);
    }
}
```

Agora a saída deixa claro a causa falha: um acesso indevido a uma posição inexistente do matriz **resultado**. Podemos corrigir o problema alterando o comparador usado na condição do laço de repetição de menor ou igual (<=) para menor (<). Porém, vamos nos concentrar em outro erro: o tratamento de exceção "genérica".

```text
...
 525233387 / 3 = 175077795
2116174946 / 4 = 529043736
 367870062 / 4 = 91967515
 446970251 / 5 = 89394050
 456889423 / 4 = 114222355
1337715920 / 2 = 668857960
1011633637 / 8 = 126454204
 312052865 / 4 = 78013216
1015692406 / 0 = divisão por zero
java.lang.ArithmeticException: / by zero
at com.codificandonamarra.App3.main(App3.java:16)
1451992593 / 6 = divisão por zero
java.lang.ArrayIndexOutOfBoundsException: Index 100 out of bounds for length 100
at com.codificandonamarra.App3.main(App3.java:16)
```

:::info Definição: Exceção "genérica"

Eu defino exceção "genérica" da seguinte forma: é aquela cujo nível de abstração não permite determinar com exatidão o motivo do seu lançamento. Em termos mais leigos, o nome da exceção não contem o motivo exato que resultou no lançamento da exceção.

:::

:::note Um Caso Mais Real: Tratando erros do Banco de Dados

O código abaixo apresenta o erro de tratamento de exceção genérica em um caso real e é muito comum com desenvolvedores inexperientes. Fazendo uma análise do código podemos presumir que a intenção do autor era retornar nulo somente quando a consulta retornar vazia, mas inadvertidamente ele está tratando todas as exceções retornando nulo, isso inclui exceções de instabilidade de conexão com o banco de dados, de erro de sintaxe SQL, entre outras.

```java
public class PessoaRepositorio {
   public Pessoa recuperarPeloCpf( Long cpf ) {
      try {
         ...
         return getEntityManager().createQuery(sql).getSingleResult();
      } catch ( Exception e ) {
         return null;
      }
   }
}
```

Esse erro é muito sutil e geralmente difícil de detectar, pois a taxa de exceções por consulta vazia é muitas vezes maior que outras exceções. Ele pode provocar comportamentos estranhos e desencadear outros erros pelo sistema, image a situação:

- O usuário solicita um novo cadastro no sistema (esse usuário já possui um cadastro e o sistema deveria negar um novo);
- O sistema usa o método do exemplo para consultar se o CPF já tem um cadastro;
- Porém a consulta gera um erro diferente de resultado vazio, por exemplo um timeout;
- O erro é capturado e tratado retornando nulo;
- Então o sistema assume que por retornar nulo o usuário não tem cadastro e, se nenhum outro mecanismo impedir, o cadastro será duplicado.
- A partir daqui outras partes do sistema que dependem da unicidade do cadastro podem falhar.

:::

## Uma exceção mais específica

Para melhorar o entendimento desse conceito, vamos nos focar no bloco que captura a exceção do programa:

```java
try {
   resultado[c] = a / b;
   System.out.println(resultado[c]);
// highlight-next-line
} catch (Exception ex) {
   System.out.println("divisão por zero");
}
```

Sabemos que nesse trecho existem dois erros distintos acontecendo: um pela divisão por zero, e outro por acesso a uma posição inexistente da matriz. Porém, a exceção capturada não fornece nenhuma informação sobre o erro e assim ambos são tratados com a mensagem "divisão por zero". Percebemos que erros de divisão por zero emitem uma exceção mais específica: **ArithmeticException**, portanto, vamos modificar o código para usar essa exceção mais específicas.

```java
try {
   resultado[c] = a / b;
   System.out.println(resultado[c]);
   // highlight-next-line
} catch (ArithmeticException ex) {
   System.out.println("divisão por zero");
}
```

A saída desse programa segue como abaixo:

```text
...
1386559585 / 0 = divisão por zero
1856377901 / 7 = 265196843
1649105237 / 7 = 235586462
1972343633 / 3 = 657447877
1013241349 / 6 = 168873558
1698639712 / 1 = 1698639712
 260793858 / 1 = 260793858
2051253597 / 0 = divisão por zero
 448884457 / 3 = 149628152
1502839834 / 7 = Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 100 out of bounds for length 100
at com.codificandonamarra.App4.main(App4.java:16)
```

:::danger Evite fazer: Escolher o tratamento correto a partir de atributos da exceção

Poderíamos verificar a mensagem dentro da exceção para tomar uma decisão sobre o tratamento correto, no entanto esse campo não é projetado especificamente para isso, por exemplo o lançador pode alterar a mensagem sem alterar o motivo de seu lançamento. De fato, a partir da versão 17 do Java, a mensagem de algumas exceções lançadas pela JVM foram alteradas para melhorar o diagnóstico do erro.

Exceções podem definir outros campos além da mensagem, alguns desse campos podem ser projetados para tomar decisões de tratamento de erro. Em geral, eu prefiro não tomar decisões com base nesses campos, a não ser para formatar ou incluí-los na mensagem ao usuário.

:::

## Acertando os níveis de abstração

Agora o programa trata o erro de divisão por zero e deixa outros erros sem tratamento, qualquer desenvolvedor que execute o programa irá notar a falha imediatamente, sem depurar, ou ser confundido por mensagens enganosas. No entanto, a exceção que capturamos, um "erro aritmético", ainda não é tão específica quanto o erro que estamos tratando, um "erro de divisão por zero". Para demostrar isso vamos alterar o programa como apresentado abaixo:

```java
Random r = new Random();
int[] resultado = new int[100];

for (int c = 0; c <= 100; c++) {
    int a = r.nextInt(0, (int) (Integer.MAX_VALUE * 0.51));
    int b = r.nextInt(9);
    System.out.printf("( 2 * %1$10d ) / %2$d = ", a, b);

    try {
        resultado[c] = Math.multiplyExact(2, a )/ b;
        System.out.println(resultado[c]);
    } catch (ArithmeticException ex) {
        System.out.println("divisão por zero");
        ex.printStackTrace(System.out);
    }
}
```

Novamente a saída da aplicação apresenta a mensagem de erro de divisão por zero mesmo com divisor diferente de zero, desta vez a o problema é um *overflow* causado pelo método *multiplyExact*.

```text
...
( 2 * 1440869253 ) / 4 = divisão por zero
java.lang.ArithmeticException: integer overflow
at java.base/java.lang.Math.multiplyExact(Math.java:959)
at com.codificandonamarra.App5.main(App5.java:16)
...
```

:::info Definição: Graus de abstração ou especificidade

Como qualquer classe, uma exceção pode apresentar graus deferentes de abstração, algumas (como Throwable, Exception e RuntimeException) são tão abstratas que a única informação que passam é que são exceções. Para outras (como IOException, ArithmeticException) conseguimos determinar uma categoria para o erro.

:::

A exceção específica que precisamos capturar é algo como DivideByZeroException, infelizmente a linguagem Java não fornece uma exceção específica para divisão por zero, portando teremos que criar uma e lançar por conta própria. Abaixo está a versão final do programa, tratando única e exclusivamente o caso em que zero é passado como divisor.

```java
public static void main(String[] args) {
    Random r = new Random();
    int[] resultado = new int[100];

    for (int c = 0; c <= 100; c++) {
        int a = r.nextInt(0, (int) (Integer.MAX_VALUE * 0.51));
        int b = r.nextInt(9);
        System.out.printf("( 2 * %1$10d ) / %2$d = ", a, b);

        try {
            resultado[c] = divide(Math.multiplyExact(2, a), b);
            System.out.println(resultado[c]);
            // highlight-next-line
        } catch (DivideByZeroException ex) {
            System.out.println("divisão por zero");
        }
    }
}

private static int divide(int a, int b) {
    // highlight-next-line
    if(b == 0) throw new DivideByZeroException();
    return a / b;
}

// highlight-next-line
public static class DivideByZeroException extends ArithmeticException {}
```

:::info Definição: Exceção "específica"

Uma exceção que define muito bem o motivo de seu lançamento, algo que fica expresso pelo seu nome. Ou seja, fornece "contexto o suficiente para determinar a fonte e a localização de um erro" (FEATHERS, Em MARTIN, Código Limpo, 2011, p. 107).

:::

## Um tratamento genérico

Nem sempre precisamos fazer um tratamento dão específico como no caso anterior, na verdade, na maior parte do tempo trataremos exceções que possuem algum nível de generalidade. Por exemplo, poderia ser aceitável pedirmos para o usuário entrar em contato com a equipe de suporte quando houver qualquer erro, sem fornecer muitos detalhes.

```java
try {
   resultado[c] = Math.multiplyExact(2, a) / b;
   System.out.println(resultado[c]);
   // highlight-start
} catch (Exception ex) {
   System.out.println("erro!!! consulte a equipe de suporte");
   // highlight-end
}
```

Essa solução é válida, pois assim como a exceção não fornece nenhum detalhe sobre a falha, o tratamento também não o faz. O importante aqui é ter um **tratamento no mesmo nível de abstração da exceção capturada**.

## Passando a responsabilidade para o lançador

Outra solução é imprimir a mensagem da própria exceção, como abaixo.

```java
try {
   resultado[c] = Math.multiplyExact(2, a) / b;
   System.out.println(resultado[c]);
   // highlight-start
} catch (Exception ex) {
   System.out.println(ex.getMessage());
   // highlight-end
}
```

Agora a responsabilidade de gerar a mensagem apresentada foi passada para a exceção, ou melhor, o seu lançador. Assim, podemos ter mensagens específicas para cada erro sem fazer um tratamento específico para cada exceção.

```text
...
( 2 * 1080413109 ) / 6 = integer overflow
( 2 *  101241475 ) / 8 = 25310368
( 2 *  547773654 ) / 1 = 1095547308
( 2 *  605723191 ) / 1 = 1211446382
( 2 *  768253728 ) / 0 = / by zero
( 2 * 1012063592 ) / 7 = 289161026
( 2 *  666022798 ) / 7 = 190292228
( 2 *  924605594 ) / 6 = 308201864
( 2 *  617788264 ) / 7 = 176510932
( 2 *  725209953 ) / 1 = Index 100 out of bounds for length 100
```

O resultado obtido pode ser aceitável para a nossa demonstração, porém as mensagens impressas podem ser muito técnicas para produção. Em geral, queremos mensagens mais amigáveis ao usuário. Para atingir esse resultado devemos tratar uma exceção mais específica, uma exceção da aplicação em que está imposta que o lançador deve atribuir mensagens direcionas ao usuário. O programa abaixo usa uma exceção própria para imprimir as mensagens.

```java
public static void main(String[] args) {
    Random r = new Random();
    int[] resultado = new int[100];

    for (int c = 0; c <= 100; c++) {
        int a = r.nextInt(0, (int) (Integer.MAX_VALUE * 0.51));
        int b = r.nextInt(9);
        System.out.printf("( 2 * %1$10d ) / %2$d = ", a, b);

        try {
            resultado[c] = calcular(a, b);
            System.out.println(resultado[c]);
            // highlight-start
        } catch (AppException ex) {
            System.out.println(ex.getMessage());
            // highlight-end
        } catch (Exception ex) {
            System.out.println("erro!!! consulte a equipe de suporte");
        }
    }
}

private static int calcular(int a, int b) {
    if (b == 0) throw new AppException("divisão por zero");
    return Math.multiplyExact(2, a) / b;
}

// highlight-start
public static class AppException extends RuntimeException {
    public AppException(String message) {
        super(message);
    }
}
// highlight-end
```

E a saída segue como abaixo:

```text
...
( 2 * 1085919210 ) / 2 = erro!!! consulte a equipe de suporte
( 2 *  784114204 ) / 0 = divisão por zero
( 2 *  116116000 ) / 4 = 58058000
( 2 *  251411321 ) / 6 = 83803773
( 2 *  974270770 ) / 3 = 649513846
( 2 *   43322173 ) / 1 = 86644346
( 2 *  149255343 ) / 3 = 99503562
( 2 *  382684342 ) / 8 = 95671085
( 2 *  448434819 ) / 2 = 448434819
( 2 *  170258881 ) / 7 = erro!!! consulte a equipe de suporte
```

Note que a exceção criada não é específica, seu nível de abstração não permite tomar nenhuma decisão no tratamento, a não ser imprimir a mensagem, cujo qual impomos ser direcionada ao usuário. Note também que optamos por uma solução mista: para a exceção mais específica que criamos, e consequentemente para todas as exceções derivadas, imprimimos sua mensagem; e para as demais imprimimos uma mensagem genérica. Perceba a compatibilidade no nível de abstração entre a exceção capturada e seu respectivo tratamento.

## Lançar exceções específicas vs genéricas

O exemplo anterior pode ter suscitado uma dúvida sobre o que é melhor: lançar uma exceção específica ou uma exceção genérica. Note que que optar por sempre lançar exceções específicas significa criar um conjunto grande de classe de exceção e, como qualquer código, existe certo custo envolvido em sua manutenção, isso pode levar a uma sobrecarga desnecessária ao desenvolvimento. Ao invés disso, Feathers (Em MARTIN, Código Limpo, 2011, p. 107) sugere: "defina as classes de exceção segundo as necessidades do chamador".

Imagine um formulário de cadastro que emite alertas sobre a validade dos valores inseridos pelo usuário, para cada campo é criada uma exceção específica: CpfInvalidoException para o campo CPF, EmailInvalidoException para o campo e-mail, NomeDeUsuarioJaExisteException para o nome do usuário. Para todas essas exceções, o chamador, vai aplicar um único tratamento possível: informar o usuário sobre o problema para que ele mesmo o corrija. Portando, pode-se substituir todas essas exceções por uma única exceção CampoInvalidoException sem grandes prejuízo, afinal exite apenas um único tratamento.

Por outro lado, usar exceções genéricas pode dificultar o tratamento mais específico. Foi isso que aconteceu no exemplo da sessão [Acertando os níveis de abstração](#acertando-os-níveis-de-abstração), a JVM não lançava a exceção especifica que precisávamos, ela não esperava que iriamos precisar dela. Isso é um problema para qualquer um que desenvolve código compartilhado, como bibliotecas: é difícil definir as classes conforme o chamador, pois não o conhecemos. Note que nem sempre o contorno do lançamento de uma exceção genérica está disponível e de fácil implementação, porém, traduzir ume exceção específica para uma mais genérica é simples. Portanto, nessa situação, pode ser preferível optar por lançar exceções mais específicas, e aceitar os custos de manter uma hierarquia grande de exceções consistente.

## Lançar exceções base da hierarquia

Em muitas linguagens todas as exceções herdem de uma única classe. Em Java todas herdam de Exception, não recomendo lançar exceções dessa classe por um detalhe da linguagem Java: ela é uma exceção verificada. Porém, apesar de poder ser vista como uma má prática, com base na necessidade do chamador é possível lançar RuntimeException, a base de todas as exceções não verificadas, quando não se deseja, ou não há expectativa, para um tratamento específico do erro lançado. Isso permite adiar a criação de exceções específicas até o momento em que elas são necessárias. Nesse caso, deve-se restringir essa prática a código em que o chamador e lançador estão no mesmo repositório de código, isso permite que qualquer desenvolvedor possa alterar para uma exceção mais específica sem dificuldade.

## Conclusão

Qualquer programador que deseje produzir código de alta qualidade deve ter o conhecimento de trabalhar com exceções de forma efetiva, para isso é essencial distinguir o exceções genéricas, identificar seu nível de abstração e optar por um tratamento do mesmo nível.

## Referência

FEATHERS, Michael. Tratamento de Erro. In: MARTIN, Robert C, et al. Código Limpo: habilidades do Agile Software. Alta Books, 2011.
