-- Drop the existing table
DROP TABLE IF EXISTS requests;

-- Recreate the table with the new constraint
CREATE TABLE `requests` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` varchar(50) DEFAULT NULL CHECK (`type` in ('Leave','Equipment','Resources','Onboarding')),
  `employee_id` int(11) DEFAULT NULL,
  `items` text NOT NULL,
  `status` varchar(20) DEFAULT NULL CHECK (`status` in ('Pending','Approved','Rejected')),
  `submission_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 