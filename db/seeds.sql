-- seeds.sql

-- Insert initial departments
INSERT INTO department (name) 
VALUES 
('Macrodata Refinement'), 
('Optics & Design'), 
('Disposal & Reclamation'), 
('Administration'),
('Wellness'), 
('Security');

-- Insert initial roles with details
INSERT INTO role (title, salary, department_id)
VALUES 
('Lead Refiner',130000, 1),
('Macrodata Refiner', 82000, 1),
('Wellness Coordinator', 60000, 5),
('Floor Manager', 150000, 4),
('Disposal Dept Chief', 85000, 3),
('Severed Employee', 60000, 2);

-- Insert initial employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES 
('Mark', 'Scout', 1, 6), 
('Helena', 'Eagan', 2, 1), 
('Irving', 'B', 2, 1), 
('Dylan', 'G', 2, 1), 
('Burt', 'Goodman', 6, 6), 
('Harmony', 'Cobel', 4, null), 
('Ricken', 'Hale', 6, 6), 
('Gemma', 'Scout', 3, 6), 
('Seth', 'Milchick', 5, 6);