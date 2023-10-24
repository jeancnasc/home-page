---
title: Tratamento de Erro
description: 'Práticas que adoto para tornar minhas aplicações mais simples de depurara e monitorar, evitando longas sessões de depuração árdua para determinar a causa de um erro.'
keywords: [erro, error, tratamento de erro, excecao, exception, boas praticas]
---

Durante o ciclo de vida de uma aplicação, a presença de erros é inevitável, seja na fase de desenvolvimento ou produção. Erros são partes integrais do funcionamento de um software, independentemente do quão testado e rígido seja o controle de qualidade, esperar que um programa nunca falhe é, no mínimo, ingenuidade. De fato, para muitos projetos é inviável testar cada parte do software, em cada situação possível, imaginável ou inimaginável.

Assim, como desenvolvedores responsáveis, temos que assumir que erros acontecem, e que nosso código esteja preparado para responder adequadamente. Os erros devem ser registrados, o tratamento deve ser capaz de tornar as falhas tão claras quanto possível, mesmo que elas não sejam esperadas.

Nessa seção irei descrever algumas das práticas que adoto para tornar minhas aplicações mais simples de depurara e monitorar. A ideia aqui não é apenas impedir a introdução involuntária de erros na aplicação, mas também evitar longas sessões de depuração árdua para determinar a causa de um erro, isso quando ele não ocorre em situações difíceis de reproduzir em ambiente controlado.
