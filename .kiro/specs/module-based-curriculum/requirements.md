# Requirements Document

## Introduction

This document outlines requirements for restructuring the MathMentor AI lesson system from a flat topic-based organization to a hierarchical module-based curriculum. The current system stores lessons with basic fields (title, topic, subtopic, description, content, difficulty) in a flat list structure. The new system will organize 150+ lessons into a structured curriculum with three subjects (Algebra, Geometry, Trigonometry), each containing 9-10 modules with 3-6 lessons per module. This restructuring will provide students with clearer learning paths, better progress tracking, and more focused learning objectives aligned with practice problems.

## Glossary

- **Lesson**: A single instructional unit covering a specific concept with content, examples, and estimated completion time
- **Module**: A collection of related lessons organized around a major topic area (e.g., "Linear Equations" or "Triangles")
- **Subject**: The highest level of organization (Algebra, Geometry, or Trigonometry)
- **Learning_Objective**: A specific, measurable skill or knowledge that a student should gain from completing a lesson
- **Practice_Problem**: A question or exercise linked to specific lesson learning objectives for student practice
- **Lesson_Model**: The MongoDB schema defining the structure and fields for lesson documents
- **User_Progress**: Student completion status and mastery data for lessons and modules
- **Frontend**: The React Native Expo mobile application that displays curriculum to students
- **Backend**: The Express.js server application with MongoDB database that stores and serves curriculum data
- **Migration**: The process of transforming existing lesson data to the new schema structure
- **Seed_File**: A script that populates the database with the complete curriculum content

## Requirements

### Requirement 1: Database Schema Extension

**User Story:** As a developer, I want the Lesson model to support module-based organization, so that lessons can be properly structured in a hierarchical curriculum.

#### Acceptance Criteria

1. THE Lesson_Model SHALL include a "subject" field with values from the enumeration ["Algebra", "Geometry", "Trigonometry"]
2. THE Lesson_Model SHALL include a "module" field storing the module name as a string (e.g., "Foundations", "Linear Equations")
3. THE Lesson_Model SHALL include a "moduleNumber" field storing an integer representing the module's sequential position within the subject
4. THE Lesson_Model SHALL include a "lessonOrder" field storing an integer representing the lesson's sequential position within the module
5. THE Lesson_Model SHALL include a "learningObjectives" field storing an array of strings describing specific learning outcomes
6. THE Lesson_Model SHALL maintain all existing fields (topic, subtopic, title, description, content, difficulty, estimatedTime, prerequisites, isLocked) for backward compatibility
7. THE Lesson_Model SHALL enforce uniqueness for the combination of subject, moduleNumber, and lessonOrder fields through a compound index

### Requirement 2: Practice Problem Alignment

**User Story:** As a student, I want practice problems to be aligned with specific learning objectives, so that I can practice exactly what I learned in each lesson.

#### Acceptance Criteria

1. THE Practice_Problem SHALL reference its associated lesson through a lessonId field
2. THE Practice_Problem SHALL include a "learningObjective" field storing a string that matches one of the lesson's learning objectives
3. WHEN a practice problem is retrieved, THE Backend SHALL include the associated lesson's learning objectives in the response
4. THE Backend SHALL support filtering practice problems by specific learning objectives through query parameters

### Requirement 3: Complete Curriculum Content

**User Story:** As an educator, I want a complete curriculum covering all three subjects with properly organized modules and lessons, so that students have comprehensive learning materials.

#### Acceptance Criteria

1. THE Seed_File SHALL create 10 modules for Algebra with module numbers 1 through 10
2. THE Seed_File SHALL create 9 modules for Geometry with module numbers 1 through 9
3. THE Seed_File SHALL create 9 modules for Trigonometry with module numbers 1 through 9
4. THE Seed_File SHALL create at least 3 lessons per module with sequential lesson orders starting from 1
5. THE Seed_File SHALL create at least 150 total lessons across all subjects and modules
6. THE Seed_File SHALL assign 2 to 5 specific learning objectives to each lesson
7. THE Seed_File SHALL create practice problems for each lesson with learning objectives that match the lesson's learning objectives

### Requirement 4: Module-Based API Endpoints

**User Story:** As a frontend developer, I want API endpoints that retrieve curriculum data organized by modules, so that I can display the hierarchical structure to students.

#### Acceptance Criteria

