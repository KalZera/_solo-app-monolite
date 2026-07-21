### Business Rules for MVP

## Functional Requirements

 - [x] It Should be to register an user
 - [x] It Should be possible to authenticate an user
 - [x] It Should be possible to create an character
 - [ ] It Should be possible add an status for character (healthy and poisoned)

 - [x] It Should be possible to get the character profile of a logged user
 - [ ] The Character should have a power score (sum of attributes)
 - [ ] It should not be possible to change your character name

 - [ ] It Should be possible to see the history of quests completed
 - [ ] It Should be possible view all metrics in a dashboard
 
 - [ ] It Should be possible an user create an quest only for your own character. 
 - [ ] It Should be possible to complete quest any time during the current day. 
 - [ ] It Should be penalty if lost the consistence or start a quest 
 - [ ] It should be warn about daily and week quests
 - [ ] It should be notified each 2 days for week quests 
 - [ ] It Should be possible to splitted a quest in mini quests and calculated by percentage 
 - [ ] It Should be possible to add a period for complete quests.
 - [ ] It Should not be possible to remove a quest started 

 - [ ] It not should be possible edit or add an attribute. 
 - [ ] It should be possible to see attribute points in a header
 - [ ] It should not be possible do a downgrade in an attribute
 
 - [ ] It should be logged to update the quest. 

 ## Business Rule 
 - [ ] A user should not be able to register with a duplicate email;
 - [ ] A user should not be able to create or edit a character title (MVP).
 - [ ] A user have to choose your character title once, 
 - [ ] A user should not be able to create another character.
 - [ ] A user can create your own quest (MVP)

 - [ ] A quest above 70% is considered done if the quest is a daily quest. 
 - [ ] A quests have to be at least one category
 - [ ] A Title have to be an description. 
 - [ ] A quest have diferent bonus points and the xp point should be changed in 50 points to incresing or decresing.
 - [ ] A quest cannot be created as 0 points reward.
 - [ ] A quest have to be a period to finish. (???)
 - [ ] A Quest completed after the deadline should not be counted.
 - [ ] An Quest should not be updated after completed. 
 - [ ] A quest could be classified by ranks, 
    Rank E (easy) - 10 xp
    Rank D (easy+) - 20 xp
    Rank C (medium) - 50 xp
    Rank B (Medium+) - 100 xp
    Rank A (Hard) - 250 xp
    Rank S (Impossible) - ?? 
 - [ ] A daily quest could be accepted done if not, on sundays. 

 - [ ] every time a user leveled up all attributes receive 1 point. 
 - [ ] A power score is a sum of all attributes. 
 - [ ] the attribute cannot be 20 points highter than second higher value. ex:(str= 40, cha=15 (not able))
 - [ ] A Power Score will calculate the character rank: 
    0 - 500 Rank E 
    500 - 1500 Rank D 
    1500 - 3500 Rank C 
    3500 - 7000 Rank B 
    7000 - 12000 Rank A 
    12000 - 18000 Rank S
    18000 - 26000 Rank SS 
    26000+ National Rank (Monarch) 


## Non-Functional Requirements
 - [ ] All quest have to be save on database 
 - [x] The application's data must be persisted in a PostgreSQL database.
 - [ ] The application events must to use an event bus to manage the events. (MVP)
 - [ ] The notification have to be sended with external service using whatsapp.
 - [x] The User must be identified by a JWT token 
 - [ ] The timezone of quest have to be calculed in GMT -3(MVP)
 <!-- - [ ] All attributes name should be saved on database and use a seed to create then.  -->

 

 A cada nível que você sobe em Solo Leveling, você recebe 5 pontos de status para distribuir livremente entre seus atributos. Além disso, o protagonista Sung Jinwoo (ou o seu personagem no jogo) também ganha 1 ponto automático em cada atributo base e mais pontos ao completar as missões diárias.