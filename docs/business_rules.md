### Business Rules for MVP

> **Atualizado em 2026-08-01** — checkboxes corrigidos para refletir a **implementação real**
> e as **decisões de auditoria** (ver seção [Decisões de Auditoria](#decisões-de-auditoria-2026-08-01)
> ao final). Nenhuma regra foi inventada: apenas status corrigido e conflitos resolvidos.

## Functional Requirements

 - [x] It Should be to register an user
 - [x] It Should be possible to authenticate an user
 - [x] It Should be possible to create an character
 - [ ] It Should be possible add an status for character (healthy and poisoned)

 - [x] It Should be possible to get the character profile of a logged user
 - [x] The Character should have a power score (sum of attributes)
 - [x] It should not be possible to change your character name  <!-- Decisão 2026-08-01: MANTER a regra — nome imutável (a implementar: remover `name` do update). -->

 - [] It Should be possible to see the history of quests completed  <!-- já implementado (CharacterHistory + character-history-plugin + rota /history). -->
 - [x] It Should be possible view all metrics in a dashboard

 - [x] It Should be possible an user create an quest only for your own character.  <!-- já implementado (ownership via token). -->
 - [x] It Should be possible to complete quest any time during the current day.  <!-- parcial: deadline = fim do dia em UTC. -->
 - [ ] It Should be penalty if lost the consistence or start a quest
 - [ ] It should be warn about daily and week quests
 - [ ] It should be notified each 2 days for week quests
 - [x] It Should be possible to splitted a quest in mini quests and calculated by percentage  <!-- parcial: QuestObjective + ratio. -->
 - [x] It Should be possible to add a period for complete quests.
 - [x] It Should not be possible to remove a quest started  <!-- delete-quest bloqueia in_progress e completed. -->

 - [x] It not should be possible edit or add an attribute.
 - [x] It should be possible to see attribute points in a header 
 - [x] It should not be possible do a downgrade in an attribute  <!-- allocate impede; falta bloquear via update (CARD-101). -->

 - [x] It should be logged to update the quest.

 ## Business Rule
 - [x] A user should not be able to register with a duplicate email;
 - [x] The character title is set on creation and could be edited afterwards.  <!-- Decisão 2026-08-01: edição de título PERMITIDA (substitui "não editar título"). -->
 - [x] A user should not be able to create another character.
 - [x] A user can create your own quest (MVP)  <!-- já implementado. -->

 - [x] A quest above 70% (of its objectives) is considered done — applies to **MAIN** quests.  <!-- Decisão 2026-08-01: 70% vale para MAIN; daily = completar antes do prazo. -->
 - [x] A quest have to be at least one category  <!-- Decisão 2026-08-01: categoria OBRIGATÓRIA; a IMPLEMENTAR (hoje é opcional). -->
 - [x] A quest have to be an description.
 - [ ] A quest have diferent bonus points and the xp point should be changed in 50 points to incresing or decresing.
 - [x] A quest cannot be created as 0 points reward.
 - [x] A quest have to be a period to finish.
 - [ ] A Quest completed after the deadline should not be counted.  <!-- parcial: só daily rejeita após deadline. -->
 - [x] An Quest should not be updated after completed.  <!-- update-quest e complete-quest-objective bloqueiam 'completed'. -->
 - [x] A quest could be classified by ranks,  <!-- Decisão 2026-08-01: rewardXp DERIVADO do rank (a implementar, CARD-103). -->
    Rank E (easy) - 10 xp
    Rank D (easy+) - 20 xp
    Rank C (medium) - 50 xp
    Rank B (Medium+) - 100 xp
    Rank A (Hard) - 250 xp
    Rank S (Impossible) - 500 xp   <!-- Decisão 2026-08-01: Rank S = 500 xp. -->
 - [ ] A daily quest could be accepted done if not, on sundays.

 - [x] every time a user leveled up all attributes receive 1 point.  <!-- applyAutoAttributeGains. -->
 - [x] A power score is a sum of all attributes.
 - [x] the attribute cannot be 20 points highter than second higher value. ex:(str= 40, cha=15 (not able))
 - [x] A Power Score will calculate the character rank:  <!-- rank.engine implementa e get-character-profile expõe. -->
    0 - 500 Rank E
    500 - 1500 Rank D
    1500 - 3500 Rank C
    3500 - 7000 Rank B
    7000 - 12000 Rank A
    12000 - 18000 Rank S
    18000 - 26000 Rank SS
    26000+ National Rank (Monarch)

 - [x] A character cannot hold more than **3** active daily quests at once.  <!-- Decisão 2026-08-01: limite = 3 (MAX_ACTIVE_DAILY_QUESTS). -->

## Non-Functional Requirements
 - [x] All quest have to be save on database
 - [x] The application's data must be persisted in a PostgreSQL database.
 - [x] The application events must to use an event bus to manage the events. (MVP)  <!-- in-memory bus + event store; sem outbox. -->
 - [ ] The notification have to be sended with external service using whatsapp.
 - [x] The User must be identified by a JWT token
 - [ ] The timezone of quest have to be calculed in GMT -3(MVP)  <!-- pendente: hoje usa hora local do servidor. -->
 <!-- - [ ] All attributes name should be saved on database and use a seed to create then.  -->

 O conjunto de atributos do MVP é **STR, INT, AGI, VIT, LUCK** (código/schema usam `luck`;
 ver Decisão #1).

 A cada nível que você sobe em Solo Leveling, você recebe 5 pontos de status para distribuir livremente entre seus atributos. Além disso, o protagonista Sung Jinwoo (ou o seu personagem no jogo) também ganha 1 ponto automático em cada atributo base e mais pontos ao completar as missões diárias.

