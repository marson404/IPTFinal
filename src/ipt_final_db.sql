-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 19, 2025 at 03:47 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ipt_final_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'HR', 'Human Resources', '2025-05-18 05:09:20', '2025-05-18 05:09:20'),
(3, 'IT Department', 'Information Technology Department', '2025-05-18 10:54:46', '2025-05-18 10:54:46'),
(4, 'Accounting', 'Accounting Department', '2025-05-19 00:32:52', '2025-05-19 00:32:52');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `position` varchar(100) NOT NULL,
  `hire_date` date NOT NULL,
  `status` varchar(20) DEFAULT NULL CHECK (`status` in ('Active','Inactive')),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `user_id`, `department_id`, `position`, `hire_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 3, 'Project Manager', '2025-05-18', 'Active', '2025-05-18 10:04:45', '2025-05-18 10:04:45'),
(3, 2, 3, 'Software Engineer', '2025-05-18', 'Active', '2025-05-18 11:06:08', '2025-05-18 11:06:08'),
(52, 1, 1, 'Software Engineer', '2025-05-18', 'Active', '2025-05-18 22:56:29', '2025-05-18 22:56:29'),
(53, 4, 3, 'Project Manager', '2025-05-18', 'Active', '2025-05-18 22:58:33', '2025-05-18 22:58:33'),
(54, 6, 1, 'Software Engineer2', '2025-05-19', 'Active', '2025-05-19 00:20:58', '2025-05-19 00:20:58'),
(55, 7, 4, 'Software Engineer', '2025-05-19', 'Active', '2025-05-19 00:31:01', '2025-05-19 00:31:01');

-- --------------------------------------------------------

--
-- Table structure for table `requests`
--

CREATE TABLE `requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(50) DEFAULT NULL CHECK (`type` in ('Leave','Equipment','Resources','Onboarding','Department Transfer')),
  `employee_id` int(11) DEFAULT NULL,
  `employee_email` varchar(255) DEFAULT NULL,
  `items` text NOT NULL,
  `status` varchar(20) DEFAULT NULL CHECK (`status` in ('Pending','Approved','Rejected')),
  `submission_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `requests`
--

INSERT INTO `requests` (`id`, `type`, `employee_id`, `employee_email`, `items`, `status`, `submission_date`, `last_updated`) VALUES
(1, 'Onboarding', 52, NULL, 'Newly hire', 'Pending', '2025-05-18 22:56:29', '2025-05-18 22:56:29'),
(2, 'Department Transfer', 52, 'john.doe@example.com', 'Department transfer from IT Department to HR', 'Pending', '2025-05-18 22:56:38', '2025-05-18 22:56:38'),
(3, 'Resources', 52, 'john.doe@example.com', 'laptop (10), computer (1), mouse and keyboard (1)', 'Rejected', '2025-05-18 22:57:08', '2025-05-18 23:05:59'),
(4, 'Onboarding', 53, NULL, 'Newly hire', 'Pending', '2025-05-18 22:58:33', '2025-05-18 22:58:33'),
(5, 'Department Transfer', 53, 'jomari.marson@gmail.com', 'Department transfer from HR to IT Department', 'Pending', '2025-05-18 22:59:07', '2025-05-18 22:59:07'),
(6, 'Leave', 53, 'jomari.marson@gmail.com', 'days (10)', 'Approved', '2025-05-18 23:00:30', '2025-05-18 23:06:32'),
(7, 'Department Transfer', 53, 'jomari.marson@gmail.com', 'Department transfer from IT Department to HR', 'Approved', '2025-05-18 23:00:44', '2025-05-18 23:06:21'),
(9, 'Equipment', 53, 'jomari.marson@gmail.com', 'taeee sa kambing (10000)', 'Pending', '2025-05-18 23:23:53', '2025-05-18 23:23:53'),
(10, 'Leave', 52, 'john.doe@example.com', 'Days (10)', 'Pending', '2025-05-18 23:25:33', '2025-05-18 23:25:33'),
(11, 'Department Transfer', 53, 'jomari.marson@gmail.com', 'Department transfer from HR to IT Department', 'Pending', '2025-05-19 00:00:21', '2025-05-19 00:00:21'),
(12, 'Onboarding', 54, NULL, 'Newly hire', 'Pending', '2025-05-19 00:20:58', '2025-05-19 00:20:58'),
(13, 'Leave', 54, 'blabla@gmail.com', 'days (10)', 'Pending', '2025-05-19 00:25:56', '2025-05-19 00:25:56'),
(14, 'Equipment', 54, 'blabla@gmail.com', 'testt (1)', 'Pending', '2025-05-19 00:26:33', '2025-05-19 00:26:33'),
(15, 'Department Transfer', 54, 'blabla@gmail.com', 'Department transfer from IT Department to HR', 'Pending', '2025-05-19 00:28:01', '2025-05-19 00:28:01'),
(16, 'Onboarding', 55, NULL, 'Newly hire', 'Pending', '2025-05-19 00:31:01', '2025-05-19 00:31:01'),
(17, 'Department Transfer', 55, 'henry@gmail.com', 'Department transfer from IT Department to HR', 'Pending', '2025-05-19 00:31:14', '2025-05-19 00:31:14'),
(18, 'Leave', 55, 'henry@gmail.com', 'days (10)', 'Approved', '2025-05-19 00:31:31', '2025-05-19 00:32:01'),
(19, 'Department Transfer', 55, 'henry@gmail.com', 'Department transfer from HR to Accounting', 'Pending', '2025-05-19 00:32:58', '2025-05-19 00:32:58');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(10) DEFAULT NULL CHECK (`title` in ('Mr','Mrs')),
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT NULL CHECK (`role` in ('Admin','User')),
  `status` varchar(20) DEFAULT NULL CHECK (`status` in ('Active','Inactive')),
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `title`, `first_name`, `last_name`, `email`, `role`, `status`, `password_hash`, `created_at`, `updated_at`) VALUES
(1, 'Mr', 'John', 'Doe', 'john.doe@example.com', 'Admin', 'Active', '$2b$10$M6FVqdHk730HG6Nr0B8EBe1k/Nih8rozLf8SLJPE4bBZlsPFMaqHm', '2025-05-18 04:15:10', '2025-05-18 04:15:10'),
(2, 'Mr', 'test', 'test', 'test@gmail.com', 'User', 'Active', '$2b$10$VFkJxetSRTJ44vU1cIuLqOnRB69aFDmIna7ClpkHLcKhHNvGyvJu.', '2025-05-18 04:44:05', '2025-05-18 04:44:05'),
(3, 'Mr', 'zina', 'tabanao', 'zina@gmail.com', 'User', 'Active', '$2b$10$1YMd9xRtokSQOs3PMcH1Su.QlULD1o9g6NfTcy4cTK7ORoqKfyogu', '2025-05-18 09:38:45', '2025-05-18 09:38:45'),
(4, 'Mr', 'jomari', 'marson', 'jomari.marson@gmail.com', 'User', 'Active', '$2b$10$MHNf1byHQQ.Djm8t52/2WeMSSmSQyEMwbbnqwYy7EpX3Oau5D3Fy6', '2025-05-18 11:29:33', '2025-05-18 11:29:33'),
(5, 'Mr', 'Admin', 'User', 'admin@example.com', 'Admin', 'Active', '$2b$10$/7HtOaOYeeIeuHPEaCBk0eY0wn2YL7xQRj4TNgVHh1MdxX0H3VWyq', '2025-05-18 23:36:44', '2025-05-18 23:36:44'),
(6, 'Mrs', 'testaevae', 'rbararbar', 'blabla@gmail.com', 'User', 'Active', '$2b$10$.OKxmJOSgqpUbMYiab5EKutRlXaB8cFgRMHtG7/ad6bJqdIC63LU.', '2025-05-19 00:20:44', '2025-05-19 00:20:44'),
(7, 'Mr', 'Henry', 'Magsayo', 'henry@gmail.com', 'User', 'Active', '$2b$10$iKiHkDGsB46F8eIdNCBCRu438mWP4/YAcscJIDGkK9XJA01XnyJqC', '2025-05-19 00:30:50', '2025-05-19 00:30:50');

-- --------------------------------------------------------

--
-- Table structure for table `workflows`
--

CREATE TABLE `workflows` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `request_id` int(11) DEFAULT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `current_step` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workflows`
--