1. THE Backend SHALL provide an endpoint that returns all modules for a specified subject with module metadata (module name, moduleNumber, lesson count)
2. THE Backend SHALL provide an endpoint that returns all lessons for a specified subject and moduleNumber with lessons ordered by lessonOrder
3. THE Backend SHALL provide an endpoint that returns a single module with all its lessons and metadata
4. THE Backend SHALL include user progress data (completion status, mastery percentage) when authenticated user requests curriculum data
5. WHEN a module endpoint is called, THE Backend SHALL return lessons sorted by lessonOrder in ascending order

### Requirement 5: Module-Based Frontend Navigation

**User Story:** As a student, I want to browse lessons by Subject → Module → Lesson, so that I can follow a structured learning path.

#### Acceptance Criteria

1. THE Frontend SHALL display a list of subjects (Algebra, Geometry, Trigonometry) on the practice screen
2. WHEN a user selects a subject, THE Frontend SHALL display all modules for that subject with module names and completion status
3. WHEN a user selects a module, THE Frontend SHALL display all lessons for that module in sequential order
4. THE Frontend SHALL display each module's completion percentage calculated as (completed lessons / total lessons) * 100
5. THE Frontend SHALL display visual indicators distinguishing completed lessons, in-progress lessons, and locked lessons

### Requirement 6: Module Progress Tracking

**User Story:** As a student, I want to track my progress through each module, so that I can see how much of each module I have completed.

#### Acceptance Criteria

1. THE Backend SHALL calculate module completion percentage as (completed lessons in module / total lessons in module) * 100
2. THE Backend SHALL calculate subject mastery as the average of all module completion percentages within that subject
3. WHEN a user completes a lesson, THE Backend SHALL update the module completion percentage
4. THE Backend SHALL provide an endpoint that returns module progress data including completion percentage, completed lesson count, and total lesson count
5. THE Frontend SHALL display module completion percentages on module cards using progress bars and percentage text

### Requirement 7: Learning Objectives Display

**User Story:** As a student, I want to see learning objectives for each lesson, so that I know what I will learn before starting the lesson.

#### Acceptance Criteria

1. WHEN a lesson detail screen is displayed, THE Frontend SHALL show all learning objectives for that lesson as a bulleted list
2. THE Frontend SHALL display learning objectives before the main lesson content
3. THE Frontend SHALL use clear, readable formatting for learning objectives with appropriate spacing and typography
4. WHEN practice problems are displayed, THE Frontend SHALL show which learning objective each problem addresses

### Requirement 8: Data Migration Strategy

**User Story:** As a system administrator, I want existing user progress to be preserved during the migration, so that students do not lose their learning history.

#### Acceptance Criteria

1. THE Migration SHALL map existing lesson records to the new schema by adding subject, module, moduleNumber, lessonOrder, and learningObjectives fields
2. THE Migration SHALL preserve all existing lesson ObjectId values to maintain references in user progress records
3. THE Migration SHALL update existing UserLessonProgress records to remain valid after the schema change
4. THE Migration SHALL create a backup of existing lesson data before applying schema changes
5. IF a migration fails, THEN THE Backend SHALL restore the backup and log the error with details

### Requirement 9: Sequential Module Progression

**User Story:** As a student, I want modules to follow a logical learning sequence, so that I build foundational knowledge before advancing to complex topics.

#### Acceptance Criteria

1. THE Seed_File SHALL order Algebra modules from foundational (Module 1: Foundations) to advanced (Module 10: Exponential & Logarithmic)
2. THE Seed_File SHALL order Geometry modules from basic concepts (Module 1: Basics) to advanced topics (Module 9: Transformations)
3. THE Seed_File SHALL order Trigonometry modules from foundations (Module 1: Foundations) to advanced applications (Module 9: Advanced)
4. THE Seed_File SHALL order lessons within each module from basic to advanced concepts based on pedagogical progression
5. THE Frontend SHALL display modules in ascending order by moduleNumber

### Requirement 10: Backward Compatibility

**User Story:** As a developer, I want the new system to maintain compatibility with existing API clients, so that deployments can happen incrementally without breaking existing functionality.

#### Acceptance Criteria

1. THE Backend SHALL continue to support existing lesson query endpoints that filter by topic and subtopic fields
2. THE Backend SHALL populate the "topic" field with the subject value for backward compatibility
3. THE Backend SHALL populate the "subtopic" field with the module name for backward compatibility
4. WHEN legacy endpoints are called, THE Backend SHALL return data in the existing format without module-specific fields
5. THE Backend SHALL support both legacy and new API endpoints simultaneously during a transition period
