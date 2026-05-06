-- rename glasses → ml, target → target_ml, convert existing values (1 glass = 250 ml)
alter table water_logs rename column glasses to ml;
alter table water_logs rename column target to target_ml;

-- convert old glass counts to ml (existing rows)
update water_logs set ml = ml * 250, target_ml = target_ml * 250;