INSERT INTO `workflows` (`id`, `request_id`, `employee_id`, `current_step`, `status`, `created_at`, `updated_at`) VALUES
(48, 1, 52, 'Initial Onboarding', 'Pending', '2025-05-18 22:56:29', '2025-05-18 22:56:29'),
(49, 2, 52, 'Transfer from IT Department to HR', 'Pending', '2025-05-18 22:56:38', '2025-05-18 22:56:38'),
(50, 3, 52, 'Requesting Resources Approval', 'Rejected', '2025-05-18 22:57:09', '2025-05-18 23:05:59'),
(51, 4, 53, 'Initial Onboarding', 'Pending', '2025-05-18 22:58:33', '2025-05-18 22:58:33'),
(52, 5, 53, 'Transfer from HR to IT Department', 'Pending', '2025-05-18 22:59:08', '2025-05-18 22:59:08'),
(53, 6, 53, 'Leave Request Approval', 'Approved', '2025-05-18 23:00:30', '2025-05-18 23:06:32'),
(54, 7, 53, 'Transfer from IT Department to HR', 'Approved', '2025-05-18 23:00:44', '2025-05-18 23:06:21'),
(59, 9, 53, 'Requesting Equipment Approval', 'Pending', '2025-05-18 23:23:53', '2025-05-18 23:23:53'),
(60, 10, 52, 'Leave Request Approval', 'Pending', '2025-05-18 23:25:33', '2025-05-18 23:25:33'),
(61, 11, 53, 'Transfer from HR to IT Department', 'Pending', '2025-05-19 00:00:21', '2025-05-19 00:00:21'),
(62, 12, 54, 'Initial Onboarding', 'Pending', '2025-05-19 00:20:58', '2025-05-19 00:20:58'),
(63, 13, 54, 'Leave Request Approval', 'Pending', '2025-05-19 00:25:56', '2025-05-19 00:25:56'),
(64, 14, 54, 'Requesting Equipment Approval', 'Pending', '2025-05-19 00:26:33', '2025-05-19 00:26:33'),
(65, 15, 54, 'Transfer from IT Department to HR', 'Pending', '2025-05-19 00:28:01', '2025-05-19 00:28:01'),
(66, 16, 55, 'Initial Onboarding', 'Pending', '2025-05-19 00:31:01', '2025-05-19 00:31:01'),
(67, 17, 55, 'Transfer from IT Department to HR', 'Pending', '2025-05-19 00:31:14', '2025-05-19 00:31:14'),
(68, 18, 55, 'Leave Request Approval', 'Approved', '2025-05-19 00:31:31', '2025-05-19 00:32:01'),
(69, 19, 55, 'Transfer from HR to Accounting', 'Pending', '2025-05-19 00:32:58', '2025-05-19 00:32:58');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `requests`
--
ALTER TABLE `requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `workflows`
--
ALTER TABLE `workflows`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `requests`
--
ALTER TABLE `requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `workflows`
--
ALTER TABLE `workflows`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
