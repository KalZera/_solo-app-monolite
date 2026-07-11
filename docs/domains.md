# Documento de Descoberta do Domínio
## Visão Geral

O sistema tem como objetivo transformar metas e atividades do mundo real em uma experiência de progressão semelhante a um RPG.

A principal mecânica consiste em permitir que o usuário evolua seu personagem ao concluir missões relacionadas aos seus objetivos pessoais.

O foco do produto não é produtividade, mas progressão contínua.

## Objetivos do Produto
 - Incentivar consistência.
 - Criar sensação de evolução.
 - Aumentar retenção diária.
 - Transformar hábitos em progresso.
 - Motivar o usuário através de recompensas.

## Linguagem Ubíqua
### Usuário (User)

Pessoa que utiliza o sistema.

Responsabilidades

possuir conta
autenticar-se
configurar preferências

### Personagem (Character)

Representa a evolução do usuário dentro do Sistema.

Possui

XP
Level
Atributos
Skills
Histórico

Nunca existe sem um usuário.

### Quest

Uma atividade executada pelo usuário.

Exemplos

 - Estudar inglês
 - Academia
 - Ler livro
 - Trabalhar em projeto

Uma Quest possui:

 - dificuldade
 - recompensa
 - categoria
 - status
 - prazo (opcional)

### XP

Representa experiência.

É concedido quando uma Quest é concluída.

Nunca pode ser negativo.

### Level

Representa o progresso geral.

É calculado automaticamente.

Não pode diminuir.

### Atributo

Representa uma característica do personagem.

No MVP:

 - STR
 - INT
 - AGI
 - VIT
 - CHA

### Skill

Representa uma habilidade específica.

Exemplos

Go

React

Node

Inglês

Liderança

Uma Skill evolui independentemente do Level.

### Recompensa (Reward)

Benefício recebido após concluir uma Quest.

Pode ser

- XP
- Pontos
- Item (futuro)
- Buff (futuro)


### Engine

Componente responsável por executar regras de negócio.

Exemplos

Quest Engine

Progression Engine

Reward Engine

Rule Engine

### Evento

Representa algo que aconteceu.

Exemplo

QuestCompleted

LevelUp

RewardGranted

### Streak

Quantidade de dias consecutivos em que uma atividade foi realizada.

Não influencia XP no MVP.

### Achievement

Conquista permanente obtida ao atingir determinado objetivo.

Não faz parte do MVP.

### Categoria

Agrupa quests.

Exemplo

Estudo

Saúde

Trabalho

Finanças

Pessoal

### Status da Quest

Pending

Completed

Cancelled

Expired

## Regras Gerais

Todo usuário possui exatamente um Character.

Toda Quest pertence a um Character.

Uma Quest só pode ser concluída uma vez.

Toda Quest concluída gera um evento.

Toda recompensa é consequência de um evento.

XP nunca é concedido diretamente pela Quest.

Quem concede XP é o Progression Engine.


## Conceitos Fora do MVP

Estes termos existem no domínio, mas ainda não serão implementados.

- Guild
- Marketplace
- Economia
- Equipamentos
- Inventário
- Buff
- Debuff
- Classes
- Hidden Quest
- IA
- Ranking Global


## Possíveis Bounded Contexts


```
Identity
Responsável por usuários e autenticação. 
```

```
Character
Responsável pelo personagem. 
```
```
Quest
Responsável pelas missões. 
```
```
Progression
Responsável por XP e Level. 
```
```
Reward
Responsável por recompensas. 
```

```
Notification
Responsável por notificações. 
```

# Glossário


Termo	= Significado

User = Pessoa cadastrada

Character = Avatar do usuário

Quest = Missão

XP = Experiência

Level = Nível

Skill = Habilidade

Reward = Recompensa

Engine = Motor de regras

Event = Evento de domínio

Streak = Sequência de dias

Achievement = Conquista


## Dúvidas em Aberto

Essas perguntas devem permanecer vivas até que o produto amadureça.

- O XP será configurável?
- Como calcular a curva de níveis?
- O usuário poderá editar quests concluídas?
- Uma quest poderá conceder múltiplas recompensas?
- Como será calculada a dificuldade?
- Como a IA criará novas quests?
- Como evitar fraudes na conclusão das missões?