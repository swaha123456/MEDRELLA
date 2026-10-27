Schedula - Full-Stack AI-Native Connected Hospital Platform

Schedula is a full-stack connected hospital platform designed to streamline clinical workflows, optimize multi-department care handoffs, and manage scheduling efficiently. This repository contains the complete implementation built as a pre-interview technical assessment.

🏗️ Database Architecture & Core Modules

The system's database infrastructure is decoupled into five core, high-performance modules to ensure clean data validation, fast query execution, and independent scalability:

1. User Authentication Module (users)

The table users handles unified credentials for all accounts, registering healthcare providers and patients within a singular login portal. A dedicated role column acts as an indexed router to assign user permissions dynamically. Verification tokens and validation expiry timestamps live straight inside this record to eliminate heavy table joins and keep authentication fast and secure.

2. Patient Profile Module (patients)

The table patients acts as an isolated demographic container, connecting to the core authentication engine via a strict 1:1 map. This layer safely splits personally identifiable information like names, birthdates, and gender values away from core system metadata to keep data privacy high.

3. Clinician Directory Module (doctors, doctor_profiles)

The tables doctors and doctor_profiles track provider records cleanly. The main table logs credential clearance and license status to monitor platform compliance. Long-form biography text, operational hours, and metadata are decoupled into a separate profile layer to maximize look-up speeds. Provider medical specialties are tracked as flat text attributes right within the row to keep search discovery quick.

4. Scheduling Engine (slots)

The table slots drives the calendar application, removing structural complexity by letting doctors create individual bookable windows directly within one table. Each timeline unit acts as an atomic row tracking its own binary state continuously as either AVAILABLE or BOOKED to mitigate duplicate booking conflicts.

5. Appointment Broker Module (appointments)

The table appointments manages transaction execution, serving as a central relational cross-point linking patients, clinicians, and individual availability slots. Every active booking takes a direct lock on a single availability slot record to assert real-time transaction consistency. Cancellation mechanisms automatically trigger updates to restore the slot back to an open status.

ER DIAGRAM LINK : https://dbdiagram.io/e/6adf393fed134e407e09c3cf/6adf394eed134e407e09c4bd
