-- Remove the specific cybercrime case about sexual blackmail in Dura
DELETE FROM cybercrime_reports 
WHERE description LIKE '%ابتزاز جنسي%' AND description LIKE '%دورا%';