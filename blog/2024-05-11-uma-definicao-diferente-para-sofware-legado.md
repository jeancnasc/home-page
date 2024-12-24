---
title: 'Uma definição diferente para código legado'
description: Será que a ausência de teste faz um software ser automaticamente legado?
slug: uma-definicao-diferente-para-codigo-legado
tags: [código legado, conceitos, testes]
keywords: [dev, software-legado, codigo-legado, legado, legacy-software, legacy-code, legacy, teste, tests, teste-unidade, unit-tests]
hide_table_of_contents: false
---

Há algum tempo comecei a ler "Trabalhando eficaz com código legado", de Michael C. Feathers, quando me deparei, ainda no capítulo de apresentação, com sua definição sobre *código legado*: **"*código legado* é simplesmente código sem teste"**. Em resumo, Feathers relaciona *código legado* a código difícil de manter, como código sem testes é difícil de manter logo ele é legado. Já vi muitas maneiras de definir *código legado*, mas essa, sem dúvidas, é a mais impactante. Mesmo achando a definição coerente, uma mistura de descrença e dúvida vieram a minha cabeça.

<!-- truncate -->

Em primeiro lugar, como adepto do TDD (Test Driven Development), reconheço a importância de testes e seu impacto no processo de desenvolvimento de software, e que código sem teste dificilmente será fácil de manter, independente do esforço e disciplina do time em manter tudo limpo, organizado e documentado. **Mas, a presença de testes realmente garante que o código é fácil de manter?** 

Por experiência posso afirmar que não, **teste também é código e passível de se tornar difícil de manter**, já presenciei software cujos testes estavam tão difíceis de manter que o código que eles se propunham a testar, geralmente porque os desenvolvedores não dedicavam aos testes o mesmo esforço que dedicavam para desenvolver o código. **Teste também é parte do software e você também deve dedicar um tempo para deixá-lo limpo e organizado**. Mas podemos compreender que **Feathers não fala de qualquer teste, mas de bons testes de unidade**.

Com as técnicas corretas, testes de unidade são fáceis de manter, diferente de outros testes, como de integração ou funcionais que exigem certa complexidade. **Então bons testes de unidade impetem que o código se torne difícil de manter?** Eu acredito que sim, quem escreve testes de unidade sabe que eles mudam substancialmente como concebemos código, e nosso entendimento sobre a qualidade do código. Portanto, testes de unidade tornam o código fácil de manter, mas, voltando ao início, um código fácil de manter não pode ser considerado legado? E se o código é difícil de alterar porque o framework ou a linguagem estão em desuso?

O problema aqui é a **subjetividade do termo *código legado***, já vi ser usado como um termo mais pejorativo do que prático, de times considerarem uma base de código como "legado" somente pelo fato de não seguir um novo padrão arquitetural - sem aferir sua qualidade ou presença de testes. Para aliviar a consciência sobre um software que você precisa, mas não quer mais manter, então repetem frases como: "é software legado é normal dar problema", "não precisamos gastar muitos recursos nisso (código legado), quando fizer um novo (de novo) os problemas irão desaparecer". Essas são definições são particularmente ruins, porém, se definirmos *código legado* simplesmente como código difícil de manter, **qual a diferença entre os termos *código legado* e *código sujo*?** Talvez esses dois termos possam ser usados como sinônimos, e acredito que muitos os usem dessa forma.

Por fim, acho que a **ausência de testes pode ser um bom critério para definir o que é *código legado***, no entanto, **pode definir melhor o que é *código sujo***, não consigo me livrar da sensação de que esse que falta algo mais para diferenciar *código legado* e *código sujo*.

## Referências

FEATHERS, Michael. Trabalhando eficaz com código legado. Editora Bookman, 2013.
