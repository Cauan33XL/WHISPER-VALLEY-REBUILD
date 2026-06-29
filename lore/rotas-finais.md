# 🔀 Rotas e Finais

## Sistema de Rotas

Whisper Valley possui atualmente **dois finais**, determinados por uma única condição: se o jogador possui a **Relíquia** no inventário ao concluir o puzzle das Ruínas.

```
                    Puzzle das Ruínas Completo
                            │
                    ┌───────┴────────┐
                    │                │
             Tem Relíquia?    Não tem Relíquia?
                    │                │
              FINAL BOM         FINAL RUIM
              (Fuga)            (Sacrifício)
```

---

## ✅ Final Bom — A Fuga

### Condição
Possuir a **Relíquia** no inventário.

### Sequência de Eventos

**Cena 14**: Os pedestais e estátuas desaparecem.
> *"Mas o quê?! Sumiram!"*  
> *"Onde estão...? Os pedestais? As estátuas?"*  
> *"Isto não está certo. De jeito nenhum."*

**Cena 15**: A seita confronta Ethan.
> *Líder: "Você chegou, viajante. O momento da oferenda se aproxima."*  
> *Ethan: "Quem são vocês?! Fiquem longe de mim!"*  
> *Membro: "O Abraxas aguarda. Sua alma será uma dádiva."*

Ethan saca a Relíquia em desespero. Uma luz surge dela, desorientando a seita.
> *Membro: "O que é isso?!"*  
> *Líder: "Peguem-no! Não o deixem escapar!"*

**Cena 16**: Ethan foge entre as árvores enquanto os gritos da seita ficam para trás.

### Epílogo
> *"Depois de retornar, Ethan publica sua matéria, mas ninguém acredita em sua história. O mundo a trata como uma obra de ficção. Por causa do fracasso da publicação, ele é demitido do jornal e permanece como o único vivo que conhece a verdade sobre Whisper Valley."*

### Análise
O final "bom" é amargo. Ethan sobrevive, mas:
- Perde o emprego
- Ninguém acredita nele
- Miguel continua desaparecido
- A seita continua operando
- Ele é o único que sabe a verdade, e ninguém quer ouvi-la

É um final que reflete o **horror existencial**: sobreviver ao pesadelo e descobrir que o mundo real pode ser tão cruel quanto o sobrenatural.

---

## ❌ Final Ruim — O Sacrifício

### Condição
**Não** possuir a Relíquia no inventário.

### Sequência de Eventos

**Cena 11**: Os pedestais e estátuas desaparecem (idêntico ao final bom).

**Cena 12**: A seita confronta Ethan, mas desta vez ele não tem defesa.
> *Líder: "Você chegou, Ethan. No momento certo."*  
> *Membro: "O Abraxas espera. Sua chegada é um sinal."*  
> *Ethan: "Sacrifício?! Não! Eu me recuso!"*

Os membros avançam. Ethan grita, mas é subjugado.
> *"Não! Soltem-me! Eu não quero! NÃO!"*

**Cena 13**: Ethan é levado para o fogo.
> *"Gritos de Ethan são abafados enquanto ele é levado para o fogo."*  
> *Líder: "A oferenda foi aceita. Glória a Abraxas."*

### Análise
O final ruim é direto e brutal. Sem a Relíquia, Ethan se torna mais um nome nas lápides em branco do cemitério. A seita vence, Abraxas é alimentado, e a cidade continua seu ciclo eterno.

A nota mencionando o nome de Ethan pelo líder (*"Você chegou, Ethan"*) reforça que ele nunca foi investigador — sempre foi **presa**.

---

## Comparação

| Aspecto | Final Bom | Final Ruim |
|---|---|---|
| **Ethan** | Sobrevive, foge | Morre como sacrifício |
| **A Seita** | Desorientada, mas intacta | Vitoriosa |
| **Abraxas** | Privado da oferenda | Alimentado |
| **Miguel** | Nunca encontrado | Nunca encontrado |
| **A Verdade** | Conhecida por Ethan, ignorada pelo mundo | Perdida para sempre |
| **Tom** | Amargo, solitário | Sombrio, absoluto |

---

## Rotas para Expansão

### 🔓 Rota Secreta / Final Verdadeiro
Uma terceira rota onde Ethan:
- Descobre o destino real de Miguel
- Encontra um meio de **derrotar** (não apenas fugir de) Abraxas
- Liberta os moradores corrompidos
- Expõe a verdade de forma que o mundo acredite

### 🔄 New Game+
Após completar o jogo uma vez:
- NPCs têm diálogos diferentes
- Novos locais se desbloqueiam
- A Relíquia tem poderes adicionais
- Pistas sobre o destino de Miguel são reveladas

### 📓 Rota do Miguel
Uma rota paralela jogável como Miguel:
- Mostra os eventos antes da chegada de Ethan
- Revela como Miguel descobriu Whisper Valley
- Termina no momento do seu desaparecimento
- Fornece contexto que enriquece a rota de Ethan

### ⚔️ Rota da Infiltração
Ethan se infiltra na seita em vez de fugir:
- Ganha a confiança do líder
- Descobre a verdadeira natureza de Abraxas
- Tem a oportunidade de destruir a seita por dentro
- Risco: ser corrompido no processo

## Notas para Implementação

- O sistema atual já suporta a verificação de itens no inventário (`this.inventoryItens.includes('Relíquia')`)
- Novos finais podem ser adicionados checando **combinações** de itens
- Um contador de **puzzles resolvidos vs. puzzles resolvidos corretamente** pode criar variações
- Diálogos de NPCs podem mudar baseado na rota, usando o sistema de `sequenceIndex` já implementado
